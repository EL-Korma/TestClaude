import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Aurora from '../components/bits/Aurora'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [_focusField, setFocusField] = useState<string | null>(null)

  const handleLogin = () => navigate('/home')

  return (
    <div className="screen min-h-screen" style={{ background: '#0A0A0A' }}>
      <Aurora colorStops={['#FF5E1A', '#2d1400', '#0A0A0A']} intensity={0.25} />

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-14 pb-8 max-w-md mx-auto w-full">
        {/* Back */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-10"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => navigate(-1)}
        >
          <span style={{ color: '#F5F0EA' }}>←</span>
        </button>

        {/* Logo badge */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
          style={{ background: 'linear-gradient(135deg, #FF5E1A 0%, #FF8C42 100%)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          🔥
        </motion.div>

        <motion.h1
          className="font-display text-5xl tracking-widest mb-1"
          style={{ color: '#F5F0EA' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          SIGN IN
        </motion.h1>
        <p className="font-body text-sm mb-8" style={{ color: '#7A7570' }}>
          Welcome back, champion.
        </p>

        {/* Form */}
        <motion.div
          className="card flex flex-col gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <label className="font-body text-xs mb-1 block" style={{ color: '#7A7570' }}>EMAIL</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
            />
          </div>
          <div>
            <label className="font-body text-xs mb-1 block" style={{ color: '#7A7570' }}>PASSWORD</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
            />
          </div>
          <button
            className="self-end font-body text-xs"
            style={{ color: '#FF5E1A' }}
            onClick={() => navigate('/reset-password')}
          >
            Forgot password?
          </button>
        </motion.div>

        <motion.button
          className="btn-primary mb-4"
          onClick={handleLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
        >
          SIGN IN
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: '#242424' }} />
          <span className="font-body text-xs" style={{ color: '#7A7570' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: '#242424' }} />
        </div>

        {/* Social */}
        <div className="flex gap-3 mb-8">
          {['G  Google', '🍎  Apple'].map((label) => (
            <button
              key={label}
              className="flex-1 h-12 rounded-xl font-body text-sm flex items-center justify-center gap-2"
              style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F0EA',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-center font-body text-sm" style={{ color: '#7A7570' }}>
          Don't have an account?{' '}
          <button
            className="font-medium"
            style={{ color: '#FF5E1A' }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
