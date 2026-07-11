export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number; // percentage change, e.g. +1.5 or -2.3
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  high52: number;
  low52: number;
  history: number[]; // Array of last 7 days of closing prices for mini charts
  description: string;
}

export interface Holding {
  stockId: string;
  symbol: string;
  name: string;
  avgPrice: number;
  quantity: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  totalAmount: number;
  remainingBalance: number;
  timestamp: string; // ISO String
}

export interface OnboardingPreferences {
  occupation: 'Student' | 'Professional';
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryGoal: 'Learning' | 'Stock Analysis' | 'Virtual Trading' | 'Portfolio Improvement';
}

export interface UserProfile {
  name: string;
  email: string;
  walletBalance: number;
  initialBalance: number;
  onboardingCompleted: boolean;
  onboarding?: OnboardingPreferences;
  googlePicture?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Lesson {
  title: string;
  category: string;
  level: string;
  content: string;
  summary: string;
  keywords: string[];
}

export interface PortfolioAnalysis {
  riskScore: number; // 1-100
  riskCategory: 'Low' | 'Medium' | 'High';
  diversificationScore: number; // 1-100
  diversificationAnalysis: string;
  sectorAllocation: { sector: string; percentage: number; value: number }[];
  topPerforming: { symbol: string; gain: number }[];
  worstPerforming: { symbol: string; loss: number }[];
  recommendations: string[];
  explanation: string;
}
