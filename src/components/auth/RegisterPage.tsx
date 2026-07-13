// C:\Users\ashwin\Desktop\stockeasy\src\components\auth\RegisterPage.tsx
// Completely independent Register page (includes OTP verification step).
// Nothing from Login exists here.

import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, Mail, User, Lock, Shield, Eye, EyeOff, ArrowRight, CheckCircle, Unlock } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useApp } from "../../AppContext";
import { AuthBackground } from "../AuthBackground";
import { Field, PrimaryBtn, GoogleBtn, Divider, ErrorBanner, OtpDigit, TEXT, MUTED, ACCENT, SURFACE, cardStyle } from "./AuthShared";
import { AuthWidgetScene, ALL_WIDGETS, AuthWidget } from "./AuthWidgets";

const ALL_REG_VALS = (): Record<string, string> => {
  const m: Record<string, string> = {};
  ALL_WIDGETS.forEach(w => { m[w.id] = w.value; });
  return m;
};

export const RegisterPage: React.FC = () => {
  const { registerUser, loginWithGoogleUser, isLoading, setActiveView } = useApp();
  const reduced = useReducedMotion();

  // ─── View state: register or otp ───────────────────────────────────────────
  const [step, setStep] = useState<"register" | "otp">("register");

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [otp,       setOtp]       = useState(["","","","","",""]);
  const [verifying, setVerifying] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");
  const [cardHov,   setCardHov]   = useState(false);
  const [spotXY,    setSpotXY]    = useState({ x: 0, y: 0 });
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Viewport ───────────────────────────────────────────────────────────────
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1400);
  useEffect(() => {
    const h = () => setVw(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ─── Widget values ──────────────────────────────────────────────────────────
  const [wVals, setWVals] = useState<Record<string, string>>(ALL_REG_VALS);
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
  }, [vw, step]);

  // ─── Cursor light ──────────────────────────────────────────────────────────
  const lightRef = useRef<HTMLDivElement>(null);
  const lMouse   = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lRaf     = useRef<number>(0);
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
    } catch { setError("Unable to start Google Sign-Up. Please try again."); }
  };
  useEffect(() => {
    const handler = async (ev: MessageEvent) => {
      const o = ev.origin;
      if (!o.endsWith(".run.app") && !o.includes("localhost") && !o.includes("127.0.0.1")) return;
      if (ev.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { name: n, email: em, picture } = ev.data.user;
        try {
          const res = await fetch("/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: n, email: em, picture: picture || "" })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem("trado_token", data.data.token);
            loginWithGoogleUser(data.data.user.name, data.data.user.email, data.data.user.googlePicture);
          } else {
            loginWithGoogleUser(n, em, picture);
          }
        } catch {
          loginWithGoogleUser(n, em, picture);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loginWithGoogleUser]);

  // ─── Register submit → OTP ─────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim())  { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)     { setError("Please set a password."); return; }
    if (password !== confirmPw) { setError("Passwords don't match."); return; }
    if (password.length < 6)   { setError("Password must be at least 6 characters."); return; }
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Registration failed."); return; }
      setStep("otp");
    } catch {
      setError("Network error. Please check your connection.");
    }
  };

  // ─── OTP handlers ──────────────────────────────────────────────────────────
  const handleOtpChange = (val: string, i: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && otp[i] === "" && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent, i: number) => {
    if (i !== 0) return;
    e.preventDefault();
    const d = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(d)) return;
    setOtp(d.split("")); otpRefs.current[5]?.focus();
  };
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.join("").length < 6) { setError("Please enter the full 6-digit code."); return; }
    setVerifying(true);
    try {
      const res = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.join(""), purpose: "signup" })
      });
      const data = await res.json();
      if (!data.success) {
        setVerifying(false);
        setError(data.message || "Invalid verification code.");
        return;
      }
      // Store JWT token
      localStorage.setItem("trado_token", data.data.token);
      setVerifying(false);
      setSuccess(true);
      setTimeout(() => loginWithGoogleUser(data.data.user.name, data.data.user.email, data.data.user.googlePicture), 1500);
    } catch {
      setVerifying(false);
      setError("Network error. Please try again.");
    }
  };

  // ─── Card spotlight ─────────────────────────────────────────────────────────
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpotXY({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const eyePwBtn = (
    <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: MUTED, display: "flex", alignItems: "center" }}>
      {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
    </button>
  );
  const eyeCPwBtn = (
    <button type="button" tabIndex={-1} onClick={() => setShowCPw(p => !p)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: MUTED, display: "flex", alignItems: "center" }}>
      {showCPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
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

      {/* Widgets */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: step === "otp" ? 0.45 : 1,
        transition: "opacity 0.4s ease-in-out",
        zIndex: 1
      }}>
        <AuthWidgetScene values={wVals} vw={vw} />
      </div>

      {/* Card glow */}
      <motion.div aria-hidden="true"
        animate={reduced ? undefined : {
          scale:   cardHov ? [1, 1.12, 1]       : [0.95, 1.08, 0.95],
          opacity: cardHov ? [0.28, 0.40, 0.28]  : [0.18, 0.28, 0.18],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", zIndex: 2, pointerEvents: "none",
          width: 540, height: 540, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,107,255,0.55) 0%, rgba(54,209,255,0.05) 55%, transparent 72%)",
          filter: "blur(110px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        }}
      />

      {/* Concentric rings + Orbiting scanning particles (zIndex: 8, sits above widgets (z:1) and below form card (z:10)) */}
      <AnimatePresence>
        {step === "otp" && !success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* 3 Concentric Rings */}
            <motion.div
              animate={{ rotate: 360, scale: [0.98, 1.02, 0.98], opacity: [0.25, 0.40, 0.25] }}
              transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
              style={{ position: "absolute", width: "560px", height: "560px", borderRadius: "50%", border: "1px dashed rgba(79,107,255,0.20)" }}
            />
            <motion.div
              animate={{ rotate: -360, scale: [1.02, 0.98, 1.02], opacity: [0.18, 0.30, 0.18] }}
              transition={{ rotate: { duration: 55, repeat: Infinity, ease: "linear" }, scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" } }}
              style={{ position: "absolute", width: "450px", height: "450px", borderRadius: "50%", border: "1px solid rgba(54,209,220,0.14)" }}
            />
            <motion.div
              animate={{ rotate: 180, scale: [0.96, 1.04, 0.96], opacity: [0.12, 0.24, 0.12] }}
              transition={{ rotate: { duration: 28, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", border: "1px dashed rgba(79,107,255,0.10)" }}
            />

            {/* Orbiting particles */}
            {[
              { radius: 250, duration: 18, dir: 1, delay: 0 },
              { radius: 280, duration: 24, dir: -1, delay: 1.5 },
              { radius: 320, duration: 30, dir: 1, delay: 3 },
              { radius: 360, duration: 36, dir: -1, delay: 4.5 }
            ].map((orb, i) => (
              <motion.div
                key={i}
                animate={{ rotate: orb.dir * 360 }}
                transition={{ duration: orb.duration, repeat: Infinity, ease: "linear", delay: orb.delay }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 0,
                  height: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: i % 2 === 0 ? "#4F6BFF" : "#36D1DC",
                    boxShadow: i % 2 === 0 ? "0 0 8px #4F6BFF, 0 0 16px rgba(79,107,255,0.8)" : "0 0 8px #36D1DC, 0 0 16px rgba(54,209,220,0.8)",
                    transform: `translate(-50%, -50%) translate(${orb.radius}px, 0)`,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form card ────────────────────────────────────────────────────────── */}
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

        <AnimatePresence mode="wait">

          {/* ── REGISTER FORM ───────────────────────────────────────────────── */}
          {step === "register" && (
            <motion.div key="register"
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.24, ease: "easeOut" }}
              style={{ position: "relative", ...cardStyle(cardHov) }}
            >
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
                }}>Create Account</h1>
                <p style={{ fontSize: "13px", color: MUTED, textAlign: "center", marginBottom: "22px", marginTop: 0 }}>
                  Get ₹10,00,000 virtual capital instantly.
                </p>

                <ErrorBanner message={error} />
                <GoogleBtn onClick={handleGoogle} />
                <Divider />

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <Field id="reg-name" label="Full Name" placeholder="Jane Doe"
                    value={name} onChange={setName} Icon={User} autoComplete="name" />
                  <Field id="reg-email" label="Email Address" type="email" placeholder="you@example.com"
                    value={email} onChange={setEmail} Icon={Mail} autoComplete="email" />
                  <Field id="reg-password" label="Password" type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters" value={password} onChange={setPassword}
                    Icon={Lock} autoComplete="new-password" rightSlot={eyePwBtn} />
                  <Field id="reg-confirm" label="Confirm Password" type={showCPw ? "text" : "password"}
                    placeholder="Repeat password" value={confirmPw} onChange={setConfirmPw}
                    Icon={Lock} autoComplete="new-password" rightSlot={eyeCPwBtn} />

                  <PrimaryBtn disabled={isLoading} type="submit">
                    <span>Create Virtual Account</span>
                    <ArrowRight style={{ width: 15, height: 15 }} />
                  </PrimaryBtn>
                </form>

                <p style={{ textAlign: "center", fontSize: "12px", color: MUTED, marginTop: "20px", marginBottom: 0 }}>
                  Already have an account?{" "}
                  <button onClick={() => setActiveView("signin")} style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: "#7B9EFF", fontWeight: 500, fontSize: "12px",
                  }}>Sign in →</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── OTP VERIFICATION ────────────────────────────────────────────── */}
          {step === "otp" && (
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
              
              {/* Circular Security Ring (620px) with circumference particle */}
              <div style={{ position: "absolute", width: "620px", height: "620px", pointerEvents: "none", zIndex: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 620 620">
                  <circle cx="310" cy="310" r="290" fill="none" stroke="rgba(79,107,255,0.06)" strokeWidth="1.5" />
                  <motion.circle
                    cx="310"
                    cy="310"
                    r="290"
                    fill="none"
                    stroke="url(#packet-glow)"
                    strokeWidth="3.5"
                    strokeDasharray="50 1822"
                    animate={{
                      strokeDashoffset: [0, -1872]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <defs>
                    <radialGradient id="packet-glow">
                      <stop offset="0%" stopColor="#36D1DC" stopOpacity="1" />
                      <stop offset="50%" stopColor="#4F6BFF" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Verification Energy (3 concentric rings radar ripples) */}
              <div style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.7, opacity: 0.05 }}
                    animate={{
                      scale: [0.7, 1.45],
                      opacity: [0.05, 0]
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeOut"
                    }}
                    style={{
                      position: "absolute",
                      width: "480px",
                      height: "480px",
                      borderRadius: "50%",
                      border: "1.5px solid #4F6BFF",
                    }}
                  />
                ))}
              </div>

              {/* Orbiting Verification Particles (Satellites) */}
              <div style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", zIndex: 7 }}>
                {[
                  { radius: 250, duration: 16, dir: 1, delay: 0, color: "#4F6BFF" },
                  { radius: 290, duration: 22, dir: -1, delay: 2, color: "#36D1DC" },
                  { radius: 330, duration: 28, dir: 1, delay: 4, color: "#4F6BFF" }
                ].map((orb, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: orb.dir * 360 }}
                    transition={{
                      duration: orb.duration * (success ? 0.15 : 1.0), // accelerate briefly on success
                      repeat: Infinity,
                      ease: "linear",
                      delay: orb.delay
                    }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 0,
                      height: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: orb.color,
                        boxShadow: `0 0 12px ${orb.color}, 0 0 24px ${orb.color}`,
                        transform: `translate(-50%, -50%) translate(${orb.radius}px, 0)`,
                        filter: "blur(0.2px)",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Main Card */}
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={reduced ? { opacity: 1, scale: 1 } : {
                  opacity: 1,
                  scale: success ? [1, 1.03, 1] : 1,
                  y: cardHov ? -5 : 0,
                  rotateX: cardHov ? 0.5 : 0,
                  rotateY: cardHov ? -0.5 : 0,
                  boxShadow: success
                    ? "0 0 64px rgba(79, 107, 255, 0.48), 0 24px 64px rgba(0, 0, 0, 0.75)"
                    : cardHov
                    ? "0 0 32px rgba(79, 107, 255, 0.24), 0 24px 64px rgba(0, 0, 0, 0.7)"
                    : "0 0 24px rgba(79, 107, 255, 0.12), 0 20px 50px rgba(0, 0, 0, 0.5)",
                }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                onMouseEnter={() => setCardHov(true)}
                onMouseLeave={() => setCardHov(false)}
                onMouseMove={handleCardMove}
                style={{
                  position: "relative",
                  zIndex: 10,
                  width: "100%",
                  maxWidth: "420px",
                  background: "rgba(15, 18, 30, 0.78)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: cardHov ? "1.5px solid rgba(90, 130, 255, 0.35)" : "1.5px solid rgba(90, 130, 255, 0.15)",
                  borderRadius: "18px",
                  overflow: "hidden",
                }}
              >
                {/* Holographic Scan Line */}
                {!success && (
                  <motion.div
                    animate={{
                      top: ["-5%", "105%"],
                      opacity: [0, 0.45, 0.45, 0]
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 6.2,
                      ease: "easeInOut"
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: "linear-gradient(90deg, transparent, rgba(54,209,220,0.5) 20%, rgba(79,107,255,0.7) 50%, rgba(54,209,220,0.5) 80%, transparent)",
                      boxShadow: "0 0 10px rgba(79,107,255,0.6), 0 0 20px rgba(54,209,220,0.3)",
                      zIndex: 5,
                      pointerEvents: "none",
                      willChange: "top, opacity",
                    }}
                  />
                )}

                <div style={{ position: "relative", zIndex: 1, padding: "clamp(24px,5vw,32px)" }}>
                  <AnimatePresence mode="wait">
                    {!success ? (
                      <motion.div key="otp-form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {/* Lock Icon floating and pulse animation */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
                          <motion.div
                            animate={reduced ? undefined : {
                              y: [0, -3, 0],
                              boxShadow: [
                                "0 0 14px rgba(79,107,255,0.16), inset 0 0 0px rgba(79,107,255,0)",
                                "0 0 24px rgba(79,107,255,0.36), inset 0 0 8px rgba(79,107,255,0.15)",
                                "0 0 14px rgba(79,107,255,0.16), inset 0 0 0px rgba(79,107,255,0)"
                              ]
                            }}
                            transition={{
                              duration: 3.0,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            style={{
                              width: "54px", height: "54px", borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: "rgba(79,107,255,0.10)",
                              border: "1.5px solid rgba(79,107,255,0.24)",
                            }}
                          >
                            <motion.div
                              animate={reduced ? undefined : {
                                scale: [1, 1.08, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{
                                duration: 3.0,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Lock style={{ width: 22, height: 22, color: "#7B9EFF" }} />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Redesigned Typography */}
                        <h1 style={{
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "36px",
                          color: "#fff", textAlign: "center", marginBottom: "8px", marginTop: 0,
                          letterSpacing: "-0.03em"
                        }}>Security Verification</h1>
                        
                        <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.6)", textAlign: "center", marginBottom: "28px", marginTop: 0 }}>
                          Enter the 6-digit code sent to <strong style={{ color: "#7B9EFF" }}>{email}</strong>
                        </p>

                        <ErrorBanner message={error} />

                        <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                          {/* OTP inputs with glass design */}
                          <div style={{ position: "relative", display: "flex", justifyContent: "center", gap: "10px" }}>
                            {otp.map((d, i) => (
                              <LocalOtpDigit
                                key={i}
                                idx={i}
                                value={d}
                                inputRef={el => { otpRefs.current[i] = el; }}
                                onChange={handleOtpChange}
                                onKeyDown={handleOtpKey}
                                onPaste={handleOtpPaste}
                                onFocus={() => setFocusedIdx(i)}
                                onBlur={() => setFocusedIdx(null)}
                                isFocused={focusedIdx === i}
                                success={success}
                              />
                            ))}
                          </div>

                          {/* Sandbox Badge */}
                          <div style={{ textAlign: "center" }}>
                            <span style={{
                              fontSize: "10px", fontFamily: "var(--font-mono)", color: MUTED,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              padding: "5px 12px", borderRadius: "8px",
                              letterSpacing: "0.04em",
                            }}>
                              Sandbox token: <strong style={{ color: "#7B9EFF" }}>482619</strong>
                            </span>
                          </div>

                          <VerifyBtn disabled={verifying} />
                        </form>

                        <p style={{ textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
                          <button
                            type="button"
                            onClick={() => { setError(""); setStep("register"); }}
                            style={{
                              background: "none", border: "none", cursor: "pointer", padding: 0,
                              fontSize: "12px", color: MUTED, transition: "color 0.18s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                          >← Back to registration</button>
                        </p>
                      </motion.div>
                    ) : (
                      // Success View: Lock icon unlocks & initializes terminal
                      <motion.div key="success"
                        initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", textAlign: "center" }}
                      >
                        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.65, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                            style={{ position: "absolute", width: "88px", height: "88px", borderRadius: "50%", background: "rgba(62,207,142,0.15)" }}
                          />
                          <div style={{
                            width: "60px", height: "60px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2.5px solid var(--color-trado-success)",
                            background: "rgba(62,207,142,0.08)",
                            boxShadow: "0 0 26px rgba(62, 207, 142, 0.32)",
                          }}>
                            <motion.div
                              initial={{ rotate: -45, scale: 0.8 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <Unlock style={{ width: 26, height: 26, color: "var(--color-trado-success)" }} />
                            </motion.div>
                          </div>
                        </div>
                        
                        <h3 style={{
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px",
                          color: TEXT, marginBottom: "8px", marginTop: 0,
                        }}>Verification Successful</h3>
                        
                        <motion.p
                          animate={{ opacity: [1, 0.45, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                          style={{
                            fontSize: "9.5px", fontFamily: "var(--font-mono)",
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            color: "var(--color-trado-success)", margin: 0,
                          }}
                        >Initializing trading terminal…</motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

            </div>
          )}

        </AnimatePresence>

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

// ─── Local Redesigned OTP Digit Box ──────────────────────────────────────────
const LocalOtpDigit: React.FC<{
  idx: number;
  value: string;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (val: string, i: number) => void;
  onKeyDown: (e: React.KeyboardEvent, i: number) => void;
  onPaste: (e: React.ClipboardEvent, i: number) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  success: boolean;
}> = ({ idx, value, inputRef, onChange, onKeyDown, onPaste, onFocus, onBlur, isFocused, success }) => {
  const hasValue = value.length > 0;
  const reduced = useReducedMotion();
  
  return (
    <motion.div
      animate={reduced ? {} : {
        scale: isFocused ? 1.04 : 1,
        y: isFocused ? -2 : 0,
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: "relative",
        width: "48px",
        height: "56px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: success
          ? "1.5px solid #3ECF8E"
          : isFocused
          ? "1.5px solid #4F6BFF"
          : hasValue
          ? "1.5px solid rgba(79, 107, 255, 0.45)"
          : "1.5px solid rgba(255, 255, 255, 0.08)",
        boxShadow: success
          ? "0 0 14px rgba(62, 207, 142, 0.3)"
          : isFocused
          ? "0 0 14px rgba(79, 107, 255, 0.3)"
          : hasValue
          ? "0 0 8px rgba(79, 107, 255, 0.15)"
          : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
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
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          textAlign: "center",
          fontSize: "20px",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color: "#fff",
          background: "none",
          border: "none",
          outline: "none",
          caretColor: "transparent",
        }}
      />

      {/* Light sweep travels through each box sequentially on success */}
      {success && (
        <motion.div
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "60%",
            background: "linear-gradient(90deg, transparent, rgba(91, 124, 255, 0.45), transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      {/* Glowing focus beam inside active field (breathing pulse scanner) */}
      {isFocused && !hasValue && (
        <motion.div
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scaleY: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.0,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: "2px",
            height: "22px",
            background: "#4F6BFF",
            boxShadow: "0 0 8px #4F6BFF, 0 0 14px rgba(79, 107, 255, 0.8)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
    </motion.div>
  );
};

// ─── Local Redesigned Verify Button ──────────────────────────────────────────
const VerifyBtn: React.FC<{
  disabled?: boolean;
  onClick?: () => void;
}> = ({ disabled, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileTap={{ scale: 0.98 }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "13px 18px",
        borderRadius: "12px",
        fontSize: "13.5px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#fff",
        border: "none",
        background: "linear-gradient(135deg, #5B7CFF 0%, #7AA2FF 100%)",
        boxShadow: hov
          ? "0 6px 28px rgba(91, 124, 255, 0.45)"
          : "0 4px 20px rgba(91, 124, 255, 0.25)",
        transform: hov ? "translateY(-1px)" : "none",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        minHeight: "44px",
        position: "relative",
      }}
    >
      <span>Verify &amp; Enter Platform</span>
      <motion.div
        animate={{
          x: hov ? 6 : 0
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <ArrowRight style={{ width: 15, height: 15 }} />
      </motion.div>
    </motion.button>
  );
};
