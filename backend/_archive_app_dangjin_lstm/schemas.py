from pydantic import BaseModel


class HourlyForecast(BaseModel):
    hour: int
    predicted_generation_kwh: float


class ForecastResponse(BaseModel):
    facility_name: str
    facility_capacity_mw: float
    target_date: str  # YYYY-MM-DD
    hourly: list[HourlyForecast]
    total_generation_kwh: float
    peak_hour: int
    peak_generation_kwh: float
    lowest_hour: int
    lowest_generation_kwh: float
    model_source: str


class HealthResponse(BaseModel):
    status: str
    model_source: str
    model_loaded: bool
