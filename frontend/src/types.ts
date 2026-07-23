export interface HourlyForecast {
  hour: number;
  predicted_generation_kwh: number;
}

export interface ForecastResponse {
  facility_name: string;
  facility_capacity_mw: number;
  target_date: string;
  hourly: HourlyForecast[];
  total_generation_kwh: number;
  peak_hour: number;
  peak_generation_kwh: number;
  lowest_hour: number;
  lowest_generation_kwh: number;
  model_source: string;
}
