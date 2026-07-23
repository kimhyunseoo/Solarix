# Solarix AI — PRD

## Problem & Goal

Individual solar panel owners find it hard to tell whether lower-than-usual output is due to weather or a system issue, and anomalies often go undetected early — delaying inspection/repair and letting generation losses accumulate.

Solarix AI learns from past generation and weather data to predict the next day's hourly (30-minute interval) power output, and provides power-use tips based on that forecast.

**Success criteria:** RMSE on the test set within roughly 13% of maximum generation output. We also track R², performance vs. a baseline (moving average), error by time of day, and the impact of weather factors.

## Target User

Individual solar panel owners (B2C) — users who want an easy way to check whether their own system is operating normally.

## Why Ours

Unlike weather forecast apps or plant-management tools, Solarix uses a model trained on the owner's own historical data to show the expected output right now, and turns that forecast into a plain-language tip (use power at peak times, or save power on low-output days) written by an LLM.

## Must-Have Features

1. **Forecast** — Auto-calculates sun angle from the site's coordinates + predicts next-day, 30-minute-interval power output using the past 7 days of data (including target hour -2h to 0h)
2. **Dashboard** — Line chart of predicted output by time of day, total predicted output for the day, peak-hour highlight
3. **LLM Output** — Sends the forecast to an LLM API to generate a plain-language tip (peak-time usage tip / low-output-day saving tip)

## User Stories

- As an individual solar owner, I want to check tomorrow's expected output.
- As an individual solar owner, I want to see the hourly forecast chart and peak hour, so that I know when it's best to use power.
- As an individual solar owner, I want a plain-language usage tip, so that I can act on it without having to interpret the data myself.

## Out of Scope

- Database integration — currently runs on a fixed 7-day CSV file only
- Weather API integration (real-time/forecast) — not included in the current model
- Anomaly detection / alerts — future work
- Multi-site management, payment/billing features

## Data & Model (Reference)

- **Data source:** Dacon-hosted AI competition dataset
  - Competition: Solar Power Generation Forecast AI Competition
  - Competition ID: 235680
  - Link: https://dacon.io/competitions/official/235680
- **Features:** 7 days × 3 time points (same hour / -1h / -2h) × 9 fields = 189 features
- **Models:** Random Forest (best: n_estimators=600, max_depth=12, min_samples_leaf=10, max_features=sqrt), Multiple Linear Regression
- **Missing values/outliers:** linear fill along the same hour across days

## Future Work

Continue exploring models to achieve better-performing results.
