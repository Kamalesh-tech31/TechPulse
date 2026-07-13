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
  const [user, setUser] = useState<UserProfile | null>(null);

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
      setIsLoading(true);
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
            
            // Clean up the URL hash so it looks clean
            if (window.history.replaceState) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            
            if (result.redirectTo === "/dashboard") {
              setActiveView("dashboard");
            } else {
              setActiveView("onboarding");
            }
            setAuthLoading(false);
            setIsLoading(false);
            return;
          }
        }

        // 2. If no Supabase session, check if there is an active backend trado_token
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
              if (finalUser.onboardingCompleted) {
                setActiveView("dashboard");
              } else {
                setActiveView("onboarding");
              }
              setAuthLoading(false);
              setIsLoading(false);
              return;
            }
          }
          // If token verification fails, clear session details
          localStorage.removeItem("trado_token");
          setUser(null);
          setActiveView("landing");
        } else {
          // No session and no local token, so they are unauthenticated
          setUser(null);
          // If they are on register/login page, keep the view. Otherwise reset to landing.
          const path = window.location.pathname;
          if (path === '/register') setActiveView('register');
          else if (path === '/login') setActiveView('signin');
          else setActiveView('landing');
        }
      } catch (err) {
        console.error("Initialization of authentication failed:", err);
      } finally {
        setAuthLoading(false);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        initAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simulate Stock Market Ticks (Price fluctuations)
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          // Fluctuates between -0.4% and +0.4%
          const pctChange = (Math.random() * 0.8 - 0.4) / 100;
          const priceDiff = stock.price * pctChange;
          const newPrice = Math.round((stock.price + priceDiff) * 100) / 100;

          // Re-evaluate high and low
          const newHigh = newPrice > stock.high ? newPrice : stock.high;
          const newLow = newPrice < stock.low ? newPrice : stock.low;

          // Calculate net day percentage change from the base historical price
          const basePrice = stock.history[0] || stock.price;
          const totalChange =
            Math.round(((newPrice - basePrice) / basePrice) * 10000) / 100;

          // Rolling 7-day history updates slowly
          let updatedHistory = [...stock.history];
          if (Math.random() > 0.85) {
            updatedHistory.shift();
            updatedHistory.push(newPrice);
          } else {
            updatedHistory[updatedHistory.length - 1] = newPrice;
          }

          return {
            ...stock,
            price: newPrice,
            change: totalChange,
            high: newHigh,
            low: newLow,
            history: updatedHistory,
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Recalculate Portfolio Holdings whenever stock prices change
  useEffect(() => {
    if (holdings.length === 0) return;

    setHoldings((prevHoldings) => {
      let updated = false;
      const newHoldings = prevHoldings.map((holding) => {
        const liveStock = stocks.find((s) => s.id === holding.stockId);
        if (!liveStock) return holding;

        const currentPrice = liveStock.price;
        const currentValue =
          Math.round(holding.quantity * currentPrice * 100) / 100;
        const profitLoss =
          Math.round((currentValue - holding.totalCost) * 100) / 100;
        const profitLossPercentage =
          holding.totalCost > 0
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
        walletBalance: 1000000, // ₹1,000,000 starting virtual capital
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
    // Simple check: if they exist in localStorage or we auto-restore
    const saved = localStorage.getItem("stockeasy_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        setTimeout(() => {
          setUser(parsed);
          setActiveView(
            parsed.onboardingCompleted ? "dashboard" : "onboarding",
          );
          setIsLoading(false);
        }, 800);
        return true;
      }
    }
    // Fallback: If no account exists, we create one instantly for seamless experience
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

  const loginWithGoogleUser = (
    name: string,
    email: string,
    picture?: string,
  ) => {
    setIsLoading(true);
    const saved = localStorage.getItem("stockeasy_user");
    let finalUser: UserProfile;

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        finalUser = {
          ...parsed,
          name: name || parsed.name,
          googlePicture: picture || parsed.googlePicture,
        };
      } else {
        finalUser = {
          name,
          email,
          walletBalance: 1000000,
          initialBalance: 1000000,
          onboardingCompleted: false,
          googlePicture: picture,
        };
      }
    } else {
      finalUser = {
        name,
        email,
        walletBalance: 1000000,
        initialBalance: 1000000,
        onboardingCompleted: false,
        googlePicture: picture,
      };
    }

    setUser(finalUser);
    localStorage.setItem("stockeasy_user", JSON.stringify(finalUser));

    if (finalUser.onboardingCompleted) {
      setActiveView("dashboard");
    } else {
      setActiveView("onboarding");
    }
    setIsLoading(false);
  };

  /**
   * loginUserFromResponse — the canonical way to log in a user from any
   * backend endpoint (email+OTP, email+password, or Google OAuth).
   * Unlike loginWithGoogleUser, this function:
   *  - Uses the backend-returned walletBalance (not hardcoded)
   *  - Sets the user synchronously (no setTimeout)
   *  - Does NOT guess onboardingCompleted from localStorage
   */
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
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          occupation: prefs.occupation,
          experience: prefs.experience,
          primaryGoal: prefs.primaryGoal
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => prev ? { ...prev, onboarding: prefs, onboardingCompleted: true } : null);
      } else {
        // Fallback: set local state even if backend call failed
        setUser(prev => prev ? { ...prev, onboarding: prefs, onboardingCompleted: true } : null);
      }
    } catch {
      // Fallback: persist locally
      setUser(prev => prev ? { ...prev, onboarding: prefs, onboardingCompleted: true } : null);
    } finally {
      setActiveView("dashboard");
    }
  };

  // Trading Simulator Core Functions
  const buyStock = (
    stockId: string,
    quantity: number,
  ): { success: boolean; message: string } => {
    if (!user)
      return { success: false, message: "You must be signed in to trade." };
    if (quantity <= 0)
      return { success: false, message: "Quantity must be greater than zero." };

    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return { success: false, message: "Stock not found." };

    const totalCost = Math.round(stock.price * quantity * 100) / 100;
    if (user.walletBalance < totalCost) {
      return {
        success: false,
        message: `Insufficient virtual funds. Required: ₹${totalCost.toLocaleString()}, Available: ₹${user.walletBalance.toLocaleString()}`,
      };
    }

    // Deduct wallet balance
    const newBalance = Math.round((user.walletBalance - totalCost) * 100) / 100;
    setUser((prev) => (prev ? { ...prev, walletBalance: newBalance } : null));

    // Update holdings
    let existingHoldingIndex = holdings.findIndex((h) => h.stockId === stockId);
    let updatedHoldings = [...holdings];

    if (existingHoldingIndex >= 0) {
      const existing = holdings[existingHoldingIndex];
      const newQty = existing.quantity + quantity;
      const newTotalCost = existing.totalCost + totalCost;
      const avgPrice = Math.round((newTotalCost / newQty) * 100) / 100;
      const currentValue = Math.round(newQty * stock.price * 100) / 100;
      const profitLoss = Math.round((currentValue - newTotalCost) * 100) / 100;
      const profitLossPct =
        Math.round((profitLoss / newTotalCost) * 10000) / 100;

      updatedHoldings[existingHoldingIndex] = {
        ...existing,
        quantity: newQty,
        totalCost: newTotalCost,
        avgPrice,
        currentValue,
        profitLoss,
        profitLossPercentage: profitLossPct,
      };
    } else {
      updatedHoldings.push({
        stockId,
        symbol: stock.symbol,
        name: stock.name,
        avgPrice: stock.price,
        quantity,
        totalCost,
        currentPrice: stock.price,
        currentValue: totalCost,
        profitLoss: 0,
        profitLossPercentage: 0,
      });
    }
    setHoldings(updatedHoldings);

    // Create buy transaction record
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "BUY",
      stockId,
      symbol: stock.symbol,
      name: stock.name,
      quantity,
      price: stock.price,
      totalAmount: totalCost,
      remainingBalance: newBalance,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [transaction, ...prev]);

    return {
      success: true,
      message: `Successfully bought ${quantity} shares of ${stock.symbol}!`,
    };
  };

  const sellStock = (
    stockId: string,
    quantity: number,
  ): { success: boolean; message: string } => {
    if (!user)
      return { success: false, message: "You must be signed in to trade." };
    if (quantity <= 0)
      return { success: false, message: "Quantity must be greater than zero." };

    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return { success: false, message: "Stock not found." };

    const holdingIndex = holdings.findIndex((h) => h.stockId === stockId);
    if (holdingIndex < 0 || holdings[holdingIndex].quantity < quantity) {
      return {
        success: false,
        message: `Insufficient stock quantity. You own ${holdingIndex >= 0 ? holdings[holdingIndex].quantity : 0} shares.`,
      };
    }

    const holding = holdings[holdingIndex];
    const totalRevenue = Math.round(stock.price * quantity * 100) / 100;

    // Add to wallet balance
    const newBalance =
      Math.round((user.walletBalance + totalRevenue) * 100) / 100;
    setUser((prev) => (prev ? { ...prev, walletBalance: newBalance } : null));

    // Update holdings
    let updatedHoldings = [...holdings];
    if (holding.quantity === quantity) {
      // Sold everything
      updatedHoldings.splice(holdingIndex, 1);
    } else {
      const remainingQty = holding.quantity - quantity;
      // Pro-rate total cost
      const percentageSold = quantity / holding.quantity;
      const totalCostReduction = holding.totalCost * percentageSold;
      const remainingCost =
        Math.round((holding.totalCost - totalCostReduction) * 100) / 100;
      const currentValue = Math.round(remainingQty * stock.price * 100) / 100;
      const profitLoss = Math.round((currentValue - remainingCost) * 100) / 100;
      const profitLossPct =
        remainingCost > 0
          ? Math.round((profitLoss / remainingCost) * 10000) / 100
          : 0;

      updatedHoldings[holdingIndex] = {
        ...holding,
        quantity: remainingQty,
        totalCost: remainingCost,
        currentValue,
        profitLoss,
        profitLossPercentage: profitLossPct,
      };
    }
    setHoldings(updatedHoldings);

    // Create sell transaction record
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "SELL",
      stockId,
      symbol: stock.symbol,
      name: stock.name,
      quantity,
      price: stock.price,
      totalAmount: totalRevenue,
      remainingBalance: newBalance,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [transaction, ...prev]);

    return {
      success: true,
      message: `Successfully sold ${quantity} shares of ${stock.symbol}!`,
    };
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("trado_token");
      if (token) {
        await fetch("/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch { /* silent fail */ }
    try {
      await supabase.auth.signOut();
    } catch { /* silent fail */ }
    localStorage.removeItem("trado_token");
    setUser(null);
    setHoldings([]);
    setTransactions([]);
    setActiveView("landing");
  };

  const resetAllData = () => {
    if (!user) return;
    const resetUser: UserProfile = {
      ...user,
      walletBalance: 1000000,
      initialBalance: 1000000,
    };
    setUser(resetUser);
    setHoldings([]);
    setTransactions([]);
    setStocks(INITIAL_STOCKS);
    localStorage.removeItem("stockeasy_stocks");
    localStorage.removeItem("stockeasy_holdings");
    localStorage.removeItem("stockeasy_transactions");
    setActiveView("dashboard");
  };

  const addMoney = (amount: number) => {
    setUser((prev) =>
      prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null,
    );
  };

  const resetMoney = () => {
    setUser((prev) => (prev ? { ...prev, walletBalance: 1000000 } : null));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        stocks,
        holdings,
        transactions,
        isLoading,
        authLoading,
        activeView,
        selectedStockId,
        registerUser,
        loginUser,
        loginWithGoogleUser,
        loginUserFromResponse,
        completeOnboarding,
        buyStock,
        sellStock,
        logout,
        resetAllData,
        addMoney,
        resetMoney,
        setActiveView,
        setSelectedStockId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
