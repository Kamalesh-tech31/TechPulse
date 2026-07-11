import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface Dot {
  x: number;
  y: number;
  opacity: number;
  radius: number;
}

interface Hub {
  name: string;
  ticker: string;
  x: number;
  y: number;
}

const HUBS: Hub[] = [
  { name: "Mumbai", ticker: "NSE Live", x: 430, y: 222 },
  { name: "New York", ticker: "NASDAQ", x: 170, y: 172 },
  { name: "London", ticker: "FTSE", x: 310, y: 148 },
  { name: "Tokyo", ticker: "Nikkei", x: 520, y: 186 },
  { name: "Singapore", ticker: "SGX", x: 456, y: 252 },
];

const CONNECTIONS = [
  { from: HUBS[1], to: HUBS[2], lift: -54, duration: 8.4 },
  { from: HUBS[2], to: HUBS[0], lift: 34, duration: 9.2 },
  { from: HUBS[0], to: HUBS[4], lift: 42, duration: 7.8 },
  { from: HUBS[4], to: HUBS[3], lift: -38, duration: 8.8 },
  { from: HUBS[2], to: HUBS[3], lift: -78, duration: 10.4 },
  { from: HUBS[1], to: HUBS[0], lift: 76, duration: 11.2 },
];

const seeded = (seed: number) => {
  const x = Math.sin(seed * 999.91) * 10000;
  return x - Math.floor(x);
};

// Generates 1400+ dots to create a highly detailed, premium continental network
const createDots = (): Dot[] => {
  const continents = [
    { cx: 165, cy: 160, rx: 84, ry: 54, count: 280 }, // North America
    { cx: 230, cy: 255, rx: 36, ry: 84, count: 180 }, // South America
    { cx: 328, cy: 153, rx: 48, ry: 33, count: 160 }, // Europe
    { cx: 347, cy: 242, rx: 48, ry: 75, count: 190 }, // Africa
    { cx: 450, cy: 180, rx: 112, ry: 68, count: 390 }, // Asia
    { cx: 505, cy: 272, rx: 52, ry: 28, count: 120 }, // Australia
  ];

  const dots: Dot[] = [];
  continents.forEach((continent, continentIndex) => {
    for (let i = 0; i < continent.count; i++) {
      const seed = continentIndex * 419 + i * 17;
      const angle = seeded(seed) * Math.PI * 2;
      const spread = Math.sqrt(seeded(seed + 9));
      const wobbleX = (seeded(seed + 23) - 0.5) * 14;
      const wobbleY = (seeded(seed + 37) - 0.5) * 12;
      dots.push({
        x: continent.cx + Math.cos(angle) * continent.rx * spread + wobbleX,
        y: continent.cy + Math.sin(angle) * continent.ry * spread + wobbleY,
        opacity: 0.18 + seeded(seed + 53) * 0.45,
        radius: 0.85 + seeded(seed + 67) * 1.5,
      });
    }
  });

  return dots;
};

// Orbital background flow particles
const createOrbitParticles = (): Dot[] =>
  Array.from({ length: 110 }, (_, index) => {
    const angle = (index / 110) * Math.PI * 2;
    const radiusX = 245 + seeded(index + 90) * 45;
    const radiusY = 128 + seeded(index + 120) * 32;
    return {
      x: 338 + Math.cos(angle) * radiusX,
      y: 205 + Math.sin(angle) * radiusY,
      radius: 0.7 + seeded(index + 180) * 1.5,
      opacity: 0.05 + seeded(index + 240) * 0.15,
    };
  });

const curvePath = (from: Hub, to: Hub, lift: number) => {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 + lift;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
};

