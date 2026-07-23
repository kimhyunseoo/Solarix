"""Real RF inference.

Loads model_rf.pkl (RandomForestRegressor, n_estimators=300, max_depth=12,
min_samples_leaf=5, trained in Colab on train_lag_anotherSplit.csv, 128
lag features + target_hour_sin/cos -- see feature_engineering.py for the
exact column definitions and build logic).
"""

from __future__ import annotations

import warnings
from pathlib import Path

import joblib
import pandas as pd

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

_MODEL_PATH = Path(__file__).parent / "model_rf.pkl"
_bundle = joblib.load(_MODEL_PATH)
_model = _bundle["model"]
_feature_cols = _bundle["feature_cols"]


def predict(X: pd.DataFrame) -> list[float]:
    X_ordered = X[_feature_cols]  # enforce exact training column order
    pred = _model.predict(X_ordered)
    return [max(0.0, float(v)) for v in pred]  # clip negatives, just in case (RF rarely predicts negative)
