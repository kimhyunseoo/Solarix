from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Where predictions actually get computed.
    #   "vertex_endpoint" = call a deployed Vertex AI Endpoint over HTTP (production)
    #   "local_tf"        = load model.keras and run TensorFlow in-process (local dev / offline testing)
    inference_source: str = "vertex_endpoint"

    # Where scaler.json / recent_days.csv come from (independent of inference_source —
    # feature engineering + scaling always happens here in FastAPI either way).
    #   "local" = read from app/data/
    #   "gcs"   = download from GCS at startup
    data_source: str = "local"

    gcp_project: str = "406789890946"
    gcp_region: str = "us-central1"
    vertex_endpoint_id: str = ""  # fill in after `gcloud ai endpoints deploy-model`

    gcs_bucket: str = "solarix"
    gcs_scaler_blob: str = "models/lstm/latest/scaler.json"
    gcs_recent_days_blob: str = "data/recent_days.csv"

    local_data_dir: str = "app/data"

    facility_name: str = "당진 태양광 3호기"
    facility_capacity_mw: float = 1.0

    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