export const GlobalFinancialNetwork: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const dots = useMemo(() => createDots(), []);
  const orbitParticles = useMemo(() => createOrbitParticles(), []);

  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isGlobeHovered, setIsGlobeHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const resetParallax = () => {
    setParallax({ x: 0, y: 0 });
    setIsGlobeHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsGlobeHovered(true)}
      onMouseLeave={resetParallax}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "visible",
        perspective: 1200,
      }}
    >
      {/* ── Volumetric Ambient Glow Core ── */}
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                x: parallax.x * -14,
                y: parallax.y * -12,
                scale: isGlobeHovered ? 1.15 : 1.0,
                opacity: isGlobeHovered ? 0.98 : 0.75,
              }
        }
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        style={{
          position: "absolute",
          inset: "-12% -8%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 48%, 
            rgba(54, 209, 255, 0.22) 0%, 
            rgba(79, 107, 255, 0.12) 36%, 
            rgba(7, 11, 20, 0) 70%)`,
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />

      {/* ── World Network SVG ── */}
      <motion.svg
        viewBox="0 0 640 400"
        role="img"
        aria-label="Global financial intelligence network"
        animate={
          reducedMotion
            ? undefined
            : {
                x: parallax.x * -12,
                y: parallax.y * -12,
                scale: isGlobeHovered ? 1.03 : 1.0,
                rotateZ: parallax.x * 3, // Max 3 degrees rotation
                filter: isGlobeHovered 
                  ? "drop-shadow(0 0 45px rgba(79,107,255,0.45)) brightness(1.15)"
                  : "drop-shadow(0 0 35px rgba(79,107,255,0.32)) brightness(0.95)",
              }
        }
        transition={{ type: "spring", stiffness: 75, damping: 20, mass: 0.8 }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          transformOrigin: "320px 200px",
        }}
      >
        <defs>
          <radialGradient id="networkCore" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(54,209,255,0.25)" />
            <stop offset="60%" stopColor="rgba(79,107,255,0.08)" />
            <stop offset="100%" stopColor="rgba(7,11,20,0)" />
          </radialGradient>
          <linearGradient id="connectionGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(54,209,255,0.06)" />
            <stop offset="50%" stopColor="rgba(175,196,255,0.65)" />
            <stop offset="100%" stopColor="rgba(54,209,255,0.06)" />
          </linearGradient>
        </defs>

        {/* Global base grid structures */}
        <ellipse cx="338" cy="205" rx="248" ry="142" fill="url(#networkCore)" />
        <ellipse
          cx="338"
          cy="205"
          rx="258"
          ry="150"
          fill="none"
          stroke={isGlobeHovered ? "rgba(79,107,255,0.22)" : "rgba(79,107,255,0.12)"}
          strokeWidth="1.1"
          style={{ transition: "stroke 0.4s ease" }}
        />
        <ellipse
          cx="338"
          cy="205"
          rx="220"
          ry="118"
          fill="none"
          stroke={isGlobeHovered ? "rgba(54, 209, 255, 0.16)" : "rgba(54, 209, 255, 0.07)"}
          strokeWidth="0.8"
          style={{ transition: "stroke 0.4s ease" }}
        />
        <path d="M 94 205 H 582" stroke="rgba(79,107,255,0.05)" strokeWidth="0.8" />
        <path d="M 338 58 V 350" stroke="rgba(79,107,255,0.05)" strokeWidth="0.8" />

        {/* Orbit Background Particles */}
        <motion.g
          style={{ transformOrigin: "338px 205px" }}
          animate={
            reducedMotion
              ? undefined
              : { rotate: [0, 360] }
          }
          transition={{
            duration: isGlobeHovered ? 20 : 38, // Accelerates on hover
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {orbitParticles.map((particle, index) => (
            <motion.circle
              key={`orbit-${index}`}
              cx={particle.x}
              cy={particle.y}
              r={particle.radius}
              animate={{
                fill: isGlobeHovered 
                  ? `rgba(100, 230, 255, ${Math.min(0.9, particle.opacity * 2.2)})` 
                  : `rgba(54, 209, 255, ${particle.opacity})`,
                r: isGlobeHovered ? particle.radius * 1.3 : particle.radius,
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </motion.g>

        {/* Thousands of Continent network dots */}
        <g>
          {dots.map((dot, index) => (
            <motion.circle
              key={`${dot.x}-${dot.y}-${index}`}
              cx={dot.x}
              cy={dot.y}
              r={dot.radius}
              fill={`rgba(${isGlobeHovered ? "175, 206, 255" : "128,170,255"}, ${
                isGlobeHovered ? Math.min(1.0, dot.opacity * 1.4) : dot.opacity
              })`}
              animate={
                reducedMotion
                  ? undefined
                  : { opacity: [dot.opacity * 0.45, dot.opacity * (isGlobeHovered ? 1.25 : 1), dot.opacity * 0.55] }
              }
              transition={{
                duration: (3.5 + (index % 6)) * (isGlobeHovered ? 0.65 : 1), // Accelerates flash rate on hover
                repeat: Infinity,
                ease: "easeInOut",
                delay: (index % 13) * 0.08,
              }}
            />
          ))}
        </g>

        {/* Connection arcs & moving light beams */}
        <g>
          {CONNECTIONS.map((connection, index) => {
            const path = curvePath(connection.from, connection.to, connection.lift);
            return (
              <g key={`${connection.from.name}-${connection.to.name}`}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke="url(#connectionGlow)"
                  strokeWidth={isGlobeHovered ? "1.65" : "1.25"}
                  strokeLinecap="round"
                  strokeDasharray="6 14"
                  animate={
                    reducedMotion
                      ? undefined
                      : { strokeDashoffset: [0, isGlobeHovered ? -96 : -48], opacity: isGlobeHovered ? [0.45, 0.95, 0.48] : [0.22, 0.7, 0.26] }
                  }
                  transition={{
                    duration: (5.2 + index * 0.6) * (isGlobeHovered ? 0.5 : 1),
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transition: "stroke-width 0.4s ease" }}
                />
                {!reducedMotion && (
                  <>
                    {/* Primary data packet */}
                    <circle r="3.2" fill="#ffffff" style={{ filter: "drop-shadow(0 0 6px #36d1ff)" }}>
                      <animateMotion
                        dur={`${isGlobeHovered ? connection.duration * 0.55 : connection.duration}s`}
                        repeatCount="indefinite"
                        path={path}
                      />
                    </circle>
                    {/* Secondary trailing packet */}
                    <circle r="1.8" fill="rgba(54, 209, 255, 0.85)" style={{ filter: "drop-shadow(0 0 4px rgba(79,107,255,0.6))" }}>
                      <animateMotion
                        dur={`${isGlobeHovered ? connection.duration * 0.55 : connection.duration}s`}
                        repeatCount="indefinite"
                        path={path}
                        begin={`${(isGlobeHovered ? connection.duration * 0.55 : connection.duration) * 0.15}s`}
                      />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Soft Volumetric Grid Scanner Sweep */}
        <motion.g
          animate={{
            y: [-24, 24, -24],
            opacity: isGlobeHovered ? [0.12, 0.28, 0.12] : [0.06, 0.15, 0.06],
          }}
          transition={{ duration: isGlobeHovered ? 4.2 : 6.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="92" y="90" width="490" height="2.2" rx="1" fill="rgba(54,209,255,0.55)" />
          <rect x="92" y="92" width="490" height="34" fill="rgba(54,209,255,0.065)" />
        </motion.g>

        {/* Glowing Hub Cities */}
        <g>
          {HUBS.map((hub, index) => (
            <g key={hub.name}>
              {/* Hub Radar Rings */}
              <motion.circle
                cx={hub.x}
                cy={hub.y}
                r="13"
                fill="rgba(54,209,255,0.14)"
                animate={
                  reducedMotion
                    ? undefined
                    : { r: [9, 22, 9], opacity: [0.12, 0.38, 0.12] }
                }
                transition={{
                  duration: (3 + index * 0.4) * (isGlobeHovered ? 0.65 : 1), // Pulses faster on hover
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Outer Sonar Ring on Hover */}
              {!reducedMotion && isGlobeHovered && (
                <motion.circle
                  cx={hub.x}
                  cy={hub.y}
                  r="28"
                  fill="none"
                  stroke="rgba(54, 209, 255, 0.3)"
                  strokeWidth="0.8"
                  animate={{ r: [10, 32], opacity: [0.55, 0] }}
                  transition={{
                    duration: 2.0 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
              <circle cx={hub.x} cy={hub.y} r="4.2" fill="#fff" style={{ filter: "drop-shadow(0 0 4px #36d1ff)" }} />

              {/* City name text label */}
              <motion.text
                x={hub.x + 10}
                y={hub.y - 8}
                fill="rgba(232,234,237,0.72)"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-mono), monospace"
              >
                {hub.name}
              </motion.text>
            </g>
          ))}
        </g>
      </motion.svg>
    </div>
  );
};

export default GlobalFinancialNetwork;
