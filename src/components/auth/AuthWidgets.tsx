// C:\Users\ashwin\Desktop\stockeasy\src\components\auth\AuthWidgets.tsx
// Floating decorative stat cards shown behind the auth form.
// z-index: 1 — behind form card (z:10), above background (z:0).
// pointer-events: none — never intercepts any clicks or keyboard events.

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface AuthWidget {
  id:       string;
  label:    string;
  value:    string;
  sub?:     string;
  live?:    boolean;
  tone:     "up" | "down" | "neutral" | "accent";
  // Safe Spawn slots (percentages)
  top:      string;
  left?:    string;
  right?:   string;
  // Responsive display tier: 0=mobile+, 640=tablet+, 1024=desktop+
  minW:     number;
}

const TONE_COLOR: Record<AuthWidget["tone"], string> = {
  up:      "var(--color-trado-success)",
  down:    "var(--color-trado-danger)",
  accent:  "#7B9EFF",
  neutral: "var(--color-trado-text)",
};

// ─── Single floating card component ─────────────────────────────────────────────
// Encapsulates its own random initial position offset, random delay,
// random duration, and bounded drift path.
const AuthFloatingCard: React.FC<{ w: AuthWidget; value: string; isMobile: boolean }> = ({ w, value, isMobile }) => {
  const reduced = useReducedMotion();

  // Bounded drift radius: 20-40px on desktop, 10-20px on mobile
  const driftRadius = useMemo(() => {
    const base = isMobile ? 10 : 20;
    const add = isMobile ? 10 : 20;
    return base + Math.random() * add;
  }, [isMobile]);

  // Duration: 18–35 seconds
  const duration = useMemo(() => 18 + Math.random() * 17, []);

  // Use a negative delay so the animations are already active at random phases
  // when the page mounts, avoiding synchronous movement or a common starting origin.
  const delay = useMemo(() => Math.random() * -duration, [duration]);

  // Generate a random path inside a bounded radius around its starting spot
  const animKeyframes = useMemo(() => {
    const angles = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);
    const x = [
      "0px",
      `${Math.cos(angles[0]) * driftRadius}px`,
      `${Math.cos(angles[1]) * driftRadius}px`,
      `${Math.cos(angles[2]) * driftRadius}px`,
      `${Math.cos(angles[3]) * driftRadius}px`,
      "0px"
    ];
    const y = [
      "0px",
      `${Math.sin(angles[0]) * driftRadius}px`,
      `${Math.sin(angles[1]) * driftRadius}px`,
      `${Math.sin(angles[2]) * driftRadius}px`,
      `${Math.sin(angles[3]) * driftRadius}px`,
      "0px"
    ];
    // Rotate between -2 and +2 degrees
    const rotate = [
      "0deg",
      `${(Math.random() - 0.5) * 4}deg`,
      `${(Math.random() - 0.5) * 4}deg`,
      `${(Math.random() - 0.5) * 4}deg`,
      `${(Math.random() - 0.5) * 4}deg`,
      "0deg"
    ];
    return { x, y, rotate };
  }, [driftRadius]);

  const floatAnim = reduced ? {} : {
    x:      animKeyframes.x,
    y:      animKeyframes.y,
    rotate: animKeyframes.rotate,
    scale:  [1, 1.015, 0.985, 1.01, 0.99, 1],
  };

  return (
    <motion.div
      animate={floatAnim}
      transition={{
        duration: duration,
        delay:    delay,
        repeat:   Infinity,
        ease:     "easeInOut",
        times:    [0, 0.25, 0.5, 0.75, 0.9, 1],
      }}
      style={{
        position:      "absolute",
        top:           w.top,
        left:          w.left  ?? undefined,
        right:         w.right ?? undefined,
        zIndex:        1,
        pointerEvents: "none", // Ensure clicks fall through to form
        opacity:       isMobile ? 0.65 : 0.85,
        willChange:    "transform",
      }}
    >
      <div style={{
        background:   "#151B26", // Fully opaque to properly occlude behind form card
        border:       "1px solid rgba(79,107,255,0.14)",
        borderRadius: "12px",
        padding:      "10px 14px",
        minWidth:     "140px",
        maxWidth:     "185px",
        boxShadow:    "0 8px 28px rgba(0,0,0,0.30)",
      }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
          <span style={{
            fontSize: "8.5px", fontFamily: "var(--font-mono)",
            color: "var(--color-trado-muted)", textTransform: "uppercase",
            letterSpacing: "0.08em", lineHeight: 1,
          }}>{w.label}</span>
          {w.live && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  display: "inline-block", width: "5px", height: "5px",
                  borderRadius: "50%", background: "var(--color-trado-success)",
                }}
              />
              <span style={{
                fontSize: "7px", fontFamily: "var(--font-mono)", fontWeight: 700,
                color: "var(--color-trado-success)", lineHeight: 1,
              }}>LIVE</span>
            </span>
          )}
        </div>
        {/* Value */}
        <div style={{
          fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)",
          color: TONE_COLOR[w.tone], lineHeight: 1.1,
        }}>{value}</div>
        {/* Sub-line */}
        {w.sub && (
          <div style={{
            fontSize: "8.5px", fontFamily: "var(--font-mono)",
            color: "var(--color-trado-muted)", marginTop: "3px", letterSpacing: "0.04em",
          }}>{w.sub}</div>
        )}
      </div>
    </motion.div>
  );
};

