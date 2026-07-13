/**
 * AuthBackground — shared fixed-position background for Login, Register, OTP.
 * Layers (z-index 0 — behind all content):
 *   1. Three large accent-blue radial glow blobs (CSS-animated, 10-15% opacity)
 *   2. Aurora sweep gradient wash (CSS-animated, ~5% opacity)
 *   3. Canvas: horizontal candlestick ticker strip (4% opacity)
 *   4. Canvas: subtle parallax grid (2% opacity)
 *   5. Canvas: sparse floating particles / + marks (8-12% opacity)
 *   6. Canvas: sparkle accents — multi-color, multi-shape stars, randomized twinkle
 *   7. Canvas: very faint diagonal light beams slowly sweeping
 *   8. Film grain overlay
 */
import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:     "#0d1117",
  accent: "79, 107, 255", // #4F6BFF as RGB components for rgba()
} as const;

// ─── Sparkle color palette ─────────────────────────────────────────────────────
// 40% blue (#4F6BFF), 35% cyan (#36D1DC), 25% white (220,230,255)
const SPARKLE_COLORS = [
  { rgb: "79,107,255",  weight: 40 },  // blue
  { rgb: "54,209,220",  weight: 35 },  // cyan
  { rgb: "220,230,255", weight: 25 },  // soft white
] as const;

const pickSparkleColor = (): string => {
  const r = Math.random() * 100;
  let acc = 0;
  for (const c of SPARKLE_COLORS) {
    acc += c.weight;
    if (r < acc) return c.rgb;
  }
  return SPARKLE_COLORS[0].rgb;
};

// ─── Canvas types ─────────────────────────────────────────────────────────────
interface Candle  { o: number; h: number; l: number; c: number; }
interface Dot     { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number; isPlus: boolean; }
interface Sparkle { x: number; y: number; size: number; maxAlpha: number; phase: number; cycleDur: number; color: string; shape: 0 | 1 | 2; }
interface Beam    { x: number; width: number; angle: number; speed: number; phase: number; }

