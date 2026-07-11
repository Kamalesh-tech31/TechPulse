import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseDir: number;
  brightness: number;
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  isBlue: boolean;
}

interface DriftText {
  x: number;
  y: number;
  text: string;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface LightBeam {
  x: number;
  angle: number;
  width: number;
  speed: number;
  opacity: number;
  progress: number;
}

export const CinematicTradingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<Packet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const driftTextsRef = useRef<DriftText[]>([]);
  const lightBeamsRef = useRef<LightBeam[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const scanRef = useRef({ y: 0, opacity: 0, direction: 1 });
  const animIdRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SYMBOLS = [
      '₹', 'NIFTY', '0', '1', 'BUY', 'SELL', 'AI', 'RSI', 'EMA', 'VOL',
      '∑', 'Δ', '%', 'RELIANCE', 'TCS', 'INFY', '24K', '50', '0.08',
      'MACD', 'SMA', '1.28%', '₹24K', 'BULL', '0x1F', 'VWAP',
    ];

    const initScene = (w: number, h: number) => {
      // Neural network nodes
      nodesRef.current = [];
      const count = Math.min(110, Math.floor(w / 13));
      for (let i = 0; i < count; i++) {
        nodesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          radius: Math.random() * 1.8 + 0.5,
          pulse: Math.random(),
          pulseDir: Math.random() > 0.5 ? 0.004 : -0.004,
          brightness: Math.random() * 0.4 + 0.1,
        });
      }
      packetsRef.current = [];

