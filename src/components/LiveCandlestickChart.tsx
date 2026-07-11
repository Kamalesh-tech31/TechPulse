import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Cpu, BrainCircuit, Activity, Layers, BarChart3 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number; // 0–1 relative volume
}

type MarketRegime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'CONSOLIDATING' | 'BREAKOUT' | 'REVERSAL';

interface RegimeState {
  regime: MarketRegime;
  duration: number;    // candles left in this regime
  momentum: number;    // current directional bias -1 to 1
}

// ─────────────────────────────────────────────────────────────────────────────
//  Market Regime Generator
//  Produces realistic Nifty-style intraday behaviour with clear deflections
// ─────────────────────────────────────────────────────────────────────────────
const REGIME_PARAMS: Record<MarketRegime, { volMult: number; bias: number; bodyRatio: [number, number]; wickRatio: [number, number] }> = {
  TRENDING_UP:   { volMult: 1.0, bias:  0.65, bodyRatio: [0.55, 0.85], wickRatio: [0.1, 0.4] },
  TRENDING_DOWN: { volMult: 1.1, bias: -0.65, bodyRatio: [0.55, 0.85], wickRatio: [0.1, 0.4] },
  CONSOLIDATING: { volMult: 0.5, bias:  0.0,  bodyRatio: [0.1, 0.35],  wickRatio: [0.4, 0.9] },
  BREAKOUT:      { volMult: 2.2, bias:  0.8,  bodyRatio: [0.75, 0.95], wickRatio: [0.05, 0.15] },
  REVERSAL:      { volMult: 1.5, bias: -0.3,  bodyRatio: [0.3, 0.65],  wickRatio: [0.35, 0.75] },
};

function nextRegime(current: MarketRegime, momentum: number): RegimeState {
  const rand = Math.random();
  let next: MarketRegime;
  if (current === 'TRENDING_UP') {
    if (rand < 0.12) next = 'BREAKOUT';
    else if (rand < 0.28) next = 'REVERSAL';
    else if (rand < 0.45) next = 'CONSOLIDATING';
    else next = 'TRENDING_UP';
  } else if (current === 'TRENDING_DOWN') {
    if (rand < 0.15) next = 'REVERSAL';
    else if (rand < 0.35) next = 'CONSOLIDATING';
    else if (rand < 0.50) next = 'TRENDING_UP';
    else next = 'TRENDING_DOWN';
  } else if (current === 'CONSOLIDATING') {
    if (rand < 0.4) next = momentum >= 0 ? 'TRENDING_UP' : 'TRENDING_DOWN';
    else if (rand < 0.55) next = 'BREAKOUT';
    else next = 'CONSOLIDATING';
  } else if (current === 'BREAKOUT') {
    if (rand < 0.6) next = 'TRENDING_UP';
    else if (rand < 0.8) next = 'REVERSAL';
    else next = 'CONSOLIDATING';
  } else { // REVERSAL
    if (rand < 0.5) next = 'TRENDING_DOWN';
    else if (rand < 0.75) next = 'CONSOLIDATING';
    else next = 'TRENDING_UP';
  }
  const durations: Record<MarketRegime, [number, number]> = {
    TRENDING_UP:   [8, 18],
    TRENDING_DOWN: [6, 14],
    CONSOLIDATING: [4, 10],
    BREAKOUT:      [2, 5],
    REVERSAL:      [3, 7],
  };
  const [min, max] = durations[next];
  const newBias = REGIME_PARAMS[next].bias + (Math.random() - 0.5) * 0.2;
  return {
    regime: next,
    duration: min + Math.floor(Math.random() * (max - min)),
    momentum: Math.max(-1, Math.min(1, newBias)),
  };
}

