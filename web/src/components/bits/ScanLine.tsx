import { motion } from 'framer-motion'

interface ScanLineProps {
  height?: number
  color?: string
}

export default function ScanLine({ height = 280, color = '#FF5E1A' }: ScanLineProps) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, ${color}88, transparent)`,
        boxShadow: `0 0 8px ${color}`,
      }}
      initial={{ top: 0 }}
      animate={{ top: height }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
    />
  )
}
