import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Stock,
  Holding,
  Transaction,
  UserProfile,
  OnboardingPreferences,
} from "./types";
import { INITIAL_STOCKS } from "./mockData";

interface AppContextType {
  user: UserProfile | null;
  stocks: Stock[];
  holdings: Holding[];
  transactions: Transaction[];
  isLoading: boolean;
  activeView: string;
  selectedStockId: string | null;
  registerUser: (name: string, email: string) => void;
  loginUser: (email: string) => boolean;
  loginWithGoogleUser: (name: string, email: string, picture?: string) => void;
  completeOnboarding: (prefs: OnboardingPreferences) => void;
  buyStock: (
    stockId: string,
    quantity: number,
  ) => { success: boolean; message: string };
  sellStock: (
    stockId: string,
    quantity: number,
  ) => { success: boolean; message: string };
  logout: () => void;
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

  // Simulate Stock Market Ticks (Price fluctuations)
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const response = await fetch("/api/nifty25");
        const data = await response.json();

        const formattedStocks = data.map((stock: any) => ({
          id: stock.info.symbol,
          symbol: stock.info.symbol,
          name: stock.info.companyName,
          price: stock.priceInfo.lastPrice,
          change: stock.priceInfo.pChange,
          high: stock.priceInfo.intraDayHighLow.max,
          low: stock.priceInfo.intraDayHighLow.min,
          volume: stock.securityInfo?.issuedSize || 0,
        }));

        setStocks(formattedStocks);

        // We'll convert this data into your Stock objects next.
      } catch (err) {
        console.error(err);
      }
    };

    loadStocks();

    const interval = setInterval(loadStocks, 15000);

    return () => clearInterval(interval);
  }, []);

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

  const completeOnboarding = (prefs: OnboardingPreferences) => {
    if (!user) return;
    const updated = {
      ...user,
      onboarding: prefs,
      onboardingCompleted: true,
    };
    setUser(updated);
    setActiveView("dashboard");
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

  const logout = () => {
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
        activeView,
        selectedStockId,
        registerUser,
        loginUser,
        loginWithGoogleUser,
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
