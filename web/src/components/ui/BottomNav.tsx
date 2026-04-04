import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  { label: 'HOME', icon: '⊞', path: '/home' },
  { label: 'LOG', icon: '📸', path: '/log', center: true },
  { label: 'EVOLVE', icon: '⭐', path: '/evolve' },
  { label: 'FUEL', icon: '🥗', path: '/nutrition' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-end justify-around z-50"
      style={{
        background: 'linear-gradient(to top, #0A0A0A, rgba(10,10,10,0.95))',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        height: 72,
        paddingBottom: 8,
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        if (tab.center) {
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center"
              style={{ marginTop: -24 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-orange-glow"
                style={{
                  background: 'linear-gradient(135deg, #FF5E1A 0%, #FF8C42 100%)',
                  boxShadow: '0 0 24px rgba(255,94,26,0.5)',
                }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
              >
                {tab.icon}
              </motion.div>
              <span
                className="mt-1 font-display text-xs tracking-widest"
                style={{ color: active ? '#FF5E1A' : '#7A7570', fontSize: 9 }}
              >
                {tab.label}
              </span>
            </button>
          )
        }
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-1 pt-2"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="text-2xl"
              style={{ opacity: active ? 1 : 0.5 }}
            >
              {tab.icon}
            </motion.div>
            <span
              className="font-display tracking-widest"
              style={{ color: active ? '#FF5E1A' : '#7A7570', fontSize: 9 }}
            >
              {tab.label}
            </span>
            {active && (
              <motion.div
                layoutId="nav-dot"
                className="w-1 h-1 rounded-full bg-primary"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
