'use client'

import React from 'react'

interface InsightCardProps {
  title: string
  description: string
  metric?: string
  metricLabel?: string
  icon: React.ReactNode
  color: string
  delay?: number
}

export function InsightCard({ 
  title, 
  description, 
  metric, 
  metricLabel,
  icon,
  color,
  delay = 0 
}: InsightCardProps) {
  return (
    <div 
      className="fade-up"
      style={{ 
        animationDelay: `${delay}ms`,
        background: 'var(--surface)',
        border: `1px solid ${color}33`,
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        transition: 'all 200ms',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gradient background */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />
      
      {/* Icon */}
      <div style={{ 
        marginBottom: '16px', 
        color,
        display: 'inline-flex',
        padding: '10px',
        background: `${color}11`,
        borderRadius: 'var(--r)',
      }}>
        {icon}
      </div>
      
      {/* Title */}
      <div style={{ 
        fontFamily: 'var(--mono)', 
        fontSize: '14px', 
        fontWeight: 600, 
        color: 'var(--text)',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      
      {/* Description */}
      <div style={{ 
        fontFamily: 'var(--sans)', 
        fontSize: '13px', 
        color: 'var(--text-2)',
        lineHeight: 1.6,
        marginBottom: '16px',
      }}>
        {description}
      </div>
      
      {/* Metric */}
      {metric && (
        <div style={{
          paddingTop: '16px',
          borderTop: `1px solid ${color}22`,
        }}>
          <div style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '24px', 
            fontWeight: 700, 
            color,
            letterSpacing: '-0.02em',
          }}>
            {metric}
          </div>
          {metricLabel && (
            <div style={{ 
              fontFamily: 'var(--sans)', 
              fontSize: '11px', 
              color: 'var(--text-3)',
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {metricLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
