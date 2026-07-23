import { useEffect, useState } from "react";
import { fetchForecast } from "../api/forecast";
import type { ForecastResponse } from "../types";

export function ForecastDashboard() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="state-msg">불러오는 중...</div>;
  if (error) return <div className="state-msg error">에러: {error}</div>;
  if (!data) return null;

  const maxKwh = Math.max(...data.hourly.map((h) => h.predicted_generation_kwh));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">SOLARIX FORECAST</div>
          <h1>{data.facility_name} <span className="cap">· {data.facility_capacity_mw}MW</span></h1>
        </div>
        <div className="badge">예측일 {data.target_date} · 06:00–20:00</div>
      </header>

      <section className="stat-row">
        <StatCard label="예상 총 발전량" value={`${(data.total_generation_kwh / 1000).toFixed(1)} MWh`} sub={`${data.total_generation_kwh.toLocaleString()} kWh`} />
        <StatCard label="최대 발전 시간대" value={`${String(data.peak_hour).padStart(2, "0")}:00`} sub={`${data.peak_generation_kwh.toLocaleString()} kWh`} />
        <StatCard label="최소 발전 시간대" value={`${String(data.lowest_hour).padStart(2, "0")}:00`} sub={`${data.lowest_generation_kwh.toLocaleString()} kWh`} />
        <StatCard label="모델 소스" value={data.model_source} sub="MODEL_SOURCE env" />
      </section>

      <section className="panel">
        <h2>시간별 예측 발전량</h2>
        <div className="bar-chart">
          {data.hourly.map((h) => (
            <div className="bar-col" key={h.hour}>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${Math.max(2, (h.predicted_generation_kwh / maxKwh) * 100)}%` }}
                  title={`${h.predicted_generation_kwh} kWh`}
                />
              </div>
              <div className="bar-label">{String(h.hour).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
