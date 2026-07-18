/**
 * ai/recommendationEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligent Recommendation Engine for portfolio optimization.
 *
 * Each recommendation includes:
 *   • title       — Short, actionable title
 *   • priority    — 'critical' | 'high' | 'medium' | 'low'
 *   • category    — What type of issue it addresses
 *   • issue       — The specific problem detected (with metrics)
 *   • action      — The recommended action
 *   • reason      — Educational explanation of WHY
 *   • supportingData — The actual numbers that triggered this recommendation
 *   • advantages  — Benefits of following the recommendation
 *   • disadvantages — Trade-offs to consider
 *   • expectedImpact — Projected effect on portfolio metrics
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { FullPortfolioAnalysis } from './portfolioEngine';
import type { RiskProfile } from './riskEngine';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'diversification' | 'risk' | 'allocation' | 'performance' | 'income' | 'defensive' | 'liquidity';
  issue: string;
  action: string;
  reason: string;
  supportingData: string;
  advantages: string[];
  disadvantages: string[];
  expectedImpact: string;
  icon: string; // Emoji icon for UI
}

// ─── RECOMMENDATION DETECTORS ─────────────────────────────────────────────────

/**
 * Detect over-concentration in a single sector.
 * Trigger: Top sector > 50% of portfolio value.
 */
function detectSectorOverconcentration(
  analysis: FullPortfolioAnalysis
): Recommendation | null {
  const topSector = analysis.sectorAllocation[0];
  if (!topSector || topSector.percentage < 50) return null;

  const isExtreme = topSector.percentage > 70;

  return {
    id: 'sector-overconcentration',
    title: `Reduce ${topSector.sector} Exposure`,
    priority: isExtreme ? 'critical' : 'high',
    category: 'diversification',
    issue: `Your portfolio has ${topSector.percentage.toFixed(1)}% concentrated in ${topSector.sector}. This is ${isExtreme ? 'dangerously' : 'significantly'} above the recommended maximum of 35%.`,
    action: `Reduce ${topSector.sector} allocation to below 35% by reallocating into underrepresented sectors such as Healthcare, Consumer Goods, or FMCG.`,
    reason: `Sector concentration is one of the most dangerous forms of portfolio risk. When a sector faces regulatory headwinds, economic cycles, or industry-specific news, all stocks in that sector tend to fall together — eliminating the benefit of holding multiple stocks. Harry Markowitz's Modern Portfolio Theory shows that adding uncorrelated assets lowers portfolio risk without necessarily reducing expected returns.`,
    supportingData: `Current ${topSector.sector} allocation: ${topSector.percentage.toFixed(1)}%. Recommended maximum: 35%. Excess exposure: ${(topSector.percentage - 35).toFixed(1)}%.`,
    advantages: [
      'Reduces sector-specific risk (regulatory, cyclical, competitive)',
      'Improves Sharpe Ratio by diversifying risk sources',
      'Protects against sector-wide downturns',
      'Aligns with Modern Portfolio Theory optimal diversification'
    ],
    disadvantages: [
      `May reduce upside if ${topSector.sector} continues to outperform`,
      'Rebalancing may trigger taxable events in a real portfolio (not applicable here)',
      'Requires research into new sectors'
    ],
    expectedImpact: `Reducing to 35% could improve your Diversification Score by 15-25 points and lower Volatility by approximately ${Math.round((topSector.percentage - 35) * 0.3)}%.`,
    icon: '⚖️'
  };
}

/**
 * Detect single-stock over-exposure.
 * Trigger: Largest holding > 30% of portfolio.
 */