function generateCandle(price: number, regime: RegimeState): Candle {
  const params = REGIME_PARAMS[regime.regime];
  const baseMove = 18 + Math.random() * 22; // 18–40 pts movement
  const volCandle = baseMove * params.volMult;

  // Direction — bias + randomness
  const dirRand = Math.random();
  const isUp = dirRand < (regime.momentum + 1) / 2;

  // Body size as fraction of total candle range
  const [minBody, maxBody] = params.bodyRatio;
  const bodyFrac = minBody + Math.random() * (maxBody - minBody);
  const body = volCandle * bodyFrac;

  // Wick allocation
  const [minWick, maxWick] = params.wickRatio;
  const wickFrac = minWick + Math.random() * (maxWick - minWick);
  const totalWick = volCandle * (1 - bodyFrac);
  const upperWickFrac = 0.3 + Math.random() * 0.4;

  const open = price;
  const close = isUp ? open + body : open - body;
  const high = Math.max(open, close) + totalWick * upperWickFrac;
  const low = Math.min(open, close) - totalWick * (1 - upperWickFrac);
  const volume = 0.3 + params.volMult * 0.4 + Math.random() * 0.3;

  return { open, close, high, low, volume };
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI Float Cards data
// ─────────────────────────────────────────────────────────────────────────────
const AI_CARDS = [
  {
    id: 'nifty',
    title: 'NIFTY 50',
    value: '₹24,150',
    sub: '+1.28%',
    tone: 'positive' as const,
    icon: TrendingUp,
    pos: { top: '5%', left: '-3%' },
    floatY: [-5, 5],
    delay: 0,
  },
  {
    id: 'portfolio',
    title: 'PORTFOLIO',
    value: '₹10,00,000',
    sub: 'Virtual Capital',
    tone: 'neutral' as const,
    icon: Layers,
    pos: { bottom: '18%', left: '-3%' },
    floatY: [5, -5],
    delay: 0.6,
  },
  {
    id: 'ai-signal',
    title: 'AI SIGNAL',
    value: 'BUY',
    sub: '94% Confidence',
    tone: 'positive' as const,
    icon: Cpu,
    pos: { top: '10%', right: '-3%' },
    floatY: [-6, 6],
    delay: 0.3,
  },
  {
    id: 'volatility',
    title: 'VOLATILITY',
    value: 'MEDIUM',
    sub: 'ATR: 42.5',
    tone: 'neutral' as const,
    icon: Activity,
    pos: { bottom: '8%', right: '-3%' },
    floatY: [4, -4],
    delay: 0.9,
  },
  {
    id: 'trend',
    title: 'MARKET TREND',
    value: 'BULLISH',
    sub: 'EMA Cross ✓',
    tone: 'positive' as const,
    icon: BarChart3,
    pos: { top: '50%', left: '-5%' },
    floatY: [-4, 4],
    delay: 1.2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────
export const LiveCandlestickChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candlesRef = useRef<Candle[]>([]);
  const regimeRef = useRef<RegimeState>({ regime: 'TRENDING_UP', duration: 12, momentum: 0.6 });
  const priceRef = useRef(23900);
  const scrollRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const animIdRef = useRef(0);
  const lastCandleTimeRef = useRef(0);
  const CANDLE_INTERVAL = 1000; // 1 second

  const initCandles = useCallback(() => {
    let p = 23600;
    let regime = regimeRef.current;
    for (let i = 0; i < 50; i++) {
      if (regime.duration <= 0) {
        regime = nextRegime(regime.regime, regime.momentum);
        regimeRef.current = regime;
      }
      const c = generateCandle(p, regime);
      candlesRef.current.push(c);
      p = c.close;
      regime.duration--;
    }
    priceRef.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initCandles();

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 540;
      canvas.height = rect?.height || 420;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (timestamp: number) => {
      animIdRef.current = requestAnimationFrame(draw);

      // Generate new candle every CANDLE_INTERVAL
      if (timestamp - lastCandleTimeRef.current >= CANDLE_INTERVAL) {
        lastCandleTimeRef.current = timestamp;
        let regime = regimeRef.current;
        if (regime.duration <= 0) {
          regime = nextRegime(regime.regime, regime.momentum);
          regimeRef.current = regime;
        }
        const newCandle = generateCandle(priceRef.current, regime);
        candlesRef.current.push(newCandle);
        if (candlesRef.current.length > 60) candlesRef.current.shift();
        priceRef.current = newCandle.close;
        regime.duration--;
        scrollTargetRef.current += 1;
      }

      // Smooth scroll
      scrollRef.current += (scrollTargetRef.current - scrollRef.current) * 0.1;

      const w = canvas.width;
      const h = canvas.height;
      const t = timestamp * 0.001;

      ctx.clearRect(0, 0, w, h);

      // Transparent background so page background shows through
      ctx.clearRect(0, 0, w, h);

      const candles = candlesRef.current;
      if (candles.length < 2) return;

      // Layout
      const PADDING_TOP = 32;
      const PADDING_BOTTOM = 50;
      const PADDING_LEFT = 8;
      const PADDING_RIGHT = 70;
      const chartW = w - PADDING_LEFT - PADDING_RIGHT;
      const chartH = h - PADDING_TOP - PADDING_BOTTOM;
      const VISIBLE = 35; // how many candles to show
      const spacing = chartW / VISIBLE;
      const candleWidth = Math.max(4, spacing * 0.52);

      // Find price range for visible candles
      const visibleCandles = candles.slice(-VISIBLE);
      let priceMin = Infinity, priceMax = -Infinity;
      visibleCandles.forEach(c => {
        priceMin = Math.min(priceMin, c.low);
        priceMax = Math.max(priceMax, c.high);
      });
      const pricePad = (priceMax - priceMin) * 0.12;
      priceMin -= pricePad;
      priceMax += pricePad;
      const priceRange = priceMax - priceMin;

      const toY = (price: number) => PADDING_TOP + chartH - ((price - priceMin) / priceRange) * chartH;

      // ── GRID LINES ──────────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.8;
      const gridCount = 5;
      for (let i = 0; i <= gridCount; i++) {
        const y = PADDING_TOP + (chartH / gridCount) * i;
        ctx.beginPath();
        ctx.moveTo(PADDING_LEFT, y);
        ctx.lineTo(w - PADDING_RIGHT, y);
        ctx.stroke();

        // Price label
        const labelPrice = priceMax - (priceRange / gridCount) * i;
        ctx.fillStyle = 'rgba(139, 147, 167, 0.45)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(labelPrice.toFixed(0), w - PADDING_RIGHT + 6, y + 3);
      }

      // ── VOLUME BARS (subtle, behind candles) ──────────────────────────
      const volMaxH = PADDING_BOTTOM * 0.7;
      visibleCandles.forEach((c, i) => {
        const x = PADDING_LEFT + i * spacing + (scrollRef.current % 1) * -spacing;
        const isUp = c.close >= c.open;
        ctx.fillStyle = isUp ? 'rgba(62, 207, 142, 0.12)' : 'rgba(240, 87, 107, 0.12)';
        const volH = c.volume * volMaxH;
        ctx.fillRect(x - candleWidth / 2, h - PADDING_BOTTOM / 2 - volH, candleWidth, volH);
      });

      // ── CANDLES ──────────────────────────────────────────────────────────
      const closePrices: Array<{ x: number; y: number }> = [];

      visibleCandles.forEach((c, i) => {
        const x = PADDING_LEFT + i * spacing - (scrollRef.current % 1) * spacing;
        const isUp = c.close >= c.open;
        const upColor = '#3ecf8e';
        const downColor = '#f0576b';
        const color = isUp ? upColor : downColor;

        const openY = toY(c.open);
        const closeY = toY(c.close);
        const highY = toY(c.high);
        const lowY = toY(c.low);

        closePrices.push({ x, y: closeY });

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        ctx.globalAlpha = 1;
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(closeY - openY));

        // Glow on last candle
        if (i === visibleCandles.length - 1) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
        }

        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
        ctx.shadowBlur = 0;

        // Subtle border on body for premium look
        ctx.strokeStyle = isUp ? 'rgba(62, 207, 142, 0.5)' : 'rgba(240, 87, 107, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
      });

      ctx.globalAlpha = 1;

      // ── PRICE LINE (connect close prices with smooth bezier) ────────────
      if (closePrices.length > 1) {
        ctx.strokeStyle = 'rgba(79, 107, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        closePrices.forEach((pt, i) => {
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = closePrices[i - 1];
            const cpX = (prev.x + pt.x) / 2;
            ctx.bezierCurveTo(cpX, prev.y, cpX, pt.y, pt.x, pt.y);
          }
        });
        ctx.stroke();
      }

      // ── LIVE PRICE DASHED LINE ───────────────────────────────────────────
      const lastClose = priceRef.current;
      const lastY = toY(lastClose);
      const lastIsUp = (candlesRef.current.at(-1)?.close ?? lastClose) >= (candlesRef.current.at(-1)?.open ?? lastClose);

      ctx.strokeStyle = lastIsUp ? 'rgba(62, 207, 142, 0.4)' : 'rgba(240, 87, 107, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(PADDING_LEFT, lastY);
      ctx.lineTo(w - PADDING_RIGHT, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LIVE PRICE BADGE ─────────────────────────────────────────────────
      const badgeX = w - PADDING_RIGHT + 2;
      const badgeY = lastY - 10;
      const badgeColor = lastIsUp ? '#3ecf8e' : '#f0576b';
      ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 60, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = badgeColor;
      ctx.font = 'bold 8.5px JetBrains Mono, monospace';
      ctx.fillText(`₹${lastClose.toFixed(0)}`, badgeX + 5, badgeY + 13);

      // ── PULSE CURSOR AT LAST CANDLE ──────────────────────────────────────
      const lastX = closePrices.at(-1)?.x ?? w - PADDING_RIGHT - 10;
      ctx.fillStyle = lastIsUp ? '#3ecf8e' : '#f0576b';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Expanding ring
      const ringRadius = ((t % 1.8) / 1.8) * 22;
      const ringOpacity = 1 - (t % 1.8) / 1.8;
      ctx.strokeStyle = `rgba(62, 207, 142, ${ringOpacity * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(lastX, lastY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // ── HEADER: Symbol & timeframe ───────────────────────────────────────
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px Space Grotesk, sans-serif';
      ctx.fillText('NIFTY 50', PADDING_LEFT + 4, PADDING_TOP - 14);

      ctx.fillStyle = 'rgba(139, 147, 167, 0.55)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('1m  •  LIVE', PADDING_LEFT + 66, PADDING_TOP - 14);

      // Change indicator
      const firstClose = visibleCandles[0]?.open ?? lastClose;
      const pctChange = ((lastClose - firstClose) / firstClose) * 100;
      const changeColor = pctChange >= 0 ? '#3ecf8e' : '#f0576b';
      ctx.fillStyle = changeColor;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`, PADDING_LEFT + 136, PADDING_TOP - 14);

      // ── AXIS TIME LABELS ─────────────────────────────────────────────────
      ctx.fillStyle = 'rgba(139, 147, 167, 0.35)';
      ctx.font = '8px JetBrains Mono, monospace';
      const now = new Date();
      const totalVisible = visibleCandles.length;
      for (let i = 0; i < totalVisible; i += 7) {
        const x = PADDING_LEFT + i * spacing - (scrollRef.current % 1) * spacing;
        const labelTime = new Date(now.getTime() - (totalVisible - i) * CANDLE_INTERVAL);
        const hh = labelTime.getHours().toString().padStart(2, '0');
        const mm = labelTime.getMinutes().toString().padStart(2, '0');
        ctx.fillText(`${hh}:${mm}`, x - 10, h - 8);
      }
    };

    animIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      ro.disconnect();
    };
  }, [initCandles]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
      }}
    >
      {/* Canvas chart */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          borderRadius: 16,
        }}
      />

      {/* Floating AI cards */}
      {AI_CARDS.map((card) => {
        const Icon = card.icon;
        const isPositive = card.tone === 'positive';
        const valueColor = isPositive ? '#3ecf8e' : 'var(--color-trado-text)';

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: card.floatY }}
            transition={{
              opacity: { duration: 0.5, delay: card.delay },
              scale: { duration: 0.5, delay: card.delay },
              y: {
                duration: 4 + card.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: card.delay,
              },
            }}
            style={{
              position: 'absolute',
              ...card.pos,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(13, 17, 23, 0.78)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(79,107,255,0.07), inset 0 1px 0 rgba(255,255,255,0.06)',
              minWidth: 140,
              zIndex: 20,
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: isPositive
                    ? 'rgba(62, 207, 142, 0.12)'
                    : 'rgba(79, 107, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isPositive ? '#3ecf8e' : 'var(--color-trado-accent)',
                  flexShrink: 0,
                }}
              >
                <Icon size={11} />
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--color-trado-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {card.title}
              </span>
            </div>

            {/* Value */}
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: valueColor, lineHeight: 1.2 }}>
              {card.value}
            </div>

            {/* Sub */}
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-trado-muted)', marginTop: 3 }}>
              {card.sub}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
