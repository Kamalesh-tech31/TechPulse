import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Activity, Zap, Wifi, Brain, BarChart2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema: number;
  rsi: number;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = '#26a69a';
const RED   = '#ef5350';
const BLUE  = '#4f6bff';
const CYAN  = '#36d1dc';
const GRID  = 'rgba(255,255,255,0.04)';

// ─── Chart constants ─────────────────────────────────────────────────────────
const CHART_H    = 190;
const VOL_H      = 34;
const RSI_H      = 40;
const MAX_CANDLES = 50;
const CANDLE_W   = 7;
const CANDLE_GAP = 3;
const STEP       = CANDLE_W + CANDLE_GAP;

// ─── EMA: proper cumulative exponential smoothing ────────────────────────────
function calcEMA(closes: number[], period = 9): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  closes.forEach((c, i) => {
    result.push(i === 0 ? c : c * k + result[i - 1] * (1 - k));
  });
  return result;
}

// ─── RSI: proper Wilder RSI ──────────────────────────────────────────────────
function calcRSI(closes: number[], period = 14): number[] {
  const rsi = new Array<number>(closes.length).fill(50);
  if (closes.length < period + 1) return rsi;
  for (let i = period; i < closes.length; i++) {
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j] - closes[j - 1];
      if (d > 0) gains += d; else losses -= d;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    rsi[i] = 100 - 100 / (1 + rs);
  }
  return rsi;
}

// ─── Realistic trend simulator ───────────────────────────────────────────────
let _trendLen  = 0;
let _trendDir  = 1;
let _trendPhase = 0; // 0=trend 1=consolidate 2=pullback

function nextPrice(last: number): number {
  if (_trendLen <= 0) {
    _trendPhase = Math.floor(Math.random() * 3);
    _trendDir   = Math.random() > 0.45 ? 1 : -1;
    _trendLen   = 6 + Math.floor(Math.random() * 12);
  }
  _trendLen--;
  let delta = 0;
  if (_trendPhase === 0)      delta = _trendDir * (0.3 + Math.random() * 1.0);
  else if (_trendPhase === 1) delta = (Math.random() - 0.5) * 0.4;
  else                        delta = -_trendDir * (0.2 + Math.random() * 0.6);
  return Math.max(85, Math.min(260, last + delta + (Math.random() - 0.5) * 0.25));
}

function makeCandle(prev: number): Omit<Candle, 'ema' | 'rsi'> {
  const open  = prev;
  const close = nextPrice(prev);
  const body  = Math.abs(close - open);
  const high  = Math.max(open, close) + Math.random() * (body * 0.6 + 0.4);
  const low   = Math.min(open, close) - Math.random() * (body * 0.6 + 0.4);
  return { open, high, low, close, volume: 20 + Math.random() * 80 };
}

function buildInitial(): Candle[] {
  let p = 148 + (Math.random() - 0.5) * 10;
  const raw: Omit<Candle, 'ema' | 'rsi'>[] = [];
  for (let i = 0; i < MAX_CANDLES; i++) {
    raw.push(makeCandle(p));
    p = raw[raw.length - 1].close;
  }
  const closes = raw.map(c => c.close);
  const emas   = calcEMA(closes);
  const rsis   = calcRSI(closes);
  return raw.map((c, i) => ({ ...c, ema: emas[i], rsi: rsis[i] }));
}

function fakeLatency() { return (1 + Math.random() * 3).toFixed(1) + 'ms'; }

