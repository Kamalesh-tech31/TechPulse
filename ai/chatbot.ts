/**
 * ai/chatbot.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Portfolio-Aware Conversational Chatbot Engine.
 *
 * FEATURES:
 *   • Session memory — maintains last 10 messages per user session
 *   • Portfolio context injection — knows the user's current holdings
 *   • Report context — references the latest analysis report
 *   • RAG retrieval — fetches relevant knowledge before answering
 *   • Pronoun resolution — resolves "it", "that stock", "the one" from context
 *   • Mode-aware — behaves differently for portfolio vs. learning questions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { retrieveKnowledge, formatRetrievedContext } from './knowledgeBase';
import { buildPortfolioContext, buildReportContext, CHATBOT_SYSTEM } from './prompts';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[]; // Knowledge sources cited
}

export interface ChatSession {
  sessionId: string;
  userEmail: string;
  messages: ChatMessage[];
  lastPortfolioContext: string;
  lastReportContext: string;
  lastUpdated: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  userEmail: string;
  holdings?: any[];
  walletBalance?: number;
  latestReport?: any;
  mode?: 'portfolio' | 'learning' | 'general';
}

export interface ChatResponse {
  reply: string;
  sources: string[];
  sessionId: string;
  suggestedFollowUps: string[];
}

// ─── SESSION STORE (In-memory, keyed by sessionId) ───────────────────────────

const sessions = new Map<string, ChatSession>();
const MAX_HISTORY = 10; // Keep last 10 messages per session

// ─── SESSION MANAGEMENT ───────────────────────────────────────────────────────

export function getOrCreateSession(sessionId: string, userEmail: string): ChatSession {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      userEmail,
      messages: [],
      lastPortfolioContext: '',
      lastReportContext: '',
      lastUpdated: new Date().toISOString()
    });
  }
  return sessions.get(sessionId)!;
}

export function addMessageToSession(sessionId: string, message: ChatMessage): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.messages.push(message);
  session.lastUpdated = new Date().toISOString();

  // Keep only last MAX_HISTORY messages
  if (session.messages.length > MAX_HISTORY) {
    session.messages = session.messages.slice(-MAX_HISTORY);
  }
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// ─── PRONOUN RESOLUTION ───────────────────────────────────────────────────────

/**
 * Attempts to resolve pronouns like "it", "that", "the stock" by looking
 * at the recent conversation history and injected portfolio context.
 *
 * Returns an enhanced query with pronouns resolved to specific entities.
 */
function resolvePronounsInQuery(query: string, session: ChatSession): string {
  const lowerQuery = query.toLowerCase();
  const vague = ['it', 'that stock', 'that one', 'the stock', 'this stock', 'the company', 'that company'];

  if (!vague.some(v => lowerQuery.includes(v))) return query;

  // Look at last 3 messages for stock mentions
  const recentMessages = session.messages.slice(-3);
  const stockMentions: string[] = [];

  for (const msg of recentMessages) {
    // Look for stock symbols (all-caps 3-12 char words)
    const matches = msg.content.match(/\b[A-Z]{2,12}(?:BANK|LTD|IND)?\b/g) || [];
    stockMentions.push(...matches);
  }

  // Also check portfolio context for stocks
  const portfolioStocks = session.lastPortfolioContext.match(/•\s+(\w+)\s+\(/g);
  if (portfolioStocks) {
    portfolioStocks.forEach(m => stockMentions.push(m.replace(/[•\s\(]/g, '')));
  }

  if (stockMentions.length === 0) return query;

  // Use the most recently mentioned stock
  const lastMentioned = stockMentions[stockMentions.length - 1];

  return vague.reduce((q, v) =>
    q.replace(new RegExp(`\\b${v}\\b`, 'gi'), lastMentioned), query
  );
}

// ─── SUGGESTED FOLLOW-UPS ────────────────────────────────────────────────────

function generateFollowUps(
  query: string,
  hasPortfolio: boolean,
  riskScore?: number
): string[] {
  const lowerQ = query.toLowerCase();

  if (lowerQ.includes('risk')) {
    return hasPortfolio
      ? ['How can I reduce my portfolio risk?', 'What is the Sharpe Ratio?', 'Which holding is my biggest risk?']
      : ['What is beta?', 'How does diversification reduce risk?', 'What is Value at Risk?'];
  }

  if (lowerQ.includes('sharpe') || lowerQ.includes('sortino') || lowerQ.includes('ratio')) {
    return ['What is considered a good Sharpe Ratio?', 'What is the Sortino Ratio?', 'How do I improve my Sharpe Ratio?'];
  }

  if (lowerQ.includes('diversif')) {
    return ['What is the ideal number of stocks to hold?', 'Which sectors am I missing?', 'What is the HHI concentration index?'];
  }

  if (lowerQ.includes('recommend') || lowerQ.includes('suggest')) {
    return hasPortfolio
      ? ['Which stocks should I reduce?', 'What sectors should I add?', 'How do I rebalance my portfolio?']
      : ['How do I start investing?', 'What is an ETF?', 'What is dollar-cost averaging?'];
  }

  if (lowerQ.includes('sector') || lowerQ.includes('allocation')) {
    return ['What is the ideal sector allocation?', 'What are defensive sectors?', 'How much should I put in one sector?'];
  }

  if (hasPortfolio && riskScore && riskScore > 60) {
    return ['How do I reduce my portfolio risk?', 'What defensive stocks should I consider?', 'What is my concentration risk?'];
  }

  return hasPortfolio
    ? ['Explain my portfolio report', 'What are my biggest risks?', 'Which stocks are performing best?']
    : ['What is diversification?', 'How does compounding work?', 'What is a PE ratio?'];
}

// ─── CONTEXT BUILDER FOR LLM ──────────────────────────────────────────────────

function buildChatContext(
  session: ChatSession,
  resolvedQuery: string,
  holdings: any[],
  walletBalance: number,
  latestReport: any
): { systemPrompt: string; conversationHistory: { role: string; content: string }[] } {

  // 1. Retrieve relevant knowledge
  const ragResults = retrieveKnowledge(resolvedQuery, 2);
  const knowledgeContext = formatRetrievedContext(ragResults);

  // 2. Build portfolio context
  const portfolioContext = buildPortfolioContext(holdings, walletBalance);
  const reportContext = buildReportContext(latestReport);

  // 3. Update session contexts
  session.lastPortfolioContext = portfolioContext;
  session.lastReportContext = reportContext;

  // 4. Assemble system prompt
  const systemPrompt = [
    CHATBOT_SYSTEM,
    '',
    '=== CURRENT USER DATA ===',
    portfolioContext,
    '',
    reportContext,
    knowledgeContext ? `\n=== RETRIEVED KNOWLEDGE ===\n${knowledgeContext}` : '',
    '',
    '=== CONVERSATION INSTRUCTIONS ===',
    'Use the above portfolio data and knowledge to give precise, grounded answers.',
    'Always reference actual numbers from the portfolio when relevant.',
    '⚠️ DISCLAIMER REMINDER: This is a virtual simulation for educational purposes only.',
  ].join('\n');

  // 5. Build conversation history for Gemini
  const conversationHistory = session.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    content: m.content
  }));

  return { systemPrompt, conversationHistory };
}


