import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { RISK_STYLES, CITY_MAP_CENTER } from '../data/mockData'
import RiskBadge from './RiskBadge'

export default function MapView({ reports, center = CITY_MAP_CENTER, height = 420, onSelect, selectedId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => {
          const style = RISK_STYLES[report.riskLevel] ?? RISK_STYLES.Low
          const isSelected = selectedId === report.id
          return (
            <CircleMarker
              key={report.id}
              center={[report.location.lat, report.location.lng]}
              radius={isSelected ? 11 : 8}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: style.marker,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onSelect?.(report.id),
              }}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-800">{report.location.address}</p>
                  <RiskBadge level={report.riskLevel} />
                  <p className="text-slate-500">
                    Crack area {report.crackAreaPercent}% &middot; Length {report.crackLengthIn} in
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
