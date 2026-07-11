import React, { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type StreamMode = "bullish" | "bearish" | "sideways" | "volatile" | "reversal";

interface MarketStream {
  id: string;
  mode: StreamMode;
  candles: Candle[];
  baseY: number;
  height: number;
  opacity: number;
  candleWidth: number;
  spacing: number;
  speed: number;
  offset: number;
  trend: number;
  volatility: number;
  phase: number;
  lastAppend: number;
  colorShift: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  blue: boolean;
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

interface EnergyPacket {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

interface MarketEvent {
  x: number;
  y: number;
  text: string;
  startedAt: number;
  duration: number;
  color: string;
}

interface LightStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

interface TerminalChart {
  symbol: string;
  candles: Candle[];
  xRatio: number;
  yRatio: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scale: number;
  driftX: number;
  driftY: number;
  driftPhase: number;
  trend: number;
  volatility: number;
  phase: number;
  lastAppend: number;
}

const EVENT_MARKERS = ["BUY", "SELL", "AI SIGNAL", "STRONG BUY", "HIGH VOLUME", "RSI 72", "EMA CROSS"];
const MARKET_SYMBOLS = ["NIFTY 50", "RELIANCE", "INFY", "HDFCBANK", "ICICI", "SBIN", "TCS", "LT", "BHARTIARTL", "AXISBANK"];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const createNextCandle = (
  previousClose: number,
  stream: Pick<MarketStream, "trend" | "volatility" | "phase">,
): Candle => {
  const openGap =
    Math.random() > 0.86
      ? randomBetween(-stream.volatility * 0.55, stream.volatility * 0.55)
      : randomBetween(-stream.volatility * 0.12, stream.volatility * 0.12);
  const open = previousClose + openGap;

  const directionalPulse = Math.sin(stream.phase) * stream.volatility * 0.16;
  const fakeBreakout = Math.random() > 0.91 ? randomBetween(-1, 1) * stream.volatility * 1.45 : 0;
  const correction = Math.random() > 0.82 ? -Math.sign(stream.trend || 1) * stream.volatility * randomBetween(0.35, 1.15) : 0;
  const chop = randomBetween(-stream.volatility, stream.volatility);
  const close = open + stream.trend + directionalPulse + chop + fakeBreakout + correction;

  const body = Math.abs(close - open);
  const wickBoost = Math.random() > 0.72 ? stream.volatility * randomBetween(0.5, 1.4) : 0;
  const high = Math.max(open, close) + randomBetween(stream.volatility * 0.08, stream.volatility * 0.8) + wickBoost;
  const low = Math.min(open, close) - randomBetween(stream.volatility * 0.08, stream.volatility * 0.8) - wickBoost * randomBetween(0.3, 0.9);
  const volume = randomBetween(42, 180) + body * randomBetween(1.5, 4.5);

  return { open, high, low, close, volume };
};

const createInitialStream = (
  id: string,
  mode: StreamMode,
  width: number,
  height: number,
  index: number,
): MarketStream => {
  // Lock opacity between 12-18% as requested
  const opacity = [0.12, 0.15, 0.17, 0.16, 0.13][index] ?? 0.14;
  const candleWidth = randomBetween(4.5, 7);
  const spacing = randomBetween(10, 15);
  const visibleCount = Math.ceil(width / spacing) + 24;
  const streamHeight = height * randomBetween(0.26, 0.38);
  const baseY = height * ([0.2, 0.38, 0.58, 0.76, 0.47][index] ?? 0.5);
  const volatility =
    mode === "volatile" ? randomBetween(28, 42) : mode === "sideways" ? randomBetween(10, 18) : randomBetween(16, 28);
  const bias =
    mode === "bullish" ? randomBetween(1.2, 3.8) : mode === "bearish" ? randomBetween(-3.8, -1.2) : randomBetween(-0.8, 0.8);

  const stream: MarketStream = {
    id,
    mode,
    candles: [],
    baseY,
    height: streamHeight,
    opacity,
    candleWidth,
    spacing,
    speed: spacing / 1400, // Slow continuous animation
    offset: 0,
    trend: bias,
    volatility,
    phase: Math.random() * Math.PI * 2,
    lastAppend: performance.now() - Math.random() * 1000,
    colorShift: Math.random(),
  };

  let price = randomBetween(1200, 24500);
  for (let i = 0; i < visibleCount; i++) {
    stream.phase += randomBetween(0.05, 0.14);
    if (i % 18 === 0) {
      stream.trend = clamp(stream.trend * 0.45 + randomBetween(-2.7, 2.7), -5.2, 5.2);
    }
    const candle = createNextCandle(price, stream);
    stream.candles.push(candle);
    price = candle.close;
  }

  return stream;
};

const mutateTrend = (stream: MarketStream) => {
  const modeBias =
    stream.mode === "bullish"
      ? 1.1
      : stream.mode === "bearish"
        ? -1.1
        : stream.mode === "volatile"
          ? randomBetween(-1.6, 1.6)
          : stream.mode === "reversal"
            ? Math.sin(stream.phase * 0.24) * 2.8
            : 0;

  const reversal = Math.random() > 0.9 ? randomBetween(-4.6, 4.6) : 0;
  const consolidation = Math.random() > 0.84 ? stream.trend * -0.72 : 0;
  stream.trend = clamp(stream.trend * 0.68 + modeBias + reversal + consolidation + randomBetween(-1.1, 1.1), -7, 7);
  stream.volatility = clamp(
    stream.volatility * 0.88 + randomBetween(8, stream.mode === "volatile" ? 48 : 30) * 0.12,
    8,
    stream.mode === "volatile" ? 52 : 36,
  );
};

const createTerminalChart = (symbol: string, width: number, height: number, index: number): TerminalChart => {
  const chart: TerminalChart = {
    symbol,
    candles: [],
    xRatio: randomBetween(0.04, 0.82),
    yRatio: randomBetween(0.08, 0.84),
    width: randomBetween(190, 340),
    height: randomBetween(92, 150),
    rotation: randomBetween(-3, 3),
    opacity: randomBetween(0.12, 0.16), // Locked between 12-18% as requested
    scale: randomBetween(0.78, 1.18),
    driftX: randomBetween(-10, 10),
    driftY: randomBetween(-8, 8),
    driftPhase: randomBetween(0, Math.PI * 2),
    trend: randomBetween(-3.8, 3.8),
    volatility: randomBetween(12, 34),
    phase: randomBetween(0, Math.PI * 2),
    lastAppend: performance.now() - index * 120,
  };

  let price = randomBetween(420, symbol === "NIFTY 50" ? 24500 : 4200);
  const count = 44 + Math.floor(randomBetween(0, 18));
  for (let i = 0; i < count; i++) {
    chart.phase += randomBetween(0.08, 0.22);
    chart.trend = clamp(chart.trend * 0.78 + randomBetween(-1.6, 1.6), -5.5, 5.5);
    const candle = createNextCandle(price, chart);
    chart.candles.push(candle);
    price = candle.close;
  }

  if (index < 3) {
    chart.xRatio = [0.52, 0.71, 0.2][index];
    chart.yRatio = [0.16, 0.56, 0.76][index];
  }

  return chart;
};

export const AnimatedMarketBackground: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamsRef = useRef<MarketStream[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const textsRef = useRef<DriftText[]>([]);
  const terminalChartsRef = useRef<TerminalChart[]>([]);
  const packetsRef = useRef<EnergyPacket[]>([]);
  const eventsRef = useRef<MarketEvent[]>([]);
  const streaksRef = useRef<LightStreak[]>([]);
  const rafRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastTimeRef = useRef(0);

  const textTokens = useMemo(
    () => [
      "NIFTY",
      "BANKNIFTY",
      "BUY",
      "SELL",
      "HOLD",
      "AI 91%",
      "RSI 58",
      "EMA",
      "ATR",
      "+0.42%",
      "-0.18%",
      "VWAP",
      "VOL",
      "24,182",
    ],
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initScene = (width: number, height: number) => {
      const modes: StreamMode[] = ["bullish", "sideways", "reversal"];
      streamsRef.current = modes.map((mode, index) => createInitialStream(`stream-${index}`, mode, width, height, index));
      terminalChartsRef.current = Array.from({ length: 4 }, (_, index) =>
        createTerminalChart(MARKET_SYMBOLS[index % MARKET_SYMBOLS.length], width, height, index),
      );

      nodesRef.current = Array.from({ length: Math.min(110, Math.floor(width / 13)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomBetween(-0.035, 0.035),
        vy: randomBetween(-0.035, 0.035),
        radius: randomBetween(0.5, 1.7),
        opacity: randomBetween(0.05, 0.19),
      }));
      packetsRef.current = [];
      eventsRef.current = [];
      streaksRef.current = Array.from({ length: 7 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: randomBetween(120, 260),
        speed: randomBetween(0.012, 0.026),
        opacity: randomBetween(0.028, 0.07),
        angle: randomBetween(-0.18, 0.18),
      }));

      particlesRef.current = Array.from({ length: Math.min(340, Math.floor((width * height) / 3000)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomBetween(-0.08, 0.08),
        vy: randomBetween(-0.14, -0.03), // Slow vertical drift
        size: randomBetween(0.25, 1.25),
        opacity: randomBetween(0.014, 0.064),
        blue: Math.random() > 0.35,
      }));

      textsRef.current = Array.from({ length: 38 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        text: textTokens[Math.floor(Math.random() * textTokens.length)],
        vx: randomBetween(-0.035, 0.035),
        vy: randomBetween(-0.07, -0.02),
        size: Math.floor(randomBetween(8, 12)),
        opacity: randomBetween(0.018, 0.045),
      }));
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene(width, height);
    };

    const appendCandle = (stream: MarketStream, now: number) => {
      mutateTrend(stream);
      stream.phase += randomBetween(0.16, 0.42);
      const last = stream.candles[stream.candles.length - 1];
      stream.candles.push(createNextCandle(last.close, stream));
      stream.candles.shift();
      stream.offset -= stream.spacing;
      stream.lastAppend = now;
    };

    const appendTerminalCandle = (chart: TerminalChart, now: number) => {
      chart.phase += randomBetween(0.18, 0.36);
      chart.trend = clamp(chart.trend * 0.7 + randomBetween(-2.4, 2.4), -6, 6);
      chart.volatility = clamp(chart.volatility * 0.86 + randomBetween(10, 36) * 0.14, 9, 44);
      const last = chart.candles[chart.candles.length - 1];
      chart.candles.push(createNextCandle(last.close, chart));
      chart.candles.shift();
      chart.lastAppend = now;
    };

    const drawGrid = (width: number, height: number, time: number) => {
      const slowDrift = (time * 0.006) % 72;
      ctx.strokeStyle = "rgba(79, 107, 255, 0.032)";
      ctx.lineWidth = 0.8;
      for (let x = -slowDrift; x < width; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 58) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(time * 0.00012 + y) * 2);
        ctx.lineTo(width, y + Math.sin(time * 0.00012 + y) * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(139, 147, 167, 0.044)";
      ctx.lineWidth = 0.5;
      for (let y = 44; y < height; y += 118) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawEvents = (time: number) => {
      eventsRef.current = eventsRef.current.filter((event) => {
        const age = time - event.startedAt;
        if (age > event.duration) return false;
        const fadeIn = clamp(age / 420, 0, 1);
        const fadeOut = clamp((event.duration - age) / 900, 0, 1);
        const alpha = Math.min(fadeIn, fadeOut) * 0.09;
        const y = event.y - age * 0.006;

        ctx.save();
        ctx.font = "10px var(--font-mono), monospace";
        ctx.fillStyle = `rgba(7, 11, 20, ${alpha * 3})`;
        ctx.strokeStyle = `${event.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(event.x - 36, y - 15, 72, 22, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `${event.color}${Math.round(alpha * 255 * 2.5).toString(16).padStart(2, "0")}`;
        ctx.textAlign = "center";
        ctx.fillText(event.text, event.x, y);
        ctx.restore();

        return true;
      });
    };

    const drawDetails = (width: number, height: number, dt: number, time: number) => {
      textsRef.current.forEach((item) => {
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        if (item.y < -24) {
          item.y = height + 24;
          item.x = Math.random() * width;
          item.text = textTokens[Math.floor(Math.random() * textTokens.length)];
        }
        if (item.x < -90) item.x = width + 90;
        if (item.x > width + 90) item.x = -90;

        ctx.font = `${item.size}px var(--font-mono), monospace`;
        ctx.fillStyle = `rgba(139, 147, 167, ${item.opacity})`;
        ctx.fillText(item.text, item.x + Math.sin(time * 0.0002 + item.y) * 8, item.y);
      });

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;

        const twinkle = 0.45 + Math.sin(time * 0.002 + particle.x * 0.09 + particle.y * 0.04) * 0.35 + Math.random() * 0.08;
        ctx.fillStyle = particle.blue
          ? `rgba(79, 107, 255, ${particle.opacity * twinkle})`
          : `rgba(255, 255, 255, ${particle.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      nodesRef.current.forEach((node) => {
        node.x += node.vx * dt;
        node.y += node.vy * dt;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const b = nodesRef.current[j];
          const distance = Math.hypot(b.x - a.x, b.y - a.y);
          if (distance < 118) {
            const lineOpacity = (1 - distance / 118) * 0.05;
            ctx.strokeStyle = `rgba(79, 107, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            if (packetsRef.current.length < 20 && Math.random() < 0.00035) {
              packetsRef.current.push({
                from: i,
                to: j,
                progress: 0,
                speed: randomBetween(0.00018, 0.00042),
              });
            }
          }
        }
      }

      packetsRef.current = packetsRef.current.filter((packet) => {
        packet.progress += packet.speed * dt;
        if (packet.progress >= 1) return false;
        const from = nodesRef.current[packet.from];
        const to = nodesRef.current[packet.to];
        if (!from || !to) return false;
        const x = from.x + (to.x - from.x) * packet.progress;
        const y = from.y + (to.y - from.y) * packet.progress;

        ctx.fillStyle = "rgba(54, 209, 255, 0.38)";
        ctx.beginPath();
        ctx.arc(x, y, 1.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(79, 107, 255, 0.08)";
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      nodesRef.current.forEach((node) => {
        const pulse = 0.65 + Math.sin(time * 0.001 + node.x) * 0.35;
        ctx.fillStyle = `rgba(79, 107, 255, ${node.opacity * pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      streaksRef.current.forEach((streak) => {
        streak.x += streak.speed * dt;
        streak.y += Math.sin(time * 0.0002 + streak.x * 0.01) * 0.012 * dt;
        if (streak.x > width + streak.length) {
          streak.x = -streak.length;
          streak.y = Math.random() * height;
        }

        const gradient = ctx.createLinearGradient(streak.x, streak.y, streak.x + streak.length, streak.y + streak.length * streak.angle);
        gradient.addColorStop(0, "rgba(54, 209, 255, 0)");
        gradient.addColorStop(0.5, `rgba(54, 209, 255, ${streak.opacity})`);
        gradient.addColorStop(1, "rgba(54, 209, 255, 0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x + streak.length, streak.y + streak.length * streak.angle);
        ctx.stroke();
      });
    };

    const drawStream = (stream: MarketStream, width: number, height: number, dt: number, now: number) => {
      while (now - stream.lastAppend >= 1000) appendCandle(stream, now);

      stream.offset += stream.speed * dt;
      stream.baseY += Math.sin(now * 0.00008 + stream.colorShift * 8) * 0.008 * dt;
      const top = clamp(stream.baseY - stream.height / 2, 22, height - stream.height - 22);
      const bottom = top + stream.height;
      const candles = stream.candles;
      const minLow = Math.min(...candles.map((candle) => candle.low));
      const maxHigh = Math.max(...candles.map((candle) => candle.high));
      const range = Math.max(40, maxHigh - minLow);
      const toY = (price: number) => bottom - ((price - minLow) / range) * stream.height;

      ctx.save();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = `rgba(139, 147, 167, ${stream.opacity * 0.52})`;
      ctx.lineWidth = 0.45;
      for (let i = 0; i < 4; i++) {
        const y = top + (stream.height / 3) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.beginPath();
      candles.forEach((candle, index) => {
        const x = width - (candles.length - index) * stream.spacing + stream.offset;
        const y = toY((candle.open + candle.close) / 2);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = `rgba(79, 107, 255, ${stream.opacity * 0.82})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      candles.forEach((candle, index) => {
        const x = width - (candles.length - index) * stream.spacing + stream.offset;
        if (x < -20 || x > width + 20) return;

        const openY = toY(candle.open);
        const closeY = toY(candle.close);
        const highY = toY(candle.high);
        const lowY = toY(candle.low);
        const isUp = candle.close >= candle.open;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.4, Math.abs(closeY - openY));
        const wickAlpha = stream.opacity * (isUp ? 0.95 : 0.9);
        const bodyAlpha = stream.opacity * (isUp ? 1.22 : 1.08);

        ctx.strokeStyle = isUp ? `rgba(62, 207, 142, ${wickAlpha})` : `rgba(240, 87, 107, ${wickAlpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        ctx.fillStyle = isUp ? `rgba(62, 207, 142, ${bodyAlpha})` : `rgba(240, 87, 107, ${bodyAlpha})`;
        ctx.fillRect(x - stream.candleWidth / 2, bodyTop, stream.candleWidth, bodyHeight);

        if (index === candles.length - 1) {
          const activeGlow = ctx.createRadialGradient(x, closeY, 0, x, closeY, 22);
          activeGlow.addColorStop(0, isUp ? `rgba(54, 209, 255, ${stream.opacity * 0.42})` : `rgba(240, 87, 107, ${stream.opacity * 0.28})`);
          activeGlow.addColorStop(1, "rgba(54, 209, 255, 0)");
          ctx.fillStyle = activeGlow;
          ctx.beginPath();
          ctx.arc(x, closeY, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        if (index % 3 === 0) {
          const volumeHeight = Math.min(24, candle.volume * 0.09);
          ctx.fillStyle = isUp ? `rgba(62, 207, 142, ${stream.opacity * 0.42})` : `rgba(240, 87, 107, ${stream.opacity * 0.38})`;
          ctx.fillRect(x - 1, bottom + 8 - volumeHeight, 2, volumeHeight);
        }
      });

      const last = candles[candles.length - 1];
      const lastY = toY(last.close);
      const priceColor = last.close >= last.open ? "62, 207, 142" : "240, 87, 107";
      ctx.strokeStyle = `rgba(${priceColor}, ${stream.opacity * 0.58})`;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (eventsRef.current.length < 8 && Math.random() < dt * 0.000035) {
        const eventIndex = Math.max(8, Math.floor(randomBetween(candles.length * 0.45, candles.length - 2)));
        const eventCandle = candles[eventIndex];
        const x = width - (candles.length - eventIndex) * stream.spacing + stream.offset;
        const y = toY(eventCandle.close);
        const label = EVENT_MARKERS[Math.floor(Math.random() * EVENT_MARKERS.length)];
        eventsRef.current.push({
          x: clamp(x, 58, width - 58),
          y: clamp(y, 38, height - 38),
          text: label,
          startedAt: now,
          duration: randomBetween(2600, 4600),
          color: label.includes("SELL") ? "#f0576b" : "#36D1FF",
        });
      }

      ctx.restore();
    };

    const drawTerminalChart = (chart: TerminalChart, width: number, height: number, now: number) => {
      while (now - chart.lastAppend >= randomBetween(900, 1450)) appendTerminalCandle(chart, now);

      const driftX = Math.sin(now * 0.00012 + chart.driftPhase) * chart.driftX;
      const driftY = Math.cos(now * 0.0001 + chart.driftPhase) * chart.driftY;
      const x = width * chart.xRatio + driftX;
      const y = height * chart.yRatio + driftY;
      const w = chart.width * chart.scale;
      const h = chart.height * chart.scale;
      const candles = chart.candles;
      const minLow = Math.min(...candles.map((candle) => candle.low));
      const maxHigh = Math.max(...candles.map((candle) => candle.high));
      const range = Math.max(30, maxHigh - minLow);
      const pad = 12;
      const chartH = h - 34;
      const chartW = w - 24;
      const toY = (price: number) => pad + chartH - ((price - minLow) / range) * chartH;
      const spacing = chartW / Math.max(1, candles.length - 1);
      const ema: number[] = [];

      candles.forEach((candle, index) => {
        if (index === 0) ema.push(candle.close);
        else ema.push(ema[index - 1] * 0.82 + candle.close * 0.18);
      });

      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((chart.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      ctx.fillStyle = `rgba(7, 11, 20, ${chart.opacity * 1.15})`;
      ctx.strokeStyle = `rgba(175, 196, 255, ${chart.opacity * 0.7})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = `rgba(79, 107, 255, ${chart.opacity * 0.5})`;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        const gy = pad + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(10, gy);
        ctx.lineTo(w - 10, gy);
        ctx.stroke();
      }

      candles.forEach((candle, index) => {
        const cx = 12 + spacing * index;
        const openY = toY(candle.open);
        const closeY = toY(candle.close);
        const highY = toY(candle.high);
        const lowY = toY(candle.low);
        const isUp = candle.close >= candle.open;
        const bodyWidth = Math.max(2, spacing * 0.42);
        const alpha = chart.opacity * (isUp ? 1.05 : 0.95);

        ctx.strokeStyle = isUp ? `rgba(62, 207, 142, ${alpha})` : `rgba(240, 87, 107, ${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(cx, highY);
        ctx.lineTo(cx, lowY);
        ctx.stroke();

        ctx.fillStyle = isUp ? `rgba(62, 207, 142, ${alpha * 1.05})` : `rgba(240, 87, 107, ${alpha})`;
        ctx.fillRect(cx - bodyWidth / 2, Math.min(openY, closeY), bodyWidth, Math.max(1.2, Math.abs(closeY - openY)));

        if (index % 2 === 0) {
          const volumeHeight = Math.min(18, candle.volume * 0.065);
          ctx.fillStyle = isUp ? `rgba(62, 207, 142, ${chart.opacity * 0.55})` : `rgba(240, 87, 107, ${chart.opacity * 0.5})`;
          ctx.fillRect(cx - 1, h - 10 - volumeHeight, 2, volumeHeight);
        }
      });

      ctx.beginPath();
      ema.forEach((value, index) => {
        const cx = 12 + spacing * index;
        const cy = toY(value);
        if (index === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.strokeStyle = `rgba(54, 209, 255, ${chart.opacity * 1.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const last = candles[candles.length - 1];
      const lastY = toY(last.close);
      ctx.fillStyle = `rgba(232, 234, 237, ${chart.opacity * 2.2})`;
      ctx.font = "9px var(--font-mono), monospace";
      ctx.fillText(chart.symbol, 12, 14);
      ctx.fillStyle = `rgba(175, 196, 255, ${chart.opacity * 1.8})`;
      ctx.fillText(last.close.toFixed(2), w - 72, lastY);
      ctx.restore();
    };

    const draw = (time: number) => {
      if (reducedMotion && lastTimeRef.current) return;
      if (!reducedMotion) rafRef.current = requestAnimationFrame(draw);
      if (document.visibilityState === "hidden") {
        lastTimeRef.current = time;
        return;
      }
      const dt = Math.min(time - (lastTimeRef.current || time), 34);
      lastTimeRef.current = time;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#070B14";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.028)";
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width * 0.48, height * 0.26, 0, width * 0.48, height * 0.26, width * 0.72);
      glow.addColorStop(0, "rgba(79, 107, 255, 0.078)");
      glow.addColorStop(0.42, "rgba(54, 209, 255, 0.032)");
      glow.addColorStop(1, "rgba(7, 11, 20, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      drawGrid(width, height, time);
      streamsRef.current.forEach((stream) => drawStream(stream, width, height, dt, time));
      terminalChartsRef.current.forEach((chart) => drawTerminalChart(chart, width, height, time));
      drawDetails(width, height, dt, time);
      drawEvents(time);

      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.45, width * 0.2, width * 0.5, height * 0.45, width * 0.78);
      vignette.addColorStop(0, "rgba(7, 11, 20, 0)");
      vignette.addColorStop(1, "rgba(7, 11, 20, 0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    rafRef.current = requestAnimationFrame(draw);

    resizeObserverRef.current = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserverRef.current.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
      resizeObserverRef.current?.disconnect();
    };
  }, [reducedMotion, textTokens]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        animate={reducedMotion ? undefined : { x: [0, 34, -18, 0], y: [0, -20, 12, 0], scale: [1, 1.08, 0.98, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[12%] top-[5%] h-[46vh] w-[56vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(79,107,255,0.105), rgba(54,209,255,0.045) 42%, transparent 70%)" }}
      />
      <motion.div
        animate={reducedMotion ? undefined : { x: [0, -28, 22, 0], y: [0, 18, -16, 0], scale: [1, 1.05, 1.12, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-18%] top-[18%] h-[54vh] w-[58vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(54,209,255,0.09), rgba(109,140,255,0.052) 48%, transparent 72%)" }}
      />
      <motion.div
        animate={reducedMotion ? undefined : { x: [0, 22, -16, 0], y: [0, -14, 24, 0], scale: [1, 1.1, 1.02, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[-14%] h-[48vh] w-[54vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(79,107,255,0.082), rgba(54,209,255,0.035) 45%, transparent 72%)" }}
      />
      <motion.div
        animate={reducedMotion ? undefined : { x: [0, -18, 18, 0], y: [0, 16, -10, 0], scale: [1, 1.06, 0.96, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[6%] right-[10%] h-[34vh] w-[40vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(109,140,255,0.078), rgba(54,209,255,0.034) 45%, transparent 74%)" }}
      />

      <canvas
        ref={canvasRef}
        className="relative block h-full w-full"
        style={{ display: "block", filter: "blur(1.2px)", opacity: 0.94 }}
      />
    </motion.div>
  );
};

export default AnimatedMarketBackground;
