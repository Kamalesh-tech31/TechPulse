import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, Shield, BookOpen, Award, ArrowRight, Activity, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   Background drift dots — faint particles for hero depth only
   (global ambient particles are handled by AmbientBackground.tsx)
───────────────────────────────────────────────────────── */
const DRIFT_DOTS = [
  { size: 5,  top: '12%', left: '8%',   duration: '14s', delay: '0s'    },
  { size: 4,  top: '28%', left: '22%',  duration: '18s', delay: '2s'    },
  { size: 6,  top: '55%', left: '5%',   duration: '22s', delay: '4s'    },
  { size: 4,  top: '72%', left: '18%',  duration: '16s', delay: '1s'    },
  { size: 5,  top: '20%', left: '88%',  duration: '20s', delay: '3s'    },
  { size: 4,  top: '80%', left: '82%',  duration: '15s', delay: '5s'    },
  { size: 5,  top: '45%', left: '95%',  duration: '24s', delay: '1.5s'  },
];

/* ─────────────────────────────────────────────────────────
   Feature cards data
───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Activity,
    title: 'Virtual Trading Simulator',
    desc: 'Buy and sell top Nifty 50 companies with instant feedback, holding margins, and live real-time price feeds.',
  },
  {
    icon: Cpu,
    title: 'AI Portfolio Analyzer',
    desc: 'Analyze your assets to calculate an overall risk index, diversification coefficient, and receive personalized recommendations.',
  },
  {
    icon: BookOpen,
    title: 'AI-Driven Lessons',
    desc: 'Generate dynamic, personalized educational notes tailored to your occupation, stock experience, and trading objectives.',
  },
  {
    icon: Award,
    title: 'AI Quiz Generator',
    desc: 'Challenge yourself with customized quizzes that test your technical metrics, fundamental knowledge, and trade strategies.',
  },
];

/* ─────────────────────────────────────────────────────────
   CSS token shortcuts
───────────────────────────────────────────────────────── */
const accent      = 'var(--color-trado-accent)';
const accentGlow  = 'rgba(79,107,255,0.35)';
const secondary   = 'var(--color-trado-secondary)';   // for icons, badges, ghost buttons
const bg          = 'var(--color-trado-bg)';
const surface     = 'var(--color-trado-surface)';
const border      = 'var(--color-trado-border)';
const text        = 'var(--color-trado-text)';
const muted       = 'var(--color-trado-muted)';

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const { setActiveView } = useApp();
  const [ctaClicking, setCtaClicking] = useState(false);

  const handleCtaClick = () => {
    setCtaClicking(true);
    setTimeout(() => {
      setCtaClicking(false);
      setActiveView('register');
    }, 450);
  };

  return (
    <div style={{
      minHeight:   '100vh',
      background:  bg,
      color:       text,
      overflowX:   'hidden',
      position:    'relative',
    }}>

      {/* ── Background drift dots (hero-specific, light) ── */}
      {DRIFT_DOTS.map((dot, i) => (
        <div
          key={i}
          style={{
            position:     'fixed',
            top:          dot.top,
            left:         dot.left,
            width:        dot.size,
            height:       dot.size,
            borderRadius: '50%',
            background:   `rgba(139,147,167,0.25)`,  /* secondary color, very faint */
            pointerEvents:'none',
            zIndex:       0,
            animation:    `drift ${dot.duration} ${dot.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Navigation Header ── */}
      <header style={{
        borderBottom:    `1px solid ${border}`,
        background:      `${bg}cc`,
        backdropFilter:  'blur(14px)',
        position:        'sticky',
        top:             0,
        zIndex:          50,
        padding:         '0 24px',
      }}>
        <div style={{
          maxWidth:      '1280px',
          margin:        '0 auto',
          height:        64,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          flexWrap:      'nowrap',
          gap:           12,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              height: 36, width: 36,
              borderRadius: 10,
              background:   accent,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              boxShadow:    `0 0 18px ${accentGlow}`,
              flexShrink:   0,
            }}>
              <TrendingUp size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily:  'var(--font-display)',
              fontWeight:  700,
              fontSize:    22,
              letterSpacing: '-0.02em',
              color:       text,
            }}>
              Trado
            </span>
          </div>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setActiveView('signin')}
              style={{
                background:  'transparent',
                border:      'none',
                color:       muted,
                fontSize:    14,
                fontWeight:  500,
                padding:     '8px 14px',
                cursor:      'pointer',
                transition:  'color 150ms ease',
                minHeight:   44,
                borderRadius: 8,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = text)}
              onMouseLeave={e => (e.currentTarget.style.color = muted)}
            >
              Sign In
            </button>
            {/* Primary accent CTA — one of two allowed accent uses on this page */}
            <button
              onClick={() => setActiveView('register')}
              style={{
                background:  accent,
                border:      'none',
                color:       '#fff',
                fontSize:    14,
                fontWeight:  600,
                padding:     '9px 20px',
                borderRadius: 8,
                cursor:      'pointer',
                boxShadow:   `0 0 20px rgba(79,107,255,0.3)`,
                transition:  'transform 150ms ease, box-shadow 150ms ease',
                display:     'flex',
                alignItems:  'center',
                gap:         6,
                minHeight:   44,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px rgba(79,107,255,0.5)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px rgba(79,107,255,0.3)`;
              }}
            >
              Get Started
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{
        maxWidth:  '1280px',
        margin:    '0 auto',
        padding:   '80px 24px 100px',
        position:  'relative',
        zIndex:    10,
        display:   'flex',
        alignItems:'center',
        gap:        48,
        flexWrap:  'wrap',
      }}>
        {/* Left — text */}
        <div style={{ flex: '1 1 480px', minWidth: 280 }}>
          {/* Badge — uses secondary color, not accent: it's a label, not a CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display:     'inline-flex',
              alignItems:  'center',
              gap:         6,
              padding:     '6px 14px',
              borderRadius: 999,
              background:  `rgba(139,147,167,0.08)`,
              border:      `1px solid rgba(139,147,167,0.2)`,
              fontSize:    11,
              fontFamily:  'var(--font-mono)',
              color:       secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}
          >
            <Activity size={11} style={{ animation: 'pulse 2s infinite' }} />
            Virtual Trading Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{
              fontFamily:   'var(--font-display)',
              fontWeight:   700,
              fontSize:     'clamp(32px, 5vw, 64px)',
              lineHeight:   1.1,
              letterSpacing: '-0.02em',
              color:        text,
              marginBottom: 24,
              margin:       '0 0 24px',
            }}
          >
            Master the Markets with{' '}
            <span style={{
              background:           `linear-gradient(135deg, ${accent}, #7B8FFF)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
            }}>
              Virtual Capital
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{
              color:        muted,
              fontSize:     18,
              lineHeight:   1.65,
              maxWidth:     480,
              margin:       '0 0 36px',
            }}
          >
            Learn the mechanics of Nifty 50 stocks with ₹1,000,000 in virtual funds.
            Build, test, and analyze your financial strategies risk-free using our
            intelligent simulator and AI tutors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
          >
            {/* Primary CTA — accent fill, glow on click. This is accent use #2 on this page. */}
            <button
              onClick={handleCtaClick}
              className={ctaClicking ? 'animate-glow-click' : ''}
              style={{
                background:  accent,
                border:      'none',
                color:       '#fff',
                fontSize:    15,
                fontWeight:  600,
                padding:     '13px 28px',
                borderRadius: 10,
                cursor:      'pointer',
                boxShadow:   `0 0 28px rgba(79,107,255,0.35)`,
                transition:  'transform 150ms ease, box-shadow 150ms ease',
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                minHeight:   48,
              }}
              onMouseEnter={e => {
                if (!ctaClicking) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 40px rgba(79,107,255,0.55)`;
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px rgba(79,107,255,0.35)`;
              }}
            >
              Start Virtual Trading
              <ArrowRight size={17} />
            </button>

            {/* Secondary CTA — ghost style, secondary/muted color. NOT a second accent button. */}
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background:  'transparent',
                border:      `1px solid rgba(139,147,167,0.3)`,
                color:       muted,
                fontSize:    15,
                fontWeight:  500,
                padding:     '13px 28px',
                borderRadius: 10,
                cursor:      'pointer',
                transition:  'border-color 150ms ease, color 150ms ease, background 150ms ease',
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                minHeight:   48,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(139,147,167,0.6)`;
                (e.currentTarget as HTMLButtonElement).style.color = text;
                (e.currentTarget as HTMLButtonElement).style.background = `rgba(139,147,167,0.05)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(139,147,167,0.3)`;
                (e.currentTarget as HTMLButtonElement).style.color = muted;
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              Explore Features
            </button>
          </motion.div>
        </div>

        {/* Right — Orbital drift graphic */}
        {/* Responsive: shrinks on mobile, hidden below 480px to avoid clipping */}
        <div style={{
          flex:            '0 0 clamp(200px, 30vw, 340px)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          position:        'relative',
          height:          'clamp(200px, 30vw, 340px)',
        }}>
          {/* Outer rotating dashed ring */}
          <div style={{
            position:     'absolute',
            inset:        -48,
            borderRadius: '50%',
            border:       '2px dashed rgba(79,107,255,0.2)',
            animation:    'orbit-ring 12s linear infinite',
            pointerEvents:'none',
          }} />

          {/* Middle ring */}
          <div style={{
            position:     'absolute',
            inset:        -10,
            borderRadius: '50%',
            border:       '1px solid rgba(79,107,255,0.07)',
            animation:    'orbit-ring 20s linear infinite reverse',
            pointerEvents:'none',
          }} />

          {/* Glowing sphere — primary accent: this is accent use #1 (key data highlight) */}
          <div
            style={{
              width:        'clamp(180px, 26vw, 280px)',
              height:       'clamp(180px, 26vw, 280px)',
              borderRadius: '50%',
              background:   `radial-gradient(circle at 35% 35%,
                rgba(79,107,255,0.5) 0%,
                rgba(79,107,255,0.15) 40%,
                rgba(13,17,23,0.1) 70%,
                transparent 100%)`,
              boxShadow:    `0 0 80px rgba(79,107,255,0.25),
                             0 0 160px rgba(79,107,255,0.1),
                             inset 0 0 60px rgba(79,107,255,0.12)`,
              animation:    'bob 4s ease-in-out infinite',
              position:     'relative',
              zIndex:       2,
              flexShrink:   0,
            }}
          >
            {/* Inner highlight */}
            <div style={{
              position:     'absolute',
              top:          '18%',
              left:         '22%',
              width:        '30%',
              height:       '22%',
              borderRadius: '50%',
              background:   'rgba(255,255,255,0.12)',
              filter:       'blur(6px)',
            }} />
          </div>

          {/* Orbiting dot on the ring */}
          <div style={{
            position:     'absolute',
            inset:        -48,
            borderRadius: '50%',
            animation:    'orbit-ring 12s linear infinite',
            pointerEvents:'none',
          }}>
            <div style={{
              position:     'absolute',
              top:          '50%',
              right:        0,
              transform:    'translateY(-50%)',
              width:        10,
              height:       10,
              borderRadius: '50%',
              background:   accent,
              boxShadow:    `0 0 12px ${accent}`,
            }} />
          </div>
        </div>
      </section>

      {/* ── Feature Cards Grid ── */}
      <section
        id="features"
        style={{
          maxWidth:     '1280px',
          margin:       '0 auto',
          padding:      '80px 24px',
          position:     'relative',
          zIndex:       10,
          borderTop:    `1px solid rgba(255,255,255,0.03)`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     'clamp(24px, 4vw, 40px)',
            color:        text,
            marginBottom: 14,
          }}>
            Designed for Beginners. Structured for Professionals.
          </h2>
          <p style={{ color: muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            Everything you need to go from a complete novice to holding a sharp,
            profitable understanding of the equity markets.
          </p>
        </div>

        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap:                 24,
        }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glassmorphism glow-border hover:glow-border-hover"
                style={{
                  padding:      24,
                  borderRadius: 20,
                  cursor:       'default',
                  transition:   'border-color 200ms ease, transform 200ms ease',
                }}
                whileHover={{ y: -3 }}
              >
                {/* Feature icon uses secondary color — NOT accent.
                    Accent reserved for primary CTA only. */}
                <div style={{
                  width:        44,
                  height:       44,
                  borderRadius: 12,
                  background:   'rgba(139,147,167,0.08)',
                  border:       '1px solid rgba(139,147,167,0.18)',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  color:        secondary,
                  marginBottom: 20,
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{
                  fontFamily:   'var(--font-display)',
                  fontWeight:   600,
                  fontSize:     17,
                  color:        text,
                  marginBottom: 8,
                }}>
                  {f.title}
                </h3>
                <p style={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Trust / Safety Section ── */}
      <section style={{
        background:  surface,
        padding:     '80px 24px',
        borderTop:   `1px solid rgba(255,255,255,0.03)`,
        textAlign:   'center',
        position:    'relative',
        zIndex:      10,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Shield icon — secondary color (decorative, not a primary action) */}
          <div style={{
            width:          48,
            height:         48,
            borderRadius:   '50%',
            background:     'rgba(139,147,167,0.08)',
            border:         '1px solid rgba(139,147,167,0.18)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 20px',
            color:          secondary,
          }}>
            <Shield size={22} />
          </div>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     'clamp(20px, 3vw, 34px)',
            color:        text,
            marginBottom: 14,
          }}>
            Zero Financial Risk. True Professional Skill.
          </h2>
          <p style={{ color: muted, lineHeight: 1.7, marginBottom: 32 }}>
            Trado is built solely for educational purposes. All trades, portfolio stats,
            and virtual funds are fully simulated. There is absolutely no real capital
            involved — giving you a secure space to test strategies, learn financial
            analysis, and build confidence.
          </p>
          {/* Primary CTA — accent fill. One of two allowed accent uses on this page. */}
          <button
            onClick={() => setActiveView('register')}
            style={{
              background:  accent,
              border:      'none',
              color:       '#fff',
              fontSize:    14,
              fontWeight:  600,
              padding:     '12px 28px',
              borderRadius: 9,
              cursor:      'pointer',
              boxShadow:   `0 0 24px rgba(79,107,255,0.3)`,
              display:     'inline-flex',
              alignItems:  'center',
              gap:         8,
              transition:  'transform 150ms ease',
              minHeight:   44,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
          >
            Create Your Virtual Account
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop:  `1px solid ${border}`,
        background: bg,
        padding:    '28px 24px',
        textAlign:  'center',
        position:   'relative',
        zIndex:     10,
      }}>
        <div style={{
          maxWidth:      '1280px',
          margin:        '0 auto',
          display:       'flex',
          flexDirection: 'row',
          alignItems:    'center',
          justifyContent: 'space-between',
          flexWrap:      'wrap',
          gap:           12,
        }}>
          <p style={{ color: muted, fontSize: 12 }}>
            © {new Date().getFullYear()} Trado — Virtual Trading Platform. Built for education.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ color: `${muted}80`, fontSize: 12 }}>Simulated Nifty 50 Feeds</span>
            <span style={{ color: `${muted}80`, fontSize: 12 }}>AI-Powered Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
