'use client'
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, motion, animate } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  format?: 'number' | 'percent' | 'plus'
  style?: React.CSSProperties
  className?: string
}

export function AnimatedNumber({ value, duration = 1.2, format = 'number', style, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => {
    const n = Math.round(v)
    if (format === 'percent') return `${n}%`
    if (format === 'plus') return `+${n}%`
    return n.toLocaleString()
  })

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.22, 1, 0.36, 1], // custom ease-out
    })
    return controls.stop
  }, [inView, value, duration, motionVal])

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
    >
      {rounded}
    </motion.span>
  )
}
