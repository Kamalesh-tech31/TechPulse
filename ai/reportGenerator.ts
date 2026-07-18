/**
 * ai/reportGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LLM-powered Portfolio Report Generator.
 *
 * Converts numerical metrics into a professional 14-section financial report.
 *
 * SECTIONS:
 *   1.  Executive Summary
 *   2.  Portfolio Overview
 *   3.  Performance Analysis
 *   4.  Risk Analysis
 *   5.  Diversification Analysis
 *   6.  Sector Analysis
 *   7.  Strengths
 *   8.  Weaknesses
 *   9.  Recommendations
 *   10. Investment Opportunities
 *   11. Portfolio Health Score
 *   12. Educational Notes
 *   13. Beginner Tips
 *   14. Future Monitoring Suggestions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { FullPortfolioAnalysis } from './portfolioEngine';
import type { RiskProfile } from './riskEngine';
import type { Recommendation } from './recommendationEngine';
import { PORTFOLIO_REPORT_SYSTEM } from './prompts';

// ─── TYPES ────────────────────────────────────────────────────────────────────

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
  // Raw data used to generate (for chatbot context)
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

// ─── FALLBACK REPORT GENERATOR (no LLM) ──────────────────────────────────────

/**
 * Generates a data-driven report without using LLM.
 * Produces professional text purely from the numerical analysis.
 */
