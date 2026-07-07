import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ResultPage from './pages/ResultPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
