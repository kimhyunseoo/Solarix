import type { ForecastResponse } from "../types";

// Same-origin in dev (proxied by Vite to the FastAPI backend) and in prod
// once the frontend is served behind the same domain/reverse proxy. If the
// backend lives on a separate Render service, set VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchForecast(): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/api/forecast`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`forecast request failed (${res.status}): ${body}`);
  }
  return res.json();
}
