/**
 * ai/riskEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Professional Risk Scoring System with 5-tier classification.
 *
 * RISK TIERS:
 *   0-20   → Very Safe   (Highly diversified, defensive, low beta)
 *   21-40  → Low Risk    (Diversified, moderate beta, low concentration)
 *   41-60  → Moderate    (Mixed portfolio, some concentration)
 *   61-80  → High Risk   (Concentrated, high beta, sector-heavy)
 *   81-100 → Very High Risk (Single sector, very high beta, over-concentrated)
 *
 * FACTORS & WEIGHTS:
 *   1. Portfolio Beta               (20%)
 *   2. Sector Concentration         (20%)
 *   3. Single-Stock Exposure        (20%)
 *   4. Diversification Quality      (15%)
 *   5. Volatility                   (10%)
 *   6. Maximum Drawdown             (10%)
 *   7. HHI (Concentration Index)    (5%)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { FullPortfolioAnalysis } from './portfolioEngine';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface RiskFactor {
  name: string;
  weight: number;       // 0-1 (percentage weight in final score)
  rawScore: number;     // 0-100 (individual factor risk score)
  weightedScore: number;// raw × weight
  description: string;  // Human-readable explanation
  detail: string;       // What specifically contributed to this score
}

export interface RiskProfile {
  score: number;        // 0-100
  label: string;        // 'Very Safe' | 'Low Risk' | 'Moderate' | 'High Risk' | 'Very High Risk'
  tier: 1 | 2 | 3 | 4 | 5;
  color: string;        // CSS hex color for UI
  emoji: string;
  factors: RiskFactor[];
  summary: string;      // One-sentence risk summary
  warnings: string[];   // Critical risk alerts
  positives: string[];  // Risk management positives
}

// ─── TIER DEFINITIONS ─────────────────────────────────────────────────────────

const RISK_TIERS = [
  { min: 0,  max: 20,  label: 'Very Safe',      tier: 1 as const, color: '#10b981', emoji: '🛡️' },
  { min: 21, max: 40,  label: 'Low Risk',        tier: 2 as const, color: '#3ecf8e', emoji: '✅' },
  { min: 41, max: 60,  label: 'Moderate',        tier: 3 as const, color: '#f59e0b', emoji: '⚖️' },
  { min: 61, max: 80,  label: 'High Risk',       tier: 4 as const, color: '#f97316', emoji: '⚠️' },
  { min: 81, max: 100, label: 'Very High Risk',  tier: 5 as const, color: '#f0576b', emoji: '🔴' },
];

function getTier(score: number) {
  return RISK_TIERS.find(t => score >= t.min && score <= t.max) || RISK_TIERS[2];
}

// ─── FACTOR CALCULATORS ────────────────────────────────────────────────────────

/**
 * Factor 1: Portfolio Beta Risk (weight: 20%)
 * Beta measures sensitivity to overall market moves.
 * β < 0.7 → Very low risk
 * β 0.7-1.0 → Low-moderate risk
 * β 1.0-1.3 → Moderate risk
 * β 1.3-1.6 → High risk
 * β > 1.6 → Very high risk
 */
function calcBetaRisk(beta: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (beta < 0.7) {
    rawScore = 10;
    detail = `Beta of ${beta} — portfolio moves significantly less than the market. Defensive.`;
  } else if (beta < 1.0) {
    rawScore = 25;
    detail = `Beta of ${beta} — portfolio slightly less volatile than the market.`;
  } else if (beta < 1.2) {
    rawScore = 45;
    detail = `Beta of ${beta} — portfolio moves roughly in line with the market.`;
  } else if (beta < 1.5) {
    rawScore = 70;
    detail = `Beta of ${beta} — portfolio is more volatile than the market by ${Math.round((beta - 1) * 100)}%.`;
  } else {
    rawScore = 90;
    detail = `Beta of ${beta} — portfolio is ${Math.round((beta - 1) * 100)}% more volatile than the market. Very aggressive.`;
  }

  const weight = 0.20;
  return {
    name: 'Market Beta Exposure',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'How much your portfolio amplifies or dampens market movements.',
    detail
  };
}

