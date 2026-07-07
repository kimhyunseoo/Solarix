import { createContext, useContext, useMemo, useState } from 'react'
import { generateAnalysis, generateSeedReports } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [reports, setReports] = useState(() => generateSeedReports())
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [stampCounter, setStampCounter] = useState(0)

  const analyzePhoto = (file) => {
    const imageUrl = URL.createObjectURL(file)
    const analysis = generateAnalysis(imageUrl)
    analysis.createdAt = 'Just now'
    setCurrentAnalysis({ ...analysis, reported: false })
    setStampCounter((c) => c + 1)
    return analysis
  }

  const reportCurrentAnalysis = () => {
    if (!currentAnalysis || currentAnalysis.reported) return
    setReports((prev) => [{ ...currentAnalysis }, ...prev])
    setCurrentAnalysis((prev) => (prev ? { ...prev, reported: true } : prev))
  }

  const value = useMemo(
    () => ({ reports, currentAnalysis, analyzePhoto, reportCurrentAnalysis, stampCounter }),
    [reports, currentAnalysis, stampCounter],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
