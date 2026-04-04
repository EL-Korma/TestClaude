import { motion } from 'framer-motion'

interface GlowRingsProps {
  size?: number
  rings?: number
  color?: string
}

export default function GlowRings({ size = 280, rings = 2, color = '#FF5E1A' }: GlowRingsProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => {
        const s = size - i * 60
        const duration = 8 + i * 4
        const reverse = i % 2 === 1
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s,
              height: s,
              border: `1px dashed ${color}`,
              opacity: 0.25 - i * 0.05,
            }}
            animate={{ rotate: reverse ? -360 : 360 }}
            transition={{ duration, repeat: Infinity, ease: 'linear' }}
          />
        )
      })}
    </div>
  )
}
