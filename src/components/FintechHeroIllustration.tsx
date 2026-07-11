import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, Cpu } from 'lucide-react';

export const FintechHeroIllustration: React.FC = () => {
  // Parallax offsets based on mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range: -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range: -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Color tokens matching the main application stylesheet
  const colorCyan = '#3ecf8e'; // Success / Up
  const colorPink = '#f0576b'; // Danger / Down
  const colorBlue = '#4f6bff'; // Accent

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        overflow: 'visible',
      }}
    >
      {/* ── Background Soft Light Rays & Ambient Gradients (Layer 1 - deep parallax) ── */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          pointerEvents: 'none',
          zIndex: 1,
          transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {/* Soft rotating cyan glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62, 207, 142, 0.12) 0%, rgba(79, 107, 255, 0.03) 50%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Soft rotating blue glow */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 107, 255, 0.15) 0%, rgba(62, 207, 142, 0.02) 60%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Digital Grid Background & Tech Frame (Layer 2 - mid-depth parallax) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            {/* Grid Pattern */}
            <pattern id="illustrationGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(79, 107, 255, 0.05)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.2" fill="rgba(79, 107, 255, 0.2)" />
            </pattern>
          </defs>

          {/* Grid Fill */}
          <rect width="100%" height="100%" fill="url(#illustrationGrid)" rx="16" />

          {/* Glowing border outline */}
          <rect
            width="100%"
            height="100%"
            fill="none"
            stroke="rgba(79, 107, 255, 0.08)"
            strokeWidth="1.5"
            rx="16"
          />

          {/* Tech crosshairs in corners */}
          <path d="M 15,25 L 15,15 L 25,15" fill="none" stroke="rgba(139, 147, 167, 0.25)" strokeWidth="1.5" />
          <path d="M calc(100% - 15),25 L calc(100% - 15),15 L calc(100% - 25),15" fill="none" stroke="rgba(139, 147, 167, 0.25)" strokeWidth="1.5" />
          <path d="M 15,calc(100% - 25) L 15,calc(100% - 15) L 25,calc(100% - 15)" fill="none" stroke="rgba(139, 147, 167, 0.25)" strokeWidth="1.5" />
          <path d="M calc(100% - 15),calc(100% - 25) L calc(100% - 15),calc(100% - 15) L calc(100% - 25),calc(100% - 15)" fill="none" stroke="rgba(139, 147, 167, 0.25)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── Holographic HUD & Chart Graphic (Layer 3 - active elements) ── */}
      <div
        style={{
          position: 'relative',
          width: '90%',
          height: '80%',
          zIndex: 3,
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        <svg
          viewBox="0 0 600 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* 1. Holographic HUD Rings (Centered) */}
          <g transform="translate(300, 180)">
            {/* Outer Rotating HUD Dial */}
            <motion.circle
              cx="0"
              cy="0"
              r="140"
              stroke="rgba(79, 107, 255, 0.08)"
              strokeWidth="1.5"
              strokeDasharray="6 20 18 10 4 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            {/* Middle Rotating HUD Dial (Reverse) */}
            <motion.circle
              cx="0"
              cy="0"
              r="120"
              stroke="rgba(62, 207, 142, 0.06)"
              strokeWidth="1"
              strokeDasharray="30 8 4 8"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            {/* Fine Inner Radar Ring */}
            <circle
              cx="0"
              cy="0"
              r="90"
              stroke="rgba(79, 107, 255, 0.03)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* Corner Angle Tick Marks */}
            <path d="M -90,-90 L -80,-90 M -90,-90 L -90,-80" stroke="rgba(79, 107, 255, 0.15)" strokeWidth="1" />
            <path d="M 90,-90 L 80,-90 M 90,-90 L 90,-80" stroke="rgba(79, 107, 255, 0.15)" strokeWidth="1" />
            <path d="M -90,90 L -80,90 M -90,90 L -90,80" stroke="rgba(79, 107, 255, 0.15)" strokeWidth="1" />
            <path d="M 90,90 L 80,90 M 90,90 L 90,80" stroke="rgba(79, 107, 255, 0.15)" strokeWidth="1" />
          </g>

          {/* 2. Soft Animated Data Connections (Network paths) */}
          <path
            d="M 60,80 L 170,110 L 260,250 L 460,200 L 520,300"
            stroke="rgba(79, 107, 255, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          {/* Animated data packet traveling */}
          <motion.path
            d="M 60,80 L 170,110 L 260,250 L 460,200 L 520,300"
            stroke="url(#packetGradient)"
            strokeWidth="2.5"
            strokeDasharray="40 180"
            animate={{ strokeDashoffset: [-220, 220] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />

          <defs>
            <linearGradient id="packetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor={colorCyan} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(62, 207, 142, 0.18)" />
              <stop offset="100%" stopColor="rgba(62, 207, 142, 0)" />
            </linearGradient>
          </defs>

          {/* 3. Animated Candlestick Chart */}
          {/* Group of candlesticks at various X coordinates */}
          {/* Format: [x, yCenter, bodyHeight, isUp (green/red)] */}
          {(([
            [80, 240, 40, true],
            [110, 220, 30, true],
            [140, 250, 45, false],
            [170, 270, 20, false],
            [200, 230, 50, true],
            [230, 210, 35, true],
            [260, 190, 40, true],
            [290, 220, 30, false],
            [320, 180, 60, true],
            [350, 150, 55, true],
            [380, 170, 40, false],
            [410, 140, 45, true],
            [440, 120, 60, true],
            [470, 140, 30, false],
            [500, 110, 50, true],
          ] as [number, number, number, boolean][]).map(([x, y, h, isUp], index) => {
            const color = isUp ? colorCyan : colorPink;
            const bodyWidth = 10;
            return (
              <g key={index}>
                {/* Wick */}
                <motion.line
                  x1={x}
                  y1={y - h / 2 - 12}
                  x2={x}
                  y2={y + h / 2 + 12}
                  stroke={color}
                  strokeWidth="1.2"
                  opacity="0.6"
                  animate={{ y: [0, isUp ? -4 : 4, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.18,
                  }}
                />
                {/* Body */}
                <motion.rect
                  x={x - bodyWidth / 2}
                  y={y - h / 2}
                  width={bodyWidth}
                  height={h}
                  fill={color}
                  rx="2"
                  opacity="0.9"
                  style={{ transformOrigin: 'center' }}
                  animate={{
                    scaleY: [1, isUp ? 1.08 : 0.93, 1],
                    y: [0, isUp ? -3 : 3, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.18,
                  }}
                />
              </g>
            );

          }))}

          {/* 4. Live Glowing Price Line & Area */}
          <path
            d="M 80,220 C 130,240 150,280 200,210 C 250,140 280,240 320,160 C 360,80 390,180 440,110 L 500,80"
            fill="none"
            stroke={colorCyan}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0px 0px 8px rgba(62, 207, 142, 0.4))"
          />
          {/* Gradient area underneath */}
          <path
            d="M 80,220 C 130,240 150,280 200,210 C 250,140 280,240 320,160 C 360,80 390,180 440,110 L 500,80 L 500,320 L 80,320 Z"
            fill="url(#chartGradient)"
            opacity="0.85"
          />

          {/* Pulsing Active Trading Cursor */}
          <g>
            <motion.circle
              cx="500"
              cy="80"
              r="6"
              fill={colorCyan}
              filter="drop-shadow(0px 0px 6px #3ecf8e)"
            />
            {/* Double AI Scanning Rings Pulsing Outward */}
            <motion.circle
              cx="500"
              cy="80"
              r="6"
              stroke={colorCyan}
              strokeWidth="1.5"
              animate={{ scale: [1, 5.5], opacity: [0.8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.circle
              cx="500"
              cy="80"
              r="6"
              stroke={colorCyan}
              strokeWidth="1"
              animate={{ scale: [1, 3.5], opacity: [0.6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 1.4 }}
            />
          </g>

          {/* 5. Floating Buy/Sell Indicators */}
          {/* Buy Tag near a bottom dip */}
          <g transform="translate(190, 280)">
            <motion.rect
              width="44"
              height="20"
              rx="4"
              fill="rgba(62, 207, 142, 0.12)"
              stroke="rgba(62, 207, 142, 0.4)"
              strokeWidth="1"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.text
              x="22"
              y="14"
              textAnchor="middle"
              fill={colorCyan}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              BUY
            </motion.text>
          </g>

          {/* Sell Tag near a top peak */}
          <g transform="translate(340, 95)">
            <motion.rect
              width="48"
              height="20"
              rx="4"
              fill="rgba(240, 87, 107, 0.12)"
              stroke="rgba(240, 87, 107, 0.4)"
              strokeWidth="1"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.text
              x="24"
              y="14"
              textAnchor="middle"
              fill={colorPink}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              SELL
            </motion.text>
          </g>

          {/* 6. Upward Trend Micro Arrows */}
          {[
            { x: 120, y: 150, delay: 0 },
            { x: 270, y: 80, delay: 1.2 },
            { x: 440, y: 60, delay: 0.6 },
          ].map((arrow, index) => (
            <motion.g
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 0.7, 0], y: -30 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeOut',
                delay: arrow.delay,
              }}
              transform={`translate(${arrow.x}, ${arrow.y})`}
            >
              <path
                d="M -5,4 L 0,0 L 5,4 M -5,9 L 0,5 L 5,9"
                fill="none"
                stroke={colorCyan}
                strokeWidth="1.5"
                opacity="0.8"
              />
            </motion.g>
          ))}

          {/* 7. Tiny Glowing Market Particles */}
          {[
            { cx: 100, cy: 180, r: 2, delay: 0.2, d: 24 },
            { cx: 210, cy: 90, r: 1.5, delay: 1.5, d: 18 },
            { cx: 360, cy: 220, r: 2.2, delay: 0.8, d: 20 },
            { cx: 480, cy: 190, r: 1.8, delay: 2.3, d: 22 },
            { cx: 150, cy: 300, r: 1.5, delay: 0.5, d: 16 },
          ].map((pt, index) => (
            <motion.circle
              key={index}
              cx={pt.cx}
              cy={pt.cy}
              r={pt.r}
              fill={index % 2 === 0 ? colorBlue : colorCyan}
              opacity="0.4"
              animate={{
                y: [0, -pt.d, 0],
                opacity: [0.3, 0.75, 0.3],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 5 + index,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pt.delay,
              }}
            />
          ))}
        </svg>
      </div>

      {/* ── Glassmorphism Floating Stock Cards & AI Indicators (Layer 4 - foreground parallax) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 4,
          transform: `translate(${mousePos.x * 24}px, ${mousePos.y * 24}px)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {/* Card A: NIFTY 50 (Top Left) */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="glassmorphism glow-border"
          style={{
            position: 'absolute',
            top: '8%',
            left: '-6%',
            padding: '12px 18px',
            borderRadius: '12px',
            width: '185px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'rgba(62, 207, 142, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colorCyan,
                }}
              >
                <TrendingUp size={13} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-trado-text)', fontFamily: 'var(--font-display)' }}>
                NIFTY 50
              </span>
            </div>
            <span style={{ fontSize: '10px', color: colorCyan, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              +1.25%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
              ₹24,150.30
            </span>
            <span style={{ fontSize: '9px', color: 'var(--color-trado-muted)', fontFamily: 'var(--font-sans)' }}>
              LIVE
            </span>
          </div>
          {/* Micro sparkline */}
          <svg width="100%" height="16" style={{ marginTop: 8, overflow: 'visible' }}>
            <path
              d="M 0,10 L 25,6 L 50,12 L 75,3 L 100,8 L 125,1"
              fill="none"
              stroke={colorCyan}
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>

        {/* Card B: AI Signals Ticker (Bottom Right) */}
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="glassmorphism glow-border"
          style={{
            position: 'absolute',
            bottom: '4%',
            right: '-4%',
            padding: '14px 18px',
            borderRadius: '14px',
            width: '200px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(79, 107, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorBlue,
              }}
            >
              <Cpu size={13} style={{ animation: 'pulse 2s infinite' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-trado-text)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                REL-AI
              </span>
              <span style={{ fontSize: '8px', color: 'var(--color-trado-muted)', fontFamily: 'var(--font-mono)' }}>
                PORTFOLIO SCAN
              </span>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(62, 207, 142, 0.08)',
                border: '1px solid rgba(62, 207, 142, 0.25)',
                fontSize: '8px',
                fontWeight: 'bold',
                color: colorCyan,
                fontFamily: 'var(--font-mono)',
              }}
            >
              BUY 94%
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              ₹2,450.50
            </span>
            <span style={{ fontSize: '11px', color: colorCyan, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'var(--font-mono)' }}>
              +3.82%
              <ArrowUpRight size={10} />
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
