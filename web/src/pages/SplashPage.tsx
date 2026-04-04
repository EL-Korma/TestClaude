import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Aurora from '../components/bits/Aurora'
import Particles from '../components/bits/Particles'
import BlurText from '../components/bits/BlurText'
import GlowRings from '../components/bits/GlowRings'

export default function SplashPage() {
  const navigate = useNavigate()

  return (
    <div className="screen items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
      <Aurora intensity={0.4} />
      <Particles count={35} color="#FF5E1A" speed={0.2} />

      {/* Rings + logo */}
      <div className="relative flex items-center justify-center mb-10 z-10">
        <GlowRings size={300} rings={2} color="#FF5E1A" />
        <div className="absolute flex flex-col items-center">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🔥
          </motion.div>
        </div>
      </div>

      {/* Brand */}
      <div className="z-10 flex flex-col items-center px-8 text-center">
        <motion.h1
          className="font-display text-8xl tracking-widest mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            background: 'linear-gradient(135deg, #FF5E1A 0%, #FF8C42 50%, #FFB380 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TWINFIT
        </motion.h1>

        <motion.p
          className="font-body text-sm tracking-widest mb-12"
          style={{ color: '#7A7570' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <BlurText text="STREAK TOGETHER. GROW TOGETHER." delay={0.8} />
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="w-full max-w-xs flex flex-col gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <button className="btn-primary" onClick={() => navigate('/mode-select')}>
            GET STARTED
          </button>
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            I HAVE AN ACCOUNT
          </button>
        </motion.div>
      </div>
    </div>
  )
}
