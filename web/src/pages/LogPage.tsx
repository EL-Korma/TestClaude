import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ScanLine from '../components/bits/ScanLine'
import BottomNav from '../components/ui/BottomNav'

export default function LogPage() {
  const navigate = useNavigate()
  const [logged, setLogged] = useState(false)

  return (
    <div className="relative min-h-screen pb-20 flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-4">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => navigate('/home')}
        >
          <span style={{ color: '#F5F0EA' }}>←</span>
        </button>
        <div>
          <h1 className="font-display text-3xl tracking-widest" style={{ color: '#F5F0EA' }}>LOG SESSION</h1>
          <p className="font-body text-xs" style={{ color: '#7A7570' }}>Snap your pose to log today</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 flex-1">
        {/* Duo status row */}
        <div className="flex items-center gap-2">
          {[
            { name: 'Karim', done: true },
            { name: 'Aya', done: false },
          ].map((m, i) => (
            <>
              {i > 0 && (
                <div key="dots" className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="w-1 h-1 rounded-full" style={{ background: '#3A3835' }} />
                  ))}
                </div>
              )}
              <div
                key={m.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: m.done ? 'rgba(34,197,94,0.1)' : '#141414',
                  border: `1px solid ${m.done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <span>{m.done ? '✅' : '⏳'}</span>
                <span className="font-display text-sm tracking-wide" style={{ color: m.done ? '#22C55E' : '#7A7570' }}>
                  {m.name}
                </span>
              </div>
            </>
          ))}
        </div>

        {/* Viewfinder */}
        {!logged ? (
          <motion.div
            className="relative rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              height: 320,
              background: '#0D0D0D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ScanLine height={300} color="#FF5E1A" />

            {/* Corner brackets */}
            {[
              { top: 16, left: 16, rotate: 0 },
              { top: 16, right: 16, rotate: 90 },
              { bottom: 16, right: 16, rotate: 180 },
              { bottom: 16, left: 16, rotate: 270 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8"
                style={{
                  ...pos,
                  borderTop: i === 0 || i === 3 ? '2px solid #FF5E1A' : 'none',
                  borderLeft: i === 0 || i === 3 ? '2px solid #FF5E1A' : 'none',
                  borderBottom: i === 1 || i === 2 ? '2px solid #FF5E1A' : 'none',
                  borderRight: i === 1 || i === 2 ? '2px solid #FF5E1A' : 'none',
                  borderTopLeftRadius: i === 0 ? 8 : 0,
                  borderTopRightRadius: i === 1 ? 8 : 0,
                  borderBottomRightRadius: i === 2 ? 8 : 0,
                  borderBottomLeftRadius: i === 3 ? 8 : 0,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}

            {/* Silhouette */}
            <motion.div
              className="text-7xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🧘
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="rounded-3xl p-8 flex flex-col items-center gap-4"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >✅</motion.div>
            <h2 className="font-display text-3xl tracking-widest" style={{ color: '#22C55E' }}>SESSION LOGGED!</h2>
            <p className="font-body text-sm" style={{ color: '#7A7570' }}>Streak maintained 🔥 Waiting for Aya…</p>
            <div className="flex gap-3 mt-2">
              {[
                { name: 'Karim', done: true },
                { name: 'Aya', done: false },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: m.done ? 'rgba(34,197,94,0.12)' : '#141414' }}>
                  <span>{m.done ? '✅' : '⏳'}</span>
                  <span className="font-display text-sm" style={{ color: m.done ? '#22C55E' : '#7A7570' }}>{m.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tip */}
        {!logged && (
          <div className="card flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="font-body text-sm" style={{ color: '#7A7570' }}>
              Match the pose and hold still — the AI captures it automatically.
            </p>
          </div>
        )}

        {/* Actions */}
        {!logged && (
          <div className="flex items-center gap-4 mt-auto">
            <button
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
            >🖼️</button>

            <motion.button
              className="flex-1 h-16 rounded-2xl font-display text-xl tracking-widest text-white flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF5E1A, #FF8C42)', boxShadow: '0 0 24px rgba(255,94,26,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLogged(true)}
            >
              SNAP IT
            </motion.button>

            <button
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
            >🔄</button>
          </div>
        )}

        {logged && (
          <button className="btn-primary" onClick={() => navigate('/home')}>
            BACK TO HOME
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
