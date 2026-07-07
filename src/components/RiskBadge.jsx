import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react'
import { RISK_STYLES } from '../data/mockData'

const ICONS = {
  Low: CheckCircle2,
  Medium: AlertTriangle,
  High: AlertOctagon,
}

export default function RiskBadge({ level, size = 'md' }) {
  const style = RISK_STYLES[level] ?? RISK_STYLES.Low
  const Icon = ICONS[level] ?? CheckCircle2
  const sizeClass = size === 'lg' ? 'text-base px-4 py-1.5 gap-2' : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${style.badge} ${sizeClass}`}
    >
      <Icon size={size === 'lg' ? 18 : 14} />
      {style.label} Risk
    </span>
  )
}