function detectSingleStockOverexposure(
  analysis: FullPortfolioAnalysis
): Recommendation | null {
  if (analysis.largestHoldingPct < 30) return null;

  const topHolding = analysis.capitalAllocation[0];
  const isExtreme = analysis.largestHoldingPct > 50;

  return {
    id: 'single-stock-overexposure',
    title: `Trim ${topHolding?.symbol || 'Top'} Position`,
    priority: isExtreme ? 'critical' : 'high',
    category: 'risk',
    issue: `${topHolding?.symbol || 'Your largest holding'} represents ${analysis.largestHoldingPct.toFixed(1)}% of your portfolio. A 20% drop in this stock alone would reduce your total portfolio value by ${(analysis.largestHoldingPct * 0.2).toFixed(1)}%.`,
    action: `Trim ${topHolding?.symbol || 'the largest holding'} to no more than 20-25% of total portfolio value and redistribute proceeds across other sectors.`,
    reason: `Position sizing is a fundamental risk management principle. Professional fund managers typically cap individual positions at 5-10% for mutual funds, or 20-25% for concentrated value portfolios. Keeping a single stock above 30% creates "idiosyncratic risk" — the possibility of catastrophic loss due to company-specific events like earnings misses, fraud, or management changes.`,
    supportingData: `${topHolding?.symbol}: ${analysis.largestHoldingPct.toFixed(1)}% of portfolio (₹${topHolding?.value?.toLocaleString('en-IN') || 'N/A'}). Recommended maximum: 25%.`,
    advantages: [
      'Reduces single-company catastrophic loss risk',
      'Frees capital for uncorrelated opportunities',
      'Lowers portfolio standard deviation',
      'Better position sizing discipline'
    ],
    disadvantages: [
      `Could reduce returns if ${topHolding?.symbol || 'the stock'} continues its upward trend`,
      'Selling high-performers can feel counterintuitive',
      'Reduced exposure to a potentially strong conviction idea'
    ],
    expectedImpact: `Trimming to 25% could reduce your Maximum Drawdown risk by approximately ${Math.round((analysis.largestHoldingPct - 25) * 0.4)}% and improve your HHI score significantly.`,
    icon: '✂️'
  };
}

/**
 * Detect high portfolio beta.
 * Trigger: Portfolio beta > 1.3.
 */
function detectHighBeta(analysis: FullPortfolioAnalysis): Recommendation | null {
  if (analysis.portfolioBeta <= 1.3) return null;

  return {
    id: 'high-beta',
    title: 'Add Defensive Low-Beta Stocks',
    priority: analysis.portfolioBeta > 1.5 ? 'high' : 'medium',
    category: 'defensive',
    issue: `Your portfolio beta is ${analysis.portfolioBeta}, meaning it typically moves ${(analysis.portfolioBeta * 100 - 100).toFixed(0)}% more than the market in both directions. In a 20% market correction, your portfolio could fall ~${(analysis.portfolioBeta * 20).toFixed(1)}%.`,
    action: 'Allocate 15-20% of portfolio to defensive stocks (FMCG, Pharma, Utilities, Consumer Staples) with betas below 0.8 to balance overall portfolio beta closer to 1.0.',
    reason: 'Beta is a measure of systematic market risk. A high-beta portfolio amplifies both gains AND losses. Adding low-beta defensive stocks (companies with stable demand regardless of economic cycles, like FMCG and healthcare) acts as a natural hedge. This is called "beta balancing" in professional portfolio management.',
    supportingData: `Current portfolio beta: ${analysis.portfolioBeta}. Target: 0.9-1.1. Market average beta: 1.0. A Nifty 50 decline of 10% would impact your portfolio by approximately ${(analysis.portfolioBeta * 10).toFixed(1)}%.`,
    advantages: [
      'Reduces portfolio sensitivity to market swings',
      'Defensive stocks provide stability during bear markets',
      'Lowers annualized volatility',
      'Improves risk-adjusted returns (Sharpe Ratio)'
    ],
    disadvantages: [
      'May reduce returns during strong bull markets',
      'Defensive sectors typically grow slower',
      'Lower beta = lower market upside participation'
    ],
    expectedImpact: `Adding 20% defensive allocation could reduce portfolio beta by 0.15-0.25 and lower annualized volatility by 2-4%.`,
    icon: '🛡️'
  };
}

/**
 * Detect poor diversification (fewer than 4 sectors or holdings < 5).
 */
