'use client'

import React, { useState } from 'react'

interface QualityDetailProps {
  score: any
  expanded: boolean
  onToggle: () => void
}

export function QualityDetail({ score, expanded, onToggle }: QualityDetailProps) {
  return (
    <>
      <tr
        className="fade-up row-hover"
        onClick={onToggle}
        style={{
          borderBottom: expanded ? 'none' : '1px solid var(--border)',
          cursor: 'pointer',
          background: expanded ? 'var(--primary-dim)' : 'transparent',
          transition: 'all 200ms',
        }}
      >
        <td style={{ padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', fontWeight: expanded ? 600 : 400 }}>
          {score.key}
        </td>
        <td style={{ padding: '16px 20px' }}>
          <span style={{ 
            fontFamily: 'var(--sans)', 
            fontSize: '13px', 
            color: 'var(--text-2)',
            display: 'block',
            maxWidth: '280px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            "{score.source_en}"
          </span>
        </td>
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ 
              fontFamily: 'var(--mono)', 
              fontSize: '12px', 
              color: 'var(--red)',
              padding: '4px 8px',
              background: 'rgba(248, 113, 113, 0.1)',
              borderRadius: '4px',
              display: 'inline-block',
            }}>
              {score.before}
            </span>
            {score.tone && (
              <span style={{ 
                fontFamily: 'var(--sans)', 
                fontSize: '10px', 
                color: 'var(--text-3)',
                fontStyle: 'italic',
              }}>
                {score.before_meaning}
              </span>
            )}
          </div>
        </td>
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ 
              fontFamily: 'var(--mono)', 
              fontSize: '12px', 
              color: 'var(--cyan)',
              padding: '4px 8px',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: '4px',
              display: 'inline-block',
              fontWeight: 600,
            }}>
              {score.after}
            </span>
            {score.context_hint && (
              <span style={{ 
                fontFamily: 'var(--sans)', 
                fontSize: '10px', 
                color: 'var(--cyan)',
                fontStyle: 'italic',
              }}>
                Context: {score.context_hint}
              </span>
            )}
          </div>
        </td>
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `conic-gradient(var(--cyan) ${score.coverage}%, var(--border) ${score.coverage}%)`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--mono)',
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--cyan)',
              }}>
                {score.coverage}%
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '11px', 
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Coverage
              </span>
              <span style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '12px', 
                color: 'var(--text-2)',
              }}>
                {Object.values(score.locales).filter((s: any) => s.status === 'translated').length}/{Object.keys(score.locales).length} locales
              </span>
            </div>
          </div>
        </td>
        <td style={{ padding: '16px 20px' }}>
          <span style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '13px', 
            fontWeight: 700, 
            color: 'var(--primary)',
            padding: '6px 12px',
            background: 'var(--primary-dim)',
            borderRadius: '6px',
            display: 'inline-block',
          }}>
            +{score.improvement_percent}%
          </span>
        </td>
      </tr>
      
      {/* Expanded detail row */}
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--primary-dim)' }}>
          <td colSpan={6} style={{ padding: '0 20px 20px' }}>
            <div style={{
              background: 'var(--surface-2)', 
              borderRadius: '12px', 
              padding: '24px',
              border: '1px solid var(--primary)',
              display: 'flex', 
              gap: '32px', 
              flexWrap: 'wrap',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              {/* English Source */}
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--text-3)', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--text)',
                    display: 'inline-block',
                  }} />
                  English source
                </div>
                <div style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '16px', 
                  color: 'var(--text)',
                  padding: '16px',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  lineHeight: 1.6,
                }}>
                  "{score.source_en}"
                </div>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '11px', 
                  color: 'var(--text-3)', 
                  marginTop: '8px',
                  padding: '8px',
                  background: 'var(--surface)',
                  borderRadius: '6px',
                }}>
                  Key: <code style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--cyan)' }}>{score.key}</code>
                </div>
              </div>
              
              {/* Before - Blind AI */}
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--red)', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--red)',
                    display: 'inline-block',
                    animation: 'pulse-dot 1.5s ease-in-out infinite',
                  }} />
                  Before (blind AI, no context)
                </div>
                <div style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '16px', 
                  color: 'var(--text)',
                  padding: '16px',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  lineHeight: 1.6,
                }}>
                  "{score.before}"
                </div>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '11px', 
                  color: 'var(--text-3)', 
                  marginTop: '8px',
                  padding: '8px',
                  background: 'var(--surface)',
                  borderRadius: '6px',
                  border: '1px dashed var(--border)',
                }}>
                  {score.before_meaning}
                </div>
              </div>
              
              {/* After - GLOS Context-Aware */}
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--cyan)', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--cyan)',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--cyan)',
                  }} />
                  After (GLOS — context-aware)
                </div>
                <div style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '16px', 
                  color: 'var(--cyan)',
                  padding: '16px',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--cyan)',
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.15)',
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}>
                  "{score.after}"
                </div>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '11px', 
                  color: 'var(--cyan)', 
                  marginTop: '8px',
                  padding: '8px',
                  background: 'var(--surface)',
                  borderRadius: '6px',
                  border: '1px dashed rgba(34, 211, 238, 0.3)',
                }}>
                  {score.after_meaning || 'Translated with visual UI context'}
                </div>
              </div>
              
              {/* Improvement Metric */}
              {score.improvement_percent > 0 && (
                <>
                  <div style={{ 
                    width: '1px', 
                    background: 'var(--border)', 
                    flexShrink: 0,
                    minHeight: '120px',
                  }} />
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    minWidth: '160px',
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--sans)', 
                      fontSize: '10px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      color: 'var(--text-3)', 
                      marginBottom: '12px',
                    }}>
                      Improvement
                    </div>
                    <div style={{ 
                      fontFamily: 'var(--mono)', 
                      fontWeight: 700, 
                      fontSize: '36px', 
                      color: 'var(--primary)',
                      letterSpacing: '-0.03em',
                      textShadow: '0 0 20px var(--primary-glow)',
                    }}>
                      +{score.improvement_percent}%
                    </div>
                    <div style={{ 
                      fontFamily: 'var(--sans)', 
                      fontSize: '11px', 
                      color: 'var(--text-3)', 
                      marginTop: '8px',
                    }}>
                      more contextually accurate
                    </div>
                  </div>
                </>
              )}
              
              {/* Locale Coverage Grid */}
              <div style={{ 
                width: '100%', 
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                marginTop: '8px',
              }}>
                <div style={{ 
                  fontFamily: 'var(--sans)', 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--text-3)', 
                  marginBottom: '16px',
                }}>
                  Translation Coverage by Locale
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                  gap: '12px',
                }}>
                  {Object.entries(score.locales).map(([locale, data]: [string, any]) => (
                    <div 
                      key={locale}
                      style={{
                        padding: '12px',
                        background: data.status === 'translated' ? 'var(--green-dim)' : 'var(--surface)',
                        border: data.status === 'translated' ? '1px solid var(--green)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        transition: 'all 150ms',
                      }}
                    >
                      <div style={{ 
                        fontFamily: 'var(--mono)', 
                        fontSize: '18px', 
                        fontWeight: 700,
                        color: data.status === 'translated' ? 'var(--green)' : 'var(--text-3)',
                        marginBottom: '4px',
                      }}>
                        {locale.toUpperCase()}
                      </div>
                      <div style={{ 
                        fontFamily: 'var(--sans)', 
                        fontSize: '10px', 
                        color: data.status === 'translated' ? 'var(--green)' : 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {data.status === 'translated' ? '✓ Translated' : '✗ Missing'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
