"""Build the 7-day lag feature rows from actual recent history (manual CSV).

No weather-forecast input. Column order MUST match training exactly
(see the Colab build script used for train_lag_anotherSplit.csv):

    for d in 1..7:                    # days back
        for minutes_before in [60, 30, 0]:
            for feat in ['DHI','DNI','WS','RH','T','TARGET']:
                d{d}_m{minutes_before}_{feat}
    target_hour_sin, target_hour_cos

history CSV format (update manually as new actuals come in):
    date,Hour,Minute,DHI,DNI,WS,RH,T,TARGET
    2026-07-15,0,0,6.0,0.0,3.44,25.73,18.05,0.15
    2026-07-15,0,30,0.0,0.0,3.38,66.67,20.1,1.35
    ...
"""

from __future__ import annotations

import datetime as dt
import math

import pandas as pd

FEATS = ["DHI", "DNI", "WS", "RH", "T", "TARGET"]
DAY_OFFSETS = range(1, 8)
SLOT_OFFSETS_MIN = [60, 30, 0]  # minutes before target time, also used directly in column names
TARGET_SLOTS: list[tuple[int, int]] = [(h, m) for h in range(5, 20) for m in (0, 30)]

FEATURE_COLUMNS = [f"d{d}_m{s}_{feat}" for d in DAY_OFFSETS for s in SLOT_OFFSETS_MIN for feat in FEATS] + [
    "target_hour_sin",
    "target_hour_cos",
]


class InsufficientHistoryError(Exception):
    pass


def load_history(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path, parse_dates=["date"])
    df["date"] = df["date"].dt.normalize()
    return df.sort_values(["date", "Hour", "Minute"]).reset_index(drop=True)


def _lookup(history: pd.DataFrame, target_dt: dt.datetime) -> pd.Series | None:
    match = history[
        (history["date"] == pd.Timestamp(target_dt.date()))
        & (history["Hour"] == target_dt.hour)
        & (history["Minute"] == target_dt.minute)
    ]
    return None if match.empty else match.iloc[0]


def build_feature_rows(history: pd.DataFrame, target_date: dt.date) -> pd.DataFrame:
    """One row per 30-min slot in 05:00~19:30 for target_date, columns == FEATURE_COLUMNS."""
    earliest_needed = target_date - dt.timedelta(days=7)
    available = set(d.date() for d in history["date"])
    missing_days = [
        earliest_needed + dt.timedelta(days=i)
        for i in range(7)
        if (earliest_needed + dt.timedelta(days=i)) not in available
    ]
    if missing_days:
        raise InsufficientHistoryError(
            f"최근 7일치 history가 부족합니다. 누락된 날짜: {[d.isoformat() for d in missing_days]}"
        )

    rows = []
    for h, m in TARGET_SLOTS:
        target_dt = dt.datetime.combine(target_date, dt.time(h, m))
        row: dict[str, float] = {}
        for d in DAY_OFFSETS:
            for s in SLOT_OFFSETS_MIN:
                src_dt = target_dt - dt.timedelta(days=d, minutes=s)
                src = _lookup(history, src_dt)
                if src is None:
                    raise InsufficientHistoryError(
                        f"{target_dt.strftime('%Y-%m-%d %H:%M')} 예측에 필요한 {src_dt.strftime('%Y-%m-%d %H:%M')} "
                        "데이터가 history CSV에 없습니다."
                    )
                for feat in FEATS:
                    row[f"d{d}_m{s}_{feat}"] = float(src[feat])
        row["target_hour_sin"] = math.sin(2 * math.pi * h / 24)
        row["target_hour_cos"] = math.cos(2 * math.pi * h / 24)
        rows.append(row)

    return pd.DataFrame(rows)[FEATURE_COLUMNS]
