import { useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import ReportListItem from '../components/ReportListItem'
import { RISK_STYLES } from '../data/mockData'

const FILTERS = ['All', 'High', 'Medium', 'Low']

export default function DashboardPage() {
  const { reports } = useApp()
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)

  const filteredReports = useMemo(
    () => (filter === 'All' ? reports : reports.filter((r) => r.riskLevel === filter)),
    [reports, filter],
  )

  const counts = useMemo(() => {
    const base = { Low: 0, Medium: 0, High: 0 }
    reports.forEach((r) => {
      base[r.riskLevel] = (base[r.riskLevel] ?? 0) + 1
    })
    return base
  }, [reports])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2 text-slate-700">
        <LayoutGrid size={20} />
        <h1 className="text-2xl font-bold text-slate-900">City Dashboard</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Review citizen-reported road risk locations on the map and list to prioritize maintenance.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
        {(['High', 'Medium', 'Low']).map((level) => {
          const style = RISK_STYLES[level]
          return (
            <div key={level} className={`rounded-xl border p-3 text-center ${style.badge}`}>
              <p className="text-2xl font-bold">{counts[level] ?? 0}</p>
              <p className="text-xs font-medium">{style.label} Risk</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'border-blue-600 bg-blue-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'All' ? 'All' : RISK_STYLES[f].label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filteredReports.length} reports</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MapView
            reports={filteredReports}
            height={520}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </div>
        <div className="flex max-h-[520px] flex-col gap-2.5 overflow-y-auto pr-1 lg:col-span-2">
          {filteredReports.map((report) => (
            <ReportListItem
              key={report.id}
              report={report}
              isSelected={selectedId === report.id}
              onSelect={setSelectedId}
            />
          ))}
          {filteredReports.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
              No reports at this risk level.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