      // Particles
      particlesRef.current = [];
      for (let i = 0; i < 55; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.1,
          vy: -(Math.random() * 0.18 + 0.04),
          size: Math.random() * 1.4 + 0.3,
          opacity: Math.random() * 0.07 + 0.02,
          isBlue: Math.random() > 0.35,
        });
      }

      // Drift texts
      driftTextsRef.current = [];
      for (let i = 0; i < 28; i++) {
        driftTextsRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          vx: (Math.random() - 0.5) * 0.08,
          vy: -(Math.random() * 0.12 + 0.03),
          size: Math.floor(Math.random() * 4) + 8,
          opacity: Math.random() * 0.04 + 0.02,
        });
      }

      // Light beams
      lightBeamsRef.current = [];
      for (let i = 0; i < 3; i++) {
        lightBeamsRef.current.push({
          x: Math.random() * w,
          angle: -Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          width: Math.random() * 80 + 40,
          speed: 0.0003 + Math.random() * 0.0002,
          opacity: 0.018 + Math.random() * 0.012,
          progress: Math.random(),
        });
      }

      scanRef.current = { y: 0, opacity: 0, direction: 1 };
    };

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      initScene(w, h);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let lastTime = 0;
    const draw = (timestamp: number) => {
      animIdRef.current = requestAnimationFrame(draw);

      const dt = Math.min(timestamp - lastTime, 32);
      lastTime = timestamp;
      const t = timestamp * 0.001;

      const w = canvas.width;
      const h = canvas.height;

      // Smooth mouse
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.04;
      m.y += (m.targetY - m.y) * 0.04;
      const px = m.x - 0.5; // -0.5 to 0.5
      const py = m.y - 0.5;

      ctx.clearRect(0, 0, w, h);

      // ── BASE BACKGROUND ──────────────────────────────────────────
      ctx.fillStyle = '#070B14';
      ctx.fillRect(0, 0, w, h);

      // ── GRADIENT MESH ─────────────────────────────────────────────
      const meshGrad = ctx.createRadialGradient(
        w * 0.5 + px * 60, h * 0.3 + py * 40, 0,
        w * 0.5 + px * 60, h * 0.3 + py * 40,
        w * 0.7
      );
      meshGrad.addColorStop(0, 'rgba(79, 107, 255, 0.055)');
      meshGrad.addColorStop(0.4, 'rgba(62, 207, 142, 0.012)');
      meshGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = meshGrad;
      ctx.fillRect(0, 0, w, h);

      // Second glow center (bottom right)
      const meshGrad2 = ctx.createRadialGradient(
        w * 0.8 + px * 40, h * 0.75 + py * 30, 0,
        w * 0.8 + px * 40, h * 0.75 + py * 30,
        w * 0.5
      );
      meshGrad2.addColorStop(0, 'rgba(79, 107, 255, 0.035)');
      meshGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = meshGrad2;
      ctx.fillRect(0, 0, w, h);

      // ── FINANCIAL GRID ─────────────────────────────────────────────
      const gridSize = 72;
      const gpx = px * -18;
      const gpy = py * -18;

      ctx.strokeStyle = 'rgba(79, 107, 255, 0.022)';
      ctx.lineWidth = 0.8;
      for (let x = (gpx % gridSize + gridSize) % gridSize; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = (gpy % gridSize + gridSize) % gridSize; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Grid intersection dots
      ctx.fillStyle = 'rgba(79, 107, 255, 0.06)';
      for (let x = (gpx % gridSize + gridSize) % gridSize; x < w; x += gridSize) {
        for (let y = (gpy % gridSize + gridSize) % gridSize; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Coordinate labels
      ctx.fillStyle = 'rgba(139, 147, 167, 0.028)';
      ctx.font = '7px monospace';
      for (let x = (gpx % (gridSize * 4) + gridSize * 4) % (gridSize * 4); x < w; x += gridSize * 4) {
        for (let y = (gpy % (gridSize * 4) + gridSize * 4) % (gridSize * 4); y < h; y += gridSize * 4) {
          ctx.fillText(`${Math.floor(x)},${Math.floor(y)}`, x + 3, y - 3);
        }
      }

      // ── DRIFT TEXTS ─────────────────────────────────────────────────
      ctx.save();
      driftTextsRef.current.forEach(dt => {
        dt.y += dt.vy;
        dt.x += dt.vx;
        if (dt.y < -20) { dt.y = h + 20; dt.x = Math.random() * w; }
        if (dt.x < -60) dt.x = w + 60;
        if (dt.x > w + 60) dt.x = -60;
        const posX = dt.x + px * -28;
        const posY = dt.y + py * -28;
        ctx.font = `${dt.size}px monospace`;
        ctx.fillStyle = `rgba(139, 147, 167, ${dt.opacity})`;
        ctx.fillText(dt.text, posX, posY);
      });
      ctx.restore();

      // ── PARTICLES ───────────────────────────────────────────────────
      particlesRef.current.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const posX = p.x + px * -38;
        const posY = p.y + py * -38;
        const col = p.isBlue ? `rgba(79, 107, 255, ${p.opacity})` : `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(posX, posY, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── NEURAL NETWORK ───────────────────────────────────────────────
      const nodes = nodesRef.current;
      const npx = px * -24;
      const npy = py * -24;

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulse += n.pulseDir;
        if (n.pulse > 1 || n.pulse < 0.1) n.pulseDir *= -1;
      });

      const maxDist = 130;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const from = nodes[i];
        const fx = from.x + npx;
        const fy = from.y + npy;
        let conns = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (conns >= 3) break;
          const to = nodes[j];
          const tx = to.x + npx;
          const ty = to.y + npy;
          const dist = Math.hypot(tx - fx, ty - fy);
          if (dist < maxDist) {
            conns++;
            const opacity = (1 - dist / maxDist) * 0.05;
            ctx.strokeStyle = `rgba(79, 107, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            if (packetsRef.current.length < 18 && Math.random() < 0.0004) {
              packetsRef.current.push({ fromNode: i, toNode: j, progress: 0, speed: Math.random() * 0.012 + 0.005 });
            }
          }
        }
      }

      // Packets
      packetsRef.current = packetsRef.current.filter(pk => {
        pk.progress += pk.speed;
        if (pk.progress >= 1) return false;
        const from = nodes[pk.fromNode];
        const to = nodes[pk.toNode];
        if (!from || !to) return false;
        const cx = (from.x + npx) + ((to.x + npx) - (from.x + npx)) * pk.progress;
        const cy = (from.y + npy) + ((to.y + npy) - (from.y + npy)) * pk.progress;
        ctx.fillStyle = 'rgba(62, 207, 142, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(79, 107, 255, 0.14)';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Nodes
      nodes.forEach(n => {
        const posX = n.x + npx;
        const posY = n.y + npy;
        ctx.fillStyle = `rgba(79, 107, 255, ${(n.brightness + n.pulse * 0.12) * 0.9})`;
        ctx.beginPath();
        ctx.arc(posX, posY, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── MOVING LIGHT BEAMS ──────────────────────────────────────────
      lightBeamsRef.current.forEach(beam => {
        beam.progress += beam.speed * dt;
        if (beam.progress > 1) beam.progress = 0;

        const beamX = beam.progress * (w + 400) - 200;
        const cos = Math.cos(beam.angle);
        const sin = Math.sin(beam.angle);

        ctx.save();
        ctx.translate(beamX, 0);
        ctx.rotate(beam.angle);

        const beamGrad = ctx.createLinearGradient(-beam.width / 2, 0, beam.width / 2, 0);
        beamGrad.addColorStop(0, 'rgba(79, 107, 255, 0)');
        beamGrad.addColorStop(0.5, `rgba(79, 107, 255, ${beam.opacity})`);
        beamGrad.addColorStop(1, 'rgba(79, 107, 255, 0)');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(-beam.width / 2, -h, beam.width, h * 3);
        ctx.restore();
      });

      // ── SCAN WAVE ───────────────────────────────────────────────────
      const scan = scanRef.current;
      scan.y += 0.4;
      if (scan.y > h) scan.y = -50;
      const scanFade = Math.sin(Math.PI * (scan.y / h));
      const scanGrad = ctx.createLinearGradient(0, scan.y, 0, scan.y + 50);
      scanGrad.addColorStop(0, `rgba(79, 107, 255, 0)`);
      scanGrad.addColorStop(0.5, `rgba(79, 107, 255, ${0.025 * scanFade})`);
      scanGrad.addColorStop(1, `rgba(79, 107, 255, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scan.y, w, 50);

      // ── AMBIENT FOG ─────────────────────────────────────────────────
      const fogGrad = ctx.createLinearGradient(0, 0, 0, h);
      fogGrad.addColorStop(0, 'rgba(7, 11, 20, 0.15)');
      fogGrad.addColorStop(0.2, 'rgba(7, 11, 20, 0)');
      fogGrad.addColorStop(0.8, 'rgba(7, 11, 20, 0)');
      fogGrad.addColorStop(1, 'rgba(7, 11, 20, 0.2)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, w, h);
    };

    animIdRef.current = requestAnimationFrame(draw);

    // Also re-init when DOM resizes (e.g., features section loads)
    resizeObserverRef.current = new ResizeObserver(() => {
      const newH = document.documentElement.scrollHeight;
      if (Math.abs(canvas.height - newH) > 100) {
        canvas.height = newH;
        initScene(canvas.width, canvas.height);
      }
    });
    resizeObserverRef.current.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};