function detectPoorDiversification(analysis: FullPortfolioAnalysis): Recommendation | null {
  const sectorCount = analysis.sectorAllocation.length;
  const holdingCount = analysis.capitalAllocation.length;

  if (sectorCount >= 4 && holdingCount >= 5 && analysis.diversificationScore >= 50) return null;

  const isUnderheld = holdingCount < 5;

  return {
    id: 'poor-diversification',
    title: isUnderheld ? 'Expand Portfolio Holdings' : 'Improve Sector Diversification',
    priority: analysis.diversificationScore < 25 ? 'critical' : 'high',
    category: 'diversification',
    issue: isUnderheld
      ? `Portfolio has only ${holdingCount} holdings across ${sectorCount} sector(s). This is insufficient diversification.`
      : `Portfolio spans only ${sectorCount} sectors. Professional portfolios typically cover at least 5-7 sectors.`,
    action: isUnderheld
      ? `Gradually expand to 8-15 holdings across at least 4-5 different sectors using your available cash balance of ₹${analysis.cashBalance.toLocaleString('en-IN')}.`
      : `Add exposure to underrepresented sectors: Healthcare, FMCG, Infrastructure, Consumer Goods, or Pharmaceuticals.`,
    reason: `Diversification is the foundational principle of portfolio management. Eugene Fama's research shows that holding 15-20 uncorrelated stocks eliminates approximately 90% of idiosyncratic (company-specific) risk. The cost of diversification is minimal while the risk reduction benefit is significant.`,
    supportingData: `Current holdings: ${holdingCount} across ${sectorCount} sector(s). Diversification Score: ${analysis.diversificationScore}/100. Recommended: 10-20 holdings across 5-7 sectors.`,
    advantages: [
      'Dramatic reduction in company-specific risk',
      'Smoother portfolio value curve with lower drawdowns',
      'Access to multiple growth opportunities',
      'Better risk-adjusted performance over time'
    ],
    disadvantages: [
      'More positions to monitor and research',
      'Dilutes conviction ideas',
      'Returns converge toward market average ("diworsification" if overdone)'
    ],
    expectedImpact: `Expanding to 10+ holdings across 5+ sectors could improve Diversification Score by 25-40 points and reduce Volatility by 20-30%.`,
    icon: '🌐'
  };
}

/**
 * Detect negative Sharpe Ratio (risk not being compensated).
 */
function detectNegativeSharpe(analysis: FullPortfolioAnalysis): Recommendation | null {
  if (analysis.sharpeRatio >= 0.5) return null;

  return {
    id: 'negative-sharpe',
    title: 'Improve Risk-Adjusted Returns',
    priority: analysis.sharpeRatio < 0 ? 'high' : 'medium',
    category: 'performance',
    issue: `Your Sharpe Ratio is ${analysis.sharpeRatio}, meaning you are ${analysis.sharpeRatio < 0 ? 'losing money' : 'earning less than the risk-free rate'} relative to the volatility you are taking on. You would be better off in a risk-free government bond earning ~7.2%.`,
    action: 'Reassess underperforming positions. Consider replacing high-volatility losers with quality dividend-paying stocks or low-cost index funds.',
    reason: 'The Sharpe Ratio, developed by Nobel laureate William Sharpe, measures "return per unit of risk." A negative Sharpe Ratio means you are bearing significant market risk without the reward. The risk-free rate in India (10-year G-Sec) is approximately 7.2%. Any portfolio should aim to beat this after accounting for the risk taken.',
    supportingData: `Sharpe Ratio: ${analysis.sharpeRatio}. Risk-Free Rate used: 7.2%. Portfolio Return: ${analysis.portfolioReturn}%. Portfolio Volatility: ${analysis.portfolioVolatility}%.`,
    advantages: [
      'Better capital efficiency',
      'Higher return for each unit of risk taken',
      'Portfolio aligned with professional standards',
      'More sustainable long-term performance'
    ],
    disadvantages: [
      'May require selling underperformers (psychologically difficult)',
      'Quality stocks with good Sharpe Ratios may seem expensive',
      'Short-term performance may not improve immediately'
    ],
    expectedImpact: 'Targeting Sharpe Ratio above 1.0 would mean meaningfully outperforming the risk-free rate on a risk-adjusted basis.',
    icon: '📊'
  };
}

/**
 * Detect no cash reserve (fully invested with no dry powder).
 */
