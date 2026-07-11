import React, { useEffect, useRef, useState } from 'react';

/**
 * AmbientBackground
 *
 * Premium HTML5 Canvas & CSS background.
 * Renders:
 *  - Top-left (cool blue) and top-right (indigo/violet) radial gradient glows.
 *  - Slowly drifting radial gradient behind the content center.
 *  - Very faint financial grid lines (2% opacity, 60px grid).
 *  - Slowly drifting invisible node web with thin connection lines (5% max opacity).
 *  - Occasional glowing packets travelling through the network.
 *  - Drifting particles (glow nodes) at 5–8% opacity.
 *  - Moving noise/grain texture (2% opacity).
 *  - Respects prefers-reduced-motion.
 *  - Delta-time throttled to 60fps, will-change: transform on canvas.
 */

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastFrameTime = 0;
    const TARGET_FPS = 60;
    const FRAME_BUDGET = 1000 / TARGET_FPS;

    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    /* ── Nodes ── */
    const nodeCount = Math.min(36, Math.floor((width * height) / 42000));
    const nodes: Array<{
      x: number; y: number;
      vx: number; vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x:      Math.random() * width,
        y:      Math.random() * height,
        vx:     (Math.random() - 0.5) * 0.22,
        vy:     (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.8 + 0.8,
      });
    }

    /* ── Packets ── */
    const packets: Array<{
      fromNode: number; toNode: number;
      progress: number; speed: number;
    }> = [];

    /* ── Resize ── */
    const handleResize = () => {
      if (!canvas) return;
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    /* ── Nearest nodes ── */
    const getNearestNodes = (idx: number, count = 2) => {
      const distances: Array<{ index: number; dist: number }> = [];
      const from = nodes[idx];
      for (let i = 0; i < nodes.length; i++) {
        if (i === idx) continue;
        const dist = Math.hypot(nodes[i].x - from.x, nodes[i].y - from.y);
        distances.push({ index: i, dist });
      }
      distances.sort((a, b) => a.dist - b.dist);
      return distances.slice(0, count);
    };

    /* ── Draw loop ── */
    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw);

      // Delta-time throttle — skip frame if too soon
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_BUDGET - 1) return;
      lastFrameTime = timestamp;

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      /* 1. Financial grid lines — 2% opacity */
      ctx.strokeStyle = 'rgba(79, 107, 255, 0.022)';
      ctx.lineWidth = 0.75;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      /* Reduced motion — static nodes only, no movement */
      if (reducedMotion) {
        ctx.fillStyle = 'rgba(139, 147, 167, 0.08)';
        nodes.forEach(n => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        return;
      }

      /* 2. Update node positions */
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width)  n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      /* 3. Connection lines — proximity-based opacity (max 5%) */
      nodes.forEach((n, idx) => {
        const nearest = getNearestNodes(idx, 2);
        nearest.forEach(({ index, dist }) => {
          const maxDist = 230;
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.048;
            ctx.strokeStyle = `rgba(79, 107, 255, ${opacity})`;
            ctx.lineWidth   = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[index].x, nodes[index].y);
            ctx.stroke();

            /* Randomly spawn a packet */
            if (packets.length < 6 && Math.random() < 0.0008) {
              const alreadyExists = packets.some(p => p.fromNode === idx && p.toNode === index);
              if (!alreadyExists) {
                packets.push({
                  fromNode: idx,
                  toNode:   index,
                  progress: 0,
                  speed:    Math.random() * 0.007 + 0.003,
                });
              }
            }
          }
        });
      });

      /* 4. Packet transmissions — glowing dots */
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) { packets.splice(i, 1); continue; }

        const from = nodes[p.fromNode];
        const to   = nodes[p.toNode];
        if (!from || !to) { packets.splice(i, 1); continue; }

        const cx = from.x + (to.x - from.x) * p.progress;
        const cy = from.y + (to.y - from.y) * p.progress;

        // Core dot
        ctx.fillStyle = 'rgba(79, 107, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo
        const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
        haloGrad.addColorStop(0, 'rgba(79, 107, 255, 0.18)');
        haloGrad.addColorStop(1, 'rgba(79, 107, 255, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 5. Drifting particles — 5–8% opacity */
      nodes.forEach(n => {
        ctx.fillStyle = 'rgba(139, 147, 167, 0.07)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [reducedMotion]);

  return (
    <>
      {/* Background container */}
      <div
        aria-hidden
        style={{
          position:        'fixed',
          inset:           0,
          pointerEvents:   'none',
          zIndex:          0,
          overflow:        'hidden',
          backgroundColor: '#0D1117',
        }}
      >
        {/* Deep radial vignette — content center lift */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(21, 28, 45, 0.55) 0%, transparent 80%)',
          pointerEvents: 'none',
        }} />

        {/* Top-Left Ambient Glow — cool blue */}
        <div style={{
          position:     'absolute',
          top:          '-25%',
          left:         '-12%',
          width:        '55vw',
          height:       '55vw',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(79, 107, 255, 0.09) 0%, rgba(79, 107, 255, 0.03) 45%, transparent 70%)',
          filter:       'blur(110px)',
          pointerEvents: 'none',
        }} />

        {/* Top-Right Ambient Glow — indigo/violet tint (Vercel-style warm right) */}
        <div style={{
          position:     'absolute',
          top:          '-20%',
          right:        '-12%',
          width:        '50vw',
          height:       '50vw',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(111, 79, 255, 0.07) 0%, rgba(79, 107, 255, 0.04) 40%, transparent 70%)',
          filter:       'blur(120px)',
          pointerEvents: 'none',
        }} />

        {/* Bottom-center subtle glow — grounds the page */}
        <div style={{
          position:     'absolute',
          bottom:       '-20%',
          left:         '30%',
          width:        '40vw',
          height:       '40vw',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(62, 207, 142, 0.03) 0%, transparent 70%)',
          filter:       'blur(100px)',
          pointerEvents: 'none',
        }} />

        {/* Canvas rendering layer */}
        <canvas
          ref={canvasRef}
          style={{
            position:      'absolute',
            inset:         0,
            width:         '100%',
            height:        '100%',
            display:       'block',
            willChange:    'transform',
          }}
        />
      </div>

      {/* Moving noise grain layer — 2% opacity */}
      <div
        aria-hidden
        style={{
          position:            'fixed',
          inset:               '-20%',
          width:               '140%',
          height:              '140%',
          backgroundImage:     `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.12'/%3E%3C/svg%3E")`,
          backgroundRepeat:    'repeat',
          backgroundSize:      '180px 180px',
          opacity:             0.025,
          pointerEvents:       'none',
          zIndex:              1,
          animation:           reducedMotion ? 'none' : 'noiseShift 16s steps(8) infinite',
        }}
      />
      <style>{`
        @keyframes noiseShift {
          0%, 100% { transform: translate(0, 0);      }
          12%       { transform: translate(-1%, -1%);  }
          25%       { transform: translate(1%, 2%);    }
          37%       { transform: translate(-2%, -1%);  }
          50%       { transform: translate(1%, 2.5%);  }
          62%       { transform: translate(-1%, 1%);   }
          75%       { transform: translate(2%, 1.5%);  }
          87%       { transform: translate(-1%, 2.5%); }
        }
      `}</style>
    </>
  );
};