// ─── Component ───────────────────────────────────────────────────────────────
export const PremiumStaticHero: React.FC = () => {
  const [candles,    setCandles]    = useState<Candle[]>(() => buildInitial());
  const [latency,    setLatency]    = useState<string>(fakeLatency);
  const [aiConf,     setAiConf]     = useState(82);
  const [sentiment,  setSentiment]  = useState<'BULLISH' | 'NEUTRAL' | 'BEARISH'>('BULLISH');
  const [signalType, setSignalType] = useState<'BUY' | 'SELL' | null>(null);

  const tick = useCallback(() => {
    setCandles(prev => {
      const last      = prev[prev.length - 1];
      const rawCandle = makeCandle(last.close);
      const slice     = [...prev.slice(1), { ...rawCandle, ema: 0, rsi: 50 }];
      const closes    = slice.map(c => c.close);
      const emas      = calcEMA(closes);
      const rsis      = calcRSI(closes);
      const updated   = slice.map((c, i) => ({ ...c, ema: emas[i], rsi: rsis[i] }));

      // Update side effects inside tick (safe, no stale closure)
      const netChg5 = closes[closes.length - 1] - closes[closes.length - 6];
      setSentiment(netChg5 > 1 ? 'BULLISH' : netChg5 < -1 ? 'BEARISH' : 'NEUTRAL');
      setAiConf(a => Math.min(98, Math.max(55, a + (Math.random() - 0.48) * 4)));
      const r = Math.random();
      setSignalType(r > 0.93 ? 'BUY' : r < 0.05 ? 'SELL' : null);
      setLatency(fakeLatency());

      return updated;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, [tick]);

  // ─── Derived values ────────────────────────────────────────────────────────
  const last         = candles[candles.length - 1];
  const prev2        = candles[candles.length - 2];
  const currentPrice = last?.close ?? 0;
  const priceChange  = prev2 ? currentPrice - prev2.close : 0;
  const pctChange    = prev2?.close ? (priceChange / prev2.close) * 100 : 0;

  const priceMin  = Math.min(...candles.map(c => c.low))    - 0.5;
  const priceMax  = Math.max(...candles.map(c => c.high))   + 0.5;
  const priceSpan = priceMax - priceMin || 1;
  const volMax    = Math.max(...candles.map(c => c.volume), 1);
  const totalW    = MAX_CANDLES * STEP - CANDLE_GAP;
  const lastRSI   = last?.rsi ?? 50;

  // Y coordinate helpers
  const py = (p: number) => CHART_H - ((p - priceMin) / priceSpan) * CHART_H;
  const cx = (i: number) => i * STEP + CANDLE_W / 2;

  // Continuous EMA path — L-connected, never jumps
  const emaPath   = 'M ' + candles.map((c, i) => `${cx(i).toFixed(1)},${py(c.ema).toFixed(1)}`).join(' L ');
  const priceLineY = py(currentPrice);

  const isUp = priceChange >= 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '5%', left: '5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,107,255,0.10) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '8%', right: '8%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(54,209,220,0.07) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* ── Terminal shell ── */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 620,
        background: 'rgba(9,12,22,0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 0 0 1px rgba(79,107,255,0.08), 0 40px 80px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
      }}>

        {/* ── Header bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,0.012)' }}>
          {/* Symbol + live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, rgba(79,107,255,0.18), rgba(79,107,255,0.32))', border: '1px solid rgba(79,107,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color={BLUE} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.2 }}>NIFTY 50</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <motion.div
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
                />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Market</span>
              </div>
            </div>
          </div>

          {/* Animated price */}
          <div style={{ textAlign: 'center' }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={Math.round(currentPrice * 10)}
                initial={{ y: isUp ? -10 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ fontSize: 22, fontWeight: 800, color: isUp ? GREEN : RED, letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.div>
            </AnimatePresence>
            <div style={{ fontSize: 10, color: isUp ? GREEN + 'cc' : RED + 'cc', fontWeight: 600, marginTop: 2 }}>
              {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)} ({pctChange.toFixed(2)}%)
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(38,166,154,0.08)', border: '1px solid rgba(38,166,154,0.2)', borderRadius: 6, padding: '3px 8px' }}>
              <Wifi size={9} color={GREEN} />
              <span style={{ fontSize: 9, color: GREEN, letterSpacing: '0.04em' }}>{latency}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(79,107,255,0.1)', border: '1px solid rgba(79,107,255,0.25)', borderRadius: 6, padding: '3px 8px' }}>
              <Brain size={9} color={BLUE} />
              <span style={{ fontSize: 9, color: '#7b9eff', letterSpacing: '0.04em' }}>AI {aiConf.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* ── Chart area ── */}
        <div style={{ padding: '10px 14px 0' }}>

          {/* Timeframe + indicator pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8 }}>
            {['1m', '5m', '15m', '1h', '4h'].map((tf, i) => (
              <div key={tf} style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'default', letterSpacing: '0.04em',
                background: i === 1 ? 'rgba(79,107,255,0.18)' : 'transparent',
                color: i === 1 ? '#7b9eff' : 'rgba(255,255,255,0.28)',
                border: i === 1 ? '1px solid rgba(79,107,255,0.3)' : '1px solid transparent',
              }}>{tf}</div>
            ))}
            <div style={{ flex: 1 }} />
            {[['EMA', '#4f6bff'], ['RSI', '#36d1dc'], ['VOL', 'rgba(255,255,255,0.3)']].map(([ind, col]) => (
              <div key={ind} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: col, border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '0.04em' }}>{ind}</div>
            ))}
          </div>

          {/* Main chart + sub-panels */}
          <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>

            {/* Price chart */}
            <svg
              viewBox={`0 0 ${totalW} ${CHART_H}`}
              style={{ width: '100%', height: CHART_H, display: 'block' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="psHeroEmaGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BLUE} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={CYAN} stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Grid */}
              {[0.2, 0.4, 0.6, 0.8].map(p => (
                <line key={p} x1={0} y1={p * CHART_H} x2={totalW} y2={p * CHART_H} stroke={GRID} strokeWidth={0.6} />
              ))}
              {[0.25, 0.5, 0.75].map(p => (
                <line key={p} x1={p * totalW} y1={0} x2={p * totalW} y2={CHART_H} stroke={GRID} strokeWidth={0.4} />
              ))}

              {/* Price axis labels */}
              {[0.12, 0.5, 0.88].map((p, i) => (
                <text key={i} x={totalW - 2} y={p * CHART_H + 3} fontSize={7} fill="rgba(255,255,255,0.22)" textAnchor="end">
                  {(priceMin + (1 - p) * priceSpan).toFixed(1)}
                </text>
              ))}

              {/* Current price dashed line */}
              <line x1={0} y1={priceLineY} x2={totalW} y2={priceLineY} stroke={isUp ? GREEN : RED} strokeWidth={0.7} strokeDasharray="3,3" opacity={0.5} />
              <rect x={totalW - 40} y={priceLineY - 8} width={40} height={14} fill={isUp ? GREEN : RED} rx={3} opacity={0.9} />
              <text x={totalW - 2} y={priceLineY + 4} fontSize={7.5} fontWeight="700" fill="#000" textAnchor="end">{currentPrice.toFixed(1)}</text>

              {/* EMA — one continuous L-connected path, never broken */}
              <path d={emaPath} fill="none" stroke="url(#psHeroEmaGrad)" strokeWidth={1.5} opacity={0.9} />

              {/* Candlesticks */}
              {candles.map((c, i) => {
                const up      = c.close >= c.open;
                const color   = up ? GREEN : RED;
                const bodyTop = py(Math.max(c.open, c.close));
                const bodyBot = py(Math.min(c.open, c.close));
                const bodyH   = Math.max(1, bodyBot - bodyTop);
                return (
                  <g key={i}>
                    <line x1={cx(i)} y1={py(c.high)} x2={cx(i)} y2={py(c.low)} stroke={color} strokeWidth={0.8} opacity={0.7} />
                    <rect x={i * STEP} y={bodyTop} width={CANDLE_W} height={bodyH} fill={color} rx={1} opacity={up ? 0.88 : 0.82} />
                  </g>
                );
              })}

              {/* Buy/Sell markers */}
              {signalType === 'BUY' && last && (() => {
                const yBase = py(last.low) + 14;
                return (
                  <g>
                    <polygon points={`${cx(candles.length - 1)},${yBase} ${cx(candles.length - 1) - 6},${yBase + 9} ${cx(candles.length - 1) + 6},${yBase + 9}`} fill={GREEN} />
                    <text x={cx(candles.length - 1)} y={yBase + 19} fontSize={7} fill={GREEN} textAnchor="middle" fontWeight="700">BUY</text>
                  </g>
                );
              })()}
              {signalType === 'SELL' && last && (() => {
                const yBase = py(last.high) - 14;
                return (
                  <g>
                    <polygon points={`${cx(candles.length - 1)},${yBase} ${cx(candles.length - 1) - 6},${yBase - 9} ${cx(candles.length - 1) + 6},${yBase - 9}`} fill={RED} />
                    <text x={cx(candles.length - 1)} y={yBase - 12} fontSize={7} fill={RED} textAnchor="middle" fontWeight="700">SELL</text>
                  </g>
                );
              })()}
            </svg>

            {/* Volume histogram */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <svg viewBox={`0 0 ${totalW} ${VOL_H}`} style={{ width: '100%', height: VOL_H, display: 'block' }} preserveAspectRatio="none">
                {candles.map((c, i) => {
                  const bh = ((c.volume / volMax) * (VOL_H - 4));
                  return <rect key={i} x={i * STEP} y={VOL_H - bh} width={CANDLE_W} height={bh} fill={c.close >= c.open ? GREEN : RED} opacity={0.28} rx={1} />;
                })}
                <text x={4} y={10} fontSize={7} fill="rgba(255,255,255,0.25)" fontWeight="600">VOL</text>
              </svg>
            </div>

            {/* RSI panel */}
            <div style={{ borderTop: '1px solid rgba(54,209,220,0.08)' }}>
              <svg viewBox={`0 0 ${totalW} ${RSI_H}`} style={{ width: '100%', height: RSI_H, display: 'block' }} preserveAspectRatio="none">
                <line x1={0} y1={(1 - 0.7) * RSI_H} x2={totalW} y2={(1 - 0.7) * RSI_H} stroke={RED}   strokeWidth={0.5} strokeDasharray="3,3" opacity={0.35} />
                <line x1={0} y1={(1 - 0.3) * RSI_H} x2={totalW} y2={(1 - 0.3) * RSI_H} stroke={GREEN} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.35} />
                <line x1={0} y1={(1 - 0.5) * RSI_H} x2={totalW} y2={(1 - 0.5) * RSI_H} stroke={GRID}  strokeWidth={0.4} />
                <path
                  d={'M ' + candles.map((c, i) => `${cx(i).toFixed(1)},${((1 - c.rsi / 100) * RSI_H).toFixed(1)}`).join(' L ')}
                  fill="none" stroke={CYAN} strokeWidth={1.2} opacity={0.75}
                />
                <text x={4}          y={10}                    fontSize={6} fill="rgba(54,209,220,0.5)" fontWeight="600">RSI({lastRSI.toFixed(0)})</text>
                <text x={totalW - 3} y={(1 - 0.7) * RSI_H - 2} fontSize={6} fill={RED}   textAnchor="end" opacity={0.5}>70</text>
                <text x={totalW - 3} y={(1 - 0.3) * RSI_H + 8} fontSize={6} fill={GREEN} textAnchor="end" opacity={0.5}>30</text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '10px 14px 14px' }}>
          {([
            { label: 'SENTIMENT', value: sentiment, color: sentiment === 'BULLISH' ? GREEN : sentiment === 'BEARISH' ? RED : 'rgba(255,255,255,0.55)', Icon: Activity },
            { label: '24H VOLUME', value: '₹2.41T',  color: 'rgba(255,255,255,0.75)', Icon: BarChart2 },
            { label: 'VOLATILITY', value: (Math.abs(priceChange) / Math.max(currentPrice, 1) * 100 * 10 + 0.4).toFixed(2) + '%', color: '#f0c040', Icon: Zap },
            { label: 'AI SIGNAL',  value: aiConf > 80 ? 'LONG' : aiConf < 60 ? 'SHORT' : 'HOLD', color: aiConf > 80 ? GREEN : aiConf < 60 ? RED : 'rgba(255,255,255,0.5)', Icon: Brain },
          ] as const).map(({ label, value, color, Icon }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon size={9} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.01em' }}>{value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};