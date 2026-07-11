import React from "react";
import { motion } from "motion/react";

type PremiumBackgroundProps = {
  parallax?: { x: number; y: number };
};

const nodes = [
  { top: "16%", left: "12%", size: 3, delay: 0 },
  { top: "28%", left: "24%", size: 2.5, delay: 1.2 },
  { top: "62%", left: "18%", size: 3.2, delay: 0.7 },
  { top: "74%", left: "82%", size: 2.4, delay: 1.5 },
  { top: "46%", left: "88%", size: 2.8, delay: 0.4 },
  { top: "20%", left: "86%", size: 2.2, delay: 0.9 },
];

const packets = [
  {
    path: "M12 20 C34 28, 48 36, 66 52 S92 76, 100 82",
    duration: 16,
    delay: 0,
  },
  {
    path: "M14 78 C28 70, 46 66, 62 58 S84 44, 100 30",
    duration: 19,
    delay: 2.2,
  },
];

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  parallax = { x: 0, y: 0 },
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ x: parallax.x * 10, y: parallax.y * 10 }}
        transition={{ type: "spring", stiffness: 80, damping: 22, mass: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,107,255,0.16),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(62,207,142,0.08),transparent_30%),linear-gradient(135deg,rgba(13,17,23,0.98),rgba(9,12,18,0.98))]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.75), transparent 92%)",
          }}
        />
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full opacity-[0.14]"
          aria-hidden="true"
        >
          <path
            d="M2 28 C18 20, 34 22, 44 34 S72 48, 90 20"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.18"
            fill="none"
          />
          <path
            d="M8 72 C26 60, 44 60, 60 72 S86 88, 98 78"
            stroke="rgba(79,107,255,0.3)"
            strokeWidth="0.2"
            fill="none"
          />
          <path
            d="M24 8 L44 28 L64 22 L86 48"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.16"
            fill="none"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-[18%] top-[20%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(79,107,255,0.09),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[12%] right-[12%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(62,207,142,0.07),transparent_75%)] blur-3xl" />
      </motion.div>

      {nodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/60"
          style={{
            top: node.top,
            left: node.left,
            width: node.size,
            height: node.size,
            boxShadow: "0 0 18px rgba(79,107,255,0.18)",
          }}
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.16, 1] }}
          transition={{
            duration: 4.2 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: node.delay,
          }}
        />
      ))}

      {packets.map((packet, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{
            duration: packet.duration,
            repeat: Infinity,
            ease: "linear",
            delay: packet.delay,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d={packet.path}
              stroke="rgba(79,107,255,0.55)"
              strokeWidth="0.18"
              fill="none"
              strokeDasharray="1.2 1.6"
            />
          </svg>
        </motion.div>
      ))}

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.18, 0.34, 0.18] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-[50%] top-[12%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full border border-white/10" />
        <div className="absolute left-[50%] top-[12%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-white/[0.04]" />
      </motion.div>
    </div>
  );
};
