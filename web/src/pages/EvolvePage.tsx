import { motion } from 'framer-motion'
import Orb from '../components/bits/Orb'
import BottomNav from '../components/ui/BottomNav'
import CountUp from '../components/bits/CountUp'

const TIERS = [
  {
    id: 'bronze', label: 'BRONZE ERA', emoji: '🥉', color: '#CD7F32',
    active: true, progress: 75, sessions: 18, total: 24,
  },
  {
    id: 'silver', label: 'SILVER ERA', emoji: '🥈', color: '#C0C0C0',
    active: false, locked: false, sessionsAway: 26,
  },
  {
    id: 'gold', label: 'GOLD ERA', emoji: '🥇', color: '#FFD700',
    active: false, locked: true,
  },
  {
    id: 'diamond', label: 'DIAMOND ERA', emoji: '💎', color: '#B9F2FF',
    active: false, locked: true,
  },
]

export default function EvolvePage() {
  return (
    <div className="relative min-h-screen pb-20 overflow-y-auto" style={{ background: '#0A0A0A' }}>
      <Orb size={400} color="#CD7F32" className="top-0 left-[-100px]" opacity={0.08} blur={100} />

      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <p className="font-body text-xs tracking-widest mb-1" style={{ color: '#7A7570' }}>YOUR JOURNEY</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-5xl tracking-widest" style={{ color: '#F5F0EA' }}>EVOLUTION</h1>
          <div className="px-3 py-1 rounded-xl" style={{ background: '#FF5E1A22', border: '1px solid rgba(255,94,26,0.3)' }}>
            <span className="font-display text-sm tracking-wide" style={{ color: '#FF5E1A' }}>
              <CountUp end={18} duration={1.5} suffix=" sessions" />
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-6">
        {/* Collectible duo card */}
        <motion.div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: '#141414', border: '2px solid #CD7F32' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-xl tracking-widest" style={{ color: '#CD7F32' }}>BRONZE COLLECTIBLE</span>
            <span className="text-xl">🥉</span>
          </div>
          <div className="flex gap-3">
            {[{ avatar: '🐯', name: 'Karim' }, { avatar: '🦋', name: 'Aya' }].map((m) => (
              <div key={m.name} className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-2 py-6"
                style={{ background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.3)' }}>
                <span className="text-4xl">{m.avatar}</span>
                <span className="font-display text-sm tracking-wide" style={{ color: '#F5F0EA' }}>{m.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >🔥</motion.span>
            <span className="font-display text-lg tracking-widest" style={{ color: '#CD7F32' }}>DUO FLAME</span>
          </div>
        </motion.div>

        {/* Evolution path */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div className="flex flex-col gap-4">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.id}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Orb node */}
                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: tier.locked ? '#141414' : `${tier.color}22`,
                      border: `2px solid ${tier.locked ? '#242424' : tier.color}`,
                      boxShadow: tier.active ? `0 0 24px ${tier.color}55` : 'none',
                      opacity: tier.locked ? 0.4 : 1,
                    }}
                    animate={tier.active ? { y: [0, -4, 0] } : undefined}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {tier.locked ? '🔒' : tier.emoji}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-2xl p-4"
                  style={{
                    background: tier.active ? `${tier.color}0D` : '#141414',
                    border: `1px solid ${tier.active ? `${tier.color}44` : 'rgba(255,255,255,0.06)'}`,
                    opacity: tier.locked ? 0.4 : 1,
                  }}
                >
                  <p className="font-display text-lg tracking-widest mb-1"
                    style={{ color: tier.locked ? '#3A3835' : tier.active ? tier.color : '#7A7570' }}>
                    {tier.label}
                  </p>
                  {tier.active && (
                    <>
                      <p className="font-body text-xs mb-2" style={{ color: '#7A7570' }}>
                        {tier.sessions}/{tier.total} sessions
                      </p>
                      <div className="h-1.5 rounded-full" style={{ background: '#242424' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: tier.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${tier.progress}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                    </>
                  )}
                  {!tier.active && !tier.locked && tier.sessionsAway && (
                    <p className="font-body text-xs" style={{ color: '#7A7570' }}>
                      {tier.sessionsAway} sessions away
                    </p>
                  )}
                  {tier.locked && (
                    <p className="font-body text-xs" style={{ color: '#3A3835' }}>Complete previous tier to unlock</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Motivation card */}
        <motion.div
          className="card flex items-center gap-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-3xl">💪</span>
          <div>
            <p className="font-display text-base tracking-wide mb-0.5" style={{ color: '#F5F0EA' }}>KEEP PUSHING</p>
            <p className="font-body text-xs" style={{ color: '#7A7570' }}>
              6 more sessions to unlock Silver Era. You've got this!
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