function detectNoCashReserve(analysis: FullPortfolioAnalysis): Recommendation | null {
  const totalNetWorth = analysis.totalNetWorth;
  const cashPct = totalNetWorth > 0 ? (analysis.cashBalance / totalNetWorth) * 100 : 0;

  if (cashPct >= 8) return null;

  return {
    id: 'no-cash-reserve',
    title: 'Maintain a Cash Buffer',
    priority: 'medium',
    category: 'liquidity',
    issue: `Your cash reserve is ${cashPct.toFixed(1)}% of total net worth (₹${analysis.cashBalance.toLocaleString('en-IN')}). Professional investors typically maintain 5-15% in cash for opportunistic buying.`,
    action: 'Consider maintaining 8-12% of your portfolio in cash to capitalize on market dips and avoid forced selling.',
    reason: `Cash is a strategic asset. It gives you "optionality" — the ability to buy stocks at a discount during market corrections without needing to sell other holdings. Warren Buffett famously maintains large cash reserves at Berkshire Hathaway. In virtual trading, this means always having capital ready for opportunities.`,
    supportingData: `Current cash: ₹${analysis.cashBalance.toLocaleString('en-IN')} (${cashPct.toFixed(1)}% of net worth). Recommended: 8-12%.`,
    advantages: [
      'Ability to buy the dip during market corrections',
      'Reduces need for forced selling at bad prices',
      'Psychological comfort during volatile markets',
      '"Dry powder" for new opportunities'
    ],
    disadvantages: [
      'Cash earns no return and loses to inflation in real portfolios',
      'Opportunity cost of not being fully invested in a bull market',
      'May create FOMO during strong rallies'
    ],
    expectedImpact: 'Maintaining an 8-10% cash buffer improves overall portfolio resilience and optionality score.',
    icon: '💰'
  };
}

/**
 * Detect missing defensive sectors (Healthcare, FMCG).
 */
function detectMissingDefensiveSectors(analysis: FullPortfolioAnalysis): Recommendation | null {
  const defensiveSectors = ['Healthcare', 'Pharmaceuticals', 'FMCG', 'Consumer Goods'];
  const hasSome = analysis.sectorAllocation.some(s =>
    defensiveSectors.some(d => s.sector.toLowerCase().includes(d.toLowerCase()))
  );

  if (hasSome || analysis.sectorAllocation.length < 2) return null;

  return {
    id: 'missing-defensive-sectors',
    title: 'Add Defensive Sector Holdings',
    priority: 'medium',
    category: 'defensive',
    issue: 'Your portfolio has no allocation to defensive sectors (Healthcare, FMCG, Consumer Staples). These sectors tend to outperform during economic downturns.',
    action: 'Allocate 10-15% to defensive sectors. Consider HDFC Bank (Financials), Sun Pharma (Healthcare), or Hindustan Unilever (FMCG).',
    reason: `Defensive sectors are businesses that sell essential goods and services — people buy medicine, food, and utilities regardless of economic conditions. Benjamin Graham's "margin of safety" principle recommends holding some defensive positions as portfolio insurance. During the COVID-19 market crash, pharma and FMCG stocks fell far less than cyclical sectors.`,
    supportingData: `Current defensive allocation: 0%. Sectors in portfolio: ${analysis.sectorAllocation.map(s => s.sector).join(', ')}.`,
    advantages: [
      'Reduces portfolio impact during bear markets and recessions',
      'Defensive stocks often pay steady dividends',
      'Lower beta contribution improves overall portfolio stability',
      'Counter-cyclical characteristics balance cyclical holdings'
    ],
    disadvantages: [
      'Defensive stocks grow slower in bull markets',
      'May underperform high-growth sectors in expansionary periods',
      'Can feel "boring" during strong market rallies'
    ],
    expectedImpact: 'Adding 15% defensive allocation could reduce portfolio beta by 0.1-0.15 and lower maximum drawdown risk.',
    icon: '🏥'
  };
}

// ─── MAIN RECOMMENDATION ENGINE FUNCTION ──────────────────────────────────────

/**
 * Runs all recommendation detectors and returns prioritized list.
 * Critical → High → Medium → Low
 *
 * @param analysis - Full portfolio analysis from portfolioEngine
 * @param riskProfile - Risk profile from riskEngine
 * @returns Sorted array of Recommendations
 */
export function generateRecommendations(
  analysis: FullPortfolioAnalysis,
  riskProfile: RiskProfile
): Recommendation[] {
  const detectors = [
    () => detectSingleStockOverexposure(analysis),
    () => detectSectorOverconcentration(analysis),
    () => detectHighBeta(analysis),
    () => detectPoorDiversification(analysis),
    () => detectNegativeSharpe(analysis),
    () => detectNoCashReserve(analysis),
    () => detectMissingDefensiveSectors(analysis),
  ];

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return detectors
    .map(detector => detector())
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
