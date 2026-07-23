from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.feature_engineering import InsufficientHistoryError, build_batch, infer_target_date, load_history
from app.inference import InferenceBackend, build_inference_backend
from app.model_loader import DataBundle, Scaler, load_data_bundle
from app.schemas import ForecastResponse, HealthResponse, HourlyForecast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("solarix.main")


@dataclass
class AppState:
    data: DataBundle
    inference: InferenceBackend


_state: dict[str, AppState] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("startup: loading data (source=%s)...", settings.data_source)
    data = load_data_bundle(settings)
    logger.info("startup: building inference backend (source=%s)...", settings.inference_source)
    inference = build_inference_backend(settings)
    _state["app"] = AppState(data=data, inference=inference)
    logger.info("startup complete")
    yield
    _state.clear()


app = FastAPI(title="Solarix Forecast API", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    state = _state.get("app")
    return HealthResponse(
        status="ok" if state else "not ready",
        model_source=get_settings().inference_source if state else "n/a",
        model_loaded=state is not None,
    )


@app.get("/api/forecast", response_model=ForecastResponse)
def forecast() -> ForecastResponse:
    state = _state.get("app")
    if state is None:
        raise HTTPException(status_code=503, detail="not ready yet")

    settings = get_settings()

    try:
        history = load_history(state.data.recent_days_csv_path)
        target_date = infer_target_date(history)
        x, hours = build_batch(history, target_date)
    except InsufficientHistoryError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    scaler: Scaler = state.data.scaler
    x_scaled = scaler.transform_features(x)
    y_raw = state.inference.predict(x_scaled)
    y_pred = scaler.inverse_transform_target(y_raw).clip(min=0)  # generation can't be negative

    hourly = [HourlyForecast(hour=h, predicted_generation_kwh=round(float(v), 2)) for h, v in zip(hours, y_pred)]
    total = float(y_pred.sum())
    peak_idx = int(y_pred.argmax())
    low_idx = int(y_pred.argmin())

    return ForecastResponse(
        facility_name=settings.facility_name,
        facility_capacity_mw=settings.facility_capacity_mw,
        target_date=target_date.strftime("%Y-%m-%d"),
        hourly=hourly,
        total_generation_kwh=round(total, 2),
        peak_hour=hours[peak_idx],
        peak_generation_kwh=round(float(y_pred[peak_idx]), 2),
        lowest_hour=hours[low_idx],
        lowest_generation_kwh=round(float(y_pred[low_idx]), 2),
        model_source=settings.inference_source,
    )
