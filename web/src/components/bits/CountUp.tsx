import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

export default function CountUp({
  end,
  start = 0,
  duration = 1.5,
  className = '',
  suffix = '',
  prefix = '',
}: CountUpProps) {
  const [value, setValue] = useState(start)
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const observerRef = useRef<IntersectionObserver | undefined>(undefined)
  const elRef = useRef<HTMLSpanElement>(null)

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const progress = Math.min((timestamp - startTimeRef.current) / (duration * 1000), 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
    setValue(Math.round(start + (end - start) * eased))
    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTimeRef.current = 0
          frameRef.current = requestAnimationFrame(animate)
          observerRef.current?.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (elRef.current) observerRef.current.observe(elRef.current)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      observerRef.current?.disconnect()
    }
  }, [end, start, duration])

  return (
    <span ref={elRef} className={className}>
      {prefix}{value}{suffix}
    </span>
  )
}
