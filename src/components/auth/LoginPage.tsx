// C:\Users\ashwin\Desktop\stockeasy\src\components\auth\LoginPage.tsx
// Completely independent Login page — nothing from Register exists here.
// Sub-components (Field, PrimaryBtn, etc.) are imported from AuthShared
// so they are STABLE REFERENCES and React never re-mounts them on state changes.
// This is the fix for the input focus / typing bug.

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TrendingUp, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useApp } from "../../AppContext";
import { AuthBackground } from "../AuthBackground";
import { Field, PrimaryBtn, GoogleBtn, Divider, ErrorBanner, SURFACE, TEXT, MUTED, ACCENT, cardStyle } from "./AuthShared";
import { AuthWidgetScene, ALL_WIDGETS, AuthWidget } from "./AuthWidgets";

// All IDs that could possibly appear in ALL_WIDGETS
const ALL_LOGIN_IDS = [...new Set(ALL_WIDGETS.map(w => w.id))];
const initLoginVals = (): Record<string, string> => {
  const m: Record<string, string> = {};
  ALL_WIDGETS.forEach(w => { m[w.id] = w.value; });
  return m;
};

export const LoginPage: React.FC = () => {
  const { loginUser, loginWithGoogleUser, isLoading, setActiveView } = useApp();
  const reduced = useReducedMotion();

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [cardHov,  setCardHov]  = useState(false);
  const [spotXY,   setSpotXY]   = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // ─── Viewport for widget filtering ─────────────────────────────────────────
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1400);
  useEffect(() => {
    const h = () => setVw(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ─── Live widget values ─────────────────────────────────────────────────────
  const [wVals, setWVals] = useState<Record<string, string>>(initLoginVals);
  useEffect(() => {
    const live = ALL_WIDGETS.filter(w => w.live && w.minW <= vw);
    if (!live.length) return;
    const iv = setInterval(() => {
      const pick = live[Math.floor(Math.random() * live.length)];
      setWVals(prev => {
        const cur = prev[pick.id] ?? pick.value;
        const m = cur.match(/^([+-]?)(\d+\.\d+)(%?)$/);
        if (!m) return prev;
        const next = Math.max(0.01, parseFloat(m[2]) + (Math.random() - 0.5) * 0.08).toFixed(2);
        return { ...prev, [pick.id]: `${m[1]}${next}${m[3]}` };
      });
    }, 9000);
    return () => clearInterval(iv);
  }, [vw]);

  // ─── Cursor light ──────────────────────────────────────────────────────────
  const lightRef  = useRef<HTMLDivElement>(null);
  const lMouse    = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lRaf      = useRef<number>(0);
  useEffect(() => {
    const mv = (e: MouseEvent) => { lMouse.current.tx = e.clientX; lMouse.current.ty = e.clientY; };
    window.addEventListener("mousemove", mv);
    const tick = () => {
      lRaf.current = requestAnimationFrame(tick);
      const m = lMouse.current;
      m.x += (m.tx - m.x) * 0.07; m.y += (m.ty - m.y) * 0.07;
      if (lightRef.current) lightRef.current.style.transform = `translate(${m.x - 200}px,${m.y - 200}px)`;
    };
    lRaf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", mv); cancelAnimationFrame(lRaf.current); };
  }, []);

  // ─── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const res = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      const [W, H] = [500, 650];
      const popup = window.open(url, "google_oauth_popup",
        `width=${W},height=${H},top=${(screen.height - H) / 2},left=${(screen.width - W) / 2}`);
      if (!popup) setError("Popup blocked — please allow popups for this site.");
    } catch { setError("Unable to start Google Sign-In. Please try again."); }
  };
  useEffect(() => {
    const handler = async (ev: MessageEvent) => {
      const o = ev.origin;
      if (!o.endsWith(".run.app") && !o.includes("localhost") && !o.includes("127.0.0.1")) return;
      if (ev.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { name, email: em, picture } = ev.data.user;
        try {
          const res = await fetch("/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email: em, picture: picture || "" })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem("trado_token", data.data.token);
            loginWithGoogleUser(data.data.user.name, data.data.user.email, data.data.user.googlePicture);
          } else {
            // Fallback: load from OAuth payload directly
            loginWithGoogleUser(name, em, picture);
          }
        } catch {
          // Fallback if backend unavailable
          loginWithGoogleUser(name, em, picture);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loginWithGoogleUser]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Login failed. Please check your credentials."); return; }
      // Store JWT token
      localStorage.setItem("trado_token", data.data.token);
      // Load user into React state
      loginWithGoogleUser(data.data.user.name, data.data.user.email, data.data.user.googlePicture);
    } catch {
      setError("Network error. Please check your connection.");
    }
  };

  // ─── Card spotlight ─────────────────────────────────────────────────────────
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpotXY({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const eyeBtn = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPw(p => !p)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
        color: MUTED, display: "flex", alignItems: "center" }}
    >
      {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", position: "relative", overflow: "hidden", background: "#0D1117",
    }}>
      <AuthBackground />

      {/* Cursor light */}
      <div ref={lightRef} aria-hidden="true" style={{
        position: "fixed", top: 0, left: 0, zIndex: 1, pointerEvents: "none",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(79,107,255,0.08) 0%, transparent 65%)",
        filter: "blur(55px)", willChange: "transform",
      }} />

      {/* Floating widgets — z:1, pointer-events:none */}
      <AuthWidgetScene values={wVals} vw={vw} />

      {/* Card glow — breathing */}
      <motion.div aria-hidden="true"
        animate={reduced ? undefined : {
          scale:   cardHov ? [1, 1.12, 1]     : [0.95, 1.08, 0.95],
          opacity: cardHov ? [0.28, 0.40, 0.28] : [0.18, 0.28, 0.18],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", zIndex: 2, pointerEvents: "none",
          width: 540, height: 540, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,107,255,0.55) 0%, rgba(54,209,255,0.05) 55%, transparent 72%)",
          filter: "blur(110px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        }}
      />

      {/* ── Form card — z:10, fully opaque ──────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setCardHov(true)}
        onMouseLeave={() => setCardHov(false)}
        onMouseMove={handleCardMove}
        animate={reduced ? undefined : { y: cardHov ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px" }}
      >
        {/* Logo */}
        <button onClick={() => setActiveView("landing")} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "10px", marginBottom: "24px", width: "100%",
          background: "none", border: "none", cursor: "pointer",
          opacity: 1, transition: "opacity 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${ACCENT}, #6f8dff)`,
            boxShadow: "0 0 18px rgba(79,107,255,0.38)",
          }}>
            <TrendingUp style={{ width: "18px", height: "18px", color: "#fff", strokeWidth: 2.5 }} />
          </div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "22px",
            letterSpacing: "-0.02em", color: TEXT,
          }}>Trado</span>
        </button>

        <div style={{ position: "relative", ...cardStyle(cardHov) }}>
          {/* Cursor spotlight */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, borderRadius: "18px", pointerEvents: "none", zIndex: 0,
            background: cardHov
              ? `radial-gradient(circle 200px at ${spotXY.x}px ${spotXY.y}px, rgba(79,107,255,0.07), transparent 70%)`
              : "transparent",
            transition: "background 0.25s ease",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: "clamp(24px,5vw,32px)" }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "21px",
              color: TEXT, textAlign: "center", marginBottom: "6px", marginTop: 0,
            }}>Welcome Back</h1>
            <p style={{ fontSize: "13px", color: MUTED, textAlign: "center", marginBottom: "22px", marginTop: 0 }}>
              Sign in to your virtual trading account.
            </p>

            <ErrorBanner message={error} />
            <GoogleBtn onClick={handleGoogle} />
            <Divider />

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field id="login-email" label="Email Address" type="email" placeholder="you@example.com"
                value={email} onChange={setEmail} Icon={Mail} autoComplete="email" />
              <Field id="login-password" label="Password" type={showPw ? "text" : "password"}
                placeholder="Enter your password" value={password} onChange={setPassword}
                Icon={Lock} autoComplete="current-password" rightSlot={eyeBtn} />

              {/* Remember Me + Forgot Password */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{ accentColor: ACCENT, width: "14px", height: "14px" }}
                  />
                  <span style={{ fontSize: "12px", color: MUTED }}>Remember me</span>
                </label>
                <button type="button" style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontSize: "12px", color: "#7B9EFF", fontWeight: 500,
                }}>Forgot password?</button>
              </div>

              <PrimaryBtn disabled={isLoading} type="submit">
                <span>Sign In</span>
                <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </PrimaryBtn>
            </form>

            <p style={{ textAlign: "center", fontSize: "12px", color: MUTED, marginTop: "20px", marginBottom: 0 }}>
              Don't have an account?{" "}
              <button onClick={() => setActiveView("register")} style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                color: "#7B9EFF", fontWeight: 500, fontSize: "12px",
              }}>Create account →</button>
            </p>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", marginTop: "24px",
          fontSize: "10px", fontFamily: "var(--font-mono)",
          color: MUTED, letterSpacing: "0.06em", opacity: 0.7,
        }}>
          <Shield style={{ width: 12, height: 12, color: "rgba(79,107,255,0.45)" }} />
          Educational Simulator — No Real Money
        </div>
      </motion.div>
    </div>
  );
};
