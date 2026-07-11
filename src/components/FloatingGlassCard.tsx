import React from "react";
import { motion } from "motion/react";

type FloatingGlassCardProps = {
  title: string;
  value: string;
  meta?: string;
  accent?: string;
  icon?: React.ReactNode;
  tone?: "positive" | "negative" | "neutral";
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  width?: string;
  children?: React.ReactNode;
  delay?: number;
};

export const FloatingGlassCard: React.FC<FloatingGlassCardProps> = ({
  title,
  value,
  meta,
  accent = "#4f6bff",
  icon,
  tone = "neutral",
  top,
  left,
  bottom,
  right,
  width = "190px",
  children,
  delay = 0,
}) => {
  const toneColor =
    tone === "positive" ? "#3ecf8e" : tone === "negative" ? "#f0576b" : accent;

  return (
    <motion.div
      animate={{ y: [-7, 7, -7] }}
      transition={{
        duration: 6.5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={{
        scale: 1.01,
        y: -2,
        boxShadow: "0 16px 32px rgba(0,0,0,0.28)",
      }}
      style={{
        position: "absolute",
        top,
        left,
        bottom,
        right,
        width,
        background: "rgba(9, 12, 18, 0.44)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow:
          "0 12px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}
        >
          {icon ? (
            <div
              style={{ color: accent, display: "flex", alignItems: "center" }}
            >
              {icon}
            </div>
          ) : null}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
        </div>
        {meta ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: toneColor,
              fontFamily: "var(--font-mono)",
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </span>
        ) : null}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color: "#fff",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {children ? <div style={{ marginTop: 8 }}>{children}</div> : null}
    </motion.div>
  );
};
