import { Link, NavLink } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
  }`

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
            <ShieldCheck size={20} />
          </span>
          <div className="leading-tight">
            <p className="font-bold text-slate-900">RoadRisk AI</p>
            <p className="text-[11px] text-slate-500">Road Crack &amp; Pothole Risk Diagnosis</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            City Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
