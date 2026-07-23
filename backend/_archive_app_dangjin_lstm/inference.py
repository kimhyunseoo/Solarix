"""
Abstracts "how a prediction actually gets computed" behind one interface,
so main.py doesn't care whether that's a local TensorFlow model in-process
or an HTTP round-trip to a Vertex AI Endpoint.
"""

from __future__ import annotations

import logging
from typing import Protocol

import numpy as np

from app.config import Settings

logger = logging.getLogger("solarix.inference")


class InferenceBackend(Protocol):
    def predict(self, x_scaled: np.ndarray) -> np.ndarray:
        """x_scaled: (n, 21, 11) scaled features -> (n,) predictions (model's native scale)."""
        ...


class VertexEndpointBackend:
    """Calls a deployed Vertex AI Endpoint instead of running TensorFlow locally.
    Requires GOOGLE_APPLICATION_CREDENTIALS or `gcloud auth application-default
    login`, and a model already deployed to VERTEX_ENDPOINT_ID."""

    def __init__(self, project: str, region: str, endpoint_id: str):
        from google.cloud import aiplatform

        aiplatform.init(project=project, location=region)
        self.endpoint = aiplatform.Endpoint(endpoint_id)
        logger.info("Vertex AI endpoint ready: projects/%s/locations/%s/endpoints/%s", project, region, endpoint_id)

    def predict(self, x_scaled: np.ndarray) -> np.ndarray:
        instances = x_scaled.tolist()  # (n, 21, 11) -> nested python lists, one instance per prediction
        response = self.endpoint.predict(instances=instances)
        return np.array(response.predictions, dtype="float32").flatten()


class LocalKerasBackend:
    """Runs TensorFlow in-process. Kept around for local dev / offline testing
    without needing a live Vertex AI Endpoint."""

    def __init__(self, model):
        self.model = model

    def predict(self, x_scaled: np.ndarray) -> np.ndarray:
        return self.model.predict(x_scaled, verbose=0).flatten()


def _load_local_keras_model(settings: Settings):
    import os

    import tensorflow as tf

    from app.model_loader import _load_keras_with_weights_fallback

    model_path = os.path.join(settings.local_data_dir, "model.keras")
    logger.info("loading local TF model from %s", model_path)
    return _load_keras_with_weights_fallback(model_path)


def build_inference_backend(settings: Settings) -> InferenceBackend:
    if settings.inference_source == "vertex_endpoint":
        if not settings.vertex_endpoint_id:
            raise ValueError(
                "INFERENCE_SOURCE=vertex_endpoint but VERTEX_ENDPOINT_ID is empty — "
                "deploy the model to a Vertex AI Endpoint first, then set its ID"
            )
        return VertexEndpointBackend(settings.gcp_project, settings.gcp_region, settings.vertex_endpoint_id)

    if settings.inference_source == "local_tf":
        model = _load_local_keras_model(settings)
        return LocalKerasBackend(model)

    raise ValueError(f"unknown INFERENCE_SOURCE: {settings.inference_source!r} (expected 'vertex_endpoint' or 'local_tf')")
