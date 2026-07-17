// ─── EXISTING TYPES (unchanged) ──────────────────────────────────────────────

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  high52: number;
  low52: number;
  history: number[];
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
  timestamp: string;
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

// Legacy basic analysis type (kept for backward compatibility)
export interface PortfolioAnalysis {
  riskScore: number;
  riskCategory: 'Low' | 'Medium' | 'High';
  diversificationScore: number;
  diversificationAnalysis: string;
  sectorAllocation: { sector: string; percentage: number; value: number }[];
  topPerforming: { symbol: string; gain: number }[];
  worstPerforming: { symbol: string; loss: number }[];
  recommendations: string[];
  explanation: string;
}

// ─── NEW AI SUBSYSTEM TYPES ───────────────────────────────────────────────────

export interface MetricCard {
  key: string;
  label: string;
  value: string | number;
  raw: number;
  unit: string;
  definition: string;
  formula: string;
  interpretation: string;
  importance: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  score?: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdingCount: number;
  color: string;
}

export interface FullPortfolioAnalysis {
  totalPortfolioValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  cashBalance: number;
  totalNetWorth: number;
  portfolioReturn: number;
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  annualizedReturn: number;
  expectedCAGR: number;
  portfolioBeta: number;
  portfolioVolatility: number;
  standardDeviation: number;
  maxDrawdown: number;
  valueAtRisk: number;
  sharpeRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
  diversificationScore: number;
  concentrationRisk: number;
  sectorConcentration: number;
  largestHoldingPct: number;
  herfindahlIndex: number;
  riskScore: number;
  healthScore: number;
  liquidityScore: number;
  growthScore: number;
  valueScore: number;
  incomeScore: number;
  performanceScore: number;
  confidenceScore: number;
  sectorAllocation: SectorAllocation[];
  topPerforming: { symbol: string; gain: number; value: number }[];
  worstPerforming: { symbol: string; loss: number; value: number }[];
  capitalAllocation: { symbol: string; percentage: number; value: number }[];
  riskLabel: string;
  riskCategory: string;
  metrics: MetricCard[];
}

export interface RiskFactor {
  name: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  description: string;
  detail: string;
}

export interface RiskProfile {
  score: number;
  label: string;
  tier: 1 | 2 | 3 | 4 | 5;
  color: string;
  emoji: string;
  factors: RiskFactor[];
  summary: string;
  warnings: string[];
  positives: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  action: string;
  reason: string;
  supportingData: string;
  advantages: string[];
  disadvantages: string[];
  expectedImpact: string;
  icon: string;
}

export interface PortfolioReport {
  generatedAt: string;
  executiveSummary: string;
  portfolioOverview: string;
  performanceAnalysis: string;
  riskAnalysis: string;
  diversificationAnalysis: string;
  sectorAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  investmentOpportunities: string;
  portfolioHealthScore: string;
  educationalNotes: string;
  beginnerTips: string[];
  proTips: string[];
  monitoringSuggestions: string[];
  disclaimer: string;
  rawMetrics: {
    riskScore: number;
    healthScore: number;
    diversificationScore: number;
    sharpeRatio: number;
    portfolioBeta: number;
    maxDrawdown: number;
    totalProfitLossPct: number;
    portfolioReturn: number;
    sectorConcentration: number;
    volatility: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface AIAnalysisResult {
  analysis: FullPortfolioAnalysis;
  riskProfile: RiskProfile;
  recommendations: Recommendation[];
}

export interface AIReportResult extends AIAnalysisResult {
  report: PortfolioReport;
}
