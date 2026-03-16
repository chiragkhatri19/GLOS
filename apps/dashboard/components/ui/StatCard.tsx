'use client'

import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

export function StatCard({ 
  label, 
  value, 
  sub, 
  color = 'var(--text)',
  icon,
  trend,
  delay = 0 
}: StatCardProps) {
  return (
    <div 
      className="fade-up"
      style={{ 
        animationDelay: `${delay}ms`,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        transition: 'all 200ms',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      
      {/* Icon */}
      {icon && (
        <div style={{ 
          marginBottom: '12px', 
          color,
          display: 'inline-flex',
          padding: '8px',
          background: `${color}11`,
          borderRadius: 'var(--r)',
        }}>
          {icon}
        </div>
      )}
      
      {/* Label */}
      <div style={{ 
        fontFamily: 'var(--mono)', 
        fontSize: '11px', 
        fontWeight: 500, 
        textTransform: 'uppercase' as const, 
        letterSpacing: '0.08em', 
        color: 'var(--text-3)',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      
      {/* Value */}
      <div style={{ 
        fontFamily: 'var(--mono)', 
        fontSize: '32px', 
        fontWeight: 600, 
        color,
        letterSpacing: '-0.02em',
        marginBottom: '6px',
      }}>
        {value}
      </div>
      
      {/* Subtitle */}
      {sub && (
        <div style={{ 
          fontFamily: 'var(--sans)', 
          fontSize: '13px', 
          color: 'var(--text-2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {trend === 'up' && <span style={{ color: 'var(--cyan)' }}>↑</span>}
          {trend === 'down' && <span style={{ color: 'var(--red)' }}>↓</span>}
          {sub}
        </div>
      )}
    </div>
  )
}
