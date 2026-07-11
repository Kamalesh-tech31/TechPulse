/**
 * Trado — Sidebar
 *
 * Shared navigation shell. Import this ONCE in App.tsx.
 * Individual pages must NOT re-implement navigation.
 *
 * Nav structure:
 *   Dashboard          ← standalone, no group label
 *   ─────────────────
 *   TRADE
 *     Stock Analysis
 *     Holdings
 *   ─────────────────
 *   GROW
 *     AI Insights
 *     Learning Center
 *   ─────────────────
 *   ACCOUNT
 *     Transaction History
 *     Profile
 *
 * Features:
 *  - Grouped nav with section labels (11px uppercase muted, 0.08em letter-spacing)
 *  - Dashboard sits ungrouped above all labeled sections
 *  - Sliding active indicator (one absolutely-positioned element, CSS transition ~200ms)
 *  - Left-edge 3px accent bar on active item (primary accent, border-radius: 0 2px 2px 0)
 *  - Icon fill swap — filled icons when active, outline when inactive
 *  - Icon color: active = primary accent, inactive = secondary (muted gray-blue)
 *  - Icon scale on hover of inactive items (CSS .sidebar-icon-wrap:hover → scale 1.05)
 *  - First-load stagger animation (once per session via sessionStorage)
 *  - Wallet count-up animation + shimmer skeleton while value loads
 *  - Collapsible to icon-only 60px mode (persisted in localStorage)
 *  - Glass circular collapse/expand button with chevron rotation
 *  - Keyboard navigation: ArrowUp/ArrowDown + Enter
 *  - Mobile: hamburger drawer below 768px (managed entirely here)
 *  - Hairline dividers before Logout and between wallet card and Logout
 *  - NO blinking animations. All transitions use ease-out at 200–300ms.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../AppContext";
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  BookOpen,
  Cpu,
  History,
  User,
  LogOut,
  TrendingUp,
  Menu,
  X,
  Wallet,
  ChevronLeft,
} from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface NavItem {
  id: string;
  name: string;
  Icon: React.ElementType;
  /** Additional activeView values that should light up this item */
  matchIds?: string[];
}

interface NavSection {
  /** Empty string = no label rendered (Dashboard standalone group) */
  label: string;
  items: NavItem[];
}

/* ─────────────────────────────────────────────────────────
   Nav structure
   Dashboard (ungrouped) → Trade → Grow → Account
───────────────────────────────────────────────────────── */
const NAV_SECTIONS: NavSection[] = [
  {
    label: "", // No label — Dashboard sits above all groups
    items: [{ id: "dashboard", name: "Dashboard", Icon: LayoutDashboard }],
  },
  {
    label: "Trade",
    items: [
      {
        id: "stock-analysis",
        name: "Stock Analysis",
        Icon: LineChart,
        matchIds: ["stock-detail"],
      },
      { id: "virtual-trading", name: "Holdings", Icon: Briefcase },
    ],
  },
  {
    label: "Grow",
    items: [
      { id: "portfolio-analyzer", name: "AI Insights", Icon: Cpu },
      { id: "learning-center", name: "Learning Center", Icon: BookOpen },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "transaction-history", name: "Transaction History", Icon: History },
      { id: "profile", name: "Profile", Icon: User },
    ],
  },
];

/** Flat list of all nav items in order — used for keyboard nav */
const ALL_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/* ─────────────────────────────────────────────────────────
   Helper
───────────────────────────────────────────────────────── */
function isItemActive(item: NavItem, view: string): boolean {
  return item.id === view || (item.matchIds?.includes(view) ?? false);
}

/* ─────────────────────────────────────────────────────────
   CSS variable token shortcuts
───────────────────────────────────────────────────────── */
const token = {
  bg: "var(--color-trado-bg)",
  surface: "var(--color-trado-surface)",
  border: "var(--color-trado-border)",
  accent: "var(--color-trado-accent)", // primary — active nav + CTA only
  secondary: "var(--color-trado-secondary)", // inactive icons, section labels
  text: "var(--color-trado-text)",
  muted: "var(--color-trado-muted)",
  success: "var(--color-trado-success)",
  danger: "var(--color-trado-danger)",
} as const;

