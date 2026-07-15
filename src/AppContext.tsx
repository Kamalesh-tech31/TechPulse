import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Stock,
  Holding,
  Transaction,
  UserProfile,
  OnboardingPreferences,
} from "./types";
import { INITIAL_STOCKS } from "./mockData";
import { supabase } from "./supabase";

// Backend-returned user shape (from /auth/login, /auth/verify-otp, /auth/google)
export interface BackendUser {
  name: string;
  email: string;
  walletBalance: number;
  initialBalance: number;
  onboardingCompleted: boolean;
  googlePicture?: string;
}

interface AppContextType {
  user: UserProfile | null;
  stocks: Stock[];
  holdings: Holding[];
  transactions: Transaction[];
  isLoading: boolean;
  authLoading: boolean;
  isAuthInitialized: boolean;
  activeView: string;
  selectedStockId: string | null;
  registerUser: (name: string, email: string) => void;
  loginUser: (email: string) => boolean;
  loginWithGoogleUser: (name: string, email: string, picture?: string) => void;
  loginUserFromResponse: (userData: BackendUser) => void;
  completeOnboarding: (prefs: OnboardingPreferences) => Promise<void>;
  buyStock: (
    stockId: string,
    quantity: number,
  ) => { success: boolean; message: string };
  sellStock: (
    stockId: string,
    quantity: number,
  ) => { success: boolean; message: string };
  logout: () => Promise<void>;
  resetAllData: () => void;
  addMoney: (amount: number) => void;
  resetMoney: () => void;
  setActiveView: (view: string) => void;
  setSelectedStockId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("stockeasy_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem("stockeasy_stocks");
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const saved = localStorage.getItem("stockeasy_holdings");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("stockeasy_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Derive the correct initial view synchronously — no useEffect flash
  const [activeView, setActiveView] = useState<string>(() => {
    const saved = localStorage.getItem("stockeasy_user");
    if (!saved) return "landing";
    try {
      const u = JSON.parse(saved);
      if (!u.onboardingCompleted) return "onboarding";
      return "dashboard";
    } catch {
      return "landing";
    }
  });

  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  // Sync state to localStorage on changes
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

  useEffect(() => {
    localStorage.setItem("stockeasy_holdings", JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem(
      "stockeasy_transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  // Handle session detection and synchronization on boot
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      try {
        // 1. Check if there is an active Supabase session (Google Auth)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase getSession error:", error);
        }
        
        if (session) {
          // Sync session with the backend using POST /auth/google
          const res = await fetch("/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: session.access_token }),
          });
          
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
              localStorage.setItem("trado_token", result.data.token);
              const finalUser = {
                name: result.data.user.name,
                email: result.data.user.email,
                walletBalance: result.data.user.walletBalance,
                initialBalance: result.data.user.initialBalance,
                onboardingCompleted: result.data.user.onboardingCompleted,
                googlePicture: result.data.user.googlePicture,
              };
              setUser(finalUser);
              
              // Clean up the URL hash
              if (window.history.replaceState) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
              }
              
              setActiveView(result.redirectTo === "/dashboard" ? "dashboard" : "onboarding");
              setIsAuthInitialized(true);
              setAuthLoading(false);
              return;
            }
          }
        }

        // 2. If no Supabase session, check trado_token
        const localToken = localStorage.getItem("trado_token");
        if (localToken) {
          const res = await fetch("/auth/me", {
            headers: {
              "Authorization": `Bearer ${localToken}`,
            },
          });
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data?.user) {
              const finalUser = {
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
              return;
            }
          }
          // If token verification fails, clear session details
          localStorage.removeItem("trado_token");
          setUser(null);
          setActiveView("landing");
        } else {
          // No session and no local token
          const path = window.location.pathname;
          if (path === '/register') setActiveView('register');
          else if (path === '/login') setActiveView('signin');
          else setActiveView('landing');
        }
      } catch (err) {
        console.error("Initialization of authentication failed:", err);
      } finally {
        setAuthLoading(false);
        setIsAuthInitialized(true);
      }
    };

    // Listen for auth state changes which trigger on startup automatically (INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        initAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("trado_token");
        setActiveView("landing");
        setIsAuthInitialized(true);
        setAuthLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        // Handle startup when no active Supabase session exists
        initAuth();
      }
    });
 
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simulate Stock Market Ticks (Price fluctuations)
  // Fetch Real Stock Market Data (NSE Nifty 25) via Yahoo Finance every 30 seconds
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const response = await fetch("/api/nifty25");
        const data = await response.json();

        const formattedStocks = data.map((stock: any) => ({
          id: stock.symbol,
          symbol: stock.symbol.replace(".NS", ""),
          name: stock.name,
          price: stock.price,
          change:
            ((stock.price - stock.previousClose) / stock.previousClose) * 100,
          high: stock.high,
          low: stock.low,
          volume: stock.volume,

          marketCap: "-",
          peRatio: "-",
          high52: stock.high,
          low52: stock.low,
          sector: "NSE",
          description: stock.name,

          history: [stock.low, stock.previousClose, stock.price, stock.high],
        }));

        setStocks(formattedStocks);
      } catch (err) {
        console.error(err);
      }
    };

    loadStocks();
    const interval = setInterval(loadStocks, 30000); // 30 seconds update interval

    return () => clearInterval(interval);
  }, []);

  // Recalculate Portfolio Holdings whenever stocks update
  useEffect(() => {
    if (holdings.length === 0) return;

    setHoldings((prevHoldings) => {
      let updated = false;
      const newHoldings = prevHoldings.map((holding) => {
        const liveStock = stocks.find((s) => s.id === holding.stockId);
        if (!liveStock) return holding;

        const currentPrice = liveStock.price;
        const currentValue = Math.round(holding.quantity * currentPrice * 100) / 100;
        const profitLoss = Math.round((currentValue - holding.totalCost) * 100) / 100;
        const profitLossPercentage = holding.totalCost > 0
            ? Math.round((profitLoss / holding.totalCost) * 10000) / 100
            : 0;

        if (holding.currentPrice !== currentPrice) {
          updated = true;
          return {
            ...holding,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
          };
        }
        return holding;
      });

      return updated ? newHoldings : prevHoldings;
    });
  }, [stocks]);

  // Auth Functions
  const registerUser = (name: string, email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        name,
        email,
        walletBalance: 1000000,
        initialBalance: 1000000,
        onboardingCompleted: false,
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
        email,
        walletBalance: 1000000,
        initialBalance: 1000000,
        onboardingCompleted: false,
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
      name,
      email,
      walletBalance: 1000000,
      initialBalance: 1000000,
      onboardingCompleted: false,
      googlePicture: picture,
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
  };

  const completeOnboarding = async (prefs: OnboardingPreferences) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("trado_token");
      const res = await fetch("/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(prefs)
      });
      if (res.ok) {
        const updatedUser = { ...user, onboardingCompleted: true };
        setUser(updatedUser);
        setActiveView("dashboard");
      }
    } catch (e) {
      console.error("Onboarding failed:", e);
      // Fallback for demo
      const updatedUser = { ...user, onboardingCompleted: true };
      setUser(updatedUser);
      setActiveView("dashboard");
    }
  };

  const buyStock = (stockId: string, quantity: number) => {
    if (!user) return { success: false, message: "Please sign in." };
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return { success: false, message: "Stock not found." };
    const totalCost = Math.round(stock.price * quantity * 100) / 100;
    if (user.walletBalance < totalCost) return { success: false, message: "Insufficient balance." };

    const newBalance = Math.round((user.walletBalance - totalCost) * 100) / 100;
    setUser({ ...user, walletBalance: newBalance });

    let updatedHoldings = [...holdings];
    const existingIdx = updatedHoldings.findIndex((h) => h.stockId === stockId);
    if (existingIdx >= 0) {
      const h = updatedHoldings[existingIdx];
      const newQty = h.quantity + quantity;
      const newCost = h.totalCost + totalCost;
      updatedHoldings[existingIdx] = { ...h, quantity: newQty, totalCost: newCost, avgPrice: newCost / newQty };
    } else {
      updatedHoldings.push({ stockId, symbol: stock.symbol, name: stock.name, quantity, totalCost, avgPrice: stock.price, currentPrice: stock.price, currentValue: totalCost, profitLoss: 0, profitLossPercentage: 0 });
    }
    setHoldings(updatedHoldings);

    const tx: Transaction = { id: Math.random().toString(36).substr(2, 9), type: "BUY", stockId, symbol: stock.symbol, name: stock.name, quantity, price: stock.price, totalAmount: totalCost, remainingBalance: newBalance, timestamp: new Date().toISOString() };
    setTransactions([tx, ...transactions]);
    return { success: true, message: `Bought ${quantity} shares of ${stock.symbol}` };
  };

  const sellStock = (stockId: string, quantity: number) => {
    if (!user) return { success: false, message: "Please sign in." };
    const stock = stocks.find((s) => s.id === stockId);
    const hIdx = holdings.findIndex((h) => h.stockId === stockId);
    if (hIdx < 0 || holdings[hIdx].quantity < quantity) return { success: false, message: "Insufficient shares." };

    const revenue = Math.round(stock!.price * quantity * 100) / 100;
    const newBalance = Math.round((user.walletBalance + revenue) * 100) / 100;
    setUser({ ...user, walletBalance: newBalance });

    let updatedHoldings = [...holdings];
    if (updatedHoldings[hIdx].quantity === quantity) {
      updatedHoldings.splice(hIdx, 1);
    } else {
      const h = updatedHoldings[hIdx];
      const newQty = h.quantity - quantity;
      const reduction = h.totalCost * (quantity / h.quantity);
      updatedHoldings[hIdx] = { ...h, quantity: newQty, totalCost: h.totalCost - reduction };
    }
    setHoldings(updatedHoldings);

    const tx: Transaction = { id: Math.random().toString(36).substr(2, 9), type: "SELL", stockId, symbol: stock!.symbol, name: stock!.name, quantity, price: stock!.price, totalAmount: revenue, remainingBalance: newBalance, timestamp: new Date().toISOString() };
    setTransactions([tx, ...transactions]);
    return { success: true, message: `Sold ${quantity} shares of ${stock!.symbol}` };
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("trado_token");
      if (token) await fetch("/auth/logout", { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
      await supabase.auth.signOut();
    } catch {}
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
    localStorage.removeItem("stockeasy_holdings");
    localStorage.removeItem("stockeasy_transactions");
  };

  const addMoney = (amount: number) => setUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null);
  const resetMoney = () => setUser(prev => prev ? { ...prev, walletBalance: 1000000 } : null);

  return (
    <AppContext.Provider
      value={{
        user, stocks, holdings, transactions, isLoading, authLoading, isAuthInitialized, activeView,
        selectedStockId, registerUser, loginUser, loginWithGoogleUser, loginUserFromResponse,
        completeOnboarding, buyStock, sellStock, logout, resetAllData, addMoney, resetMoney,
        setActiveView, setSelectedStockId,
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