/**
 * Factor 2: Sector Concentration Risk (weight: 20%)
 * Single sector dominance dramatically increases systematic risk.
 * < 30% → Excellent diversification
 * 30-50% → Moderate concentration
 * 50-70% → High sector concentration
 * > 70% → Extremely concentrated
 */
function calcSectorConcentrationRisk(sectorConcentration: number, sectorCount: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (sectorConcentration < 30 && sectorCount >= 4) {
    rawScore = 15;
    detail = `Excellent sector balance — top sector is ${sectorConcentration}% with ${sectorCount} sectors covered.`;
  } else if (sectorConcentration < 40) {
    rawScore = 30;
    detail = `Good sector spread — top sector is ${sectorConcentration}% across ${sectorCount} sectors.`;
  } else if (sectorConcentration < 55) {
    rawScore = 55;
    detail = `Moderate sector concentration — ${sectorConcentration}% in top sector.`;
  } else if (sectorConcentration < 70) {
    rawScore = 75;
    detail = `High sector concentration — ${sectorConcentration}% in one sector. Sector-specific risk elevated.`;
  } else {
    rawScore = 95;
    detail = `Extreme sector concentration — ${sectorConcentration}% in one sector. Portfolio exposed to sector downturns.`;
  }

  const weight = 0.20;
  return {
    name: 'Sector Concentration',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'How evenly your holdings are spread across different business sectors.',
    detail
  };
}

/**
 * Factor 3: Single-Stock Exposure (weight: 20%)
 * A single stock dominating the portfolio is the most dangerous form of concentration.
 * < 15% → Low risk
 * 15-25% → Moderate
 * 25-40% → High
 * > 40% → Very high (potential catastrophic loss if stock crashes)
 */
function calcSingleStockRisk(largestHoldingPct: number, holdingCount: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (largestHoldingPct < 15) {
    rawScore = 10;
    detail = `Largest single holding is only ${largestHoldingPct}%. No single-stock risk concern.`;
  } else if (largestHoldingPct < 25) {
    rawScore = 30;
    detail = `Largest holding at ${largestHoldingPct}% — within acceptable bounds. Monitor closely.`;
  } else if (largestHoldingPct < 40) {
    rawScore = 60;
    detail = `Largest holding at ${largestHoldingPct}% — elevated single-stock risk. Consider rebalancing.`;
  } else if (largestHoldingPct < 60) {
    rawScore = 80;
    detail = `Largest holding at ${largestHoldingPct}%! A 20% fall in this stock removes ${Math.round(largestHoldingPct * 0.2)}% of portfolio value.`;
  } else {
    rawScore = 98;
    detail = `Extremely concentrated at ${largestHoldingPct}%! This is essentially a single-stock bet. Portfolio at maximum risk.`;
  }

  // Adjust slightly for total holding count
  const holdingBonus = holdingCount > 10 ? -5 : holdingCount > 5 ? 0 : 10;
  rawScore = Math.max(0, Math.min(100, rawScore + holdingBonus));

  const weight = 0.20;
  return {
    name: 'Single-Stock Exposure',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'Concentration risk from having too much in a single stock.',
    detail
  };
}

/**
 * Factor 4: Diversification Quality (weight: 15%)
 * Based on the diversification score from portfolioEngine.
 */
function calcDiversificationRisk(diversificationScore: number): RiskFactor {
  const rawScore = 100 - diversificationScore; // Invert: low diversification = high risk

  let detail: string;
  if (diversificationScore > 70) detail = `High diversification score of ${diversificationScore}/100 — risk is well spread.`;
  else if (diversificationScore > 50) detail = `Moderate diversification of ${diversificationScore}/100 — some improvement possible.`;
  else if (diversificationScore > 30) detail = `Poor diversification at ${diversificationScore}/100 — portfolio lacks spread.`;
  else detail = `Very poor diversification at ${diversificationScore}/100 — portfolio dangerously concentrated.`;

  const weight = 0.15;
  return {
    name: 'Diversification Quality',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'Quality of risk spread across different assets, sectors, and market caps.',
    detail
  };
}

/**
 * Factor 5: Portfolio Volatility (weight: 10%)
 * < 12% → Low volatility (bond-like)
 * 12-20% → Normal equity volatility
 * 20-30% → Elevated volatility
 * > 30% → High volatility (speculative)
 */
