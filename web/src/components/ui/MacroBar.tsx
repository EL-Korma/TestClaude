import { motion } from 'framer-motion'

interface MacroBarProps {
  label: string
  value: number
  max: number
  unit: string
  color: string
}

export default function MacroBar({ label, value, max, unit, color }: MacroBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="font-body text-xs" style={{ color: '#7A7570' }}>{label}</span>
        <span className="font-body text-xs font-medium" style={{ color: '#F5F0EA' }}>
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#242424' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}
