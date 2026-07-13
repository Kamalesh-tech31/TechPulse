// C:\Users\ashwin\Desktop\stockeasy\src\components\auth\AuthShared.tsx
// Shared sub-components, constants, and utilities used by all auth pages.
// These are defined OUTSIDE any component so React never re-creates them
// on re-renders, which is the root cause of the input focus/typing bug.

import React, { useRef } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

// ─── Theme ────────────────────────────────────────────────────────────────────
export const ACCENT    = "#4F6BFF";
export const SURFACE   = "#151B26";
export const BG        = "#0D1117";
export const TEXT      = "#E8EAED";
export const MUTED     = "var(--color-trado-muted)";
export const SUCCESS   = "var(--color-trado-success)";
export const DANGER    = "var(--color-trado-danger)";

// ─── Card shell style — consistent across Login / Register / OTP ──────────────
export const cardStyle = (hover: boolean): React.CSSProperties => ({
  background:   SURFACE,          // fully opaque — z-index occlusion requires this
  borderRadius: "18px",
  border: hover
    ? "1px solid rgba(79,107,255,0.22)"
    : "1px solid rgba(255,255,255,0.06)",
  boxShadow: hover
    ? "0 0 0 1px rgba(79,107,255,0.10), 0 24px 56px rgba(0,0,0,0.65), 0 0 24px rgba(79,107,255,0.12)"
    : "0 20px 50px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
  transition: "border 0.2s ease, box-shadow 0.2s ease",
});

// ─── Error Banner ─────────────────────────────────────────────────────────────
export const ErrorBanner: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <div style={{
      marginBottom: "14px", padding: "10px 12px", borderRadius: "10px",
      background: "rgba(240,87,107,0.08)", border: "1px solid rgba(240,87,107,0.22)",
      display: "flex", alignItems: "center", gap: "8px",
      color: DANGER, fontSize: "12.5px",
    }}>
      <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  ) : null;

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    <span style={{
      fontSize: "9px", fontFamily: "var(--font-mono)",
      color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em",
    }}>or email gateway</span>
    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
  </div>
);

// ─── Text Field ───────────────────────────────────────────────────────────────
// Critical: defined OUTSIDE the parent component so it is never re-mounted
// on parent state changes. Re-mounting = loss of input focus = typing bug.
export const Field: React.FC<{
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}> = ({ id, label, type = "text", placeholder, value, onChange, Icon, autoComplete, rightSlot }) => (
  <div>
    <label
      htmlFor={id}
      style={{
        display: "block", fontSize: "9px", fontFamily: "var(--font-mono)",
        color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px",
      }}
    >{label}</label>
    <div style={{ position: "relative" }}>
      <Icon style={{
        position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
        width: "15px", height: "15px", color: MUTED, pointerEvents: "none", flexShrink: 0,
      }} />
      <input
        id={id}
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        // No onFocus/onBlur inline handlers that could trigger parent re-renders.
        // Focus ring is handled via CSS class on this input alone.
        className="auth-text-input"
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          padding: `12px 14px 12px ${rightSlot ? "38px" : "38px"}`,
          paddingRight: rightSlot ? "44px" : "14px",
          fontSize: "13.5px",
          color: TEXT,
          caretColor: ACCENT,
          outline: "none",
          minHeight: "44px",
          transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        }}
      />
      {rightSlot && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
// One-shot click pulse via `.auth-btn-clicked` CSS class.
export const PrimaryBtn: React.FC<{
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}> = ({ children, disabled, type = "submit", onClick }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (btnRef.current) {
      btnRef.current.classList.remove("auth-btn-clicked");
      void btnRef.current.offsetWidth; // force reflow
      btnRef.current.classList.add("auth-btn-clicked");
    }
    onClick?.();
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={type === "button" ? handleClick : undefined}
      className="auth-primary-btn"
      style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "7px",
        padding: "13px 18px", borderRadius: "12px",
        fontSize: "13.5px", fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#fff", border: "none",
        background: `linear-gradient(135deg, ${ACCENT} 0%, #6f8dff 100%)`,
        boxShadow: "0 4px 20px rgba(79,107,255,0.22)",
        transition: "box-shadow 0.18s ease, filter 0.18s ease",
        opacity: disabled ? 0.55 : 1,
        minHeight: "44px",
      }}
    >
      {disabled
        ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        : children
      }
    </button>
  );
};

// ─── Google Sign-In Button ────────────────────────────────────────────────────
export const GoogleBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="auth-google-btn"
    style={{
      width: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", gap: "10px",
      padding: "11px 16px", borderRadius: "12px", cursor: "pointer",
      fontSize: "13.5px", fontWeight: 500, color: TEXT,
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      transition: "background 0.18s ease, border-color 0.18s ease",
      minHeight: "44px",
    }}
  >
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6-4.52z" fill="#EA4335"/>
    </svg>
    Continue with Google
  </button>
);

// ─── OTP Digit Input ──────────────────────────────────────────────────────────
export const OtpDigit: React.FC<{
  idx: number;
  value: string;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (val: string, i: number) => void;
  onKeyDown: (e: React.KeyboardEvent, i: number) => void;
  onPaste: (e: React.ClipboardEvent, i: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ idx, value, inputRef, onChange, onKeyDown, onPaste, onFocus, onBlur }) => (
  <input
    ref={inputRef}
    type="text"
    maxLength={1}
    inputMode="numeric"
    value={value}
    onChange={e => onChange(e.target.value, idx)}
    onKeyDown={e => onKeyDown(e, idx)}
    onPaste={e => onPaste(e, idx)}
    onFocus={onFocus}
    onBlur={onBlur}
    className="auth-otp-digit"
    style={{
      width: "44px", height: "52px",
      textAlign: "center", fontSize: "18px",
      fontFamily: "var(--font-mono)", fontWeight: 700,
      color: TEXT,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      outline: "none",
      caretColor: ACCENT,
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    }}
  />
);
