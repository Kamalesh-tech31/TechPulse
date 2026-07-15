import React from 'react';
import { motion } from 'motion/react';

export const PremiumOnboardingBackground: React.FC = () => {
  const CYAN = '#3ecf8e';
  const BLUE = '#4f6bff';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#05070f]">
      {/* ── Volumetric Light Atmosphere (Breathing Layered Glows) ── */}
      <motion.div
        animate={{
          opacity: [0.7, 0.95, 0.7],
          scale: [1, 1.08, 1],
          x: [0, 15, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '-15%',
          top: '-10%',
          width: '50rem',
          height: '50rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,107,255,0.18) 0%, rgba(79,107,255,0.02) 65%, transparent 100%)',
          filter: 'blur(90px)',
        }}
      />
      <motion.div
        animate={{
          opacity: [0.55, 0.8, 0.55],
          scale: [1, 1.12, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          right: '-10%',
          bottom: '-15%',
          width: '45rem',
          height: '45rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(54,209,220,0.12) 0%, rgba(54,209,220,0.01) 60%, transparent 100%)',
          filter: 'blur(95px)',
        }}
      />
      <motion.div
        animate={{
          opacity: [0.7, 0.95, 0.7],
          scale: [1, 1.08, 1],
          x: [0, 15, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '42%',
          top: '25%',
          width: '32rem',
          height: '32rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,158,255,0.08) 0%, rgba(123,158,255,0.005) 55%, transparent 100%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Dedicated Glow Beneath the Onboarding Card (Generates Floating Depth) ── */}
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.22, 0.28, 0.22],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,107,255,0.22) 0%, rgba(54,209,220,0.05) 45%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          filter: 'blur(75px)',
          zIndex: 1,
        }}
      />

      {/* ── Precision Hologram Tech Grid ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 65%, transparent 92%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 65%, transparent 92%)',
          opacity: 0.8,
        }}
      />

      {/* ── Hologram Scanner Sweep Line ── */}
      <motion.div
        animate={{
          top: ['0%', '100%'],
          opacity: [0, 0.8, 0.8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(54,209,220,0.2) 20%, rgba(79,107,255,0.45) 50%, rgba(54,209,220,0.2) 80%, transparent)',
          boxShadow: '0 0 10px rgba(79,107,255,0.3)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Pulsing Hologram Tech Intersection Nodes ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 2 }}>
        {[[24, 30], [38, 70], [62, 40], [78, 20], [18, 80], [70, 75]].map(([top, left], idx) => (
          <motion.div
            key={idx}
            animate={{
              opacity: [0.15, 0.75, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: idx % 2 === 0 ? CYAN : BLUE,
              boxShadow: `0 0 8px ${idx % 2 === 0 ? CYAN : BLUE}`,
            }}
          />
        ))}
      </div>

      {/* ── Abstract Glass-Reflected Curve Waves (Vector Lines) ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.16,
          zIndex: 2,
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wave1Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f6bff" stopOpacity="0" />
            <stop offset="50%" stopColor="#4f6bff" stopOpacity="1" />
            <stop offset="100%" stopColor="#36d1dc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave2Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#36d1dc" stopOpacity="0" />
            <stop offset="60%" stopColor="#4f6bff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4f6bff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          animate={{
            strokeDashoffset: [600, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          d="M-10,50 Q25,35 50,65 T110,35"
          fill="none"
          stroke="url(#wave1Grad)"
          strokeWidth="0.12"
          strokeDasharray="600"
        />
        <motion.path
          animate={{
            strokeDashoffset: [600, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, delay: -5, ease: 'linear' }}
          d="M-10,30 Q30,75 70,25 T110,65"
          fill="none"
          stroke="url(#wave2Grad)"
          strokeWidth="0.08"
          strokeDasharray="600"
        />
        <path
          d="M50,-10 C45,30 55,70 50,110"
          fill="none"
          stroke="rgba(79,107,255,0.22)"
          strokeWidth="0.05"
        />
      </svg>

      {/* ── Tiny Drifting Particles ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(16)].map((_, i) => {
          const size = Math.random() * 2 + 1;
          const delay = Math.random() * 8;
          const duration = 8 + Math.random() * 12;
          const left = Math.random() * 100;
          const top = 30 + Math.random() * 70;
          return (
            <motion.div
              key={i}
              animate={{
                y: [0, -160],
                x: [0, 25],
                opacity: [0.1, 0.65, 0],
              }}
              transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                boxShadow: '0 0 8px rgba(79,107,255,0.4)',
              }}
            />
          );
        })}
      </div>

      {/* ── Cinematic Dark Vignette Edge Framing ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 35%, rgba(5,7,15,0.72) 75%, #05070f 98%)',
          zIndex: 3,
        }}
      />
    </div>
  );
};

