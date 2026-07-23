"""
Rebuilds the same (21 timestep, 11 feature) sliding-window input the model
was trained on (see build_dataset.py / train_lstm.py in the training repo),
but for inference: given a fixed "recent days" history CSV and a target
date, build one sequence per target hour (06:00-20:00) with no label.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

FEATURES = [
    "shortwave_radiation",
    "diffuse_radiation",
    "temperature",
    "humidity",
    "cloud_cover",
    "precipitation",
    "wind_speed",
    "solar_elevation",
    "generation_kwh",
    "hour_sin",
    "hour_cos",
]
N_FEATURES = len(FEATURES)
DAY_OFFSETS = range(1, 8)  # d1 (yesterday) ... d7 (7 days ago)
HOUR_OFFSETS = [2, 1, 0]  # hm2, hm1, h0
N_TIMESTEPS = len(list(DAY_OFFSETS)) * len(HOUR_OFFSETS)  # 21
TARGET_HOURS = list(range(6, 21))  # 06:00-20:00, 15 hours


class InsufficientHistoryError(Exception):
    """Raised when recent_days.csv doesn't cover the 7-day lookback window."""


def load_history(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["time"] = pd.to_datetime(df["time"])
    df["hour"] = df["time"].dt.hour
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df = df.set_index("time", drop=False).sort_index()
    return df


def infer_target_date(history: pd.DataFrame) -> pd.Timestamp:
    """The demo dataset is static, so 'tomorrow' is defined relative to the
    last date present in the history file, not the wall-clock date — that
    keeps the pipeline self-consistent no matter when this runs."""
    last_date = history.index.max().normalize()
    return last_date + pd.Timedelta(days=1)


def build_sequence_for_hour(history: pd.DataFrame, target_date: pd.Timestamp, target_hour: int) -> np.ndarray:
    """Returns a (21, 11) float32 array in chronological order (oldest -> newest),
    matching MODEL_COL_ORDER's day/hour ordering in train_lstm.py."""
    target_dt = pd.Timestamp(target_date) + pd.Timedelta(hours=target_hour)

    rows = []
    for day_off in reversed(list(DAY_OFFSETS)):  # 7..1 -> oldest day first
        for hour_off in HOUR_OFFSETS:  # 2,1,0 -> already chronological within a day
            src_dt = target_dt - pd.Timedelta(days=day_off, hours=hour_off)
            if src_dt not in history.index:
                raise InsufficientHistoryError(
                    f"missing {src_dt} in recent_days.csv (need history back to "
                    f"{target_dt - pd.Timedelta(days=7, hours=2)})"
                )
            src_row = history.loc[src_dt]
            rows.append([float(src_row[feat]) for feat in FEATURES])

    return np.array(rows, dtype="float32")  # (21, 11)


def build_batch(history: pd.DataFrame, target_date: pd.Timestamp) -> tuple[np.ndarray, list[int]]:
    """Returns (X, hours) where X is (15, 21, 11) — one sequence per target hour."""
    sequences = [build_sequence_for_hour(history, target_date, hour) for hour in TARGET_HOURS]
    return np.stack(sequences, axis=0), TARGET_HOURS