export function generateFallbackReport(
  analysis: FullPortfolioAnalysis,
  risk: RiskProfile,
  recommendations: Recommendation[]
): PortfolioReport {
  const { totalPortfolioValue, totalInvested, totalProfitLoss, totalProfitLossPct,
    cashBalance, totalNetWorth, sharpeRatio, sortinoRatio, portfolioBeta,
    portfolioVolatility, maxDrawdown, diversificationScore, healthScore,
    sectorAllocation, capitalAllocation, topPerforming, worstPerforming,
    valueAtRisk, herfindahlIndex, expectedCAGR } = analysis;

  const topSector = sectorAllocation[0];
  const topHolding = capitalAllocation[0];
  const returnDirection = totalProfitLossPct >= 0 ? 'profit' : 'loss';
  const returnSign = totalProfitLossPct >= 0 ? '+' : '';

  return {
    generatedAt: new Date().toISOString(),

    executiveSummary: `Your virtual portfolio currently holds ₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} across ${capitalAllocation.length} stocks, with a total ${returnDirection} of ${returnSign}${totalProfitLossPct.toFixed(2)}% on your ₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })} investment. The portfolio is classified as **${risk.label}** with a risk score of ${risk.score}/100 and a health score of ${healthScore}/100. Your Sharpe Ratio of ${sharpeRatio} indicates ${sharpeRatio > 1 ? 'good' : sharpeRatio > 0 ? 'moderate' : 'poor'} risk-adjusted performance. ${recommendations.length > 0 ? `The AI has identified ${recommendations.length} key recommendation(s) to improve your portfolio's risk-return profile.` : 'No critical issues were detected.'} ⚠️ *All analysis is for educational purposes. This is a virtual simulation.*`,

    portfolioOverview: `**Total Net Worth**: ₹${totalNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (Portfolio + Cash)\n**Portfolio Value**: ₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n**Total Invested**: ₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n**Total P&L**: ${returnSign}₹${Math.abs(totalProfitLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${returnSign}${totalProfitLossPct.toFixed(2)}%)\n**Cash in Wallet**: ₹${cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n**Holdings Count**: ${capitalAllocation.length} stocks across ${sectorAllocation.length} sectors\n**Largest Position**: ${topHolding?.symbol || 'N/A'} (${topHolding?.percentage?.toFixed(1) || 0}% of portfolio)`,

    performanceAnalysis: `The portfolio has delivered a ${returnSign}${totalProfitLossPct.toFixed(2)}% return. Your top performer is **${topPerforming[0]?.symbol || 'N/A'}** at ${topPerforming[0]?.gain >= 0 ? '+' : ''}${topPerforming[0]?.gain?.toFixed(2) || 0}%, while **${worstPerforming[0]?.symbol || 'N/A'}** lags at ${worstPerforming[0]?.loss?.toFixed(2) || 0}%.\n\nThe **Sharpe Ratio** of ${sharpeRatio} ${sharpeRatio >= 1 ? 'indicates that you are being well-compensated for the risk you are taking — a score above 1.0 is considered good by professional standards.' : 'suggests there is room to improve risk-adjusted returns. A Sharpe below 0.5 means the portfolio is not delivering adequate return for the volatility carried.'}\n\nThe **Sortino Ratio** of ${sortinoRatio} focuses specifically on downside risk and shows ${sortinoRatio >= 1 ? 'good downside protection' : 'elevated downside volatility that needs attention'}.\n\n**Expected CAGR** projection based on current composition: **${expectedCAGR >= 0 ? '+' : ''}${expectedCAGR}% annually**.`,

    riskAnalysis: `**Risk Score**: ${risk.score}/100 — **${risk.label}** ${risk.emoji}\n\n${risk.summary}\n\n**Key Risk Factors:**\n${risk.factors.slice(0, 4).map(f => `• **${f.name}** (${(f.weight * 100).toFixed(0)}% weight): ${f.detail}`).join('\n')}\n\n**Portfolio Beta**: ${portfolioBeta} — ${portfolioBeta > 1.2 ? `portfolio is ${((portfolioBeta - 1) * 100).toFixed(0)}% more volatile than the market` : 'portfolio moves closely with the market'}\n\n**Annualized Volatility**: ${portfolioVolatility}%\n\n**Maximum Drawdown**: ${maxDrawdown}% — ${maxDrawdown < 10 ? 'low drawdown, portfolio has been stable' : maxDrawdown < 25 ? 'moderate drawdown risk' : 'significant drawdown — portfolio has experienced large losses'}\n\n**Value at Risk (95%, 1-day)**: ₹${Math.round(valueAtRisk).toLocaleString('en-IN')} — 95% chance of not losing more than this in a single trading day.`,

    diversificationAnalysis: `**Diversification Score**: ${diversificationScore}/100\n\nYour portfolio spans **${sectorAllocation.length} sectors** with a **Herfindahl Index (HHI)** of ${Math.round(herfindahlIndex)} (${herfindahlIndex < 1500 ? 'below the 1,500 threshold — well diversified' : herfindahlIndex < 2500 ? 'moderate concentration' : 'above 2,500 — highly concentrated'}).\n\n${diversificationScore > 70 ? '✅ Strong diversification — risk is well spread across multiple assets and sectors.' : diversificationScore > 40 ? '⚠️ Moderate diversification — there is room to improve sector and asset spread.' : '❌ Poor diversification — concentration risk is elevated. Adding stocks across more sectors would significantly improve risk management.'}\n\n**Largest Single Holding**: ${analysis.largestHoldingPct.toFixed(1)}% of portfolio ${analysis.largestHoldingPct > 30 ? '— exceeds the recommended 25% single-stock maximum.' : '— within acceptable bounds.'}`,

    sectorAnalysis: sectorAllocation.length > 0
      ? `**Sector Breakdown:**\n${sectorAllocation.map(s => `• **${s.sector}**: ${s.percentage.toFixed(1)}% (₹${s.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}) — ${s.holdingCount} stock(s)`).join('\n')}\n\n**Top Sector**: ${topSector?.sector} at ${topSector?.percentage.toFixed(1)}% ${topSector?.percentage > 50 ? '— this exceeds the recommended 35% maximum for a single sector. Consider rebalancing.' : '— within acceptable concentration levels.'}`
      : 'No sector data available — start by building a portfolio in the Virtual Trading section.',

    strengths: [
      ...(totalProfitLossPct > 0 ? [`✅ Portfolio is in profit at ${returnSign}${totalProfitLossPct.toFixed(2)}%`] : []),
      ...(sharpeRatio > 1 ? [`✅ Strong Sharpe Ratio of ${sharpeRatio} — good risk-adjusted returns`] : []),
      ...(sectorAllocation.length >= 4 ? [`✅ Exposure across ${sectorAllocation.length} sectors — good sector diversification`] : []),
      ...(portfolioBeta < 1 ? [`✅ Low beta of ${portfolioBeta} — portfolio is more defensive than the market`] : []),
      ...(analysis.largestHoldingPct < 25 ? [`✅ No single stock dominates — largest holding at ${analysis.largestHoldingPct.toFixed(1)}%`] : []),
      ...(diversificationScore > 65 ? [`✅ High diversification score of ${diversificationScore}/100`] : []),
      ...(cashBalance > 50000 ? [`✅ Healthy cash reserve of ₹${cashBalance.toLocaleString('en-IN')} for opportunistic buying`] : [])
    ].filter(Boolean).slice(0, 5),

    weaknesses: [
      ...(totalProfitLossPct < 0 ? [`❌ Portfolio is at a loss of ${totalProfitLossPct.toFixed(2)}%`] : []),
      ...(sharpeRatio < 0.5 ? [`❌ Low Sharpe Ratio of ${sharpeRatio} — inadequate risk-adjusted returns`] : []),
      ...(analysis.largestHoldingPct > 35 ? [`❌ Single stock concentration: ${analysis.largestHoldingPct.toFixed(1)}% in one position`] : []),
      ...(topSector?.percentage > 50 ? [`❌ High sector concentration: ${topSector.percentage.toFixed(1)}% in ${topSector.sector}`] : []),
      ...(portfolioBeta > 1.4 ? [`❌ High portfolio beta of ${portfolioBeta} — amplifies market losses`] : []),
      ...(maxDrawdown > 20 ? [`❌ Maximum drawdown of ${maxDrawdown}% — portfolio has suffered significant losses`] : []),
      ...(diversificationScore < 40 ? [`❌ Low diversification score of ${diversificationScore}/100`] : [])
    ].filter(Boolean).slice(0, 5),

    recommendations: recommendations.length > 0
      ? recommendations.slice(0, 4).map((r, i) =>
        `**${i + 1}. ${r.title}** [${r.priority.toUpperCase()}]\n${r.icon} **Issue**: ${r.issue}\n📋 **Action**: ${r.action}\n💡 **Why**: ${r.reason.slice(0, 200)}...`
      ).join('\n\n')
      : 'No critical recommendations at this time. Your portfolio appears reasonably well-structured. Continue monitoring for changes in sector concentration and single-stock exposure.',

    investmentOpportunities: `Based on your current portfolio composition:\n\n${sectorAllocation.length < 4 ? `• **Sector Gap**: Your portfolio lacks exposure to ${['Healthcare', 'FMCG', 'Infrastructure', 'Consumer Goods'].filter(s => !sectorAllocation.some(sa => sa.sector.includes(s))).join(', ')}. These sectors offer defensive characteristics.\n` : ''}${analysis.largestHoldingPct > 30 ? `• **Rebalancing Opportunity**: Trimming the oversized ${capitalAllocation[0]?.symbol} position frees capital for diversification.\n` : ''}• **Cash Deployment**: ₹${cashBalance.toLocaleString('en-IN')} in cash could be systematically deployed during market dips using a dollar-cost averaging strategy.\n• **Defensive Buffer**: Consider allocating 10-15% to low-beta defensive stocks as market insurance.`,

    portfolioHealthScore: `**Overall Health Score: ${healthScore}/100**\n\n${healthScore >= 75 ? '🟢 Excellent' : healthScore >= 50 ? '🟡 Good' : healthScore >= 25 ? '🟠 Needs Improvement' : '🔴 Poor'}\n\nComponent Breakdown:\n• Diversification: ${diversificationScore}/100\n• Risk Management: ${Math.max(0, 100 - risk.score)}/100\n• Performance: ${analysis.performanceScore}/100\n• Liquidity: ${analysis.liquidityScore}/100\n• Growth Potential: ${analysis.growthScore}/100`,

    educationalNotes: `**📚 Key Concepts from Your Analysis:**\n\n**Beta (${portfolioBeta})**: Beta measures how your portfolio moves relative to the market. Your beta of ${portfolioBeta} means that when the Nifty 50 moves 10%, your portfolio typically moves approximately ${(portfolioBeta * 10).toFixed(1)}%. Beta above 1 amplifies moves; below 1 dampens them.\n\n**Sharpe Ratio (${sharpeRatio})**: This Nobel Prize-winning metric by William Sharpe measures how much extra return you earn per unit of risk. Calculated as (Portfolio Return − 7.2% risk-free rate) / Volatility. Above 1.0 is considered good.\n\n**Diversification Score (${diversificationScore}/100)**: Based on Harry Markowitz's Modern Portfolio Theory — spreading assets across uncorrelated investments reduces risk without necessarily reducing returns. The "free lunch" of investing.\n\n**HHI (${Math.round(herfindahlIndex)})**: The Herfindahl-Hirschman Index measures concentration. Below 1,500 is considered well-diversified by regulatory standards.`,

    beginnerTips: [
      '💡 Never invest more than 10-15% in a single stock — diversification protects you from company-specific disasters.',
      '💡 The Sharpe Ratio tells you if you\'re being paid fairly for the risk you\'re taking — aim for above 1.0.',
      '💡 Beta above 1.5 means your portfolio will fall harder than the market during corrections — consider adding some defensive stocks.',
      '💡 Always keep 8-10% of your portfolio in cash as "dry powder" to buy during market dips.',
      '💡 Sector concentration above 50% is a warning sign — spread across at least 4-5 different sectors.'
    ],

    proTips: [
      '🎯 Monitor your Sortino Ratio alongside Sharpe — Sortino only penalizes downside volatility, giving a cleaner risk picture.',
      '🎯 The Treynor Ratio (your score: ' + analysis.treynorRatio + ') measures return per unit of MARKET risk (beta) — useful for comparing against benchmark performance.',
      '🎯 HHI below 1,000 indicates excellent diversification; use it as a target when rebalancing.',
      '🎯 Value at Risk (VaR) of ₹' + Math.round(valueAtRisk).toLocaleString('en-IN') + '/day (95% confidence) — consider this your daily "financial insurance" cost.',
      '🎯 Expected CAGR of ' + expectedCAGR + '% is based on current composition. Improving Sharpe Ratio and reducing beta can push projected CAGR higher.'
    ],

    monitoringSuggestions: [
      `📊 **Weekly**: Check if ${capitalAllocation[0]?.symbol || 'largest holding'} remains within 25% of portfolio value.`,
      `📊 **Monthly**: Review sector allocations — rebalance if any sector exceeds 40%.`,
      `📊 **Quarterly**: Re-run full AI analysis to track changes in Sharpe Ratio and Health Score.`,
      `📊 **On Market Events**: If Nifty 50 falls 10%+, reassess portfolio beta and consider defensive adds.`,
      `📊 **Annual**: Compare your portfolio return against Nifty 50 benchmark. Alpha = your return minus Nifty return.`
    ],

    disclaimer: `⚠️ **IMPORTANT DISCLAIMER**: This analysis is generated by an AI system for **educational purposes only** within a virtual stock market simulation. All money and transactions in Trado are **completely virtual**. Nothing in this report constitutes financial advice, investment recommendations, or personalized guidance for real-world investing. Past (simulated) performance is not indicative of future results. Always consult a licensed financial advisor (SEBI Registered Investment Advisor) before making real investment decisions.`,

    rawMetrics: {
      riskScore: risk.score,
      healthScore,
      diversificationScore,
      sharpeRatio,
      portfolioBeta,
      maxDrawdown,
      totalProfitLossPct,
      portfolioReturn: analysis.portfolioReturn,
      sectorConcentration: analysis.sectorConcentration,
      volatility: portfolioVolatility
    }
  };
}

