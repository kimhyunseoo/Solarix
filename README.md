# roadrisk-ai

AI-powered road damage detection and maintenance prioritization using computer vision and multimodal data.

Citizens upload a road photo, AI detects cracks and potholes, and combines that with rainfall, traffic volume, and road type data to diagnose pothole development risk (Low/Medium/High). Demo region: San Diego, CA.

## Current status: frontend demo

A UI-flow demo not connected to a real AI model. Segmentation results and risk levels are simulated in `src/data/mockData.js`.

### Screens

- **Home** (`/`) — service intro, road photo upload
- **Result** (`/result`) — crack overlay, crack area/length, risk badge, GPS location
- **City Dashboard** (`/dashboard`) — map of reported locations (color-coded by risk) + list view, risk filter

### Tech stack

React + Vite, Tailwind CSS v4, React Router, Leaflet (OpenStreetMap)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
