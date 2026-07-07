import { MapPin, Ruler, Percent } from 'lucide-react'
import RiskBadge from './RiskBadge'

export default function ReportListItem({ report, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(report.id)}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{report.location.address}</p>
            <p className="mt-0.5 text-xs text-slate-400">{report.createdAt ?? '-'} · {report.roadType}</p>
          </div>
        </div>
        <RiskBadge level={report.riskLevel} />
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Percent size={13} /> Crack area {report.crackAreaPercent}%
        </span>
        <span className="inline-flex items-center gap-1">
          <Ruler size={13} /> Length {report.crackLengthIn} in
        </span>
      </div>
    </button>
  )
}