const nextCandle = (prev: number): Candle => {
  const d = (Math.random() - 0.5) * 14 + 0.06;
  const c = prev + d;
  return { o: prev, c, h: Math.max(prev, c) + Math.random() * 6, l: Math.min(prev, c) - Math.random() * 6 };
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AuthBackground: React.FC = () => {
  const reduced   = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const lastT     = useRef(0);

  const candles  = useRef<Candle[]>([]);
  const offset   = useRef(0);
  const dots     = useRef<Dot[]>([]);
  const sparkles = useRef<Sparkle[]>([]);
  const beams    = useRef<Beam[]>([]);
  const mouse    = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth;
      mouse.current.ty = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = (W: number, H: number) => {
      // Seed candle ticker
      const count = Math.ceil(W / 13) + 8;
      candles.current = [];
      let price = 5800;
      for (let i = 0; i < count; i++) { const c = nextCandle(price); candles.current.push(c); price = c.c; }
      offset.current = 0;

      // Seed dots / + marks (8-12% opacity, 40-60s to cross screen)
      const n = W < 640 ? 20 : 45;
      dots.current = Array.from({ length: n }, (_, i) => ({
        x:       Math.random() * W,
        y:       Math.random() * H,
        vx:      (Math.random() - 0.5) * 0.05,
        vy:      -(0.025 + Math.random() * 0.06),   // 40-60s to cross 100vh
        r:       0.6 + Math.random() * 1.1,
        alpha:   0.08 + Math.random() * 0.04,       // 8-12%
        phase:   Math.random() * Math.PI * 2,
        isPlus:  i % 3 === 0,                       // every 3rd is a + mark
      }));

      // Seed sparkles — multi-color, multi-shape, fully randomized params
      const sc = W < 640 ? 25 : 50;
      sparkles.current = Array.from({ length: sc }, () => ({
        x:        Math.random() * W,
        y:        Math.random() * H,
        size:     1.5 + Math.random() * 3.5,          // 1.5-5px arm length
        maxAlpha: 0.25 + Math.random() * 0.55,         // 0.25-0.80 peak alpha
        phase:    Math.random(),                        // 0-1 random start in cycle
        cycleDur: 2.5 + Math.random() * 5.5,           // 2.5-8s full twinkle cycle
        color:    pickSparkleColor(),
        shape:    Math.floor(Math.random() * 3) as 0 | 1 | 2, // 0=cross, 1=glow dot, 2=big star
      }));

      // Seed light beams — 3-5 diagonal beams
      const bc = 3 + Math.floor(Math.random() * 3); // 3-5
      beams.current = Array.from({ length: bc }, () => ({
        x:     Math.random() * W,
        width: 200 + Math.random() * 200,    // 200-400px wide
        angle: 28 + Math.random() * 24,      // 28-52 degrees diagonal
        speed: 0.006 + Math.random() * 0.01, // very slow sweep
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = innerWidth, H = innerHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init(W, H);
    };

    // ── Layer 3: candlestick ticker strip (4% opacity) ─────────────────────
    const drawTicker = (W: number, H: number, dt: number) => {
      const SPEED = 0.32, SPACING = 13, CW = 5, BASE = H * 0.83, RH = 46;
      offset.current += SPEED * (dt / 16);
      if (offset.current >= SPACING) {
        const last = candles.current[candles.current.length - 1];
        candles.current.push(nextCandle(last.c)); candles.current.shift();
        offset.current -= SPACING;
      }
      const cs = candles.current;
      const minL = Math.min(...cs.map(c => c.l)), maxH = Math.max(...cs.map(c => c.h));
      const rng  = Math.max(20, maxH - minL);
      const toY  = (p: number) => BASE + RH / 2 - ((p - minL) / rng) * RH;

      ctx.save(); ctx.globalAlpha = 0.04;
      // Trend line
      ctx.beginPath();
      cs.forEach((c, i) => { const x = W - (cs.length - i) * SPACING + offset.current; i === 0 ? ctx.moveTo(x, toY((c.o + c.c) / 2)) : ctx.lineTo(x, toY((c.o + c.c) / 2)); });
      ctx.strokeStyle = `rgba(${T.accent}, 0.6)`; ctx.lineWidth = 0.8; ctx.stroke();
      cs.forEach((c, i) => {
        const x = W - (cs.length - i) * SPACING + offset.current;
        if (x < -8 || x > W + 8) return;
        const up = c.c >= c.o, col = up ? "62,207,142" : "240,87,107";
        const top = Math.min(toY(c.o), toY(c.c)), bh = Math.max(1, Math.abs(toY(c.c) - toY(c.o)));
        ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x, toY(c.h)); ctx.lineTo(x, toY(c.l)); ctx.stroke();
        ctx.fillStyle = `rgb(${col})`; ctx.fillRect(x - CW / 2, top, CW, bh);
      });
      ctx.restore();
    };

    // ── Layer 4: subtle parallax grid (2% opacity) ─────────────────────────
    const drawGrid = (W: number, H: number, px: number, py: number) => {
      const GS = 72;
      const ox = ((px * -18) % GS + GS) % GS, oy = ((py * -18) % GS + GS) % GS;
      ctx.strokeStyle = `rgba(${T.accent}, 0.018)`; ctx.lineWidth = 0.6;
      for (let x = ox; x < W; x += GS) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = oy; y < H; y += GS) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = `rgba(${T.accent}, 0.032)`;
      for (let x = ox; x < W; x += GS * 2)
        for (let y = oy; y < H; y += GS * 2) { ctx.beginPath(); ctx.arc(x, y, 0.7, 0, Math.PI * 2); ctx.fill(); }
    };

    // ── Layer 5: sparse dots / + marks (8-12% opacity) ────────────────────
    const drawDots = (W: number, H: number, dt: number, t: number) => {
      dots.current.forEach(d => {
        d.x += d.vx * (dt / 16); d.y += d.vy * (dt / 16);
        if (d.y < -8) { d.y = H + 8; d.x = Math.random() * W; }
        if (d.x < -8) d.x = W + 8; if (d.x > W + 8) d.x = -8;
        const pulse = 0.7 + Math.sin(t * 0.0007 + d.phase) * 0.3;
        ctx.globalAlpha = d.alpha * pulse;
        ctx.fillStyle = `rgba(${T.accent}, 1)`;
        if (d.isPlus) {
          // Draw a + mark instead of a dot
          ctx.strokeStyle = `rgba(${T.accent}, 1)`;
          ctx.lineWidth = 0.8; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(d.x - d.r * 2, d.y); ctx.lineTo(d.x + d.r * 2, d.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(d.x, d.y - d.r * 2); ctx.lineTo(d.x, d.y + d.r * 2); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    // ── Layer 6: multi-color, multi-shape sparkles ─────────────────────────
    const drawSparkles = (W: number, H: number, dt: number) => {
      sparkles.current.forEach(s => {
        // Increment phase based on delta-time and duration.
        // Once the cycle completes (phase >= 1), respawn at a new random location.
        s.phase += (dt * 0.001) / s.cycleDur;
        if (s.phase >= 1) {
          s.phase = 0;
          s.x = Math.random() * W;
          s.y = Math.random() * H;
          s.size = 1.5 + Math.random() * 3.5;
          s.maxAlpha = 0.25 + Math.random() * 0.55;
          s.cycleDur = 2.5 + Math.random() * 5.5;
          s.color = pickSparkleColor();
          s.shape = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        }

        const phase = s.phase;
        let alpha = 0;
        if      (phase < 0.18) alpha = phase / 0.18;
        else if (phase < 0.50) alpha = 1;
        else if (phase < 0.68) alpha = 1 - (phase - 0.50) / 0.18;
        // else: dark period, alpha stays 0

        alpha *= s.maxAlpha;
        if (alpha < 0.015) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `rgba(${s.color}, 1)`;
        ctx.fillStyle   = `rgba(${s.color}, 1)`;
        ctx.lineCap     = "round";
        ctx.translate(s.x, s.y);

        if (s.shape === 0) {
          // Shape 0: 4-point cross (original style)
          ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.moveTo(-s.size, 0); ctx.lineTo(s.size, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -s.size); ctx.lineTo(0, s.size); ctx.stroke();
          const d = s.size * 0.45;
          ctx.beginPath(); ctx.moveTo(-d, -d); ctx.lineTo(d, d); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(d, -d); ctx.lineTo(-d, d); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, s.size * 0.22, 0, Math.PI * 2); ctx.fill();

        } else if (s.shape === 1) {
          // Shape 1: simple bright dot with radial glow
          const r = s.size * 0.65;
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
          grd.addColorStop(0,   `rgba(${s.color}, 1)`);
          grd.addColorStop(0.4, `rgba(${s.color}, 0.5)`);
          grd.addColorStop(1,   `rgba(${s.color}, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2); ctx.fill();
          // Bright hard core
          ctx.fillStyle = `rgba(${s.color}, 1)`;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.fill();

        } else {
          // Shape 2: larger 4-point star with longer arms
          ctx.lineWidth = 1.2;
          const arm  = s.size * 1.4;  // longer main arms
          const diag = s.size * 0.7;  // longer diagonals too
          ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -arm); ctx.lineTo(0, arm); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-diag, -diag); ctx.lineTo(diag, diag); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(diag, -diag); ctx.lineTo(-diag, diag); ctx.stroke();
          // Glow halo
          const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, arm * 0.9);
          halo.addColorStop(0,   `rgba(${s.color}, 0.35)`);
          halo.addColorStop(1,   `rgba(${s.color}, 0)`);
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(0, 0, arm * 0.9, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `rgba(${s.color}, 1)`;
          ctx.beginPath(); ctx.arc(0, 0, s.size * 0.28, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
      });
    };

    // ── Layer 7: very faint diagonal light beams ───────────────────────────
    const drawBeams = (W: number, H: number, t: number) => {
      beams.current.forEach(b => {
        // Slowly oscillate the beam position across the canvas
        const sweep = Math.sin(t * 0.0001 * b.speed * 60 + b.phase) * W * 0.4;
        const cx = b.x + sweep;

        ctx.save();
        ctx.translate(cx, H * 0.5);
        ctx.rotate((b.angle * Math.PI) / 180);

        // Linear gradient perpendicular to beam direction: faint center, transparent edges
        const half = b.width / 2;
        const grd = ctx.createLinearGradient(-half, 0, half, 0);
        grd.addColorStop(0,   "rgba(130,160,255,0)");
        grd.addColorStop(0.3, "rgba(130,160,255,0.022)");
        grd.addColorStop(0.5, "rgba(160,200,255,0.030)");
        grd.addColorStop(0.7, "rgba(130,160,255,0.022)");
        grd.addColorStop(1,   "rgba(130,160,255,0)");

        ctx.fillStyle = grd;
        const diag = Math.sqrt(W * W + H * H);
        ctx.fillRect(-half, -diag / 2, b.width, diag);
        ctx.restore();
      });
    };

    // ── Main draw loop ─────────────────────────────────────────────────────
    const draw = (t: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (document.visibilityState === "hidden") { lastT.current = t; return; }
      const dt = Math.min(t - (lastT.current || t), 40);
      lastT.current = t;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

      // Smooth mouse parallax
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.03; m.y += (m.ty - m.y) * 0.03;

      drawGrid(W, H, m.x - 0.5, m.y - 0.5);
      drawBeams(W, H, t);
      drawTicker(W, H, dt);
      drawDots(W, H, dt, t);
      drawSparkles(W, H, dt);

      // Edge vignette
      const vig = ctx.createRadialGradient(W*.5, H*.5, W*.2, W*.5, H*.5, W*.72);
      vig.addColorStop(0, "rgba(13,17,23,0)");
      vig.addColorStop(1, "rgba(13,17,23,0.62)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) rafRef.current = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [reduced]);

  return (
    /* position:fixed — shared/persistent across all three auth views */
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Layer 1 — Three large accent glow blobs (CSS-driven, no JS needed) */}
      <div className="auth-blob auth-blob-a" />
      <div className="auth-blob auth-blob-b" />
      <div className="auth-blob auth-blob-c" />

      {/* Layer 2 — Aurora sweep */}
      <div className="auth-aurora" />

      {/* Canvas: layers 3 (ticker), 4 (grid), 5 (dots), 6 (sparkles), 7 (beams) */}
      <canvas ref={canvasRef} className="absolute inset-0 block" style={{ opacity: 0.94 }} />

      {/* Layer 8 — Film grain */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
};

export default AuthBackground;
