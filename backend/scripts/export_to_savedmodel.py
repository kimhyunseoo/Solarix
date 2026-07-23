# -*- coding: utf-8 -*-
"""
Converts a trained .keras model into TensorFlow SavedModel format, which is
what Vertex AI's prebuilt TensorFlow serving container expects.

Run from backend/ with the venv active:
    ./.venv/bin/python scripts/export_to_savedmodel.py \
        --keras-path app/data/model.keras \
        --out-dir app/data/saved_model

Then upload app/data/saved_model/ (the whole directory) to GCS, e.g.:
    gsutil -m cp -r app/data/saved_model gs://solarix/models/lstm/v1/
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import tensorflow as tf

from app.model_loader import _load_keras_with_weights_fallback  # reuses the version-mismatch fallback


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--keras-path", default="app/data/model.keras")
    parser.add_argument("--out-dir", default="app/data/saved_model")
    args = parser.parse_args()

    print(f"Loading {args.keras_path}...")
    model = _load_keras_with_weights_fallback(args.keras_path)
    model.summary()

    print(f"Exporting SavedModel to {args.out_dir}...")
    # model.export() (Keras 3) writes the standard SavedModel format Vertex AI's
    # prebuilt TF serving container expects (serving_default signature, etc.)
    model.export(args.out_dir)

    print("Done. Contents:")
    for root, _, files in os.walk(args.out_dir):
        for f in files:
            print(" ", os.path.join(root, f))


if __name__ == "__main__":
    main()
