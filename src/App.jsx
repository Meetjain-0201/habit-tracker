import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Today from './pages/Today'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0f0f0f] pb-20">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}
