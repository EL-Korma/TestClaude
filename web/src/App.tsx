import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import ModeSelectPage from './pages/ModeSelectPage'
import HomePage from './pages/HomePage'
import LogPage from './pages/LogPage'
import EvolvePage from './pages/EvolvePage'
import NutritionPage from './pages/NutritionPage'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/mode-select" element={<ModeSelectPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/evolve" element={<EvolvePage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
