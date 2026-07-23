"""
Loads the two data artifacts every prediction needs regardless of where
inference happens: the feature/target scaler and the recent-days CSV.
(Model loading itself now lives in inference.py, since "which model" and
"how do I run it" are separate concerns — see build_inference_backend().)
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
import zipfile
from dataclasses import dataclass

import numpy as np

from app.config import Settings

logger = logging.getLogger("solarix.model_loader")


@dataclass
class Scaler:
    feature_mean: np.ndarray  # (11,)
    feature_std: np.ndarray  # (11,)
    target_mean: float
    target_std: float

    @classmethod
    def from_json(cls, path: str) -> "Scaler":
        with open(path) as f:
            raw = json.load(f)
        return cls(
            feature_mean=np.array(raw["feature_mean"], dtype="float32"),
            feature_std=np.array(raw["feature_std"], dtype="float32"),
            target_mean=float(raw["target_mean"]),
            target_std=float(raw["target_std"]),
        )

    def transform_features(self, x: np.ndarray) -> np.ndarray:
        """x: (..., 11) -> scaled, same shape."""
        return ((x - self.feature_mean) / self.feature_std).astype("float32")

    def inverse_transform_target(self, y_scaled: np.ndarray) -> np.ndarray:
        return y_scaled * self.target_std + self.target_mean


@dataclass
class DataBundle:
    scaler: Scaler
    recent_days_csv_path: str
    source: str  # "local" or "gcs"


def _download_gcs_blob(bucket_name: str, blob_name: str, dest_path: str) -> None:
    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    blob.download_to_filename(dest_path)
    logger.info("downloaded gs://%s/%s -> %s", bucket_name, blob_name, dest_path)


def load_data_bundle(settings: Settings) -> DataBundle:
    if settings.data_source == "local":
        base = settings.local_data_dir
        scaler = Scaler.from_json(os.path.join(base, "scaler.json"))
        recent_days_path = os.path.join(base, "recent_days.csv")
        return DataBundle(scaler=scaler, recent_days_csv_path=recent_days_path, source="local")

    if settings.data_source == "gcs":
        tmp_dir = tempfile.mkdtemp(prefix="solarix-data-")

        scaler_path = os.path.join(tmp_dir, "scaler.json")
        _download_gcs_blob(settings.gcs_bucket, settings.gcs_scaler_blob, scaler_path)
        scaler = Scaler.from_json(scaler_path)

        recent_days_path = os.path.join(tmp_dir, "recent_days.csv")
        _download_gcs_blob(settings.gcs_bucket, settings.gcs_recent_days_blob, recent_days_path)

        return DataBundle(scaler=scaler, recent_days_csv_path=recent_days_path, source="gcs")

    raise ValueError(f"unknown DATA_SOURCE: {settings.data_source!r} (expected 'local' or 'gcs')")


# ---------------------------------------------------------------------------
# Used only by inference.py's local_tf path and scripts/export_to_savedmodel.py
# to work around a Keras version mismatch between Colab (newer Keras) and
# this Intel Mac's TensorFlow ceiling (2.16.2, see README). Not needed on
# Render/Vertex AI where TF versions can be kept in sync.
# ---------------------------------------------------------------------------
_FALLBACK_ARCHITECTURE_SPEC = [
    ("Input", {"shape": (21, 11)}),
    ("LSTM", {"units": 64, "return_sequences": True}),
    ("Dropout", {"rate": 0.2}),
    ("LSTM", {"units": 32, "return_sequences": False}),
    ("Dropout", {"rate": 0.2}),
    ("Dense", {"units": 16, "activation": "relu"}),
    ("Dense", {"units": 1, "activation": "linear"}),
]


def _load_keras_with_weights_fallback(model_path: str):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    try:
        return tf.keras.models.load_model(model_path)
    except TypeError as e:
        if "could not be deserialized" not in str(e):
            raise
        logger.warning(
            "tf.keras.models.load_model() failed on a Keras version mismatch "
            "(%s) — rebuilding the known placeholder architecture and loading "
            "weights only. This is a local-dev workaround; make sure the real "
            "production model is saved with a Keras version that matches "
            "requirements.txt so this fallback isn't needed elsewhere.",
            e.__class__.__name__,
        )
        tmp_dir = tempfile.mkdtemp(prefix="solarix-weights-")
        with zipfile.ZipFile(model_path) as z:
            z.extract("model.weights.h5", tmp_dir)

        layer_map = {"Input": layers.Input, "LSTM": layers.LSTM, "Dropout": layers.Dropout, "Dense": layers.Dense}
        built_layers = [layer_map[name](**kwargs) for name, kwargs in _FALLBACK_ARCHITECTURE_SPEC]
        model = models.Sequential(built_layers)
        model.load_weights(os.path.join(tmp_dir, "model.weights.h5"))
        return model
