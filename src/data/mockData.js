// All values here are simulated for demo purposes only — no real model inference.

const CITY_CENTER = { lat: 32.7157, lng: -117.1611 } // San Diego, CA, used as demo anchor

const ROAD_TYPES = ['Arterial Road', 'Local Street', 'Highway', 'Residential Road']

const STREETS = [
  'La Jolla Village Dr',
  'Pacific Hwy',
  'El Cajon Blvd',
  'University Ave',
  'Mission Blvd',
  'Harbor Dr',
  'Balboa Ave',
  'Genesee Ave',
  'Convoy St',
  'Broadway',
  'Garnet Ave',
  'Sports Arena Blvd',
]

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function computeRiskLevel({ crackAreaPercent, rainfallIn, trafficVolume }) {
  // Simple weighted dummy scoring — NOT a real model, purely for demo simulation.
  const score =
    crackAreaPercent * 4 + rainfallIn * 1.3 + trafficVolume / 800

  if (score >= 32) return 'High'
  if (score >= 16) return 'Medium'
  return 'Low'
}

function randomOverlayRegions() {
  const count = Math.floor(randomBetween(2, 5))
  return Array.from({ length: count }, () => ({
    top: randomBetween(10, 75),
    left: randomBetween(10, 75),
    width: randomBetween(8, 26),
    height: randomBetween(6, 18),
    rotate: randomBetween(-25, 25),
  }))
}

function randomAddress() {
  return `${Math.floor(randomBetween(100, 9900))} ${pick(STREETS)}, San Diego, CA`
}

export function generateAnalysis(imageUrl) {
  const crackAreaPercent = Number(randomBetween(0.5, 15).toFixed(1))
  const crackLengthIn = Math.round(randomBetween(8, 125))
  const rainfallIn = Number(randomBetween(0.2, 8.5).toFixed(1))
  const trafficVolume = Math.round(randomBetween(500, 9000))
  const roadType = pick(ROAD_TYPES)
  const riskLevel = computeRiskLevel({ crackAreaPercent, rainfallIn, trafficVolume })

  const lat = CITY_CENTER.lat + randomBetween(-0.04, 0.04)
  const lng = CITY_CENTER.lng + randomBetween(-0.05, 0.05)
  const address = randomAddress()

  return {
    id: `report-${Math.floor(randomBetween(100000, 999999))}`,
    imageUrl,
    crackAreaPercent,
    crackLengthIn,
    rainfallIn,
    trafficVolume,
    roadType,
    riskLevel,
    overlayRegions: randomOverlayRegions(),
    location: { lat, lng, address },
    createdAt: null, // stamped by caller (avoids Date.now inside pure generator)
  }
}

export function generateSeedReports(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const crackAreaPercent = Number(randomBetween(0.5, 15).toFixed(1))
    const rainfallIn = Number(randomBetween(0.2, 8.5).toFixed(1))
    const trafficVolume = Math.round(randomBetween(500, 9000))
    const riskLevel = computeRiskLevel({ crackAreaPercent, rainfallIn, trafficVolume })
    const lat = CITY_CENTER.lat + randomBetween(-0.045, 0.045)
    const lng = CITY_CENTER.lng + randomBetween(-0.06, 0.06)

    return {
      id: `seed-${i}`,
      imageUrl: null,
      crackAreaPercent,
      crackLengthIn: Math.round(randomBetween(8, 125)),
      rainfallIn,
      trafficVolume,
      roadType: pick(ROAD_TYPES),
      riskLevel,
      overlayRegions: [],
      location: { lat, lng, address: randomAddress() },
      createdAt: `2026-0${Math.floor(randomBetween(1, 7))}-${String(Math.floor(randomBetween(1, 28))).padStart(2, '0')}`,
    }
  })
}

export const RISK_STYLES = {
  Low: {
    label: 'Low',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    marker: '#10b981',
    ring: 'ring-emerald-500',
  },
  Medium: {
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    marker: '#f59e0b',
    ring: 'ring-amber-500',
  },
  High: {
    label: 'High',
    badge: 'bg-red-100 text-red-800 border-red-300',
    dot: 'bg-red-500',
    marker: '#ef4444',
    ring: 'ring-red-500',
  },
}

export const CITY_MAP_CENTER = CITY_CENTER