// ─── INTELLIGENT FALLBACK Q&A ENGINE ──────────────────────────────────────────
// Handles 40+ question types with real financial knowledge, no API key needed.

function generateFallbackResponse(
  query: string,
  holdings: any[],
  walletBalance: number,
  latestReport: any
): string {
  const q = query.toLowerCase().trim();
  const hasPortfolio = holdings && holdings.length > 0;

  // ── Portfolio calculations (used across many answers) ──
  const totalValue  = hasPortfolio ? holdings.reduce((s, h) => s + h.currentValue, 0) : 0;
  const totalCost   = hasPortfolio ? holdings.reduce((s, h) => s + h.totalCost, 0)   : 0;
  const totalPnL    = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const netWorth    = totalValue + walletBalance;
  const fmtINR = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  if (hasPortfolio) {
    holdings.forEach(h => {
      sectorMap[h.sector || 'Other'] = (sectorMap[h.sector || 'Other'] || 0) + h.currentValue;
    });
  }
  const sectors = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
  const topSector = sectors[0];

  // Best/worst performers
  const sorted = hasPortfolio ? [...holdings].sort((a, b) => b.profitLossPercentage - a.profitLossPercentage) : [];
  const bestStock  = sorted[0];
  const worstStock = sorted[sorted.length - 1];

  // Largest holding
  const largestHolding = hasPortfolio ? [...holdings].sort((a, b) => b.currentValue - a.currentValue)[0] : null;
  const largestPct = largestHolding && totalValue > 0 ? (largestHolding.currentValue / totalValue) * 100 : 0;

  // ─── QUESTION MATCHING ────────────────────────────────────────────────────────

  // ── 1. Portfolio overview / summary / how am I doing ──
  if (hasMatch(q, ['how is my portfolio', 'how am i doing', 'portfolio summary', 'portfolio overview', 'show my portfolio', 'my portfolio', 'portfolio status', 'how are my investments', 'portfolio performance'])) {
    if (!hasPortfolio) return noPortfolioMsg(walletBalance);
    const pnlSign = totalPnL >= 0 ? '+' : '-';
    return `📊 **Your Portfolio Overview**

• **Total Portfolio Value:** ${fmtINR(totalValue)}
• **Total Invested:** ${fmtINR(totalCost)}
• **Profit / Loss:** ${pnlSign}${fmtINR(totalPnL)} (${pnlSign}${Math.abs(totalPnLPct).toFixed(2)}%)
• **Cash Available:** ${fmtINR(walletBalance)}
• **Net Worth:** ${fmtINR(netWorth)}
• **Number of Stocks:** ${holdings.length}

**Holdings Breakdown:**
${holdings.map(h => `• ${h.symbol} — ${fmtINR(h.currentValue)} (${h.profitLoss >= 0 ? '+' : ''}${h.profitLossPercentage.toFixed(2)}%)`).join('\n')}

${totalPnL >= 0
  ? `✅ Your portfolio is in profit. Keep monitoring and rebalancing regularly.`
  : `⚠️ Your portfolio is currently at a loss. Consider reviewing your holdings — dips can be buying opportunities.`}

💡 *Run the full AI Analysis on the Overview tab for deeper metrics like Sharpe Ratio, Beta, and sector diversification.*`;
  }

  // ── 2. Risk questions ──
  if (hasMatch(q, ['biggest risk', 'main risk', 'portfolio risk', 'my risk', 'risky', 'risk level', 'how risky'])) {
    if (!hasPortfolio) return riskEducation();
    const riskFactors: string[] = [];
    if (largestPct > 50) riskFactors.push(`**Concentration Risk:** ${largestHolding?.symbol} makes up ${largestPct.toFixed(1)}% of your portfolio — too much in one stock`);
    if (sectors.length === 1) riskFactors.push(`**Sector Risk:** All holdings are in ${sectors[0][0]} — zero diversification`);
    if (holdings.length < 3) riskFactors.push(`**Undiversified:** Only ${holdings.length} stock(s) — very high idiosyncratic risk`);
    if (worstStock && worstStock.profitLossPercentage < -15) riskFactors.push(`**Losing Position:** ${worstStock.symbol} is down ${worstStock.profitLossPercentage.toFixed(2)}%`);

    return `⚠️ **Your Portfolio Risk Analysis**

${riskFactors.length > 0
  ? `**Key Risk Factors Detected:**\n${riskFactors.map(r => `• ${r}`).join('\n')}`
  : `✅ No critical concentration risks detected in your portfolio.`}

**General Risk Metrics:**
• **Holdings Count:** ${holdings.length} (${holdings.length >= 8 ? 'Good diversification' : 'Consider adding more stocks'})
• **Sector Count:** ${sectors.length} (${sectors.length >= 4 ? 'Well spread' : 'Add more sectors'})
• **Largest Single Holding:** ${largestHolding?.symbol} at ${largestPct.toFixed(1)}%
• **Worst Performer:** ${worstStock?.symbol} (${worstStock?.profitLossPercentage.toFixed(2)}%)

📚 **Risk 101:** Risk in a portfolio = market risk (unavoidable) + concentration risk (avoidable through diversification). Holding 15-20 stocks across 5+ sectors reduces avoidable risk by ~90%.`;
  }

  // ── 3. Sharpe Ratio ──
  if (hasMatch(q, ['sharpe', 'sharpe ratio', 'risk adjusted'])) {
    const sharpe = latestReport?.rawMetrics?.sharpeRatio || latestReport?.sharpeRatio;
    return `📐 **Sharpe Ratio — Explained**

**Definition:** Measures how much extra return you earn for each unit of risk you take.

**Formula:** (Portfolio Return − Risk-Free Rate) / Portfolio Standard Deviation

**Interpretation:**
• **< 0:** Terrible — taking risk with no reward
• **0 – 1:** Below average
• **1 – 2:** Good
• **> 2:** Excellent (institutional-grade)

**India context:** The risk-free rate is ~7.2% (10-year Government bond yield).

${sharpe !== undefined
  ? `**Your Sharpe Ratio:** ${sharpe.toFixed(2)} — ${sharpe >= 2 ? '🏆 Excellent!' : sharpe >= 1 ? '✅ Good' : sharpe >= 0 ? '⚠️ Below average' : '❌ Negative — restructuring needed'}`
  : `Run the AI Analysis to calculate your exact Sharpe Ratio.`}

💡 *To improve Sharpe Ratio: reduce volatile positions, add defensive stocks, or hold some cash.*`;
  }

  // ── 4. Diversification ──
  if (hasMatch(q, ['diversif', 'diversify', 'spread', 'all eggs', 'sectors', 'sector allocation', 'which sector', 'sector missing'])) {
    if (!hasPortfolio) return `**Diversification** means spreading investments across different assets so one bad event doesn't wipe out everything.\n\n**Rule of thumb:** Hold 10–20 stocks across 5+ sectors:\n• 🏦 Banking & Finance\n• 💻 Technology / IT\n• 💊 Healthcare / Pharma\n• ⚡ Energy\n• 🛒 FMCG / Consumer Goods\n• 🏗️ Infrastructure\n\n*Start trading in Virtual Trading to build a diversified portfolio!*`;
    const coveredSectors = sectors.map(s => s[0]);
    const allSectors = ['Banking & Finance', 'Technology', 'Healthcare', 'Energy', 'FMCG', 'Infrastructure', 'Automobile', 'Metals'];
    const missingSectors = allSectors.filter(s => !coveredSectors.some(cs => cs.toLowerCase().includes(s.toLowerCase())));

    return `🎯 **Diversification Analysis**

**Your Sector Spread:**
${sectors.map(([sector, val]) => `• ${sector}: ${fmtINR(val)} (${((val / totalValue) * 100).toFixed(1)}%)`).join('\n')}

**Diversification Score:** ${sectors.length >= 5 ? '✅ Good' : sectors.length >= 3 ? '⚠️ Moderate' : '❌ Poor'} (${sectors.length} sector${sectors.length !== 1 ? 's' : ''})

${missingSectors.length > 0
  ? `**Consider adding exposure to:**\n${missingSectors.slice(0, 4).map(s => `• ${s}`).join('\n')}`
  : `✅ You're well spread across sectors!`}

📚 **Why it matters:** If your top sector crashes by 30%, your total portfolio loses only ${((sectors[0]?.[1] / totalValue) * 30).toFixed(1)}% — vs 30% if you were 100% in it.`;
  }

  // ── 5. Best/top performing stock ──
  if (hasMatch(q, ['best stock', 'top performer', 'which stock is best', 'highest gain', 'most profit', 'performing best', 'best performing'])) {
    if (!hasPortfolio) return noPortfolioMsg(walletBalance);
    return `🏆 **Your Top Performers**

${sorted.slice(0, Math.min(3, sorted.length)).map((h, i) => `**#${i + 1} ${h.symbol}**
• Current Value: ${fmtINR(h.currentValue)}
• Invested: ${fmtINR(h.totalCost)}
• P&L: ${h.profitLoss >= 0 ? '+' : ''}${fmtINR(h.profitLoss)} (${h.profitLoss >= 0 ? '+' : ''}${h.profitLossPercentage.toFixed(2)}%)
• Avg Buy Price: ₹${h.avgPrice?.toFixed(2)} → Current: ₹${h.currentPrice?.toFixed(2)}`).join('\n\n')}

💡 **Tip:** Don't let winners run too long without reviewing — consider taking partial profits if a stock becomes > 25% of your portfolio.`;
  }

  // ── 6. Worst/losing stock ──
  if (hasMatch(q, ['worst stock', 'losing stock', 'lowest', 'most loss', 'biggest loss', 'worst performing', 'underperforming'])) {
    if (!hasPortfolio) return noPortfolioMsg(walletBalance);
    return `📉 **Your Worst Performers**

${sorted.slice(-Math.min(3, sorted.length)).reverse().map((h, i) => `**#${i + 1} ${h.symbol}**
• Current Value: ${fmtINR(h.currentValue)}
• Invested: ${fmtINR(h.totalCost)}
• P&L: ${h.profitLoss >= 0 ? '+' : ''}${fmtINR(h.profitLoss)} (${h.profitLossPercentage.toFixed(2)}%)
• Avg Buy Price: ₹${h.avgPrice?.toFixed(2)} → Current: ₹${h.currentPrice?.toFixed(2)}`).join('\n\n')}

💡 **Decision framework for losing positions:**
• **Down < 10%:** Hold if fundamentals are intact
• **Down 10–20%:** Research if the story has changed
• **Down > 20%:** Apply stop-loss discipline — cut losses before they grow`;
  }

  // ── 7. Rebalancing ──
  if (hasMatch(q, ['rebalanc', 'rebalance', 'restructure', 'reshuffle', 'how to improve', 'improve portfolio'])) {
    if (!hasPortfolio) return `**Portfolio Rebalancing** = periodically adjusting your holdings to maintain your desired allocation.\n\n**Steps:**\n1. Define target: e.g., max 10% in one stock, 5 sectors covered\n2. Identify drifted positions (grown too large or small)\n3. Sell trimmed positions, buy underweighted ones\n4. Do this every 3–6 months or when a stock moves > 5% from target weight\n\n*Add stocks first, then come back for rebalancing advice!*`;
    const suggestions: string[] = [];
    if (largestPct > 30) suggestions.push(`✂️ Trim **${largestHolding?.symbol}** — it's ${largestPct.toFixed(1)}% of portfolio (target: < 15%)`);
    if (sectors.length < 4) suggestions.push(`➕ Add stocks from underrepresented sectors`);
    if (walletBalance / netWorth > 0.4) suggestions.push(`💰 You have ${((walletBalance / netWorth) * 100).toFixed(0)}% in cash — consider deploying some into diversified stocks`);
    if (worstStock && worstStock.profitLossPercentage < -20) suggestions.push(`⚠️ Review ${worstStock.symbol} (${worstStock.profitLossPercentage.toFixed(2)}%) — consider a stop-loss`);

    return `🔄 **Rebalancing Suggestions for Your Portfolio**

${suggestions.length > 0 ? suggestions.join('\n') : '✅ Your portfolio looks reasonably balanced. Keep monitoring!'}

**Current State:**
• ${holdings.length} stocks across ${sectors.length} sectors
• Largest holding: ${largestHolding?.symbol} (${largestPct.toFixed(1)}%)
• Cash ratio: ${((walletBalance / netWorth) * 100).toFixed(1)}% of net worth

📚 **Rule of Thumb:** No single stock > 15%, no single sector > 35%, keep 5–10% cash for opportunities.`;
  }

  // ── 8. P/E Ratio ──
  if (hasMatch(q, ['pe ratio', 'p/e', 'price to earnings', 'p e ratio', 'pe of'])) {
    return `📊 **Price-to-Earnings (P/E) Ratio**

**Definition:** How much you pay for ₹1 of a company's earnings.

**Formula:** P/E = Stock Price / Earnings Per Share (EPS)

**Interpretation:**
• **< 15:** Potentially undervalued (value stocks)
• **15 – 25:** Fair value for most sectors
• **25 – 50:** Growth premium (market expects high growth)
• **> 50:** Very expensive — high expectations baked in

**Indian Market Context:**
• Nifty 50 average P/E: ~22–24
• IT sector: ~28–35
• Banking: ~12–18
• FMCG: ~40–60 (premium brands command high P/E)

💡 **Key Insight:** A low P/E isn't always good (could mean declining business) and a high P/E isn't always bad (growth companies justify it). Always compare P/E within the same sector.`;
  }

  // ── 9. Beta ──
  if (hasMatch(q, ['beta', 'market sensitivity', 'market correlation', 'portfolio beta'])) {
    return `📐 **Beta — Market Sensitivity**

**Definition:** Measures how much your stock moves relative to the overall market.

**Formula:** Beta = (Stock Return Covariance with Market) / Market Variance

**Interpretation:**
• **Beta = 1:** Moves in line with the market
• **Beta > 1:** More volatile than market (e.g., Beta 1.5 → market +10% = stock +15%)
• **Beta < 1:** Less volatile (defensive stocks like FMCG, utilities)
• **Beta < 0:** Moves opposite to market (rare — gold stocks sometimes)

**Examples of Indian stocks by Beta:**
• High Beta (> 1.2): Adani stocks, small/mid-cap IT
• Medium Beta (~1): Reliance, HDFC Bank, Infosys
• Low Beta (< 0.7): ITC, HUL, Nestle (FMCG/defensive)

💡 **Portfolio tip:** A Beta of 0.8–1.0 is ideal for balanced investors. Lower Beta = more stability during market crashes.`;
  }

  // ── 10. Standard deviation / volatility ──
  if (hasMatch(q, ['standard deviation', 'volatility', 'std dev', 'how volatile', 'portfolio volatility'])) {
    return `📉 **Portfolio Volatility (Standard Deviation)**

**Definition:** Measures how much your portfolio returns fluctuate from the average return.

**Formula:** √(Average of squared deviations from mean return)

**Interpretation:**
• **< 10%:** Low volatility — stable portfolio (like large-cap/defensive)
• **10–20%:** Moderate — typical equity portfolio
• **> 20%:** High volatility — aggressive/concentrated portfolio

**Why it matters:** If your portfolio has an annual return of 15% with 20% standard deviation, returns could range from **-5% to +35%** in any given year.

💡 **Reducing volatility:**
• Add defensive stocks (FMCG, healthcare, utilities)
• Reduce high-Beta tech/small-cap exposure
• Keep a cash buffer of 5–10%
• Diversify across uncorrelated sectors`;
  }

  // ── 11. RSI ──
  if (hasMatch(q, ['rsi', 'relative strength', 'overbought', 'oversold'])) {
    return `📈 **RSI — Relative Strength Index**

**Definition:** Momentum oscillator measuring speed and magnitude of price changes. Ranges from 0 to 100.

**Formula:** RSI = 100 − (100 / (1 + Average Gain / Average Loss)) over 14 periods

**Signals:**
• **RSI > 70:** Overbought → possible pullback/sell signal
• **RSI 30–70:** Neutral zone — trend continuation
• **RSI < 30:** Oversold → possible bounce/buy opportunity
• **RSI = 50:** Neutral momentum

**Common patterns:**
• RSI divergence (price makes new high but RSI doesn't) → bearish warning
• RSI breakout above 50 → bullish momentum confirmation

💡 **Indian market tip:** Nifty 50 RSI above 75 has historically preceded corrections. RSI alone shouldn't drive decisions — combine with price action and fundamentals.`;
  }

  // ── 12. MACD ──
  if (hasMatch(q, ['macd', 'moving average convergence', 'signal line', 'macd crossover'])) {
    return `📊 **MACD — Moving Average Convergence Divergence**

**Components:**
1. **MACD Line** = 12-day EMA − 26-day EMA
2. **Signal Line** = 9-day EMA of MACD Line
3. **Histogram** = MACD Line − Signal Line

**Buy/Sell Signals:**
• **Bullish:** MACD crosses above Signal Line → buy
• **Bearish:** MACD crosses below Signal Line → sell
• **Zero-line cross:** MACD crosses 0 = trend change

**How to use:**
• Works best in trending markets, not sideways markets
• Look for MACD + RSI confirmation for stronger signals
• Useful for timing entry/exit in swing trades

💡 **Example:** If Reliance's MACD just crossed above Signal Line after being below for 3 weeks, that's a potential bullish entry signal — confirm with volume and fundamentals.`;
  }

  // ── 13. Moving averages ──
  if (hasMatch(q, ['moving average', 'sma', 'ema', '50 day', '200 day', 'golden cross', 'death cross', 'ma crossover'])) {
    return `📈 **Moving Averages**

**Types:**
• **SMA (Simple Moving Average):** Average of last N closing prices
• **EMA (Exponential Moving Average):** Weighted average — more weight to recent prices

**Key Levels:**
• **20-day MA:** Short-term trend
• **50-day MA:** Medium-term trend
• **200-day MA:** Long-term trend (most important)

**Key Signals:**
• **Golden Cross:** 50-day MA crosses above 200-day MA → strong bullish signal 🟢
• **Death Cross:** 50-day MA crosses below 200-day MA → strong bearish signal 🔴
• Price above 200-day MA = uptrend; below = downtrend

💡 **Practical use:** When a Nifty 50 stock bounces off its 200-day MA with high volume, that's a strong support level and potential buy zone.`;
  }

  // ── 14. Dividends ──
  if (hasMatch(q, ['dividend', 'dividend yield', 'dividend paying', 'passive income', 'income stocks'])) {
    return `💰 **Dividends & Dividend Yield**

**Definition:** A portion of company profits paid to shareholders, usually quarterly or annually.

**Formula:** Dividend Yield = (Annual Dividend per Share / Stock Price) × 100

**High dividend stocks in India (examples):**
• Coal India (~7–9% yield)
• ITC (~3–5% yield)
• Power Grid, ONGC (~4–6% yield)
• HDFC Bank, Infosys (~1–2% yield — prefer reinvesting)

**Why it matters:**
• Dividends provide income even without selling shares
• High dividend yield can signal value or — if too high — financial stress
• Dividend growth stocks often outperform over the long term

💡 **Dividend Reinvestment:** Reinvesting dividends compounds your wealth significantly over time — ₹1,00,000 at 8% yield reinvested for 20 years grows to ~₹4,66,000.`;
  }

  // ── 15. Compounding ──
  if (hasMatch(q, ['compound', 'compounding', 'power of compounding', 'compound interest', 'eighth wonder'])) {
    return `🚀 **The Power of Compounding**

**Definition:** Earning returns on your returns — your investment grows exponentially over time.

**Formula:** A = P × (1 + r/n)^(n×t)
Where P = Principal, r = rate, n = compounding frequency, t = time

**Rule of 72:** Divide 72 by return rate to find how long to double your money.
• At 12% annual return: 72/12 = **6 years to double**
• At 18% annual return: 72/18 = **4 years to double**

**Example:**
• ₹1,00,000 invested at 12% annually:
  - After 10 years: ₹3,10,585
  - After 20 years: ₹9,64,629
  - After 30 years: ₹29,95,992

💡 **Key insight:** Time is the most powerful variable — starting early matters far more than investing large amounts late. Even virtual trading practice builds the discipline that pays off in real investing.`;
  }

  // ── 16. Nifty 50 ──
  if (hasMatch(q, ['nifty', 'nifty 50', 'sensex', 'market index', 'indian market', 'indian stock market', 'nse', 'bse', 'stock market'])) {
    return `🇮🇳 **Indian Stock Market Overview**

**NSE (National Stock Exchange):**
• Largest exchange by volume in India
• **Nifty 50:** Top 50 companies by market cap + liquidity
• Trading hours: **9:15 AM – 3:30 PM IST** (Mon–Fri)

**BSE (Bombay Stock Exchange):**
• World's fastest exchange
• **Sensex:** Top 30 companies
• Also lists 5,500+ companies vs NSE's 2,000+

**Nifty 50 Key Sectors (approximate weights):**
• Financial Services: ~37%
• IT: ~13%
• Oil & Gas: ~12%
• Consumer: ~9%
• Healthcare: ~5%

**Key Indian Companies:**
• Reliance Industries, TCS, Infosys, HDFC Bank, ICICI Bank, HUL, ITC, L&T, Wipro

💡 **Trado context:** You are trading a simulated version of Nifty 50 stocks with virtual ₹ — perfect to learn market behavior risk-free!`;
  }

  // ── 17. Bull / Bear market ──
  if (hasMatch(q, ['bull market', 'bear market', 'market crash', 'market rally', 'bull run', 'bear run'])) {
    return `📊 **Bull vs Bear Markets**

**Bull Market:**
• Sustained price rise of 20%+ from recent lows
• Characterized by: optimism, strong GDP, rising earnings, FII buying
• Avg duration: ~4–5 years
• Strategy: Stay invested, add on dips, growth stocks outperform

**Bear Market:**
• Sustained decline of 20%+ from recent highs
• Characterized by: fear, economic slowdown, rising unemployment, FII selling
• Avg duration: ~1–1.5 years
• Strategy: Hold quality stocks, accumulate beaten-down fundamentals, avoid leverage

**Indian Market Major Events:**
• 2008 Crash: Nifty fell ~60% (Lehman Brothers crisis)
• 2020 COVID Crash: Fell ~40% in 6 weeks, recovered in 6 months
• 2021–22 Bull Run: Nifty doubled from COVID lows

💡 **Key stat:** In every bear market in history, long-term investors who stayed invested recovered and went on to new highs. Timing the market consistently is nearly impossible.`;
  }

  // ── 18. How to reduce risk ──
  if (hasMatch(q, ['reduce risk', 'lower risk', 'safe portfolio', 'defensive stocks', 'how to be safe', 'safe investment'])) {
    return `🛡️ **How to Reduce Portfolio Risk**

**1. Diversify Holdings:**
• 15–20 stocks across 5+ sectors
• No single stock > 10–15% of portfolio
• Include defensive sectors (FMCG, healthcare, utilities)

**2. Add Low-Beta Stocks:**
• HUL, Nestle, ITC (FMCG) — Beta ~0.4–0.6
• Dr. Reddy's, Sun Pharma (Healthcare) — Beta ~0.5
• Power Grid, NTPC (Utilities) — Beta ~0.6

**3. Keep Cash Buffer (5–10%):**
• Cushions volatility, lets you buy dips

**4. Set Stop-Losses:**
• Mental rule: exit if any stock falls > 15–20% from your buy price

**5. Avoid Concentrated Positions:**
• Even if you're very confident in a stock, cap at 15% max

${hasPortfolio
  ? `\n**For your current portfolio:**\n• Largest holding ${largestHolding?.symbol} is ${largestPct.toFixed(1)}% — ${largestPct > 25 ? '⚠️ consider trimming' : '✅ within acceptable range'}`
  : ''}`;
  }

  // ── 19. Fundamental analysis ──
  if (hasMatch(q, ['fundamental analysis', 'fundamentals', 'how to analyse stock', 'how to analyze a stock', 'stock analysis', 'analyse company', 'evaluate company'])) {
    return `🔍 **Fundamental Analysis — How to Evaluate a Stock**

**Step 1: Understand the Business**
• What does the company do? How does it make money?
• Is the sector growing or declining?
• Who are the competitors?

**Step 2: Key Financial Ratios**
• **P/E Ratio:** Price / EPS — is it cheap or expensive vs peers?
• **ROE:** Net Income / Equity — how efficiently is management using capital? (> 15% = good)
• **Debt/Equity Ratio:** < 1 = healthy, > 2 = risky
• **EPS Growth:** Is profit per share growing year over year?
• **Revenue Growth:** Is the top line expanding?

**Step 3: Management Quality**
• Track record of promoters
• Corporate governance history
• Promoter holding % (> 50% = skin in the game)

**Step 4: Valuation**
• Compare P/E and P/B to sector peers and historical averages
• DCF (Discounted Cash Flow) for intrinsic value

💡 **Rule of thumb:** Great business + fair price = good investment. Mediocre business + cheap price = value trap.`;
  }

  // ── 20. Technical analysis ──
  if (hasMatch(q, ['technical analysis', 'chart analysis', 'chart reading', 'price chart', 'candlestick', 'support resistance', 'support level', 'resistance level'])) {
    return `📈 **Technical Analysis Basics**

**What is it?** Using price charts and patterns to predict future price movements.

**Key Concepts:**

**Support & Resistance:**
• **Support:** Price level where buying is strong enough to stop decline (floor)
• **Resistance:** Price level where selling stops further rise (ceiling)
• A resistance level, once broken, often becomes support

**Candlestick Patterns:**
• **Doji:** Open = Close → market indecision
• **Hammer:** Long lower wick → bullish reversal signal
• **Engulfing:** Large candle engulfs previous → strong reversal
• **Shooting Star:** Long upper wick → bearish reversal

**Common Indicators:**
• RSI (momentum), MACD (trend), Moving Averages (trend direction), Bollinger Bands (volatility)

💡 **Important:** Technical analysis works best in liquid markets with high trading volumes. Always combine with fundamental understanding — don't buy a fundamentally broken company just because the chart looks good.`;
  }

  // ── 21. Inflation / interest rates ──
  if (hasMatch(q, ['inflation', 'interest rate', 'rbi', 'repo rate', 'monetary policy', 'fii', 'dii', 'foreign investor'])) {
    return `🏦 **Inflation, Interest Rates & Markets**

**How Interest Rates affect Stocks:**
• **Rate hike** → borrowing costs rise → company profits fall → stocks decline
• **Rate cut** → cheap money → more investment → stocks rally

**RBI's Repo Rate (India):**
• Current range: ~6.5% (2024)
• When RBI raises: banks' loan rates rise, EMIs increase, consumption drops
• Sectors hurt by rate hikes: Real Estate, Auto, NBFCs
• Sectors benefiting from rate hikes: Banking (higher NIM), Fixed income

**Inflation:**
• High inflation (> 6%) → RBI hikes → bearish for equities
• Moderate inflation (4–5%) → healthy economic growth
• Deflation → demand collapse → very bearish

**FII vs DII:**
• **FII (Foreign Institutional Investors):** Drive major rallies/crashes — watch for FII flow data
• **DII (Domestic Institutional Investors):** Buy on FII sell-offs, stabilize market
• FII net buying + DII net buying = strong bull signal

💡 **Practical tip:** When RBI signals rate cuts, **banking and rate-sensitive sectors** typically rally first.`;
  }

  // ── 22. How to buy/sell on Trado ──
  if (hasMatch(q, ['how to buy', 'how to sell', 'how to trade', 'how do i buy', 'place order', 'how to invest', 'virtual trading', 'how to start'])) {
    return `🛒 **How to Trade on Trado**

**Step 1: Go to Virtual Trading**
• Click **"Holdings"** (Virtual Trading) in the left sidebar

**Step 2: Find a Stock**
• Browse Nifty 50 stocks by sector
• Click any stock to see its detail page with price history and metrics

**Step 3: Buy**
• Enter the number of shares you want
• Check the total cost vs your wallet balance
• Click **"Buy"** — shares are instantly added to your portfolio

**Step 4: Monitor**
• See your holdings with real-time P&L in the Holdings view
• Click **"AI Assistant"** for analysis

**Step 5: Sell**
• In your holdings, click a stock and choose **"Sell"**
• Choose quantity and confirm

💰 **You start with ₹10,00,000 in virtual money!**

**Tips:**
• Buy stocks from multiple sectors from day 1
• Don't put more than 15% in one stock
• Check the AI Assistant regularly for portfolio health`;
  }

  // ── 23. Download report ──
  if (hasMatch(q, ['download report', 'pdf', 'get report', 'report download', 'save report', 'portfolio report', 'report'])) {
    return `📄 **Downloading Your Portfolio Report**

**Steps:**
1. Click the **"Overview"** tab (you should be there now)
2. Click **"Launch AI Analysis"** if you haven't yet — wait for it to complete
3. Once analysis is done, click the **"⬇️ Download PDF Report"** button in the top-right of the Overview

**What the PDF includes:**
• Executive summary
• Portfolio metrics (value, P&L, Sharpe, beta, diversification)
• Sector allocation table
• Top & worst performers
• AI recommendations (detailed)
• Strengths & weaknesses
• Beginner tips & disclaimer

The PDF will download automatically to your default Downloads folder.`;
  }

  // ── 24. Dollar cost averaging / DCA ──
  if (hasMatch(q, ['dca', 'dollar cost averaging', 'sip', 'systematic investment', 'regular investing', 'monthly invest'])) {
    return `💡 **Dollar Cost Averaging (DCA) / SIP**

**Definition:** Investing a fixed amount at regular intervals (monthly/weekly) regardless of market price.

**Why it works:**
• When price is high → you buy fewer shares
• When price is low → you buy more shares
• **Result:** Your average cost is lower than simply buying at one price

**Example:**
You invest ₹10,000/month in TCS:
• Month 1: Price ₹3,500 → buy 2.86 shares
• Month 2: Price ₹3,200 (fell) → buy 3.13 shares
• Month 3: Price ₹3,700 → buy 2.70 shares
• **Average cost:** ₹3,456 vs if you had invested ₹30,000 only in Month 3 at ₹3,700

**Benefits:**
✅ Removes emotion from investing
✅ No need to time the market
✅ Works best for long-term (5+ years)
✅ Reduces impact of market volatility

💡 **Trado tip:** Try investing virtual money in fixed amounts each week to simulate a real SIP strategy!`;
  }

  // ── 25. Value investing ──
  if (hasMatch(q, ['value investing', 'warren buffett', 'undervalued', 'margin of safety', 'intrinsic value', 'graham'])) {
    return `💎 **Value Investing**

**Philosophy:** Buy great companies at a price below their intrinsic value — popularized by Benjamin Graham, mastered by Warren Buffett.

**Key Principles:**
1. **Mr. Market:** The market is irrational short-term, rational long-term — use irrationality to your advantage
2. **Margin of Safety:** Only buy if price is significantly below calculated intrinsic value
3. **Circle of Competence:** Only invest in businesses you understand
4. **Long-term horizon:** Think in years, not days

**How to find undervalued stocks:**
• P/E well below sector average
• P/B ratio < 1 (trading below book value)
• Strong free cash flow but depressed price
• Temporary bad news, fundamentally intact business

**Indian Value Investing examples:**
• Public sector banks during PSB crisis (2018–2020) → recovered massively
• Pharma stocks post-USFDA issues often recover

💡 **Buffett's rule:** "Be fearful when others are greedy, and greedy when others are fearful." — buy quality stocks during crashes.`;
  }

  // ── 26. Stop loss ──
  if (hasMatch(q, ['stop loss', 'stop-loss', 'exit strategy', 'when to sell', 'when to exit', 'cut loss'])) {
    return `🛑 **Stop Loss — Risk Management Tool**

**Definition:** A pre-determined price level at which you exit a position to limit losses.

**Types:**
• **Fixed Stop Loss:** Exit if stock falls X% from buy price (e.g., -15%)
• **Trailing Stop Loss:** Adjusts upward as stock rises (locks in profits)
• **Time Stop Loss:** Exit if stock doesn't move in expected direction within N days

**Recommended Stop Loss Levels:**
• Conservative: 7–10% below buy price
• Moderate: 12–15% below buy price
• Aggressive: 20–25% below buy price

**When to use stop loss:**
• Speculative/momentum trades → tight stop loss (7–10%)
• Long-term value investments → wider or no stop loss if fundamentals intact
• Never apply stop loss to quality blue-chips in temporary dips

${hasPortfolio && worstStock && worstStock.profitLossPercentage < -15
  ? `\n⚠️ **Alert for your portfolio:** ${worstStock.symbol} is currently at ${worstStock.profitLossPercentage.toFixed(2)}% — consider reviewing if this still fits your investment thesis.`
  : ''}`;
  }

  // ── 27. IPO questions ──
  if (hasMatch(q, ['ipo', 'initial public offering', 'new listing', 'ipo invest', 'how to apply ipo'])) {
    return `📋 **IPOs — Initial Public Offerings**

**Definition:** When a private company offers shares to the public for the first time to raise capital.

**How IPO Process Works (India):**
1. Company files DRHP (Draft Red Herring Prospectus) with SEBI
2. SEBI reviews and approves
3. IPO opens for 3 days — retail investors apply via broker/UPI
4. Allotment is done (lottery if oversubscribed)
5. Shares list on NSE/BSE (typically 6 days after close)

**Lot Size & Categories:**
• **Retail:** Up to ₹2 lakh, applied in lots
• **HNI/NII:** ₹2L to ₹10L
• **QIB:** Institutional investors

**How to evaluate an IPO:**
• Is the business model proven and profitable?
• Compare IPO valuation to listed peers (P/E, P/S)
• Grey market premium (GMP) — informal price before listing
• Promoter background and use of proceeds

💡 **Key stat:** In India, ~60–70% of IPOs give listing day gains but only ~40% outperform the market over 2 years. Do fundamental research before applying.`;
  }

  // ── 28. P&L explanation ──
  if (hasMatch(q, ['pnl', 'p&l', 'profit and loss', 'profit loss', 'my profit', 'how much profit', 'gains', 'returns', 'how much have i made'])) {
    if (!hasPortfolio) return noPortfolioMsg(walletBalance);
    const sign = totalPnL >= 0 ? '+' : '-';
    return `💰 **Your Profit & Loss Summary**

• **Total Invested:** ${fmtINR(totalCost)}
• **Current Value:** ${fmtINR(totalValue)}
• **Net P&L:** ${sign}${fmtINR(totalPnL)} (${sign}${Math.abs(totalPnLPct).toFixed(2)}%)

**Stock-wise Breakdown:**
${holdings.map(h => `• **${h.symbol}:** ${h.profitLoss >= 0 ? '+' : ''}${fmtINR(h.profitLoss)} (${h.profitLoss >= 0 ? '+' : ''}${h.profitLossPercentage.toFixed(2)}%)`).join('\n')}

${totalPnL >= 0
  ? `✅ Your portfolio is in the green! Total gain: ${sign}${fmtINR(totalPnL)}`
  : `📉 Portfolio is currently at a loss of ${fmtINR(totalPnL)}. This is normal in volatile markets — focus on the long-term.`}

💡 **Note:** P&L is unrealized (paper profit/loss) until you actually sell the shares.`;
  }

  // ── 29. Hello / greetings ──
  if (hasMatch(q, ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste', 'start', 'help me'])) {
    return `👋 **Hello! I'm FinBot — your AI Financial Assistant on Trado.**

I can help you with:

**📊 Your Portfolio**
• Analyze your holdings and P&L
• Identify risks and opportunities
• Give rebalancing suggestions

**📚 Financial Education**
• Explain concepts: Sharpe Ratio, P/E, Beta, RSI, MACD and more
• Teach investment strategies (Value, Growth, DCA)
• Cover Indian market specifics (Nifty 50, SEBI, NSE/BSE)

**🇮🇳 Indian Stock Markets**
• How Nifty 50 works
• Key sectors and companies
• Technical & fundamental analysis

**💡 Platform Help**
• How to trade on Trado
• How to download your PDF report
• How to use the AI analysis features

What would you like to know? I'm here to help! 🚀`;
  }

  // ── 30. What is Trado ──
  if (hasMatch(q, ['what is trado', 'about trado', 'what is this app', 'how does trado work', 'trado platform', 'how this works'])) {
    return `🏦 **About Trado**

Trado is a **virtual stock market simulation platform** designed to help you learn investing risk-free.

**Key Features:**
• 💹 **Virtual Trading** — Trade real Nifty 50 stocks with ₹10,00,000 in virtual money
• 🤖 **AI Assistant** — Get portfolio analysis, risk scoring, and smart recommendations
• 📄 **PDF Reports** — Download detailed portfolio reports
• 📚 **Learning Center** — AI-powered lessons, quizzes, and financial education
• 📋 **Transaction History** — Track all your virtual trades
• 📊 **Stock Analysis** — Deep-dive charts and fundamentals for each stock

**How to use Trado:**
1. Start in **Holdings (Virtual Trading)** → buy your first stocks
2. Come to **AI Assistant** → run analysis
3. Chat with me for guidance!

All trading is **100% virtual** — no real money, no real risk. Perfect for learning! 🎓`;
  }

  // ── Default catch-all with context ──
  if (!hasPortfolio) {
    return `I'd be happy to help with that! Here are some things I can answer:

**Your portfolio questions:**
• "How is my portfolio doing?"
• "What are my risks?"
• "Which stock is performing best?"

**Financial concepts:**
• "What is Sharpe Ratio?"
• "Explain P/E ratio"
• "What is diversification?"
• "How does RSI work?"

**Market education:**
• "How does Nifty 50 work?"
• "What is value investing?"
• "Explain stop loss"

📝 *First, add some stocks in the Virtual Trading section to unlock portfolio-specific analysis!*

What would you like to know?`;
  }

  return `I understand you're asking about **"${query}"**. Let me give you relevant information:

${hasPortfolio
  ? `**Your Portfolio at a Glance:**
• Total Value: ${fmtINR(totalValue)} (${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%)
• Holdings: ${holdings.length} stocks across ${sectors.length} sector(s)
• Best: ${bestStock?.symbol} (${bestStock?.profitLossPercentage.toFixed(2)}%)
• Worst: ${worstStock?.symbol} (${worstStock?.profitLossPercentage.toFixed(2)}%)`
  : ''}

Try asking me more specifically:
• **"What is [financial term]?"** — I'll explain with examples
• **"How is my [specific stock] doing?"** — portfolio-specific answers
• **"How do I [investment action]?"** — strategy guidance
• **"Explain [indicator like RSI/MACD/Beta]"** — technical analysis

What else can I help you with? 💬`;
}

// ─── Helper functions ──────────────────────────────────────────────────────────

function hasMatch(query: string, patterns: string[]): boolean {
  return patterns.some(p => query.includes(p.toLowerCase()));
}

function noPortfolioMsg(walletBalance: number): string {
  return `📊 You don't have any holdings yet!\n\n**You have ₹${walletBalance.toLocaleString('en-IN')} in virtual funds ready to invest.** Head to **Virtual Trading** in the sidebar to start building your portfolio.\n\nOnce you have positions, I can provide:\n• Portfolio P&L analysis\n• Risk breakdown\n• Sector diversification review\n• Stock-specific insights\n\n*All funds are virtual — learn with zero real-world risk!*`;
}

function riskEducation(): string {
  return `📚 **Understanding Investment Risk**

**Types of Risk:**

1. **Market Risk (Systematic):** Entire market falls — affects all stocks. Cannot be diversified away.
   *Example: COVID crash of 2020 — all stocks fell regardless of quality*

2. **Concentration Risk:** Too much in one stock or sector.
   *Example: If 80% in IT and IT crashes 30%, you lose 24% of portfolio*

3. **Company Risk (Idiosyncratic):** Bad news for a specific company.
   *Example: USFDA ban on a pharma company's plant*

4. **Liquidity Risk:** Can't sell quickly at fair price (more common in small-caps)

5. **Interest Rate Risk:** Rate hikes hurt rate-sensitive sectors (Real Estate, NBFCs)

**How to measure risk:**
• Beta (market sensitivity)
• Standard Deviation (volatility)
• Max Drawdown (worst historical loss)
• VaR (Value at Risk)

💡 **The golden rule:** Higher potential returns = higher risk. There's no free lunch in investing. Diversification is the only "free" risk reduction tool.`;
}


// ─── MAIN CHAT FUNCTION ────────────────────────────────────────────────────────

/**
 * Processes a chat message and returns an AI response.
 * This function is called from the Express route handler.
 *
 * @param request - Chat request with message, session info, and portfolio context
 * @param aiClient - Initialized Gemini client (or null for fallback)
 * @returns ChatResponse with reply, sources, and follow-up suggestions
 */
export async function processChat(
  request: ChatRequest,
  aiClient: any
): Promise<ChatResponse> {
  const { message, sessionId, userEmail, holdings = [], walletBalance = 0, latestReport } = request;

  // ── Get or create session ────────────────────────────────────────────────
  const session = getOrCreateSession(sessionId, userEmail);

  // ── Resolve pronouns in query ────────────────────────────────────────────
  const resolvedMessage = resolvePronounsInQuery(message, session);

  // ── Retrieve relevant knowledge ──────────────────────────────────────────
  const ragResults = retrieveKnowledge(resolvedMessage, 3);
  const sources = ragResults.map(r => r.document.title);

  // ── Add user message to session ──────────────────────────────────────────
  addMessageToSession(sessionId, {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  // ── Generate follow-up suggestions ───────────────────────────────────────
  const suggestedFollowUps = generateFollowUps(
    resolvedMessage,
    holdings.length > 0,
    latestReport?.riskScore
  );

  // ── Fallback mode if no AI client ────────────────────────────────────────
  if (!aiClient) {
    const fallbackReply = generateFallbackResponse(resolvedMessage, holdings, walletBalance, latestReport);
    addMessageToSession(sessionId, {
      role: 'assistant',
      content: fallbackReply,
      timestamp: new Date().toISOString(),
      sources
    });
    return { reply: fallbackReply, sources, sessionId, suggestedFollowUps };
  }

  try {
    // ── Build full context ─────────────────────────────────────────────────
    const { systemPrompt, conversationHistory } = buildChatContext(
      session, resolvedMessage, holdings, walletBalance, latestReport
    );

    // ── Build Groq/OpenAI message array ────────────────────────────────────
    const messages: any[] = [];
    messages.push({ role: 'system', content: systemPrompt });

    // Inject previous conversation
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: resolvedMessage !== message
        ? `${resolvedMessage} (context: user said "${message}")`
        : message
    });

    const response = await aiClient.chat.completions.create({
      model:'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1200
    });

    const replyText = response.choices[0]?.message?.content || generateFallbackResponse(resolvedMessage, holdings, walletBalance, latestReport);

    // ── Add assistant reply to session ────────────────────────────────────
    addMessageToSession(sessionId, {
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toISOString(),
      sources
    });

    return { reply: replyText, sources, sessionId, suggestedFollowUps };

  } catch (error: any) {
    console.error('[Chatbot] Groq error:', error.message);
    const fallback = generateFallbackResponse(resolvedMessage, holdings, walletBalance, latestReport);
    addMessageToSession(sessionId, {
      role: 'assistant',
      content: fallback,
      timestamp: new Date().toISOString(),
      sources
    });
    return { reply: fallback, sources, sessionId, suggestedFollowUps };
  }
}

/**
 * Gets the conversation history for a session.
 */
export function getSessionHistory(sessionId: string): ChatMessage[] {
  return sessions.get(sessionId)?.messages || [];
}
