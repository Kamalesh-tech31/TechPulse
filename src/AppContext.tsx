import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  Stock,
  GroupedHolding,
  DbTransaction,
  Transaction,
  UserProfile,
  OnboardingPreferences,
  FullPortfolioAnalysis,
  RiskProfile,
  Recommendation,
  PortfolioReport,
  ChatMessage,
  ChatSession,
} from "./types";
import { INITIAL_STOCKS } from "./mockData";
import { supabase } from "./supabase";

// ─────────────────────────────────────────────────────────────
//  Backend-returned user shape (from /auth/login, /auth/verify-otp, /auth/google)
// ─────────────────────────────────────────────────────────────
export interface BackendUser {
  name: string;
  email: string;
  walletBalance: number;
  initialBalance: number;
  onboardingCompleted: boolean;
  googlePicture?: string;
}

// ─────────────────────────────────────────────────────────────
//  Context type
// ─────────────────────────────────────────────────────────────
interface AppContextType {
  user: UserProfile | null;
  stocks: Stock[];
  holdings: GroupedHolding[];
  transactions: Transaction[];
  isLoading: boolean;
  authLoading: boolean;
  isAuthInitialized: boolean;
  activeView: string;
  selectedStockId: string | null;
  portfolioLoading: boolean;

  registerUser: (name: string, email: string) => void;
  loginUser: (email: string) => boolean;
  loginWithGoogleUser: (name: string, email: string, picture?: string) => void;
  loginUserFromResponse: (userData: BackendUser) => void;
  completeOnboarding: (prefs: OnboardingPreferences) => Promise<void>;
  buyStock: (stockId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  sellStock: (stockId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  claimWeeklyCredit: (amount: number) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetAllData: () => void;
  addMoney: (amount: number) => void;
  resetMoney: () => void;
  setActiveView: (view: string) => void;
  setSelectedStockId: (id: string | null) => void;
  refreshPortfolio: () => Promise<void>;

  // AI Assistant Subsystem State
  aiState: {
    analysis: FullPortfolioAnalysis | null;
    riskProfile: RiskProfile | null;
    recommendations: Recommendation[];
    report: PortfolioReport | null;
    hasAnalyzed: boolean;
  };
  setAiState: React.Dispatch<React.SetStateAction<{
    analysis: FullPortfolioAnalysis | null;
    riskProfile: RiskProfile | null;
    recommendations: Recommendation[];
    report: PortfolioReport | null;
    hasAnalyzed: boolean;
  }>>;
  aiChatMessages: ChatMessage[];
  setAiChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  aiChatSessions: ChatSession[];
  setAiChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
//  Helper: get the auth token
// ─────────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("trado_token");
}

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("stockeasy_user");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem("stockeasy_stocks");
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const realHistoriesRef = useRef<Record<string, number[]>>({});
  const fetchedHistoriesRef = useRef<Set<string>>(new Set());

  // ── DB-backed portfolio state ───────────────────────────────
  const [holdings, setHoldings] = useState<GroupedHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [aiState, setAiState] = useState<{
    analysis: FullPortfolioAnalysis | null;
    riskProfile: RiskProfile | null;
    recommendations: Recommendation[];
    report: PortfolioReport | null;
    hasAnalyzed: boolean;
  }>({
    analysis: null,
    riskProfile: null,
    recommendations: [],
    report: null,
    hasAnalyzed: false
  });

  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [aiChatSessions, setAiChatSessions] = useState<ChatSession[]>([]);

  // Load user-specific AI data when user logs in/out or reloads
  useEffect(() => {
    const fetchAIData = async () => {
      const token = getToken();
      if (!user || !token) {
        setAiState({ analysis: null, riskProfile: null, recommendations: [], report: null, hasAnalyzed: false });
        setAiChatMessages([]);
        setAiChatSessions([]);
        return;
      }

      try {
        // 1. Fetch sessions from Supabase via backend
        const sessionsRes = await fetch('/api/ai/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sessionsRes.ok) {
          const res = await sessionsRes.json();
          if (res.success && res.data) {
            setAiChatSessions(res.data);
          }
        }

        // 2. Fetch latest report from Supabase via backend
        const reportRes = await fetch('/api/ai/latest-report', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (reportRes.ok) {
          const res = await reportRes.json();
          if (res.success && res.data) {
            setAiState({
              analysis: res.data.analysis,
              riskProfile: res.data.riskProfile,
              recommendations: res.data.recommendations || [],
              report: res.data.report,
              hasAnalyzed: true
            });
          }
        }
      } catch (err) {
        console.error('Failed to load AI assistant data:', err);
      }
    };

    fetchAIData();
  }, [user]);

  useEffect(() => {
    console.log("HOLDINGS STATE CHANGED:", holdings);
  }, [holdings]);

  // ── UI state ───────────────────────────────────────────────
  const [activeView, setActiveView] = useState<string>(() => {
    const saved = localStorage.getItem("stockeasy_user");
    if (!saved) return "landing";
    try {
      const u = JSON.parse(saved);
      if (!u.onboardingCompleted) return "onboarding";
      return "dashboard";
    } catch { return "landing"; }
  });

  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  // Ref to track if a portfolio fetch is in flight (prevent duplicate calls)
  const portfolioFetchRef = useRef(false);

  // ── Persist user profile to localStorage ──────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem("stockeasy_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("stockeasy_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("stockeasy_stocks", JSON.stringify(stocks));
  }, [stocks]);

