# Solarix AI

An AI agent that predicts solar power generation and detects anomalies (output degradation, equipment issues, etc.) by comparing predicted output against actual output.

---

## Team Introduction

**Team F**

| Name | Role |
|---|---|
| Hyunseo | Team Lead, Backend, AI Model Training |
| Jiyoon | Data Analysis & Preprocessing, AI Model Training |
| Gwangmin | AI Model Training & Evaluation |
| Yejeong | Frontend, Documentation, Presentation Materials |

---

## Service Introduction

### Problem

Individual solar panel owners face the following challenges:

- When output is lower than usual, it is **hard to tell whether it's due to weather or a system issue**
- Anomalies often go **undetected early**, delaying inspection/repair and accumulating generation losses

### Overview

**Solarix AI** learns from weather data (irradiance, temperature, humidity, wind speed, etc.) and historical generation records to **predict expected output at a given time**, and provides a usage guide based on the forecast.

### Key Features

- **Generation Forecasting**: Predicts output at a target time using weather and generation data from the preceding days
- **Anomaly Detection**: Flags an anomaly when the deviation between predicted and actual output exceeds a threshold
- **Target Users**: Individual solar panel owners

### Personas

1. **Individual Solar User**: Wants an easy way to check whether their own system is operating normally

### Dataset

- Built on Dacon's public "Solar Power Generation Forecast AI Competition" dataset (30-minute intervals, 3 years)
- Variables used: DHI (Diffuse Horizontal Irradiance), DNI (Direct Normal Irradiance), WS (Wind Speed), RH (Relative Humidity), T (Temperature)
- Time-series lag features engineered from the preceding 7 days of data

### Tech Stack

- **Analysis / Modeling**: Python, Pandas, Machine learning regression models (Random Forest, Multiple Linear Regression, etc.)
- **Infrastructure**: Google Cloud Platform (Vertex AI Workbench, Cloud Storage, Model Registry)
- **Frontend**: (TBD by Yejeong)
