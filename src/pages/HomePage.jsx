import { useNavigate } from 'react-router-dom'
import { CloudRain, Car, Route, ScanSearch, Building2 } from 'lucide-react'
import UploadDropzone from '../components/UploadDropzone'
import { useApp } from '../context/AppContext'

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'AI Crack & Pothole Detection',
    desc: 'Automatically detects road cracks and pothole regions in the uploaded photo.',
  },
  {
    icon: CloudRain,
    title: 'Rainfall Data',
    desc: 'Factors in local rainfall data to estimate how quickly a crack could worsen.',
  },
  {
    icon: Car,
    title: 'Traffic Volume Data',
    desc: 'Considers vehicle traffic volume to estimate pothole development speed.',
  },
  {
    icon: Route,
    title: 'Road Type Analysis',
    desc: 'Distinguishes risk by road type — highway, arterial, local, residential.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { analyzePhoto } = useApp()

  const handleFileSelected = (file) => {
    analyzePhoto(file)
    navigate('/result')
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-blue-50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700">
              <Building2 size={14} />
              A citizen-powered road safety diagnosis service
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Diagnose pothole risk
              <br />
              from a single road photo
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Upload a photo and our AI detects cracks and potholes, then combines rainfall,
              traffic volume, and road type data to score the risk as Low, Medium, or High.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-xl">
            <UploadDropzone onFileSelected={handleFileSelected} />
            <p className="mt-3 text-center text-xs text-slate-400">
              * This demo is not connected to a real AI model — analysis results are simulated for demonstration.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          How is the risk diagnosed?
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Icon size={20} />
              </span>
              <p className="mt-4 font-semibold text-slate-800">{title}</p>
              <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Are you a city official?</h2>
          <p className="mt-2 text-sm text-slate-500">
            See citizen-reported risk locations on a map and list, and prioritize maintenance work.
          </p>
          <a
            href="/dashboard"
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            View City Dashboard
          </a>
        </div>
      </section>
    </div>
  )
}