  // ─────────────────────────────────────────────────────────────
  //  Portfolio fetcher — calls /api/dashboard with live prices
  // ─────────────────────────────────────────────────────────────
  const refreshPortfolio = useCallback(async () => {
    console.log("refreshPortfolio CALLED");

    const token = getToken();
    if (!token || portfolioFetchRef.current) return;

    portfolioFetchRef.current = true;
    setPortfolioLoading(true);
    try {
      // Build live price map from current stocks state
      const livePrices: Record<string, number> = {};
      setStocks(prev => {
        prev.forEach(s => { livePrices[s.symbol] = s.price; });
        return prev;
      });

      const pricesParam = encodeURIComponent(JSON.stringify(livePrices));
      const res = await fetch(`/portfolio/dashboard?prices=${pricesParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Dashboard URL:", res.url);
      console.log("Dashboard Status:", res.status);

      if (!res.ok) {
        console.warn("[Portfolio] Failed to fetch dashboard:", res.status);
        return;
      }

      const result = await res.json();

      if (result.success && result.data) {
        const { wallet, holdings: h, transactions: t } = result.data;

        // 👇 ADD THIS
        console.log("About to map holdings...");

        const enriched: GroupedHolding[] = (h as GroupedHolding[]).map((g) => {
          const livePrice = livePrices[g.symbol] ?? g.currentPrice;

          const currentValue =
            Math.round(g.totalQuantity * livePrice * 100) / 100;
          const profitLoss =
            Math.round((currentValue - g.totalCost) * 100) / 100;
          const profitLossPercentage =
            g.totalCost > 0
              ? Math.round((profitLoss / g.totalCost) * 10000) / 100
              : 0;

          return {
            ...g,
            currentPrice: livePrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
            purchases: g.purchases.map((p) => ({
              ...p,
              currentValue: Math.round(p.quantity * livePrice * 100) / 100,
              profitLoss:
                Math.round(p.quantity * (livePrice - p.buyPrice) * 100) / 100,
            })),
          };
        });

        // 👇 ADD THIS
        console.log("ENRICHED =", enriched);

        const mappedTransactions: Transaction[] = (t || []).map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          stockId: tx.symbol,
          symbol: tx.symbol,
          name: tx.company_name,
          quantity: tx.quantity,
          price: Number(tx.price),
          totalAmount: Number(tx.total_amount),
          remainingBalance: Number(tx.remaining_balance ?? 0),
          timestamp: tx.transaction_time || tx.created_at,
        }));

        // 👇 ADD THIS
        console.log("ENRICHED:", enriched);
        console.log("CALLING setHoldings");

        setHoldings(enriched);

        console.log("setHoldings FINISHED");

        setTransactions(mappedTransactions);

        if (wallet) {
          setUser((prev) =>
            prev ? {
              ...prev,
              walletBalance: wallet.available_cash,
              weeklyCreditLimit: wallet.weekly_credit_limit,
              weeklyCreditRemaining: wallet.weekly_credit_remaining,
              lastWeeklyReset: wallet.last_weekly_reset,
            } : prev,
          );
        }
      }
    } catch (err) {
      console.error("[Portfolio] refreshPortfolio error:", err);
    } finally {
      portfolioFetchRef.current = false;
      setPortfolioLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  //  Live stocks — fetch from market API every 30 seconds
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const response = await fetch("/api/nifty25");

        console.log("Status:", response.status);

        const text = await response.text();
        console.log(text);

        const data = JSON.parse(text);

        console.log("NIFTY RESPONSE =", data);

        const formattedStocks = data.map((stock: any) => ({
          id: stock.symbol,
          symbol: stock.symbol.replace(".NS", ""),
          name: stock.name,
          price: stock.price,
          change: ((stock.price - stock.previousClose) / stock.previousClose) * 100,
          high: stock.high,
          low: stock.low,
          volume: stock.volume,
          marketCap: "-",
          peRatio: "-",
          high52: stock.high,
          low52: stock.low,
          sector: "NSE",
          description: stock.name,
          history: realHistoriesRef.current[stock.symbol] || [stock.low, stock.previousClose, stock.price, stock.high],
        }));

        setStocks(formattedStocks);
      } catch (err) {
        console.error("[Stocks] Failed to load:", err);
      }
    };

    loadStocks();
    const interval = setInterval(loadStocks, 2*60*1000);
    return () => clearInterval(interval);
  }, []);

  // Effect to load 7-day historical prices for each stock once retrieved
  useEffect(() => {
    if (stocks.length === 0) return;

    const fetchHistoryForStock = async (stockId: string) => {
      try {
        const response = await fetch(`/api/stocks/${stockId}/history`);
        if (response.ok) {
          const data = await response.json();
          const quotes = data.quotes || [];
          const closePrices = quotes
            .filter((q: any) => q && typeof q.close === 'number')
            .map((q: any) => q.close);
          if (closePrices.length > 0) {
            realHistoriesRef.current[stockId] = closePrices;
            // Update the history in stocks state in-place
            setStocks(prevStocks =>
              prevStocks.map(s =>
                s.id === stockId ? { ...s, history: closePrices } : s
              )
            );
          }
        }
      } catch (err) {
        console.error(`Failed to fetch history for ${stockId}:`, err);
      }
    };

    stocks.forEach(stock => {
      const cached = realHistoriesRef.current[stock.id];
      if (cached) {
        // If we have cached real history but the stock object doesn't have it, update it
        if (stock.history !== cached) {
          setStocks(prevStocks =>
            prevStocks.map(s =>
              s.id === stock.id ? { ...s, history: cached } : s
            )
          );
        }
      } else if (!fetchedHistoriesRef.current.has(stock.id)) {
        fetchedHistoriesRef.current.add(stock.id);
        fetchHistoryForStock(stock.id);
      }
    });
  }, [stocks]);

  // ── When stocks update, refresh portfolio P/L in-place (no round-trip) ──
  useEffect(() => {
    if (holdings.length === 0) return;
    setHoldings(prev => {
      const livePrices: Record<string, number> = {};
      stocks.forEach(s => { livePrices[s.symbol] = s.price; });

      return prev.map(g => {
        const livePrice = livePrices[g.symbol] ?? g.currentPrice;
        if (livePrice === g.currentPrice) return g;

        const currentValue = Math.round(g.totalQuantity * livePrice * 100) / 100;
        const profitLoss = Math.round((currentValue - g.totalCost) * 100) / 100;
        const profitLossPercentage = g.totalCost > 0
          ? Math.round((profitLoss / g.totalCost) * 10000) / 100
          : 0;
        return {
          ...g,
          currentPrice: livePrice,
          currentValue,
          profitLoss,
          profitLossPercentage,
          purchases: g.purchases.map(p => ({
            ...p,
            currentValue: Math.round(p.quantity * livePrice * 100) / 100,
            profitLoss: Math.round(p.quantity * (livePrice - p.buyPrice) * 100) / 100,
          })),
        };
      });
    });
  }, [stocks]);

  // ─────────────────────────────────────────────────────────────
  //  Auth initialization
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      try {
        // 1. Check if there is an active Supabase session (Google Auth)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error("Supabase getSession error:", error);

        if (session) {
          const res = await fetch("/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: session.access_token }),
          });

          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
              localStorage.setItem("trado_token", result.data.token);
              const finalUser: UserProfile = {
                name: result.data.user.name,
                email: result.data.user.email,
                walletBalance: result.data.user.walletBalance,
                initialBalance: result.data.user.initialBalance,
                onboardingCompleted: result.data.user.onboardingCompleted,
                googlePicture: result.data.user.googlePicture,
              };
              setUser(finalUser);
              if (window.history.replaceState) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
              }
              setActiveView(result.redirectTo === "/dashboard" ? "dashboard" : "onboarding");
              setIsAuthInitialized(true);
              setAuthLoading(false);
              // Restore portfolio from DB
              await refreshPortfolio();
              return;
            }
          }
        }

        // 2. No Supabase session — check trado_token
        const localToken = localStorage.getItem("trado_token");
        if (localToken) {
          const res = await fetch("/auth/me", {
            headers: { Authorization: `Bearer ${localToken}` },
          });
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data?.user) {
              const finalUser: UserProfile = {
                name: result.data.user.name,
                email: result.data.user.email,
                walletBalance: result.data.user.walletBalance,
                initialBalance: result.data.user.initialBalance,
                onboardingCompleted: result.data.user.onboardingCompleted,
                googlePicture: result.data.user.googlePicture,
              };
              setUser(finalUser);
              setActiveView(finalUser.onboardingCompleted ? "dashboard" : "onboarding");
              setIsAuthInitialized(true);
              setAuthLoading(false);
              // Restore portfolio from DB
              await refreshPortfolio();
              return;
            }
          }
          // Token invalid — clear session
          localStorage.removeItem("trado_token");
          setUser(null);
          setHoldings([]);
          setTransactions([]);
          setActiveView("landing");
        } else {
          const path = window.location.pathname;
          if (path === "/register") setActiveView("register");
          else if (path === "/login") setActiveView("signin");
          else setActiveView("landing");
        }
      } catch (err) {
        console.error("Initialization of authentication failed:", err);
      } finally {
        setAuthLoading(false);
        setIsAuthInitialized(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        initAuth();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setHoldings([]);
        setTransactions([]);
        localStorage.removeItem("trado_token");
        setActiveView("landing");
        setIsAuthInitialized(true);
        setAuthLoading(false);
      } else if (event === "INITIAL_SESSION" && !session) {
        initAuth();
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  // ─────────────────────────────────────────────────────────────
  //  Auth Functions
  // ─────────────────────────────────────────────────────────────
  const registerUser = (name: string, email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        name, email, walletBalance: 1000000, initialBalance: 1000000, onboardingCompleted: false,
      };
      setUser(newUser);
      setActiveView("onboarding");
      setIsLoading(false);
    }, 800);
  };

  const loginUser = (email: string): boolean => {
    setIsLoading(true);
    const saved = localStorage.getItem("stockeasy_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        setTimeout(() => {
          setUser(parsed);
          setActiveView(parsed.onboardingCompleted ? "dashboard" : "onboarding");
          setIsLoading(false);
        }, 800);
        return true;
      }
    }
    setTimeout(() => {
      const autoUser: UserProfile = {
        name: email.split("@")[0].toUpperCase(),
        email, walletBalance: 1000000, initialBalance: 1000000, onboardingCompleted: false,
      };
      setUser(autoUser);
      setActiveView("onboarding");
      setIsLoading(false);
    }, 800);
    return true;
  };

  const loginWithGoogleUser = (name: string, email: string, picture?: string) => {
    setIsLoading(true);
    const finalUser: UserProfile = {
      name, email, walletBalance: 1000000, initialBalance: 1000000, onboardingCompleted: false, googlePicture: picture,
    };
    setUser(finalUser);
    setActiveView("onboarding");
    setIsLoading(false);
  };

  const loginUserFromResponse = (userData: BackendUser) => {
    const finalUser: UserProfile = {
      name: userData.name,
      email: userData.email,
      walletBalance: userData.walletBalance,
      initialBalance: userData.initialBalance,
      onboardingCompleted: userData.onboardingCompleted,
      googlePicture: userData.googlePicture,
    };
    setUser(finalUser);
    setActiveView(userData.onboardingCompleted ? "dashboard" : "onboarding");
    // Restore portfolio from DB after login
    setTimeout(() => refreshPortfolio(), 100);
  };

  const completeOnboarding = async (prefs: OnboardingPreferences) => {
    if (!user) return;
    try {
      const token = getToken();
      const res = await fetch("/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        const updatedUser = { ...user, onboardingCompleted: true };
        setUser(updatedUser);
        setActiveView("dashboard");
      }
    } catch (e) {
      console.error("Onboarding failed:", e);
      const updatedUser = { ...user, onboardingCompleted: true };
      setUser(updatedUser);
      setActiveView("dashboard");
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Buy Stock — calls POST /api/buy (Supabase-backed)
  // ─────────────────────────────────────────────────────────────
  const buyStock = async (stockId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Please sign in." };
    const token = getToken();
    if (!token) return { success: false, message: "Authentication required." };

    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return { success: false, message: "Stock not found." };

    const livePrice = stock.price;
    const totalCost = Math.round(quantity * livePrice * 100) / 100;

    if (user.walletBalance < totalCost) {
      return { success: false, message: `Insufficient balance. Need ₹${totalCost.toLocaleString()}.` };
    }

    try {
      const res = await fetch("/portfolio/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          companyName: stock.name,
          exchange: "NSE",
          quantity,
          livePrice,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, message: result.message || "Buy failed." };
      }

      // Update wallet balance immediately in UI
      setUser(prev => prev ? { ...prev, walletBalance: result.data.available_cash } : prev);

      // Refresh full portfolio from DB
      await refreshPortfolio();

      return { success: true, message: result.message };
    } catch (err: any) {
      console.error("[Buy] Error:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Sell Stock — calls POST /api/sell (Supabase-backed, FIFO)
  // ─────────────────────────────────────────────────────────────
  const sellStock = async (stockId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Please sign in." };
    const token = getToken();
    if (!token) return { success: false, message: "Authentication required." };

    // stockId may be the NSE symbol (e.g. "RELIANCE.NS") or bare symbol ("RELIANCE")
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return { success: false, message: "Stock not found." };

    // Check total available quantity from grouped holdings
    const holding = holdings.find(h => h.symbol === stock.symbol);
    if (!holding || holding.totalQuantity < quantity) {
      return { success: false, message: `Insufficient shares. Available: ${holding?.totalQuantity ?? 0}.` };
    }

    try {
      const res = await fetch("/portfolio/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity,
          livePrice: stock.price,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, message: result.message || "Sell failed." };
      }

      // Update wallet balance immediately in UI
      setUser(prev => prev ? { ...prev, walletBalance: result.data.available_cash } : prev);

      // Refresh full portfolio from DB
      await refreshPortfolio();

      return { success: true, message: result.message };
    } catch (err: any) {
      console.error("[Sell] Error:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Logout
  // ─────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const token = getToken();
      if (token) await fetch("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      await supabase.auth.signOut();
    } catch {}
    // Clear local state only — DB data persists for next login
    localStorage.removeItem("trado_token");
    localStorage.removeItem("stockeasy_user");
    setUser(null);
    setHoldings([]);
    setTransactions([]);
    setActiveView("landing");
  };

  const resetAllData = () => {
    if (!user) return;
    setUser({ ...user, walletBalance: 1000000, initialBalance: 1000000 });
    setHoldings([]);
    setTransactions([]);
    setStocks(INITIAL_STOCKS);
    localStorage.removeItem("stockeasy_stocks");
  };

  const addMoney = (amount: number) => setUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null);
  const resetMoney = () => setUser(prev => prev ? { ...prev, walletBalance: 1000000 } : null);

  // ─────────────────────────────────────────────────────────────
  //  Claim Weekly Credit — calls POST /portfolio/claim-credit
  // ─────────────────────────────────────────────────────────────
  const claimWeeklyCredit = async (amount: number): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Please sign in.' };
    const token = getToken();
    if (!token) return { success: false, message: 'Authentication required.' };

    try {
      const res = await fetch('/portfolio/claim-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, message: result.message || 'Claim failed.' };
      }
      // Update wallet state immediately from response
      setUser(prev => prev ? {
        ...prev,
        walletBalance: result.data.currentWallet,
        weeklyCreditRemaining: result.data.weeklyCreditRemaining,
        weeklyCreditLimit: result.data.weeklyCreditLimit,
        lastWeeklyReset: result.data.lastWeeklyReset,
      } : prev);
      // Refresh full portfolio to sync transaction history
      await refreshPortfolio();
      return { success: true, message: result.message };
    } catch (err: any) {
      console.error('[Claim Credit] Error:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Delete Account — calls DELETE /auth/account
  // ─────────────────────────────────────────────────────────────
  const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
    const token = getToken();
    if (!token) return { success: false, message: 'Authentication required.' };

    try {
      const res = await fetch('/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, message: result.message || 'Deletion failed.' };
      }
      // Clear all local state and redirect to landing
      try {
        await supabase.auth.signOut();
      } catch {}
      localStorage.removeItem('trado_token');
      localStorage.removeItem('stockeasy_user');
      localStorage.removeItem('stockeasy_stocks');
      setUser(null);
      setHoldings([]);
      setTransactions([]);
      setActiveView('landing');
      return { success: true, message: result.message };
    } catch (err: any) {
      console.error('[Delete Account] Error:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user, stocks, holdings, transactions,
        isLoading, authLoading, isAuthInitialized, activeView,
        selectedStockId, portfolioLoading,
        registerUser, loginUser, loginWithGoogleUser, loginUserFromResponse,
        completeOnboarding, buyStock, sellStock, claimWeeklyCredit, deleteAccount,
        logout, resetAllData,
        addMoney, resetMoney, setActiveView, setSelectedStockId,
        refreshPortfolio,
        aiState, setAiState,
        aiChatMessages, setAiChatMessages,
        aiChatSessions, setAiChatSessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within an AppProvider");
  return context;
};
