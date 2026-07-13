/**
 * AuthPages — Login, Register, and OTP Verification.
 * All three views share:
 *   - the AuthBackground (fixed, full-bleed)
 *   - floating stat widgets (decorative, z-index below the form)
 *   - breathing card glow
 *   - cursor-following soft light
 *   - consistent card hover/focus/button treatment
 *
 * Color tokens used from var(--color-trado-*) / inline via CSS vars for
 * consistency with the rest of the app theme.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../AppContext";
import { TrendingUp, Mail, User, Shield, AlertCircle, ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AuthBackground } from "./AuthBackground";

interface AuthProps { type: "signin" | "register"; }

// ─── Floating widget definition ───────────────────────────────────────────────
interface Widget {
  id:      string;
  label:   string;
  value:   string;
  live?:   boolean;
  tone:    "up" | "down" | "neutral" | "accent";
  // Anchor: absolute % position on the page
  top:     string;
  left?:   string;
  right?:  string;
  // CSS animation name matches @keyframes auth-float-{id} in index.css
  dur:     number;   // 20-40s
  delay:   number;
  // Responsive: min viewport width to show
  minW:    number;   // 0=always, 640=tablet+, 1024=laptop+, 1280=desktop+
  opacity: number;   // base opacity 0.72-0.85
}

// ─── Login page — market index cards ────────────────────────────────────────
const LOGIN_WIDGETS: Widget[] = [
  { id:"nifty",     label:"NIFTY 50",         value:"+1.24%",  live:true, tone:"up",
    top:"14%", left:"4%",  dur:48, delay:0,  minW:0,    opacity:0.78 },
  { id:"sensex",    label:"SENSEX",            value:"+0.92%",  live:true, tone:"up",
    top:"68%", left:"4%",  dur:52, delay:6,  minW:0,    opacity:0.76 },
  { id:"btc",       label:"BTC / USD",          value:"+1.52%",  live:true, tone:"up",
    top:"18%", right:"4%", dur:46, delay:3,  minW:0,    opacity:0.76 },
  { id:"gold",      label:"Gold",               value:"-0.15%",              tone:"down",
    top:"70%", right:"4%", dur:55, delay:9,  minW:0,    opacity:0.74 },
  { id:"sentiment", label:"Market Sentiment",   value:"Bullish",             tone:"neutral",
    top:"40%", left:"3%",  dur:50, delay:14, minW:640,  opacity:0.72 },
];

// ─── Register page — value-prop / onboarding cards ─────────────────────
const REGISTER_WIDGETS: Widget[] = [
  { id:"capital",   label:"Virtual Capital",    value:"₹10,00,000",           tone:"neutral",
    top:"14%", left:"4%",  dur:54, delay:0,  minW:0,    opacity:0.78 },
  { id:"ai",        label:"AI Confidence",       value:"94%",     live:true, tone:"accent",
    top:"68%", left:"4%",  dur:44, delay:5,  minW:0,    opacity:0.80 },
  { id:"portfolio", label:"Portfolio Growth",    value:"+18.4%",               tone:"up",
    top:"20%", right:"4%", dur:50, delay:2,  minW:0,    opacity:0.78 },
  { id:"aapl",      label:"AAPL",               value:"+0.84%",  live:true, tone:"up",
    top:"70%", right:"4%", dur:46, delay:10, minW:0,    opacity:0.74 },
  { id:"tsla",      label:"TSLA",               value:"-1.12%",               tone:"down",
    top:"42%", right:"3%", dur:42, delay:16, minW:640,  opacity:0.72 },
];

// ─── OTP page — calm focused set (3 cards max) ─────────────────────────
const OTP_WIDGETS: Widget[] = [
  { id:"ai",        label:"AI Confidence",       value:"94%",     live:true, tone:"accent",
    top:"20%", left:"5%",  dur:50, delay:0,  minW:0,    opacity:0.76 },
  { id:"sentiment", label:"Market Sentiment",    value:"Bullish",             tone:"neutral",
    top:"68%", right:"5%", dur:55, delay:7,  minW:0,    opacity:0.74 },
  { id:"nifty",     label:"NIFTY 50",            value:"+1.24%",  live:true, tone:"up",
    top:"42%", right:"4%", dur:48, delay:14, minW:640,  opacity:0.72 },
];

// Merge of all widget IDs for initial value seeding
const ALL_WIDGETS = [...LOGIN_WIDGETS, ...REGISTER_WIDGETS, ...OTP_WIDGETS];

const TONE_COLOR: Record<Widget["tone"], string> = {
  up:      "var(--color-trado-success)",
  down:    "var(--color-trado-danger)",
  accent:  "#7B9EFF",
  neutral: "var(--color-trado-text)",
};

// ─── Single floating widget (decorative only — CSS animation, z-index: 1) ──────
const FloatingWidget: React.FC<{ w: Widget; value: string }> = ({ w, value }) => {
  const reduced = useReducedMotion();

  const posStyle: React.CSSProperties = {
    // z-index 1 — sits above background (z:0) but below form card (z:10)
    position:      "absolute",
    top:           w.top,
    left:          w.left  ?? undefined,
    right:         w.right ?? undefined,
    opacity:       w.opacity,
    zIndex:        1,
    pointerEvents: "none",
    // Full-viewport drift via CSS keyframe — name matches @keyframes auth-float-{id}
    animation: reduced
      ? "none"
      : `auth-float-${w.id} ${w.dur}s ease-in-out ${w.delay}s infinite`,
  };

  return (
    <div style={posStyle}>
      <div
        className="rounded-xl px-3.5 py-2.5"
        style={{
          // Solid background — fully opaque so it occludes correctly when stacked
          background: "#151B26",
          border:     "1px solid rgba(79,107,255,0.14)",
          boxShadow:  "0 8px 24px rgba(0,0,0,0.28)",
          minWidth:   "140px",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
          <span style={{
            fontSize:"8.5px", fontFamily:"var(--font-mono)",
            color:"var(--color-trado-muted)", textTransform:"uppercase",
            letterSpacing:"0.08em", lineHeight:1,
          }}>
            {w.label}
          </span>
          {w.live && (
            <span style={{ display:"flex", alignItems:"center", gap:"3px" }}>
              <motion.span
                animate={{ opacity:[1,0.25,1] }}
                transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
                style={{ display:"inline-block", width:"5px", height:"5px",
                  borderRadius:"50%", background:"var(--color-trado-success)" }}
              />
              <span style={{
                fontSize:"7px", fontFamily:"var(--font-mono)", fontWeight:700,
                color:"var(--color-trado-success)", lineHeight:1,
              }}>LIVE</span>
            </span>
          )}
        </div>
        <span style={{
          fontSize:"13px", fontWeight:700,
          fontFamily:"var(--font-display)",
          color: TONE_COLOR[w.tone],
          lineHeight:1,
        }}>
          {value}
        </span>
      </div>
    </div>
  );
};

// ─── Main Auth component ──────────────────────────────────────────────────────
export const AuthPages: React.FC<AuthProps> = ({ type }) => {
  const { registerUser, loginUser, loginWithGoogleUser, isLoading, setActiveView } = useApp();
  const reduced = useReducedMotion();

  const [viewState, setViewState] = useState<"signin" | "register" | "otp">(type);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [otp,       setOtp]       = useState(["","","","","",""]);
  const [verifying, setVerifying] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [cardHover, setCardHover] = useState(false);

  // Cursor spotlight inside card
  const [spotXY, setSpotXY] = useState({ x: 0, y: 0 });
  const cardRef  = useRef<HTMLDivElement>(null);
  const otpRefs  = useRef<(HTMLInputElement|null)[]>([]);

  // Cursor-following soft light
  const lightRef    = useRef<HTMLDivElement>(null);
  const lightMouse  = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lightRafRef = useRef<number>(0);

  // Responsive: which widgets to show
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1400);

  // Live widget values — seeded from all three page sets so no ID is missing
  const initValues = useCallback(() => {
    const v: Record<string, string> = {};
    ALL_WIDGETS.forEach(w => { v[w.id] = w.value; });
    return v;
  }, []);
  const [wVals, setWVals] = useState<Record<string, string>>(initValues);

  useEffect(() => { setViewState(type); setError(""); }, [type]);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cursor light RAF
  useEffect(() => {
    const onMove = (e: MouseEvent) => { lightMouse.current.tx = e.clientX; lightMouse.current.ty = e.clientY; };
    window.addEventListener("mousemove", onMove);
    const tick = () => {
      lightRafRef.current = requestAnimationFrame(tick);
      const m = lightMouse.current;
      m.x += (m.tx - m.x) * 0.07;
      m.y += (m.ty - m.y) * 0.07;
      if (lightRef.current) lightRef.current.style.transform = `translate(${m.x - 200}px,${m.y - 200}px)`;
    };
    lightRafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(lightRafRef.current); };
  }, []);

  // Select widget set based on which view is active
  const activeSet = viewState === "otp" ? OTP_WIDGETS : viewState === "register" ? REGISTER_WIDGETS : LOGIN_WIDGETS;
  // On mobile (< 640px) always show full OTP set; for others filter by minW
  const visibleWidgets = activeSet.filter(w => w.minW <= vw);

  // Live value nudger — one widget every 9s from currently visible live cards
  useEffect(() => {
    const liveWidgets = visibleWidgets.filter(w => w.live);
    if (!liveWidgets.length) return;
    const iv = setInterval(() => {
      const pick = liveWidgets[Math.floor(Math.random() * liveWidgets.length)];
      setWVals(prev => {
        const cur = prev[pick.id] ?? pick.value;
        const m = cur.match(/^([+-]?)(\d+\.\d+)(%?)$/);
        if (!m) return prev;
        const next = Math.max(0.01, parseFloat(m[2]) + (Math.random() - 0.5) * 0.10).toFixed(2);
        return { ...prev, [pick.id]: `${m[1]}${next}${m[3]}` };
      });
    }, 9000);
    return () => clearInterval(iv);
  }, [vw, viewState]);

  // Card spotlight
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpotXY({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  // Card shell style — consistent hover glow across all three screens
  const cardStyle = (): React.CSSProperties => ({
    // FULLY OPAQUE — alpha must be 1 so browser stacking occludes z:1 widgets
    // behind it without any transparency or backdrop-filter bleed-through.
    background:   "#151B26",  // var(--color-trado-surface), alpha = 1
    borderRadius: "18px",
    border: cardHover
      ? "1px solid rgba(79,107,255,0.22)"
      : "1px solid rgba(255,255,255,0.06)",
    boxShadow: cardHover
      ? "0 0 0 1px rgba(79,107,255,0.10), 0 24px 56px rgba(0,0,0,0.65), 0 0 24px rgba(79,107,255,0.12)"
      : "0 20px 50px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
    transition: "border 0.2s ease, box-shadow 0.2s ease",
  });

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const res = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      const [W, H] = [500, 650];
      const popup = window.open(url, "google_oauth_popup",
        `width=${W},height=${H},top=${(screen.height-H)/2},left=${(screen.width-W)/2}`);
      if (!popup) setError("Popup blocked — please allow popups for this site.");
    } catch { setError("Unable to start Google Sign-In. Please try again."); }
  };

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const o = ev.origin;
      if (!o.endsWith(".run.app") && !o.includes("localhost") && !o.includes("127.0.0.1")) return;
      if (ev.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { name: n, email: em, picture: p } = ev.data.user;
        loginWithGoogleUser(n, em, p);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loginWithGoogleUser]);

  // Form submit → OTP
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email) { setError("Please enter a valid email address."); return; }
    if (viewState === "register" && !name) { setError("Please enter your name."); return; }
    setViewState("otp");
  };

  // OTP handlers
  const handleOtpChange = (val: string, i: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i+1]?.focus();
  };
  const handleOtpKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && otp[i] === "" && i > 0) otpRefs.current[i-1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent, i: number) => {
    if (i !== 0) return;
    e.preventDefault();
    const d = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(d)) return;
    setOtp(d.split("")); otpRefs.current[5]?.focus();
  };
  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) { setError("Please enter the full 6-digit code."); return; }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false); setSuccess(true);
      setTimeout(() => {
        if (name && email) registerUser(name, email);
        else loginUser(email || "trado.user@example.com");
      }, 1500);
    }, 1200);
  };

  // ─── Shared sub-components ──────────────────────────────────────────────────

  const ErrorBanner = () => error ? (
    <div style={{
      marginBottom:"14px", padding:"10px 12px", borderRadius:"10px",
      background:"rgba(240,87,107,0.08)", border:"1px solid rgba(240,87,107,0.22)",
      display:"flex", alignItems:"center", gap:"8px",
      color:"var(--color-trado-danger)", fontSize:"12.5px",
    }}>
      <AlertCircle style={{ width:15, height:15, flexShrink:0 }} />
      <span>{error}</span>
    </div>
  ) : null;

  const GoogleBtn = () => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
        gap:"10px", padding:"11px 16px", borderRadius:"12px", cursor:"pointer",
        fontSize:"13.5px", fontWeight:500,
        color:"var(--color-trado-text)",
        background:"rgba(255,255,255,0.035)",
        border:"1px solid rgba(255,255,255,0.08)",
        transition:"background 0.18s ease, border-color 0.18s ease",
        minHeight:"44px",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.065)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.035)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
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

  const Divider = () => (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"18px 0" }}>
      <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
      <span style={{
        fontSize:"9px", fontFamily:"var(--font-mono)",
        color:"var(--color-trado-muted)", textTransform:"uppercase", letterSpacing:"0.1em",
      }}>or email gateway</span>
      <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
    </div>
  );

  const Field: React.FC<{
    label: string; type?: string; placeholder: string;
    value: string; onChange: (v: string) => void; Icon: React.FC<any>;
  }> = ({ label, type="text", placeholder, value, onChange, Icon }) => (
    <div>
      <label style={{
        display:"block", fontSize:"9px", fontFamily:"var(--font-mono)",
        color:"var(--color-trado-muted)", textTransform:"uppercase",
        letterSpacing:"0.08em", marginBottom:"8px",
      }}>{label}</label>
      <div style={{ position:"relative" }}>
        <Icon style={{
          position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)",
          width:"15px", height:"15px", color:"var(--color-trado-muted)", flexShrink:0,
          pointerEvents:"none",
        }} />
        <input
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width:"100%", boxSizing:"border-box",
            background:"rgba(255,255,255,0.025)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"12px",
            padding:"12px 14px 12px 38px",
            fontSize:"13.5px",
            color:"var(--color-trado-text)",
            caretColor:"var(--color-trado-accent)",
            outline:"none",
            transition:"border-color 0.18s ease, box-shadow 0.18s ease",
            minHeight:"44px",
          }}
          onFocus={e => {
            e.target.style.borderColor = "rgba(79,107,255,0.48)";
            e.target.style.boxShadow   = "0 0 0 3px rgba(79,107,255,0.10)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(255,255,255,0.07)";
            e.target.style.boxShadow   = "none";
          }}
        />
      </div>
    </div>
  );

  // Primary button with one-shot click pulse via CSS class
  const PrimaryBtn: React.FC<{
    children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "submit"|"button";
  }> = ({ children, disabled, onClick, type="submit" }) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const handleClick = () => {
      if (btnRef.current) {
        btnRef.current.classList.remove("auth-btn-clicked");
        // Force reflow so animation replays
        void btnRef.current.offsetWidth;
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
        style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
          gap:"7px", padding:"13px 18px", borderRadius:"12px",
          fontSize:"13.5px", fontWeight:600, cursor:disabled?"not-allowed":"pointer",
          color:"#fff", border:"none",
          background:"linear-gradient(135deg, var(--color-trado-accent) 0%, #6f8dff 100%)",
          boxShadow:"0 4px 20px rgba(79,107,255,0.22)",
          transition:"box-shadow 0.18s ease, filter 0.18s ease",
          opacity: disabled ? 0.55 : 1,
          minHeight:"44px",
        }}
        onMouseEnter={e => {
          if (!disabled) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(79,107,255,0.40)";
            (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.07)";
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(79,107,255,0.22)";
          (e.currentTarget as HTMLButtonElement).style.filter = "none";
        }}
        onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.975)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
      >
        {disabled
          ? <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
          : children
        }
      </button>
    );
  };

  const Spotlight = () => (
    <div
      aria-hidden="true"
      style={{
        position:"absolute", inset:0, borderRadius:"18px",
        background: cardHover
          ? `radial-gradient(circle 200px at ${spotXY.x}px ${spotXY.y}px, rgba(79,107,255,0.08), transparent 70%)`
          : "transparent",
        pointerEvents:"none", zIndex:0,
        transition:"background 0.25s ease",
      }}
    />
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
      position:"relative",
      overflow:"hidden",
      background:"var(--color-trado-bg)",
    }}>
      {/* Shared fixed background */}
      <AuthBackground />

      {/* Cursor light follower */}
      <div
        ref={lightRef}
        aria-hidden="true"
        style={{
          position:"fixed", top:0, left:0, zIndex:1, pointerEvents:"none",
          width:400, height:400,
          background:"radial-gradient(circle, rgba(79,107,255,0.09) 0%, transparent 65%)",
          filter:"blur(55px)",
          willChange:"transform",
        }}
      />

      {/* Floating stat widgets */}
      {visibleWidgets.map(w => (
        <FloatingWidget key={w.id} w={w} value={wVals[w.id] ?? w.value} />
      ))}

      {/* Breathing glow behind the card */}
      <motion.div
        aria-hidden="true"
        animate={reduced ? undefined : {
          scale:   cardHover ? [1.0, 1.12, 1.0] : [0.95, 1.08, 0.95],
          opacity: cardHover ? [0.26, 0.36, 0.26] : [0.18, 0.28, 0.18],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:"absolute", zIndex:2, pointerEvents:"none",
          width:520, height:520, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(79,107,255,0.55) 0%, rgba(54,209,255,0.06) 55%, transparent 72%)",
          filter:"blur(110px)",
          top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        }}
      />

      {/* Auth card — max-w-md, full-width on mobile */}
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
        onMouseMove={handleCardMove}
        animate={reduced ? undefined : { y: cardHover ? -4 : 0 }}
        transition={{ type:"spring", stiffness:120, damping:20 }}
        style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:"420px",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => setActiveView("landing")}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            gap:"10px", marginBottom:"24px", width:"100%",
            background:"none", border:"none", cursor:"pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <div style={{
            width:"36px", height:"36px", borderRadius:"10px",
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg, var(--color-trado-accent), #6f8dff)",
            boxShadow:"0 0 18px rgba(79,107,255,0.38)",
            transition:"box-shadow 0.2s ease",
          }}>
            <TrendingUp style={{ width:"18px", height:"18px", color:"#fff", strokeWidth:2.5 }} />
          </div>
          <span style={{
            fontFamily:"var(--font-display)", fontWeight:700, fontSize:"22px",
            letterSpacing:"-0.02em", color:"var(--color-trado-text)",
          }}>Trado</span>
        </button>

        {/* AnimatePresence wraps all three card views */}
        <AnimatePresence mode="wait">

          {/* ── SIGN IN ────────────────────────────────────────────── */}
          {viewState === "signin" && (
            <motion.div key="signin"
              initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:14 }} transition={{ duration:0.24, ease:"easeOut" }}
              style={{ position:"relative", ...cardStyle() }}
            >
              <Spotlight />
              <div style={{ position:"relative", zIndex:1, padding:"clamp(24px,5vw,32px)" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)", fontWeight:700, fontSize:"21px",
                  color:"var(--color-trado-text)", textAlign:"center",
                  marginBottom:"6px", marginTop:0,
                }}>Welcome Back</h2>
                <p style={{
                  fontSize:"13px", color:"var(--color-trado-muted)",
                  textAlign:"center", marginBottom:"22px", marginTop:0,
                }}>Sign in to your virtual trading account.</p>

                <ErrorBanner />
                <GoogleBtn />
                <Divider />

                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <Field label="Email Address" type="email" placeholder="you@example.com"
                    value={email} onChange={setEmail} Icon={Mail} />
                  <PrimaryBtn disabled={isLoading}>
                    <span>Access Dashboard</span>
                    <ArrowRight style={{ width:15, height:15 }} />
                  </PrimaryBtn>
                </form>

                <p style={{ textAlign:"center", fontSize:"12px", color:"var(--color-trado-muted)", marginTop:"20px", marginBottom:0 }}>
                  New here?{" "}
                  <button onClick={() => setViewState("register")} style={{
                    background:"none", border:"none", cursor:"pointer", padding:0,
                    color:"#7B9EFF", fontWeight:500, fontSize:"12px",
                  }}>Create account</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── REGISTER ──────────────────────────────────────────── */}
          {viewState === "register" && (
            <motion.div key="register"
              initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-14 }} transition={{ duration:0.24, ease:"easeOut" }}
              style={{ position:"relative", ...cardStyle() }}
            >
              <Spotlight />
              <div style={{ position:"relative", zIndex:1, padding:"clamp(24px,5vw,32px)" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)", fontWeight:700, fontSize:"21px",
                  color:"var(--color-trado-text)", textAlign:"center",
                  marginBottom:"6px", marginTop:0,
                }}>Create Account</h2>
                <p style={{
                  fontSize:"13px", color:"var(--color-trado-muted)",
                  textAlign:"center", marginBottom:"22px", marginTop:0,
                }}>Get ₹10,00,000 virtual capital instantly.</p>

                <ErrorBanner />
                <GoogleBtn />
                <Divider />

                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <Field label="Full Name" placeholder="Jane Doe" value={name} onChange={setName} Icon={User} />
                  <Field label="Email Address" type="email" placeholder="you@example.com"
                    value={email} onChange={setEmail} Icon={Mail} />
                  <PrimaryBtn disabled={isLoading}>
                    <span>Create Virtual Account</span>
                    <ArrowRight style={{ width:15, height:15 }} />
                  </PrimaryBtn>
                </form>

                <p style={{ textAlign:"center", fontSize:"12px", color:"var(--color-trado-muted)", marginTop:"20px", marginBottom:0 }}>
                  Have an account?{" "}
                  <button onClick={() => setViewState("signin")} style={{
                    background:"none", border:"none", cursor:"pointer", padding:0,
                    color:"#7B9EFF", fontWeight:500, fontSize:"12px",
                  }}>Sign in</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── OTP VERIFICATION ──────────────────────────────────── */}
          {viewState === "otp" && (
            <motion.div key="otp"
              initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.26, ease:"easeOut" }}
              style={{
                position:"relative", overflow:"hidden",
                ...cardStyle(),
                // Success overrides border/shadow
                ...(success ? {
                  border:"1px solid rgba(62,207,142,0.35)",
                  boxShadow:"0 0 48px rgba(62,207,142,0.28), 0 20px 50px rgba(0,0,0,0.50)",
                } : {}),
              }}
            >
              {/* Rotating conic accent ring (visible only before success) */}
              {!success && (
                <div aria-hidden="true" style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:"18px", zIndex:0 }}>
                  <motion.div
                    animate={{ rotate:360 }}
                    transition={{ duration:5, repeat:Infinity, ease:"linear" }}
                    style={{
                      position:"absolute", top:"50%", left:"50%",
                      width:"230%", height:"230%",
                      transform:"translate(-50%,-50%)",
                      background:"conic-gradient(from 0deg, transparent 36%, rgba(79,107,255,0.55) 50%, transparent 64%)",
                    }}
                  />
                </div>
              )}

              <Spotlight />

              <div style={{
                position:"relative", zIndex:1, padding:"clamp(24px,5vw,32px)",
                minHeight:"360px", display:"flex", flexDirection:"column", justifyContent:"center",
              }}>
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div key="otp-form" exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}>
                      <div style={{ display:"flex", justifyContent:"center", marginBottom:"18px" }}>
                        <div style={{
                          width:"44px", height:"44px", borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background:"rgba(79,107,255,0.10)",
                          border:"1px solid rgba(79,107,255,0.24)",
                          boxShadow:"0 0 14px rgba(79,107,255,0.16)",
                        }}>
                          <Lock style={{ width:18, height:18, color:"#7B9EFF" }} />
                        </div>
                      </div>

                      <h2 style={{
                        fontFamily:"var(--font-display)", fontWeight:700, fontSize:"21px",
                        color:"var(--color-trado-text)", textAlign:"center",
                        marginBottom:"6px", marginTop:0,
                      }}>Security Verification</h2>
                      <p style={{
                        fontSize:"13px", color:"var(--color-trado-muted)",
                        textAlign:"center", marginBottom:"24px", marginTop:0,
                      }}>Enter the 6-digit code sent to your email.</p>

                      <ErrorBanner />

                      <form onSubmit={verifyOtp} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                        {/* OTP digit boxes */}
                        <div style={{ display:"flex", justifyContent:"center", gap:"8px" }}>
                          {otp.map((d, i) => (
                            <input
                              key={i}
                              ref={el => { otpRefs.current[i] = el; }}
                              type="text" maxLength={1} inputMode="numeric"
                              value={d}
                              onChange={e => handleOtpChange(e.target.value, i)}
                              onKeyDown={e => handleOtpKey(e, i)}
                              onPaste={e => handleOtpPaste(e, i)}
                              style={{
                                width:"44px", height:"50px",
                                textAlign:"center", fontSize:"18px",
                                fontFamily:"var(--font-mono)", fontWeight:700,
                                color:"var(--color-trado-text)",
                                background:"rgba(255,255,255,0.025)",
                                border:"1px solid rgba(255,255,255,0.08)",
                                borderRadius:"12px",
                                outline:"none",
                                caretColor:"var(--color-trado-accent)",
                                transition:"border-color 0.18s ease, box-shadow 0.18s ease",
                              }}
                              onFocus={e => {
                                e.target.style.borderColor = "rgba(79,107,255,0.55)";
                                e.target.style.boxShadow   = "0 0 0 3px rgba(79,107,255,0.12)";
                              }}
                              onBlur={e => {
                                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                                e.target.style.boxShadow   = "none";
                              }}
                            />
                          ))}
                        </div>

                        <div style={{ textAlign:"center" }}>
                          <span style={{
                            fontSize:"9px", fontFamily:"var(--font-mono)",
                            color:"var(--color-trado-muted)",
                            background:"rgba(255,255,255,0.02)",
                            border:"1px solid rgba(255,255,255,0.04)",
                            padding:"4px 10px", borderRadius:"6px",
                          }}>
                            Sandbox code:{" "}
                            <strong style={{ color:"#7B9EFF" }}>482619</strong>
                          </span>
                        </div>

                        <PrimaryBtn disabled={verifying}>
                          <span>Verify &amp; Enter Platform</span>
                          <ArrowRight style={{ width:15, height:15 }} />
                        </PrimaryBtn>
                      </form>

                      <p style={{ textAlign:"center", marginTop:"16px", marginBottom:0 }}>
                        <button
                          onClick={() => { setError(""); setViewState(name ? "register" : "signin"); }}
                          style={{
                            background:"none", border:"none", cursor:"pointer", padding:0,
                            fontSize:"12px", color:"var(--color-trado-muted)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-trado-text)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-trado-muted)")}
                        >
                          Back
                        </button>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="success"
                      initial={{ opacity:0, scale:0.84 }} animate={{ opacity:1, scale:1 }}
                      transition={{ duration:0.38, ease:"easeOut" }}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0", textAlign:"center" }}
                    >
                      <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
                        <motion.div
                          animate={{ scale:[1,1.5,1], opacity:[0.3,0.65,0] }}
                          transition={{ duration:1.4, repeat:Infinity, ease:"easeOut" }}
                          style={{ position:"absolute", width:"88px", height:"88px", borderRadius:"50%", background:"rgba(62,207,142,0.15)" }}
                        />
                        <div style={{
                          width:"60px", height:"60px", borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:"2.5px solid var(--color-trado-success)",
                          background:"rgba(62,207,142,0.08)",
                          boxShadow:"0 0 26px rgba(62,207,142,0.32)",
                        }}>
                          <svg style={{ width:28, height:28, color:"var(--color-trado-success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
                            <motion.path
                              initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                              transition={{ delay:0.18, duration:0.42 }}
                              strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 style={{
                        fontFamily:"var(--font-display)", fontWeight:700, fontSize:"19px",
                        color:"var(--color-trado-text)", marginBottom:"8px", marginTop:0,
                      }}>Access Granted</h3>
                      <motion.p
                        animate={{ opacity:[1,0.45,1] }}
                        transition={{ duration:1.8, repeat:Infinity }}
                        style={{
                          fontSize:"9.5px", fontFamily:"var(--font-mono)",
                          letterSpacing:"0.12em", textTransform:"uppercase",
                          color:"var(--color-trado-success)", margin:0,
                        }}
                      >
                        Initializing trading terminal…
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          gap:"6px", marginTop:"24px",
          fontSize:"10px", fontFamily:"var(--font-mono)",
          color:"var(--color-trado-muted)", letterSpacing:"0.06em", opacity:0.7,
        }}>
          <Shield style={{ width:12, height:12, color:"rgba(79,107,255,0.45)" }} />
          Educational Simulator — No Real Money
        </div>
      </motion.div>
    </div>
  );
};
