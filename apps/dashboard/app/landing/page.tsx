'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import GlosChip from '@/components/ui/chip-hero'

/* ─────────────────────────────────────────────────────────────
   GLOS LANDING PAGE — CONTEXT-AWARE I18N
   Design: Minimal, terminal-inspired, lime-400 accent
   NO indigo, NO cyan, NO competitor names
   ───────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [terminalStep, setTerminalStep] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Realistic terminal animation sequence
    const sequence = [
      setTimeout(() => setTerminalStep(1), 1000),    // Start typing command (1s delay)
      setTimeout(() => setTerminalStep(2), 2200),    // Command complete, start discovery (+1.2s)
      setTimeout(() => setTerminalStep(3), 2800),    // Found routes (+0.6s)
      setTimeout(() => setTerminalStep(4), 3400),    // Capturing pages (+0.6s)
      setTimeout(() => setTerminalStep(5), 4600),    // Enriching strings (+1.2s)
      setTimeout(() => setTerminalStep(6), 5800),    // Context map written (+1.2s)
      setTimeout(() => setTerminalStep(7), 6400),    // Translations fixed (+0.6s)
    ]
    
    const handleScroll = () => {
      if (!heroRef.current) return
      const heroHeight = heroRef.current.offsetHeight
      const scrollY = window.scrollY
      
      if (scrollY > heroHeight * 0.2) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      sequence.forEach(clearTimeout)
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText('npx @chiragbuilds/glos capture --url http://localhost:3000')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ 
      background: '#09090b', 
      color: '#f4f4f5', 
      fontFamily: 'var(--sans)', 
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        @keyframes fadeInLine {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-line {
          animation: fadeInLine 0.4s ease forwards;
          opacity: 0;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeInTerminal {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        .typing-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: typing 1.2s steps(44) forwards;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink {
          display: inline-block;
          color: #a3e635;
          animation: cursorBlink 1s step-end infinite;
          margin-left: 2px;
        }
        
        /* Aceternity Background Lines */
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .aceternity-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(163,230,53,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(163,230,53,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
          pointer-events: none;
        }
        
        .aceternity-lines {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.08) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(163,230,53,0.08) 50%, transparent 100%);
          background-size: 100% 2px, 2px 100%;
          background-position: 0% 0%, 0% 0%;
          animation: moveLines 8s linear infinite;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          pointer-events: none;
          opacity: 0.4;
        }
        
        @keyframes moveLines {
          0% {
            background-position: 0% 0%, 0% 0%;
          }
          100% {
            background-position: 0% 100%, 100% 0%;
          }
        }
        
        .aceternity-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: moveGlow 15s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        
        @keyframes moveGlow {
          0%, 100% {
            transform: translate(-20%, -20%) scale(1);
          }
          50% {
            transform: translate(20%, 20%) scale(1.1);
          }
        }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(163,230,53,0.3); }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          NAVBAR — GLASSMORPHIC APPLE-STYLE
      ═══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed',
        top: scrolled ? '16px' : '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '1200px',
        zIndex: 1000,
        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        padding: scrolled ? '0' : '0',
      }}>
        <div style={{
          background: scrolled ? 'rgba(9,9,11,0.7)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderRadius: scrolled ? '16px' : '0',
          border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
          padding: '16px 24px',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '100%',
          }}>
            {/* Logo */}
            <Link href="/" style={{
              fontFamily: 'var(--mono)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#a3e635',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              display: 'inline-block',
              transition: 'all 300ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.textShadow = '0 0 20px rgba(163,230,53,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.textShadow = 'none';
            }}>
              glos.io
            </Link>

            {/* Nav links */}
            <div style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center',
            }}>
              <a href="#how-it-works" style={{
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                color: '#71717a',
                textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f4f4f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#71717a';
              }}>
                How it works
              </a>
              <Link href="/dashboard" style={{
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#f4f4f5',
                textDecoration: 'none',
                background: '#a3e635',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#84cc16';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#a3e635';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ 
        minHeight: '100vh', 
        paddingTop: '80px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Aceternity Background Effects */}
        <div className="aceternity-grid" />
        <div className="aceternity-lines" />
        <div 
          className="aceternity-glow" 
          style={{ top: '10%', left: '20%' }} 
        />
        <div 
          className="aceternity-glow" 
          style={{ bottom: '10%', right: '20%', animationDelay: '-7s' }} 
        />

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '600px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(163,230,53,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '80px 40px 60px',
          position: 'relative',
          zIndex: 1,
          width: '100%',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}>
            {/* LEFT - Content */}
            {mounted && (
              <div style={{ textAlign: 'left' }}>
                {/* Eyebrow */}
                <div className="fade-in" style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '12px', 
                  color: '#a3e635', 
                  letterSpacing: '0.16em',
                  marginBottom: '24px',
                  textTransform: 'uppercase',
                }}>
                  // i18n context layer
                </div>

                {/* H1 */}
                <h1 className="fade-in delay-1" style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 'clamp(40px, 5vw, 56px)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  color: '#f4f4f5',
                }}>
                  Your i18n is context-blind.<br />
                  <span style={{ color: '#a3e635' }}>glos.io fixes that.</span>
                </h1>

                {/* Subheading */}
                <p className="fade-in delay-2" style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '16px',
                  color: '#71717a',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '520px',
                }}>
                  glos.io crawls your running app, extracts every UI string with its visual context, and delivers translations that actually fit. Because "Save" on a checkout isn't the same as "Save" in settings.
                </p>

                {/* Buttons */}
                <div className="fade-in delay-3" style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '40px',
                }}>
                  <Link href="/dashboard" style={{
                    background: '#a3e635',
                    color: '#09090b',
                    fontFamily: 'var(--sans)',
                    fontSize: '15px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 200ms',
                    boxShadow: '0 0 30px rgba(163,230,53,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#84cc16';
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(163,230,53,0.35)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#a3e635';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(163,230,53,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    Get started
                  </Link>
                  <a href="#how-it-works" style={{
                    background: 'transparent',
                    color: '#f4f4f5',
                    fontFamily: 'var(--sans)',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '14px 28px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(163,230,53,0.4)';
                    e.currentTarget.style.color = '#a3e635';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}>
                    See it run →
                  </a>
                </div>
              </div>
            )}

            {/* RIGHT - Terminal with Float Animation */}
            {mounted && (
              <div className="fade-in delay-4" style={{ position: 'relative' }}>
                {/* Background glow behind terminal */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  right: '-20px',
                  bottom: '-20px',
                  background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: -1,
                }} />
                
                <div className="float-animation" style={{
                  background: '#0a0a0c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '24px',
                  fontFamily: 'var(--mono)',
                  fontSize: '13px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(163,230,53,0.1)',
                }}>
                  {/* Top bar */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                  </div>

                  {/* Terminal output with realistic typing animation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Step 1: Command being typed */}
                    {terminalStep >= 1 && (
                      <div style={{
                        color: '#71717a',
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        animation: 'fadeInTerminal 0.3s ease forwards',
                      }}>
                        <span style={{ color: '#a3e635', marginRight: '8px' }}>$</span>
                        <span className="typing-text">npx @chiragbuilds/glos capture --url http://localhost:3000</span>
                        <span className="cursor-blink">█</span>
                      </div>
                    )}

                    {/* Step 2: Discovering routes */}
                    {terminalStep >= 2 && (
                      <>
                        <div style={{
                          color: '#52525b',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ○ Discovering routes...
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Found 6 routes
                        </div>
                      </>
                    )}

                    {/* Step 3: Capturing pages */}
                    {terminalStep >= 3 && (
                      <>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /dashboard
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /settings
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /billing
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /team
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /projects
                        </div>
                        <div style={{
                          color: '#a3e635',
                          fontFamily: 'var(--mono)',
                          fontSize: '13px',
                          animation: 'fadeInTerminal 0.2s ease forwards',
                        }}>
                          ✓ Captured /notifications
                        </div>
                      </>
                    )}

                    {/* Step 4: Enriching strings */}
                    {terminalStep >= 4 && (
                      <div style={{
                        color: '#bef264',
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        animation: 'fadeInTerminal 0.2s ease forwards',
                      }}>
                        ◎ Enriching 45 strings with visual context...
                      </div>
                    )}

                    {/* Step 5: Context map written */}
                    {terminalStep >= 5 && (
                      <div style={{
                        color: '#a3e635',
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        animation: 'fadeInTerminal 0.2s ease forwards',
                      }}>
                        ✓ Context map written
                      </div>
                    )}

                    {/* Step 6: Translations fixed */}
                    {terminalStep >= 6 && (
                      <div style={{
                        color: '#a3e635',
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        animation: 'fadeInTerminal 0.2s ease forwards',
                      }}>
                        → Fixed 12 ambiguous translations
                      </div>
                    )}

                    {/* Step 7: Complete message */}
                    {terminalStep >= 7 && (
                      <div style={{
                        color: '#f4f4f5',
                        fontWeight: 700,
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        animation: 'fadeInTerminal 0.2s ease forwards',
                        marginTop: '8px',
                      }}>
                        ✓ Capture complete!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CHIP HERO COMPONENT (RIGHT AFTER HERO)
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        {mounted && (
          <>
            {/* Powered by pill */}
            <div style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px',
              border: '1px solid rgba(163,230,53,0.25)', 
              borderRadius: '999px',
              padding: '8px 20px',
              background: 'rgba(163,230,53,0.08)',
              boxShadow: '0 0 20px rgba(163,230,53,0.1)',
              marginBottom: '32px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a3e635', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: '#a3e635', letterSpacing: '0.05em' }}>POWERED BY</span>
            </div>
            
            {/* GlosChip Component */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <GlosChip size={560} />
            </div>

            {/* Lingo.dev Attribution */}
            <div style={{
              marginTop: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            }}>
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: '#71717a',
              }}>
                Built with
              </span>
              <Link href="https://lingo.dev" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#f4f4f5',
                textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a3e635';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f4f4f5';
              }}>
                Lingo.dev
              </Link>
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: '#71717a',
              }}>
                Hackathon #3
              </span>
            </div>
          </>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ 
        padding: '96px 24px', 
        maxWidth: '1120px', 
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: '#71717a',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          // the problem
        </div>

        <h2 className="fade-in" style={{
          fontFamily: 'var(--sans)',
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 700,
          color: '#f4f4f5',
          marginBottom: '48px',
          lineHeight: 1.2,
        }}>
          Your translator gets a flat file. Context stays in your head.
        </h2>

        {/* Three cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {/* Card 1 */}
          <div style={{
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 200ms',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}>
              'Save' is not just 'Save'
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
            }}>
              The same string means different things on a settings form, a payment modal, and a destructive action. Your pipeline treats all three identically.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 200ms',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}>
              Translators work without a map
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
            }}>
              They get raw keys and values. No page, no element type, no tone. The context never leaves your codebase.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 200ms',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}>
              You find out after it ships
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
            }}>
              By the time a mistranslation surfaces, it's live across 10 locales and you're doing a hotfix at 11pm.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ 
        padding: '96px 24px', 
        maxWidth: '896px', 
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: '#71717a',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          // how it works
        </div>

        <h2 style={{
          fontFamily: 'var(--sans)',
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 700,
          color: '#f4f4f5',
          marginBottom: '48px',
          lineHeight: 1.2,
        }}>
          From localhost to context-aware translations in one command.
        </h2>

        {/* Timeline */}
        <div style={{
          borderLeft: '2px solid rgba(163,230,53,0.2)',
          marginLeft: '16px',
          paddingLeft: '32px',
        }}>
          {/* Step 01 */}
          <div style={{
            position: 'relative',
            paddingBottom: '48px',
          }}>
            <div style={{
              position: 'absolute',
              left: '-41px',
              top: '0',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#a3e635',
            }} />
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: '#a3e635',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}>
              01
            </div>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '12px',
            }}>
              CRAWL
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
              maxWidth: '640px',
            }}>
              Playwright opens your running app and walks every route automatically. No config file. No route list. Just a URL.
            </p>
          </div>

          {/* Step 02 */}
          <div style={{
            position: 'relative',
            paddingBottom: '48px',
          }}>
            <div style={{
              position: 'absolute',
              left: '-41px',
              top: '0',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#a3e635',
            }} />
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: '#a3e635',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}>
              02
            </div>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '12px',
            }}>
              EXTRACT
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
              maxWidth: '640px',
            }}>
              Every button, heading, label, link, and placeholder — pulled from the live rendered DOM. Not source code. What users actually see.
            </p>
          </div>

          {/* Step 03 */}
          <div style={{
            position: 'relative',
            paddingBottom: '48px',
          }}>
            <div style={{
              position: 'absolute',
              left: '-41px',
              top: '0',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#a3e635',
            }} />
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: '#a3e635',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}>
              03
            </div>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '12px',
            }}>
              ENRICH
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
              maxWidth: '640px',
            }}>
              Each string gets classified: element type, page section, tone, and an ambiguity score 1–10. 'Delete' on /account scores a 9. 'Done' on /onboarding scores a 3. Your translator gets that information.
            </p>
          </div>

          {/* Step 04 */}
          <div style={{
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              left: '-41px',
              top: '0',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#a3e635',
            }} />
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: '#a3e635',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}>
              04
            </div>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '12px',
            }}>
              TRANSLATE
            </h3>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              color: '#71717a',
              lineHeight: 1.7,
              maxWidth: '640px',
            }}>
              Enriched strings go through the translation pipeline with context attached. Before/after quality scores show exactly what changed.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — STATS STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '64px',
          flexWrap: 'wrap',
        }}>
          {[
            { num: '45', label: 'STRINGS MAPPED' },
            { num: '6', label: 'PAGES CRAWLED' },
            { num: '10', label: 'LOCALES' },
            { num: '~8s', label: 'SCAN TIME' },
          ].map((stat) => (
            <div key={stat.label} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '36px',
                fontWeight: 700,
                color: '#a3e635',
                letterSpacing: '-0.02em',
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: '#71717a',
                marginTop: '4px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — CONTEXT PREVIEW
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '96px 24px',
        maxWidth: '896px',
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: '#71717a',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          // context map
        </div>

        <h2 style={{
          fontFamily: 'var(--sans)',
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 700,
          color: '#f4f4f5',
          marginBottom: '48px',
          lineHeight: 1.2,
        }}>
          See exactly what your translator sees.
        </h2>

        {/* Context preview card */}
        <div style={{
          background: '#111113',
          border: '1px solid rgba(163,230,53,0.15)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: '#71717a',
            marginBottom: '16px',
          }}>
            // context map output
          </div>

          <table style={{
            width: '100%',
            fontSize: '12px',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: '#52525b',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <th style={{ textAlign: 'left', paddingRight: '16px', paddingBottom: '8px' }}>key</th>
                <th style={{ textAlign: 'left', paddingRight: '16px', paddingBottom: '8px' }}>route</th>
                <th style={{ textAlign: 'left', paddingRight: '16px', paddingBottom: '8px' }}>element</th>
                <th style={{ textAlign: 'left', paddingBottom: '8px' }}>score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'save', route: '/settings', element: 'button', score: 6, scoreColor: '#fbbf24' },
                { key: 'delete', route: '/account', element: 'button', score: 9, scoreColor: '#f87171' },
                { key: 'confirm', route: '/checkout', element: 'button', score: 7, scoreColor: '#f87171' },
                { key: 'back', route: '/onboarding', element: 'button', score: 4, scoreColor: '#a3e635' },
              ].map((row) => (
                <tr key={row.key} style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <td style={{
                    color: '#f4f4f5',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}>
                    {row.key}
                  </td>
                  <td style={{
                    color: '#71717a',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}>
                    {row.route}
                  </td>
                  <td style={{
                    color: '#71717a',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}>
                    {row.element}
                  </td>
                  <td style={{
                    color: row.scoreColor,
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}>
                    {row.score}/10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — INTEGRATIONS
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--sans)',
          fontSize: '14px',
          color: '#71717a',
          marginBottom: '12px',
        }}>
          Works with any running app →
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px',
        }}>
          {['Next.js', 'Remix', 'Vite', 'SvelteKit', 'next-intl', 'react-i18next', 'Lingo.dev'].map((chip) => (
            <div
              key={chip}
              style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '4px 12px',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: '#71717a',
                cursor: 'default',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a3e635';
                e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#71717a';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — CTA
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '112px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '500px',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(163,230,53,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#f4f4f5',
            marginBottom: '16px',
          }}>
            Your strings have context.<br />
            <span style={{ color: '#a3e635' }}>Start using it.</span>
          </h2>

          {/* Terminal chip */}
          <div style={{
            marginTop: '40px',
            maxWidth: '700px',
            margin: '40px auto 0',
          }}>
            <div style={{
              background: '#0d0d0f',
              border: '1px solid rgba(163,230,53,0.25)',
              borderRadius: '10px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <code style={{
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                color: '#a3e635',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                $ npx @chiragbuilds/glos capture --url http://localhost:3000
              </code>
              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 200ms',
                  color: copied ? '#a3e635' : '#71717a',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a3e635';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = copied ? '#a3e635' : '#71717a';
                }}
                title="Copy command"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Docs link */}
          <Link href="/dashboard" style={{
            display: 'block',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            color: '#71717a',
            marginTop: '24px',
            textDecoration: 'none',
            transition: 'color 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f4f4f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#71717a';
          }}>
            Read the docs →
          </Link>

          {/* Caption */}
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: '#52525b',
            marginTop: '16px',
          }}>
            Free. No account required. Works on any localhost app.
          </div>
        </div>
      </section>
    </div>
  )
}
