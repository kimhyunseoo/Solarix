import { RISK_STYLES } from '../data/mockData'

export default function CrackOverlay({ imageUrl, regions, riskLevel }) {
  const color = RISK_STYLES[riskLevel]?.marker ?? RISK_STYLES.Low.marker

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
      <img src={imageUrl} alt="Uploaded road photo" className="max-h-[480px] w-full object-cover" />
      <div className="pointer-events-none absolute inset-0">
        {regions.map((r, i) => (
          <div
            key={i}
            className="absolute rounded-md border-2 mix-blend-multiply"
            style={{
              top: `${r.top}%`,
              left: `${r.left}%`,
              width: `${r.width}%`,
              height: `${r.height}%`,
              transform: `rotate(${r.rotate}deg)`,
              backgroundColor: color,
              borderColor: color,
              opacity: 0.45,
            }}
          />
        ))}
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
        AI Crack Detection Result (Simulated)
      </span>
    </div>
  )
}