function calcVolatilityRisk(volatility: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (volatility < 12) {
    rawScore = 10;
    detail = `Low annualized volatility of ${volatility}% — very stable portfolio.`;
  } else if (volatility < 20) {
    rawScore = 30;
    detail = `Normal equity volatility of ${volatility}% — expected for a diversified stock portfolio.`;
  } else if (volatility < 28) {
    rawScore = 60;
    detail = `Elevated volatility of ${volatility}% — expect significant price swings.`;
  } else {
    rawScore = 85;
    detail = `High volatility of ${volatility}% — portfolio susceptible to sharp drawdowns.`;
  }

  const weight = 0.10;
  return {
    name: 'Portfolio Volatility',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'How much the portfolio value fluctuates over time.',
    detail
  };
}

/**
 * Factor 6: Maximum Drawdown Risk (weight: 10%)
 * Measures historical peak-to-trough loss.
 */
function calcDrawdownRisk(maxDrawdown: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (maxDrawdown < 5) {
    rawScore = 10;
    detail = `Low maximum drawdown of ${maxDrawdown}% — portfolio held up well during downturns.`;
  } else if (maxDrawdown < 15) {
    rawScore = 30;
    detail = `Moderate drawdown of ${maxDrawdown}% — within normal range for equity portfolios.`;
  } else if (maxDrawdown < 25) {
    rawScore = 60;
    detail = `Significant drawdown of ${maxDrawdown}% — portfolio experienced notable losses.`;
  } else {
    rawScore = 85;
    detail = `Severe drawdown of ${maxDrawdown}% — portfolio has experienced substantial losses.`;
  }

  const weight = 0.10;
  return {
    name: 'Maximum Drawdown',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'Maximum observed loss from peak to trough.',
    detail
  };
}

/**
 * Factor 7: HHI Concentration Risk (weight: 5%)
 * < 1500 → Competitive (diversified)
 * 1500-2500 → Moderate concentration
 * > 2500 → High concentration
 */
function calcHHIRisk(hhi: number): RiskFactor {
  let rawScore: number;
  let detail: string;

  if (hhi < 1000) {
    rawScore = 10;
    detail = `HHI of ${Math.round(hhi)} — excellent asset distribution (below market threshold of 1500).`;
  } else if (hhi < 1500) {
    rawScore = 25;
    detail = `HHI of ${Math.round(hhi)} — good distribution. Portfolio is considered competitive.`;
  } else if (hhi < 2500) {
    rawScore = 55;
    detail = `HHI of ${Math.round(hhi)} — moderate concentration. Some rebalancing advised.`;
  } else {
    rawScore = 80;
    detail = `HHI of ${Math.round(hhi)} — high concentration. Portfolio has dominant holdings.`;
  }

  const weight = 0.05;
  return {
    name: 'HHI Concentration Index',
    weight,
    rawScore,
    weightedScore: rawScore * weight,
    description: 'Herfindahl-Hirschman Index — academic measure of portfolio concentration.',
    detail
  };
}

// ─── WARNINGS & POSITIVES GENERATORS ─────────────────────────────────────────

function generateWarnings(analysis: FullPortfolioAnalysis, factors: RiskFactor[]): string[] {
  const warnings: string[] = [];

  if (analysis.largestHoldingPct > 35) {
    warnings.push(`⚠️ Single stock concentration at ${analysis.largestHoldingPct}% — a major collapse in this stock could severely damage your portfolio.`);
  }
  if (analysis.portfolioBeta > 1.4) {
    warnings.push(`⚠️ High portfolio beta of ${analysis.portfolioBeta} — your portfolio will fall harder than the market during corrections.`);
  }
  if (analysis.sectorConcentration > 60) {
    warnings.push(`⚠️ Sector concentration at ${analysis.sectorConcentration}% — you are heavily exposed to sector-specific news and regulations.`);
  }
  if (analysis.portfolioVolatility > 25) {
    warnings.push(`⚠️ Annualized volatility of ${analysis.portfolioVolatility}% — expect large daily price swings.`);
  }
  if (analysis.maxDrawdown > 20) {
    warnings.push(`⚠️ Maximum drawdown of ${analysis.maxDrawdown}% recorded — portfolio has suffered significant losses.`);
  }
  if (analysis.herfindahlIndex > 3000) {
    warnings.push(`⚠️ HHI of ${Math.round(analysis.herfindahlIndex)} indicates extremely high portfolio concentration by academic standards.`);
  }
  if (analysis.sharpeRatio < 0) {
    warnings.push(`⚠️ Negative Sharpe Ratio (${analysis.sharpeRatio}) — you are taking on risk without being adequately compensated with return.`);
  }

  return warnings;
}

