import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountUp from '../components/bits/CountUp'
import Orb from '../components/bits/Orb'
import BottomNav from '../components/ui/BottomNav'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_STATE = ['done', 'done', 'done', 'done', 'done', 'today', 'empty']

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen pb-20 overflow-y-auto" style={{ background: '#0A0A0A' }}>
      <Orb size={500} color="#FF5E1A" className="top-[-100px] right-[-100px]" opacity={0.08} blur={120} />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="font-body text-xs tracking-widest mb-0.5" style={{ color: '#7A7570' }}>TODAY'S DUO</p>
          <h2 className="font-display text-2xl tracking-wide" style={{ color: '#F5F0EA' }}>KARIM & AYA</h2>
        </div>
        {/* Avatar pair */}
        <div className="flex">
          {['🐯', '🦋'].map((a, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: '#1C1C1C',
                border: '2px solid #0A0A0A',
                marginLeft: i > 0 ? -10 : 0,
                zIndex: i === 0 ? 2 : 1,
              }}
            >
              {a}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Streak hero */}
        <motion.div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a0800 0%, #2d1200 100%)', border: '1px solid rgba(255,94,26,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Orb size={200} color="#FF5E1A" className="top-0 right-0" opacity={0.15} blur={60} />
          <div className="flex items-center gap-5 mb-5">
            <motion.span
              className="text-5xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >🔥</motion.span>
            <div>
              <div className="flex items-end gap-2">
                <span className="font-display leading-none" style={{ fontSize: 72, color: '#FF5E1A' }}>
                  <CountUp end={14} duration={1.8} />
                </span>
                <span className="font-display text-2xl mb-2 tracking-wider" style={{ color: '#F5F0EA' }}>DAYS</span>
              </div>
              <p className="font-display text-sm tracking-widest" style={{ color: '#7A7570' }}>IN A ROW</p>
            </div>
          </div>

          {/* Duo status */}
          <div className="flex gap-3 mb-5">
            {[
              { name: 'Karim', status: 'done', emoji: '✅' },
              { name: 'Aya', status: 'pending', emoji: '⏳' },
            ].map((m) => (
              <div key={m.name} className="flex-1 rounded-xl p-3 flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span>{m.emoji}</span>
                <div>
                  <p className="font-display text-sm tracking-wide" style={{ color: '#F5F0EA' }}>{m.name}</p>
                  <p className="font-body text-xs" style={{ color: '#7A7570' }}>{m.status === 'done' ? 'Logged' : 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 7-day strip */}
          <div className="flex gap-2">
            {DAYS.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="font-body text-xs" style={{ color: '#7A7570' }}>{d}</span>
                <div
                  className="w-full h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: DAY_STATE[i] === 'done'
                      ? 'rgba(255,94,26,0.25)'
                      : DAY_STATE[i] === 'today'
                        ? 'rgba(255,94,26,0.5)'
                        : '#242424',
                    border: DAY_STATE[i] === 'today' ? '1px solid #FF5E1A' : 'none',
                  }}
                >
                  {DAY_STATE[i] === 'done' && <span className="text-xs">🔥</span>}
                  {DAY_STATE[i] === 'today' && <span className="text-xs">•</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="flex gap-3">
          {[
            { label: 'LOG', icon: '📸', primary: true, path: '/log' },
            { label: 'EVOLVE', icon: '⭐', path: '/evolve' },
            { label: 'FUEL', icon: '🥗', path: '/nutrition' },
          ].map((a, i) => (
            <motion.button
              key={a.label}
              className="flex-1 h-16 rounded-2xl flex flex-col items-center justify-center gap-1"
              style={{
                background: a.primary ? 'linear-gradient(135deg, #FF5E1A, #FF8C42)' : '#141414',
                border: a.primary ? 'none' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: a.primary ? '0 0 20px rgba(255,94,26,0.35)' : 'none',
              }}
              onClick={() => navigate(a.path)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileTap={{ scale: 0.93 }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="font-display text-xs tracking-widest"
                style={{ color: a.primary ? '#fff' : '#7A7570' }}>{a.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Today's Pose */}
        <motion.div
          className="card flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: '#FF5E1A22' }}>🧘</div>
          <div className="flex-1">
            <p className="font-body text-xs tracking-widest mb-0.5" style={{ color: '#7A7570' }}>TODAY'S POSE</p>
            <p className="font-display text-xl tracking-wide" style={{ color: '#F5F0EA' }}>POWER STANCE</p>
            <p className="font-body text-xs" style={{ color: '#7A7570' }}>Hold for 45 seconds each side</p>
          </div>
          <span className="text-2xl">🥉</span>
        </motion.div>

        {/* Coming soon cards */}
        <p className="font-body text-xs tracking-widest mt-2" style={{ color: '#7A7570' }}>UNLOCKABLES</p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
          {[
            { tier: 'Silver', emoji: '🥈', locked: true },
            { tier: 'Gold', emoji: '🥇', locked: true },
            { tier: 'Diamond', emoji: '💎', locked: true },
          ].map((c) => (
            <div
              key={c.tier}
              className="min-w-[120px] h-32 rounded-2xl flex flex-col items-center justify-center gap-2 flex-shrink-0"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-3xl opacity-30">{c.emoji}</span>
              <span className="font-display text-sm tracking-wide" style={{ color: '#3A3835' }}>
                🔒 {c.tier.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