/* ═══════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════ */
export const Sidebar: React.FC = () => {
  const { user, activeView, setActiveView, logout } = useApp();

  /* ── Collapsed state (persisted) ── */
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("trado_sidebar_collapsed") === "true",
  );

  /* ── Mobile drawer ── */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Keyboard focus tracking ── */
  const [focusedIdx, setFocusedIdx] = useState(-1);

  /* ── Sliding indicator geometry ── */
  const [indicator, setIndicator] = useState<{
    top: number;
    height: number;
  } | null>(null);
  const navWrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* ── Wallet count-up ── */
  const walletTarget = user?.walletBalance ?? 0;
  const animatedWallet = useCountUp(walletTarget, 500);

  /* ── One-time stagger ── */
  /* ── Update sliding indicator ── */
  const updateIndicator = useCallback(() => {
    const idx = ALL_ITEMS.findIndex((item) => isItemActive(item, activeView));
    const btn = itemRefs.current[idx];
    const wrap = navWrapRef.current;
    if (!btn || !wrap) return;
    const bRect = btn.getBoundingClientRect();
    const wRect = wrap.getBoundingClientRect();
    setIndicator({
      top: bRect.top - wRect.top + wrap.scrollTop,
      height: bRect.height,
    });
  }, [activeView]);

  useEffect(() => {
    /* Small delay so layout settles after collapse transition */
    const t = setTimeout(updateIndicator, 70);
    return () => clearTimeout(t);
  }, [activeView, collapsed, updateIndicator]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  /* ── Collapse toggle ── */
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("trado_sidebar_collapsed", String(next));
      return next;
    });
  };

  /* ── Navigate ── */
  const navigate = useCallback(
    (id: string) => {
      setActiveView(id);
      setMobileOpen(false);
      setFocusedIdx(-1);
    },
    [setActiveView],
  );

  /* ── Keyboard handler ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => (i + 1) % ALL_ITEMS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => (i - 1 + ALL_ITEMS.length) % ALL_ITEMS.length);
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      navigate(ALL_ITEMS[focusedIdx].id);
    } else if (e.key === "Escape") {
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    if (focusedIdx >= 0) itemRefs.current[focusedIdx]?.focus();
  }, [focusedIdx]);

  if (!user?.onboardingCompleted) return null;

  /* ─────────────────────────────────────────────────────
     Logo mark
  ───────────────────────────────────────────────────── */
  const LogoMark = ({ compact = false }: { compact?: boolean }) => (
    <div
      style={{ display: "flex", alignItems: "center", gap: compact ? 0 : 10 }}
    >
      <div
        style={{
          height: compact ? 32 : 36,
          width: compact ? 32 : 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #4F6BFF 0%, #3B54E8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 0 20px rgba(79,107,255,0.38), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          flexShrink: 0,
          transition: "box-shadow 300ms ease-out",
        }}
      >
        <TrendingUp size={compact ? 16 : 18} color="#fff" strokeWidth={2.5} />
      </div>
      {!compact && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "-0.02em",
            color: token.text,
          }}
        >
          Trado
        </span>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────
     User avatar / card
  ───────────────────────────────────────────────────── */
  const UserCard = ({ compact = false }: { compact?: boolean }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: compact ? "center" : "flex-start",
        gap: 10,
        padding: compact ? "8px 0" : "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.028)",
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: 16,
        transition: "background 250ms ease-out",
      }}
    >
      {user.googlePicture ? (
        <img
          src={user.googlePicture}
          alt={user.name}
          referrerPolicy="no-referrer"
          style={{
            height: 36,
            width: 36,
            borderRadius: 10,
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.09)",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            height: 36,
            width: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.accent}, var(--color-trado-accent-dark))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            flexShrink: 0,
            textTransform: "uppercase",
            border: "1px solid rgba(79,107,255,0.32)",
            boxShadow: "0 0 12px rgba(79,107,255,0.2)",
          }}
        >
          {user.name.slice(0, 2)}
        </div>
      )}
      {!compact && (
        <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
          <div
            style={{
              color: token.text,
              fontWeight: 600,
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              color: token.muted,
              fontSize: 11,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </div>
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────
     Wallet card
  ───────────────────────────────────────────────────── */
  const WalletCard = ({ compact = false }: { compact?: boolean }) => {
    const display =
      walletTarget === 0
        ? "—"
        : animatedWallet.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });

    return (
      <div
        style={{
          background: "rgba(21, 27, 38, 0.85)",
          border: "1px solid rgba(62,207,142,0.14)",
          borderRadius: 14,
          padding: compact ? "10px 0" : "14px",
          display: "flex",
          flexDirection: "column",
          alignItems: compact ? "center" : "flex-start",
          gap: 4,
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 250ms ease-out",
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            right: -16,
            bottom: -16,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(62,207,142,0.07)",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />

        {!compact && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: token.muted,
              fontSize: 11,
            }}
          >
            <Wallet size={12} color={token.success} />
            <span>Available Wallet</span>
          </div>
        )}

        {compact ? (
          <Wallet size={16} color={token.success} />
        ) : (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 18,
              color: token.success,
              marginTop: 2,
              lineHeight: 1,
            }}
          >
            {walletTarget === 0 ? (
              <span
                className="skeleton-shimmer"
                style={{ display: "inline-block", width: 80, height: 20 }}
              />
            ) : (
              `₹${display}`
            )}
          </div>
        )}

        {!compact && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: token.muted,
              opacity: 0.6,
            }}
          >
            Simulated Virtual Cash
          </span>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────
     Nav sections (shared between desktop + mobile)
  ───────────────────────────────────────────────────── */
  const renderNav = (opts: { isCollapsed: boolean; isDesktop: boolean }) => {
    const { isCollapsed } = opts;
    let globalIdx = 0;

    return (
      <div
        ref={opts.isDesktop && !isCollapsed ? navWrapRef : undefined}
        style={{ position: "relative", flex: 1 }}
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={opts.isDesktop ? handleKeyDown : undefined}
      >
        {/* Sliding active indicator — desktop expanded only */}
        {opts.isDesktop && !isCollapsed && indicator && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: indicator.top,
              height: indicator.height,
              background: "rgba(79,107,255,0.11)",
              borderRadius: "0 8px 8px 0",
              boxShadow:
                "0 0 20px rgba(79, 107, 255, 0.12), inset 0 0 0 1px rgba(79,107,255,0.14)",
              transition: "top 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {/* Left accent bar — full-strength accent, rounded right edge */}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 5,
                bottom: 5,
                width: 3,
                background: token.accent,
                borderRadius: "0 2px 2px 0",
              }}
            />
          </div>
        )}

        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div
            key={`section-${sectionIdx}`}
            style={{ marginBottom: isCollapsed ? 4 : 8 }}
          >
            {/* Section label — shown only when label is non-empty and not collapsed */}
            {!isCollapsed && section.label && (
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: token.secondary,
                  padding: "8px 14px 4px",
                  opacity: 0.65,
                  userSelect: "none",
                  margin: 0,
                }}
              >
                {section.label}
              </p>
            )}

            {/* Hairline divider between sections in collapsed mode */}
            {isCollapsed && sectionIdx > 0 && (
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.055)",
                  margin: "6px 8px",
                }}
              />
            )}

            {section.items.map((item) => {
              const idx = globalIdx++;
              const active = isItemActive(item, activeView);
              const { Icon } = item;
              const showStaticActive =
                active && (isCollapsed || !opts.isDesktop);

              return (
                <div key={item.id} style={{ position: "relative" }}>
                  {/* Left accent bar — for collapsed or mobile active items */}
                  {showStaticActive && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 5,
                        bottom: 5,
                        width: 3,
                        background: token.accent,
                        borderRadius: "0 2px 2px 0",
                        zIndex: 2,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <button
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    onClick={() => navigate(item.id)}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={item.name}
                    aria-current={active ? "page" : undefined}
                    tabIndex={0}
                    className="sidebar-nav-btn"
                    data-active={String(active)}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      gap: isCollapsed ? 0 : 11,
                      width: "100%",
                      padding: isCollapsed ? "10px 0" : "9px 14px",
                      borderRadius: 8,
                      border: "none",
                      /* Active and hover backgrounds are handled by CSS classes */
                      background: showStaticActive
                        ? "rgba(79,107,255,0.12)"
                        : "transparent",
                      boxShadow: showStaticActive
                        ? "0 0 24px rgba(79, 107, 255, 0.10), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(79,107,255,0.14)"
                        : "none",
                      cursor: "pointer",
                      outline: "none",
                      /* Colors managed by CSS classes */
                      color: active ? "#FFFFFF" : token.secondary,
                      transition:
                        "background 200ms ease-out, box-shadow 200ms ease-out, color 200ms ease-out",
                      minHeight: 40,
                    }}
                  >
                    <span
                      className="sidebar-icon-wrap"
                      style={{
                        color: active ? token.accent : token.secondary,
                      }}
                    >
                      <Icon
                        size={17}
                        fill={active ? "currentColor" : "none"}
                        stroke={active ? "none" : "currentColor"}
                        strokeWidth={2}
                      />
                    </span>

                    {!isCollapsed && (
                      <span
                        className="sidebar-nav-label"
                        style={{
                          fontSize: 13,
                          fontWeight: active ? 600 : 400,
                          color: active ? "#FFFFFF" : token.secondary,
                          /* Smooth width/opacity for collapse transition */
                          maxWidth: isCollapsed ? 0 : 200,
                          opacity: isCollapsed ? 0 : 1,
                          overflow: "hidden",
                          transition:
                            "max-width 250ms ease-out, opacity 200ms ease-out, color 200ms ease-out",
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────
     Logout button
  ───────────────────────────────────────────────────── */
  const LogoutButton = ({ compact = false }: { compact?: boolean }) => (
    <button
      onClick={() => {
        logout();
        setMobileOpen(false);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: compact ? "center" : "flex-start",
        gap: compact ? 0 : 10,
        width: "100%",
        padding: compact ? "10px 0" : "10px 14px",
        borderRadius: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "rgba(240,87,107,0.7)",
        fontSize: 13,
        fontWeight: 500,
        transition: "color 200ms ease-out, background 200ms ease-out",
        minHeight: 40,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = token.danger;
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(240,87,107,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color =
          "rgba(240,87,107,0.7)";
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
      title={compact ? "Logout" : undefined}
      aria-label="Logout"
    >
      <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      {!compact && <span>Logout</span>}
    </button>
  );

  /* ─────────────────────────────────────────────────────
     DESKTOP SIDEBAR
  ───────────────────────────────────────────────────── */
  const DesktopSidebar = () => (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        width: collapsed ? 60 : 256,
        minHeight: "100vh",
        background: "rgba(13, 17, 23, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: collapsed ? "20px 8px" : "20px 10px",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        transition:
          "width 280ms cubic-bezier(0.4,0,0.2,1), padding 280ms ease-out",
        overflowX: "hidden",
        overflowY: "auto",
        zIndex: 30,
        userSelect: "none",
      }}
    >
      {/* Header row: logo + collapse toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 24,
          position: "relative",
          minHeight: 36,
        }}
      >
        <LogoMark compact={collapsed} />

        {/* Glass circular toggle button — single element, chevron rotates */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`sidebar-toggle-glass${collapsed ? " is-collapsed" : ""}`}
          style={
            collapsed
              ? {
                  /* When collapsed, position it absolutely to the right of the icon */
                  position: "absolute",
                  top: "50%",
                  right: -13,
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                }
              : {}
          }
        >
          <span className="toggle-chevron">
            <ChevronLeft size={13} strokeWidth={2.5} />
          </span>
        </button>
      </div>

      {/* User card */}
      <UserCard compact={collapsed} />

      {/* Nav sections */}
      {renderNav({ isCollapsed: collapsed, isDesktop: true })}

      {/* Bottom: wallet + hairline divider + logout */}
      <div style={{ marginTop: "auto" }}>
        {/* Divider above wallet */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.055)",
            margin: "12px 4px",
          }}
        />

        <WalletCard compact={collapsed} />

        {/* Hairline divider between wallet and Logout */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.055)",
            margin: "12px 4px",
          }}
        />

        <LogoutButton compact={collapsed} />
      </div>
    </aside>
  );

  /* ─────────────────────────────────────────────────────
     MOBILE TOP BAR + DRAWER
  ───────────────────────────────────────────────────── */
  const MobileBar = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(13, 17, 23, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 16px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        width: "100%",
        minHeight: 56,
      }}
    >
      <LogoMark />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Wallet quick badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(62,207,142,0.07)",
            border: "1px solid rgba(62,207,142,0.18)",
            borderRadius: 8,
            padding: "4px 10px",
            minHeight: 32,
          }}
        >
          <Wallet size={11} color={token.success} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              color: token.success,
            }}
          >
            ₹
            {walletTarget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            cursor: "pointer",
            color: token.secondary,
            transition: "background 200ms ease-out, color 200ms ease-out",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = token.text;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              token.secondary;
          }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </div>
  );

  const MobileDrawer = () => (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 45,
          }}
        />
      )}

      {/* Drawer slides in from left */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: "rgba(13, 17, 23, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          padding: "20px 10px",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <LogoMark />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: token.secondary,
              transition: "background 200ms ease-out, color 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = token.text;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                token.secondary;
            }}
          >
            <X size={18} />
          </button>
        </div>

        <UserCard />

        {/* Nav */}
        {renderNav({ isCollapsed: false, isDesktop: false })}

        {/* Bottom */}
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.055)",
              margin: "12px 4px",
            }}
          />
          <WalletCard />
          {/* Hairline divider between wallet card and Logout */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.055)",
              margin: "12px 4px",
            }}
          />
          <LogoutButton />
        </div>
      </aside>
    </>
  );

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <>
      {/* Desktop — occupies its own flex column alongside <main> */}
      <div className="hidden md:block" style={{ flexShrink: 0 }}>
        <DesktopSidebar />
      </div>

      {/*
        Mobile — zero-width flex child so <main> fills 100% of viewport width.
        MobileBar is position:fixed (top bar), MobileDrawer is position:fixed (overlay).
        A spacer div at the top of <main> compensates for the fixed top bar height.
      */}
      <div
        className="md:hidden"
        style={{ width: 0, flexShrink: 0, overflow: "visible" }}
      >
        <MobileBar />
        <MobileDrawer />
      </div>
    </>
  );
};