// ─── 12 Unique Market Cards ───────────────────────────────────────────────────
export const ALL_WIDGETS: AuthWidget[] = [
  // Mobile+ visible (minW: 0) — 4 cards
  { id: "nifty",       label: "NIFTY 50",       value: "+1.24%",          tone: "up",      top: "8%",   left: "4%",   minW: 0, live: true },
  { id: "portfolio",   label: "Portfolio",      value: "+18.4%",          tone: "up",      top: "76%",  right: "4%",  minW: 0, sub: "Total Returns" },
  { id: "btc",         label: "BTC / USD",      value: "+1.52%",          tone: "up",      top: "10%",  right: "4%",  minW: 0, live: true },
  { id: "capital",     label: "Virtual Capital",value: "₹10,00,000",      tone: "accent",  top: "78%",  left: "4%",   minW: 0, sub: "Sandbox Balance" },

  // Tablet+ visible (minW: 640) — 4 cards
  { id: "ai",          label: "AI Confidence",  value: "94%",             tone: "accent",  top: "24%",  left: "14%",  minW: 640, live: true },
  { id: "tsla",        label: "TSLA",            value: "-1.12%",          tone: "down",    top: "60%",  right: "14%", minW: 640, live: true },
  { id: "winrate",     label: "Win Rate",       value: "82%",             tone: "up",      top: "26%",  right: "14%", minW: 640, sub: "Last 30 Trades" },
  { id: "sentiment",   label: "Market Mood",    value: "Bullish",         tone: "neutral", top: "58%",  left: "14%",  minW: 640, sub: "Broad Sentiment" },

  // Laptop+ visible (minW: 1024) — 4 cards
  { id: "gold",        label: "Gold (XAU)",     value: "-0.15%",          tone: "down",    top: "42%",  left: "3%",   minW: 1024 },
  { id: "live_market", label: "Live Market",    value: "Open",            tone: "up",      top: "42%",  right: "3%",  minW: 1024, sub: "NSE / BSE" },
  { id: "risk",        label: "Risk Index",     value: "Low",             tone: "up",      top: "92%",  left: "22%",  minW: 1024, sub: "Conservative" },
  { id: "mode",        label: "Trading Mode",   value: "Sandbox",         tone: "neutral", top: "92%",  right: "22%", minW: 1024, sub: "Risk-Free" }
];

// ─── Scene Renderer ──────────────────────────────────────────────────────────
export const AuthWidgetScene: React.FC<{
  values: Record<string, string>;
  vw:     number;
}> = ({ values, vw }) => {
  const isMobile = vw < 640;
  
  // Filter based on screen size:
  // Mobile (< 640px) shows 4 cards (minW === 0)
  // Tablet (640px to 1023px) shows 8 cards (minW <= 640)
  // Desktop (>= 1024px) shows 12 cards (minW <= 1024)
  const visible = useMemo(() => {
    return ALL_WIDGETS.filter(w => w.minW <= vw);
  }, [vw]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {visible.map(w => (
        <AuthFloatingCard
          key={w.id}
          w={w}
          value={values[w.id] ?? w.value}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};