function generatePositives(analysis: FullPortfolioAnalysis): string[] {
  const positives: string[] = [];

  if (analysis.sectorAllocation.length >= 4) {
    positives.push(`✅ Portfolio spans ${analysis.sectorAllocation.length} sectors — good sector diversification.`);
  }
  if (analysis.sharpeRatio > 1.0) {
    positives.push(`✅ Sharpe Ratio of ${analysis.sharpeRatio} — strong risk-adjusted returns.`);
  }
  if (analysis.portfolioBeta < 1.0) {
    positives.push(`✅ Defensive portfolio beta of ${analysis.portfolioBeta} — portfolio may outperform in market downturns.`);
  }
  if (analysis.diversificationScore > 65) {
    positives.push(`✅ High diversification score of ${analysis.diversificationScore}/100 — risk is well distributed.`);
  }
  if (analysis.largestHoldingPct < 20) {
    positives.push(`✅ No single stock exceeds 20% — healthy position sizing.`);
  }
  if (analysis.totalProfitLoss > 0) {
    positives.push(`✅ Portfolio is in profit at +${analysis.totalProfitLossPct}% — investments are performing positively.`);
  }

  return positives;
}

// ─── MAIN RISK ENGINE FUNCTION ────────────────────────────────────────────────

/**
 * Calculates the complete risk profile for a portfolio.
 * Returns a RiskProfile with score, tier, factors, and narrative.
 *
 * @param analysis - The full portfolio analysis from portfolioEngine
 * @returns Complete RiskProfile
 */
export function calculateRiskProfile(analysis: FullPortfolioAnalysis): RiskProfile {

  if (analysis.totalPortfolioValue === 0) {
    return {
      score: 0,
      label: 'No Holdings',
      tier: 1,
      color: '#8b93a7',
      emoji: '📋',
      factors: [],
      summary: 'No active positions detected. Risk analysis requires at least one holding.',
      warnings: [],
      positives: ['✅ Zero market exposure while holding cash — no investment risk.']
    };
  }

  // ── Calculate individual factors ──────────────────────────────────────────
  const factors: RiskFactor[] = [
    calcBetaRisk(analysis.portfolioBeta),
    calcSectorConcentrationRisk(analysis.sectorConcentration, analysis.sectorAllocation.length),
    calcSingleStockRisk(analysis.largestHoldingPct, analysis.capitalAllocation.length),
    calcDiversificationRisk(analysis.diversificationScore),
    calcVolatilityRisk(analysis.portfolioVolatility),
    calcDrawdownRisk(analysis.maxDrawdown),
    calcHHIRisk(analysis.herfindahlIndex)
  ];

  // ── Compute weighted total risk score ─────────────────────────────────────
  const totalWeightedScore = factors.reduce((sum, f) => sum + f.weightedScore, 0);
  const score = Math.round(Math.max(0, Math.min(100, totalWeightedScore)));

  // ── Determine tier ────────────────────────────────────────────────────────
  const tier = getTier(score);

  // ── Generate narrative elements ───────────────────────────────────────────
  const warnings = generateWarnings(analysis, factors);
  const positives = generatePositives(analysis);

  const summary = `Your portfolio scores ${score}/100 on the risk scale — classified as "${tier.label}". ` +
    `The primary risk driver is ${factors.sort((a, b) => b.rawScore - a.rawScore)[0].name.toLowerCase()}.`;

  return {
    score,
    label: tier.label,
    tier: tier.tier,
    color: tier.color,
    emoji: tier.emoji,
    factors,
    summary,
    warnings,
    positives
  };
}
