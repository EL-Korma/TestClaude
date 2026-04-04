interface OrbProps {
  size?: number
  color?: string
  className?: string
  blur?: number
  opacity?: number
}

export default function Orb({
  size = 300,
  color = '#FF5E1A',
  className = '',
  blur = 80,
  opacity = 0.15,
}: OrbProps) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none animate-orb ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity,
      }}
    />
  )
}