// ─── LLM-ENHANCED REPORT GENERATOR ────────────────────────────────────────────

/**
 * Uses Gemini to enhance the executive summary and performance narrative
 * with professional financial language.
 */
export async function generateLLMReport(
  analysis: FullPortfolioAnalysis,
  risk: RiskProfile,
  recommendations: Recommendation[],
  aiClient: any
): Promise<PortfolioReport> {
  const baseReport = generateFallbackReport(analysis, risk, recommendations);

  if (!aiClient) {
    throw new Error('Groq API Key is not set or invalid. Running in strict AI mode.');
  }

  console.log('[AI Report] Requesting LLM report enhancement from Groq model: llama-3.3-70b-versatile');
  const prompt = `You are generating sections of a professional portfolio analysis report for a virtual stock market educational platform.

PORTFOLIO DATA:
- Total Value: ₹${analysis.totalPortfolioValue.toLocaleString('en-IN')}
- Total P&L: ${analysis.totalProfitLossPct >= 0 ? '+' : ''}${analysis.totalProfitLossPct.toFixed(2)}%
- Risk Score: ${risk.score}/100 (${risk.label})
- Sharpe Ratio: ${analysis.sharpeRatio}
- Portfolio Beta: ${analysis.portfolioBeta}
- Diversification Score: ${analysis.diversificationScore}/100
- Health Score: ${analysis.healthScore}/100
- Sectors: ${analysis.sectorAllocation.map(s => s.sector + ' ' + s.percentage.toFixed(0) + '%').join(', ')}
- Holdings: ${analysis.capitalAllocation.length} stocks
- Max Drawdown: ${analysis.maxDrawdown}%
- Volatility: ${analysis.portfolioVolatility}%
- Top recommendations: ${recommendations.slice(0, 2).map(r => r.title).join(', ')}

Write a compelling, professional yet friendly and educational executive summary (2-3 paragraphs) that:
1. Opens with the portfolio's overall state in an engaging way
2. Highlights the most important insight from the data
3. Ends with an encouraging, educational call-to-action
4. Uses clear, jargon-free language suitable for learners
5. Includes the educational disclaimer at the end

Also provide one paragraph each for:
- "investmentOpportunities": Specific opportunities given the current gaps
- "portfolioHealthScore": Narrative explanation of the health score components

Return JSON with keys: executiveSummary, investmentOpportunities, portfolioHealthScore`;

  const response = await aiClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: 'system', 
        content: `${PORTFOLIO_REPORT_SYSTEM}\n\nOutput ONLY valid JSON matching this schema: { "executiveSummary": "string", "investmentOpportunities": "string", "portfolioHealthScore": "string" }` 
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6
  });

  const responseText = response.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('Groq returned empty response for report enhancement.');
  }

  console.log('[AI Report] Successfully received LLM report enhancement from Groq');
  const enhanced = JSON.parse(responseText.trim());
  return {
    ...baseReport,
    executiveSummary: enhanced.executiveSummary || baseReport.executiveSummary,
    investmentOpportunities: enhanced.investmentOpportunities || baseReport.investmentOpportunities,
    portfolioHealthScore: enhanced.portfolioHealthScore || baseReport.portfolioHealthScore
  };
}
