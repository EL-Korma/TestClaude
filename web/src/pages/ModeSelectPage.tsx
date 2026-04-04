import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlowRings from '../components/bits/GlowRings'
import Aurora from '../components/bits/Aurora'

const MODES = [
  { id: 'couple', emoji: '❤️', title: 'Couple Mode', sub: 'Train with your partner. Stay in sync.' },
  { id: 'besties', emoji: '🤝', title: 'Besties Mode', sub: 'Accountability squad. No excuses.' },
]

export default function ModeSelectPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="screen min-h-screen items-center justify-center" style={{ background: '#0A0A0A' }}>
      <Aurora colorStops={['#FF5E1A', '#1a0a00', '#0A0A0A']} intensity={0.3} />

      <div className="relative z-10 flex flex-col items-center px-6 py-16 w-full max-w-sm mx-auto">
        {/* Animated ring + flame */}
        <div className="relative flex items-center justify-center mb-10">
          <GlowRings size={180} rings={2} color="#FF5E1A" />
          <div className="absolute flex items-center justify-center">
            <motion.span
              className="text-5xl"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔥
            </motion.span>
          </div>
        </div>

        <motion.h1
          className="font-display text-5xl tracking-widest text-center mb-2"
          style={{ color: '#F5F0EA' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          CHOOSE YOUR MODE
        </motion.h1>
        <p className="font-body text-sm text-center mb-10" style={{ color: '#7A7570' }}>
          Who are you training with?
        </p>

        {/* Mode cards */}
        <div className="flex flex-col gap-4 w-full mb-10">
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: selected === mode.id ? 'rgba(255,94,26,0.12)' : '#141414',
                border: `2px solid ${selected === mode.id ? '#FF5E1A' : 'rgba(255,255,255,0.06)'}`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{mode.emoji}</span>
                <div>
                  <p className="font-display text-xl tracking-wide" style={{ color: selected === mode.id ? '#FF5E1A' : '#F5F0EA' }}>
                    {mode.title}
                  </p>
                  <p className="font-body text-sm mt-0.5" style={{ color: '#7A7570' }}>{mode.sub}</p>
                </div>
                <div className="ml-auto">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: selected === mode.id ? '#FF5E1A' : '#3A3835' }}
                  >
                    {selected === mode.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          className="btn-primary"
          onClick={() => selected && navigate('/home')}
          style={{ opacity: selected ? 1 : 0.4 }}
          whileTap={selected ? { scale: 0.97 } : undefined}
        >
          START TOGETHER
        </motion.button>
      </div>
    </div>
  )
}
