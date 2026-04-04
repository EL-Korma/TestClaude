import { useEffect, useRef } from 'react'

interface AuroraProps {
  className?: string
  colorStops?: string[]
  speed?: number
  intensity?: number
}

export default function Aurora({
  className = '',
  colorStops = ['#FF5E1A', '#FF8C42', '#1a0a00'],
  speed = 1,
  intensity = 0.5,
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const blobs = [
      { x: 0.3, y: 0.3, r: 0.5, dx: 0.0003, dy: 0.0002, color: colorStops[0] },
      { x: 0.7, y: 0.6, r: 0.45, dx: -0.0002, dy: 0.0003, color: colorStops[1] },
      { x: 0.5, y: 0.8, r: 0.4, dx: 0.0002, dy: -0.0002, color: colorStops[2] ?? '#0a0514' },
    ]

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0A0A0A'
      ctx.fillRect(0, 0, W, H)

      blobs.forEach((b) => {
        b.x += b.dx * speed
        b.y += b.dy * speed
        if (b.x < 0 || b.x > 1) b.dx *= -1
        if (b.y < 0 || b.y > 1) b.dy *= -1

        const grd = ctx.createRadialGradient(
          b.x * W, b.y * H, 0,
          b.x * W, b.y * H, b.r * Math.max(W, H)
        )
        const alpha = Math.round(intensity * 80).toString(16).padStart(2, '0')
        grd.addColorStop(0, b.color + alpha)
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, W, H)
      })

      t += 0.01
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [colorStops, speed, intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
