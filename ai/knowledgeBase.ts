/**
 * ai/knowledgeBase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * RAG (Retrieval-Augmented Generation) Knowledge Base.
 *
 * ARCHITECTURE:
 *   • In-memory document store (no external dependencies)
 *   • Each document has: id, category, title, content, keywords, synonyms
 *   • Retrieval uses: keyword matching + TF-IDF-inspired scoring
 *   • Returns top-K most relevant documents for a given query
 *
 * KNOWLEDGE DOMAINS:
 *   1. Financial Terminology (100+ terms)
 *   2. Investment Strategies
 *   3. Technical Analysis
 *   4. Fundamental Analysis
 *   5. Risk Management
 *   6. Market Concepts
 *   7. Portfolio Theory
 *   8. Learning Module Content
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  synonyms: string[];
}

export interface RetrievalResult {
  document: KnowledgeDocument;
  score: number;
  excerpt: string; // Most relevant excerpt (first 500 chars)
}

// ─── KNOWLEDGE BASE DOCUMENTS ─────────────────────────────────────────────────

const KNOWLEDGE_BASE: KnowledgeDocument[] = [

  // ── CORE RATIOS ──────────────────────────────────────────────────────────
  {
    id: 'sharpe-ratio',
    category: 'Performance Metrics',
    title: 'Sharpe Ratio — Risk-Adjusted Return',
    content: `The Sharpe Ratio, developed by Nobel laureate William F. Sharpe in 1966, is the most widely used measure of risk-adjusted performance in portfolio management.

Formula: Sharpe Ratio = (Portfolio Return − Risk-Free Rate) / Portfolio Standard Deviation

Risk-Free Rate: In India, typically the 10-year Government Securities (G-Sec) yield, currently around 7.2%.

Interpretation Guide:
• Below 0: Portfolio is underperforming the risk-free rate. You are taking risk for no reward.
• 0 to 1.0: Acceptable performance, but room for improvement.
• 1.0 to 2.0: Good risk-adjusted performance. Portfolio is well-managed.
• Above 2.0: Excellent. Rare in real markets over long periods.

Example: If your portfolio returns 15%, the risk-free rate is 7%, and volatility is 12%:
Sharpe = (15 - 7) / 12 = 0.67 — decent but not exceptional.

Why it matters: Two portfolios can have the same return but vastly different risk levels. Sharpe Ratio lets you compare them fairly. A portfolio returning 12% with 8% volatility (Sharpe: 0.6) may be better than one returning 15% with 20% volatility (Sharpe: 0.4).

Limitations: Sharpe Ratio assumes returns are normally distributed, which is not always true in real markets. It also treats upside volatility as bad, which it isn't. See Sortino Ratio for a better alternative.`,
    keywords: ['sharpe', 'sharpe ratio', 'risk-adjusted', 'return', 'standard deviation', 'volatility', 'performance'],
    synonyms: ['risk-adjusted return', 'sharpe index']
  },

  {
    id: 'sortino-ratio',
    category: 'Performance Metrics',
    title: 'Sortino Ratio — Downside Risk Measure',
    content: `The Sortino Ratio improves upon the Sharpe Ratio by only penalizing downside (negative) volatility, not upside volatility.

Formula: Sortino = (Portfolio Return − Risk-Free Rate) / Downside Deviation

Downside Deviation: Standard deviation of only the negative returns.

Why it's better than Sharpe: Investors don't dislike upward price swings — they only fear losses. Sortino rewards portfolios that have volatile upside without the downside risk.

Interpretation: Same as Sharpe — higher is better. A Sortino > 2 is excellent.

Example: Portfolio A has Sharpe of 1.2 but Sortino of 0.8 (lots of downside risk). Portfolio B has Sharpe of 0.9 but Sortino of 1.5 (good downside protection). For risk-averse investors, Portfolio B is preferable.`,
    keywords: ['sortino', 'downside', 'downside deviation', 'risk-adjusted', 'sortino ratio'],
    synonyms: ['downside risk measure', 'sortino index']
  },

  {
    id: 'beta',
    category: 'Risk Metrics',
    title: 'Beta — Market Sensitivity',
    content: `Beta (β) measures how much a stock or portfolio moves relative to the overall market.

Formula: Beta = Covariance(Stock, Market) / Variance(Market)

Key values:
• Beta = 0: No market correlation (e.g., cash)
• Beta = 0.5: Moves half as much as the market (defensive)
• Beta = 1.0: Moves exactly with the market
• Beta = 1.5: 50% more volatile than the market (aggressive)
• Beta = -1.0: Moves opposite to the market (rare)

Sector Betas (approximate for Indian market):
• FMCG/Pharma: 0.6-0.8 (defensive)
• Banking: 1.2-1.4 (moderate-high)
• IT: 1.0-1.2 (moderate)
• Metals/Mining: 1.3-1.6 (high)

Portfolio Beta: Weighted average of individual stock betas. A portfolio beta of 1.3 means: if Nifty 50 falls 10%, your portfolio typically falls ~13%.

Use in CAPM: Beta is the core variable in the Capital Asset Pricing Model (CAPM): Expected Return = Risk-Free Rate + Beta × (Market Return − Risk-Free Rate).

Why it matters: High-beta portfolios amplify market moves. They can deliver excellent returns in bull markets but cause severe pain in corrections.`,
    keywords: ['beta', 'market sensitivity', 'systematic risk', 'capm', 'market risk', 'volatility', 'nifty'],
    synonyms: ['systematic risk', 'market beta', 'equity beta']
  },

  {
    id: 'pe-ratio',
    category: 'Fundamental Analysis',
    title: 'P/E Ratio — Price-to-Earnings',
    content: `The Price-to-Earnings (P/E) ratio is the most commonly used stock valuation metric.

Formula: P/E = Current Stock Price / Earnings Per Share (EPS)

Types:
• Trailing P/E: Based on last 12 months actual earnings
• Forward P/E: Based on projected future earnings (more useful for growth stocks)
• Sector P/E: Average P/E for a sector, used as a benchmark

Interpretation by Indian Market Standards:
• Below 10: Potentially undervalued OR market expects declining earnings
• 10-20: Fair value range for most Nifty stocks
• 20-30: Growth premium; acceptable for quality companies
• Above 30: Expensive; requires high growth to justify
• Above 50: Speculative; very high growth expectations priced in

Sector Context:
• Banking/FMCG: Average P/E 15-25
• IT: Average P/E 20-30
• Pharma: Average P/E 25-35
• Growth startups: P/E can be 50-100+

Limitations: P/E doesn't work for companies with negative earnings. High P/E isn't always bad if the company has a moat and growing earnings. Always compare P/E to sector peers.

PEG Ratio: P/E ÷ Growth Rate = better measure for growth stocks. PEG < 1 = potentially undervalued relative to growth.`,
    keywords: ['pe ratio', 'price earnings', 'valuation', 'eps', 'earnings', 'fundamental', 'peg'],
    synonyms: ['price-to-earnings', 'earnings multiple', 'p/e multiple']
  },

  {
    id: 'diversification',
    category: 'Portfolio Theory',
    title: 'Diversification — The Free Lunch of Investing',
    content: `Diversification is the practice of spreading investments across different assets to reduce risk without sacrificing expected returns.

The Nobel Prize: Harry Markowitz won the 1990 Nobel Prize in Economics for proving mathematically that diversification reduces risk — famously called "the only free lunch in investing."

How it works: When assets are not perfectly correlated (don't move together), combining them in a portfolio reduces overall volatility. A portfolio of 20 uncorrelated stocks has far less risk than holding just 1 stock, even if each individual stock has the same expected return.

The 90% Rule: Studies show that holding 12-18 stocks across different sectors eliminates approximately 90% of company-specific (idiosyncratic) risk. The remaining 10% is systematic risk — market risk that cannot be diversified away.

Types of Diversification:
1. Asset Class: Stocks + Bonds + Cash + Real Estate
2. Sector: IT + Banking + Healthcare + FMCG + Energy
3. Geographic: Indian + US + International markets
4. Market Cap: Large cap + Mid cap + Small cap
5. Time: Dollar-cost averaging (investing regularly over time)

The Correlation Matrix: Two assets with correlation of -1 are perfect hedges (move oppositely). Zero correlation means they move independently. +1 means they move identically (no diversification benefit).

Common Mistakes:
• Owning 10 IT stocks thinking you're diversified (you're not — they're highly correlated)
• Over-diversifying into 50+ stocks (diminishing returns, "diworsification")
• Ignoring international diversification`,
    keywords: ['diversification', 'correlation', 'portfolio', 'spread', 'risk reduction', 'markowitz', 'uncorrelated', 'sectors'],
    synonyms: ['portfolio diversification', 'asset spread', 'risk distribution']
  },

  {
    id: 'rsi',
    category: 'Technical Analysis',
    title: 'RSI — Relative Strength Index',
    content: `RSI is a momentum oscillator that measures the speed and change of price movements on a scale of 0 to 100.

Formula: RSI = 100 − (100 / (1 + RS)), where RS = Average Gain / Average Loss over 14 periods.

Key Levels:
• Above 70: Overbought — stock may be overvalued and due for a pullback
• 30-70: Neutral zone — no strong signal
• Below 30: Oversold — stock may be undervalued and due for a bounce

How to use:
1. Overbought signal (RSI > 70): Consider taking profits or avoiding new long positions
2. Oversold signal (RSI < 30): Potential buying opportunity, but confirm with other indicators
3. RSI Divergence: Price makes new high but RSI doesn't → weakening momentum (bearish signal)

Indian Market Context: During bull runs (2020-2024 Nifty rally), many quality stocks stayed "overbought" for months. RSI alone is insufficient — always combine with volume, trend, and fundamentals.

Limitations: RSI is a lagging indicator — it reflects past price action. In strong trends, stocks can remain overbought/oversold for extended periods. Never use RSI in isolation.`,
    keywords: ['rsi', 'relative strength index', 'overbought', 'oversold', 'momentum', 'technical', 'oscillator'],
    synonyms: ['relative strength index', 'momentum oscillator', 'technical indicator']
  },

  {
    id: 'moving-averages',
    category: 'Technical Analysis',
    title: 'Moving Averages — Trend Following',
    content: `Moving averages smooth out price data to identify trends. They are the foundation of most trend-following strategies.

Types:
1. Simple Moving Average (SMA): Plain average of closing prices over N days
2. Exponential Moving Average (EMA): Weighted average — gives more importance to recent prices
3. Weighted Moving Average (WMA): Custom weights assigned to each period

Key Periods Used:
• 20-day MA: Short-term trend
• 50-day MA: Medium-term trend
• 200-day MA: Long-term trend (gold standard for identifying bull/bear markets)

Golden Cross (Bullish Signal): 50-day SMA crosses ABOVE the 200-day SMA.
This historically precedes sustained upward moves.

Death Cross (Bearish Signal): 50-day SMA crosses BELOW the 200-day SMA.
This often precedes sustained downward moves.

Support and Resistance: Moving averages act as dynamic support during uptrends and resistance during downtrends. Many traders buy when price bounces off the 50-day MA.

Limitations: Moving averages are lagging — they only confirm trends after they've started. They generate false signals in sideways/choppy markets. Best used in trending markets.`,
    keywords: ['moving average', 'sma', 'ema', 'golden cross', 'death cross', 'trend', '50 day', '200 day', 'technical'],
    synonyms: ['ma', 'moving average', 'trend indicator', 'sma', 'ema']
  },

  {
    id: 'candlestick-patterns',
    category: 'Technical Analysis',
    title: 'Candlestick Patterns — Price Action Reading',
    content: `Candlestick charts originated in 18th century Japan (Munehisa Homma). Each candle shows 4 data points: Open, High, Low, Close (OHLC).

Anatomy of a Candle:
• Body: Area between Open and Close
• Wick (Shadow): Thin lines extending above/below the body
• Green/White candle: Close > Open (bullish)
• Red/Black candle: Close < Open (bearish)

Key Bullish Patterns:
1. Hammer: Small body at top, long lower wick. Signals rejection of lower prices.
2. Engulfing Bullish: Large green candle completely engulfs previous red candle.
3. Morning Star: Three-candle pattern — large red, small uncertain, large green.
4. Doji at support: Open and close nearly equal — market indecision, often reversal signal.

Key Bearish Patterns:
1. Shooting Star: Small body at bottom, long upper wick. Signals rejection of higher prices.
2. Engulfing Bearish: Large red candle completely engulfs previous green candle.
3. Evening Star: Three-candle pattern — large green, small uncertain, large red.
4. Hanging Man: Same shape as hammer but at the top of an uptrend.

Important: Candlestick patterns are more reliable when:
• They appear at key support/resistance levels
• They're confirmed by volume (high volume = stronger signal)
• Combined with other indicators (RSI, MACD)`,
    keywords: ['candlestick', 'candle', 'pattern', 'hammer', 'engulfing', 'morning star', 'doji', 'ohlc', 'technical', 'price action'],
    synonyms: ['candle patterns', 'price action', 'japanese candlesticks', 'ohlc chart']
  },

  {
    id: 'portfolio-theory',
    category: 'Portfolio Theory',
    title: 'Modern Portfolio Theory (MPT)',
    content: `Modern Portfolio Theory (MPT) was developed by Harry Markowitz in 1952 and revolutionized how we think about investing.

Core Insight: By combining assets with low or negative correlations, you can construct a portfolio with HIGHER expected return for the SAME level of risk — or equivalently, LOWER risk for the same expected return.

The Efficient Frontier: A curve showing all optimal portfolios (maximum return for given risk level). Portfolios ON the frontier are efficient; those BELOW it are suboptimal.

Key Concepts:
1. Expected Return: Weighted average of individual asset expected returns
2. Portfolio Variance: Cannot be simplified to weighted average — correlations matter!
3. Covariance: How two assets move together (positive = same direction, negative = opposite)
4. Minimum Variance Portfolio: The portfolio with the lowest possible risk

Two-Asset Example: Holding 50% RELIANCE + 50% HDFC BANK gives less total risk than either alone IF they don't move in perfect lockstep (which they don't).

Limitations:
• Assumes investors are rational and markets are efficient
• Input garbage (bad estimates of return/correlation) → output garbage
• Historical correlations break down during crises (all assets fall together)
• Does not account for behavioral factors, taxes, or transaction costs

Practical Application: Use sector ETFs or index funds to approximate efficient frontier portfolios without needing individual stock analysis.`,
    keywords: ['mpt', 'modern portfolio theory', 'efficient frontier', 'markowitz', 'covariance', 'correlation', 'optimal portfolio'],
    synonyms: ['mean-variance optimization', 'markowitz model', 'portfolio optimization']
  },

  {
    id: 'compounding',
    category: 'Investment Principles',
    title: 'Compounding — The Eighth Wonder',
    content: `Albert Einstein reportedly called compound interest "the eighth wonder of the world." Compounding is the process of earning returns on your returns.

Formula: A = P × (1 + r/n)^(n×t)
Where: A = final amount, P = principal, r = annual rate, n = compounding frequency, t = years

The Rule of 72: Divide 72 by your annual return rate to find how many years to double your money.
• At 8% return: 72/8 = 9 years to double
• At 12% return: 72/12 = 6 years to double
• At 20% return: 72/20 = 3.6 years to double

Power of Compounding with Time:
₹1,00,000 at 12% annual return:
• After 10 years: ₹3,10,585
• After 20 years: ₹9,64,629
• After 30 years: ₹29,95,992

Key Lesson: Starting early matters MORE than earning high returns. A 25-year-old who invests ₹5,000/month at 12% accumulates more than a 35-year-old who invests ₹10,000/month at the same rate.

Compounding Killers:
1. Inflation: Reduce real returns
2. Taxes: Reduce after-tax compounding
3. High fees: A 2% annual fee doesn't seem much but destroys 40% of wealth over 30 years
4. Withdrawing early: "Breaks" the compounding chain`,
    keywords: ['compounding', 'compound interest', 'rule of 72', 'time value', 'wealth creation', 'cagr', 'growth'],
    synonyms: ['compound interest', 'compounding returns', 'exponential growth', 'time value of money']
  },

  {
    id: 'macd',
    category: 'Technical Analysis',
    title: 'MACD — Moving Average Convergence Divergence',
    content: `MACD is a trend-following momentum indicator showing the relationship between two EMAs.

Components:
• MACD Line: 12-day EMA minus 26-day EMA
• Signal Line: 9-day EMA of the MACD Line
• Histogram: MACD Line minus Signal Line (shows momentum)

Trading Signals:
1. Bullish Crossover: MACD Line crosses ABOVE Signal Line → potential buy signal
2. Bearish Crossover: MACD Line crosses BELOW Signal Line → potential sell signal
3. Zero Line Cross: MACD crossing above zero is bullish; below zero is bearish
4. Divergence: Price makes new high but MACD doesn't → momentum weakening

How to interpret:
• When MACD is above zero: Short-term average > long-term average = bullish momentum
• When MACD is below zero: Short-term average < long-term average = bearish momentum
• Wide histograms = strong momentum; narrow = weakening momentum`,
    keywords: ['macd', 'moving average convergence divergence', 'technical', 'momentum', 'ema', 'signal line', 'histogram'],
    synonyms: ['moving average convergence divergence', 'macd indicator', 'trend momentum']
  },

  {
    id: 'market-cap',
    category: 'Stock Market Basics',
    title: 'Market Capitalization — Company Size',
    content: `Market Capitalization (Market Cap) = Current Share Price × Total Outstanding Shares.

This represents the total market value of a company's equity.

Indian Market Classification:
• Large Cap: Top 100 companies by market cap (₹20,000+ crore). Examples: Reliance, TCS, HDFC Bank. Lower risk, more stability.
• Mid Cap: 101st to 250th company. Better growth potential, moderate risk.
• Small Cap: Below 251st company. High growth potential, high risk.

Why Market Cap Matters:
1. Risk Assessment: Small caps are riskier but can deliver higher returns
2. Liquidity: Large caps are easier to buy/sell (higher daily trading volumes)
3. Index Inclusion: Nifty 50 = top 50 large caps; BSE Sensex = top 30
4. Institutional Interest: Large caps attract FII/DII investment, providing price support

Market Cap vs. Stock Price: A ₹100 stock of a large company is NOT cheaper than a ₹5,000 stock of a smaller company. A ₹100 stock with 10 billion shares outstanding has a ₹1 trillion market cap!

Free Float Market Cap: Only counts shares available for public trading (excludes promoter holdings). Used for index weighting (Nifty 50 uses free float methodology).`,
    keywords: ['market cap', 'large cap', 'mid cap', 'small cap', 'capitalization', 'outstanding shares', 'nifty', 'sensex'],
    synonyms: ['market capitalization', 'company size', 'market value']
  },

  {
    id: 'bull-bear-market',
    category: 'Market Concepts',
    title: 'Bull & Bear Markets — Market Cycles',
    content: `Financial markets move in cycles. Understanding these cycles helps investors make better decisions.

Bull Market: A sustained period of rising stock prices (typically 20%+ rise from recent lows).
• Characteristics: Rising prices, high investor confidence, economic expansion, low unemployment
• Historical examples: 2003-2007 (pre-GFC run), 2009-2020 (post-GFC), 2020-2021 (post-COVID)
• Nifty 50 has been in a broad bull market trend since 2009

Bear Market: A sustained period of falling stock prices (typically 20%+ fall from recent highs).
• Characteristics: Falling prices, pessimism, economic contraction, high unemployment
• Historical examples: 2008 GFC (-60%), 2020 COVID crash (-38%)
• Indian bear markets are typically shorter and shallower than global ones

Market Cycle Phases (simplified):
1. Accumulation: Informed investors buy while others are fearful
2. Mark Up: Prices rise, momentum builds, media coverage increases
3. Distribution: Smart money sells to latecomers at high prices
4. Mark Down: Prices fall, panic selling, fear dominates

Warren Buffett's Wisdom: "Be fearful when others are greedy, and greedy when others are fearful." This perfectly describes how to profit from market cycles.

Key Indicators:
• VIX (Volatility Index): High VIX = fear/panic, Low VIX = complacency
• Market P/E: High PE suggests overvaluation (distribution phase)
• FII Flows: Foreign money in = bullish signal`,
    keywords: ['bull market', 'bear market', 'market cycle', 'correction', 'rally', 'nifty', 'sensex', 'vix', 'crash'],
    synonyms: ['market cycles', 'bull run', 'bear run', 'market phases', 'correction']
  },

  {
    id: 'max-drawdown',
    category: 'Risk Metrics',
    title: 'Maximum Drawdown — Worst-Case Loss',
    content: `Maximum Drawdown (MDD) measures the largest peak-to-trough decline in portfolio value over a specific period.

Formula: MDD = (Trough Value − Peak Value) / Peak Value × 100

Example: If your portfolio peaks at ₹10 lakh and later drops to ₹7 lakh before recovering:
MDD = (7L − 10L) / 10L = −30%

Interpretation:
• 0-10%: Low drawdown — very stable portfolio
• 10-20%: Moderate drawdown — normal for equity portfolios
• 20-30%: Significant drawdown — indicates high volatility
• Above 30%: Severe drawdown — requires years to recover

Recovery Time: The "Time to Recovery" matters as much as the drawdown itself. A 30% loss requires a 43% gain just to break even! (Because 70% × 143% ≈ 100%)

Calmar Ratio: Annual Return / Maximum Drawdown. Higher = better risk-adjusted performance. A Calmar of 1 means you earn 100% of your maximum drawdown annually.

Why it matters for investors:
• Most retail investors panic and sell at the bottom, locking in the maximum loss
• Understanding your drawdown tolerance BEFORE investing prevents emotional decisions
• Hedge funds and professional managers closely monitor MDD as a risk limit`,
    keywords: ['drawdown', 'maximum drawdown', 'peak', 'trough', 'loss', 'recovery', 'calmar', 'mdd'],
    synonyms: ['max drawdown', 'peak-to-trough loss', 'mdd', 'worst loss']
  },

  {
    id: 'etfs',
    category: 'Investment Vehicles',
    title: 'ETFs — Exchange Traded Funds',
    content: `ETFs are investment funds that track an index, commodity, or basket of assets and trade on stock exchanges like ordinary stocks.

How ETFs work: An ETF provider (like Mirae, SBI, ICICI) buys all the stocks in an index (like Nifty 50) and creates fund units backed by these stocks. When you buy 1 Nifty Bees unit, you own a tiny slice of all 50 Nifty stocks.

Indian ETF Examples:
• Nippon India ETF Nifty 50 (NIFTYBEES)
• SBI ETF Sensex
• Mirae Asset Large Cap Fund

Advantages:
• Instant diversification: One purchase → 50+ stocks
• Low cost: Expense ratios of 0.05-0.10% (vs 1-2% for active funds)
• Transparency: Holdings are disclosed daily
• Tax efficiency: Lower turnover = fewer taxable events
• Liquidity: Can buy/sell anytime during market hours

Disadvantages:
• No alpha: Index funds never beat the market — they match it
• Cannot exit individual losers
• Tracking error: Fund may not perfectly replicate index
• Requires brokerage to buy (unlike mutual funds via SIPs)

For Beginners: Most financial advisors recommend starting with a diversified ETF before picking individual stocks. "If you can't beat the market, join it."`,
    keywords: ['etf', 'exchange traded fund', 'index fund', 'nifty bees', 'passive investing', 'index', 'diversification'],
    synonyms: ['exchange traded fund', 'index etf', 'passive fund', 'index tracker']
  },

  {
    id: 'support-resistance',
    category: 'Technical Analysis',
    title: 'Support & Resistance — Price Memory',
    content: `Support and Resistance are price levels where a stock tends to stop and reverse direction.

Support Level: A price floor where buying demand is strong enough to prevent further decline.
• Buyers dominate at this level; stock "bounces" off support
• If support breaks, it often becomes new resistance (role reversal)

Resistance Level: A price ceiling where selling pressure is strong enough to prevent further rise.
• Sellers dominate at this level; stock "rejected" at resistance
• If resistance breaks, it often becomes new support (role reversal)

Why these levels work: Price memory — many traders placed orders at the same level before. When price returns, those orders activate.

Types:
• Round numbers: ₹100, ₹500, ₹1000, ₹2000 (psychological levels)
• Previous highs/lows: 52-week high/low are major resistance/support
• Moving averages: 50-day and 200-day MAs act as dynamic support/resistance
• Volume nodes (from Volume Profile): Levels with high historical trading volume

Trading Strategy:
• Buy near support with stop-loss below it
• Sell or take profits near resistance
• Wait for breakouts (price closes above resistance on high volume) before buying

Risk: Support and resistance "breaks" can be false (called "fakeouts"). Always confirm with volume.`,
    keywords: ['support', 'resistance', 'price level', 'breakout', 'technical', 'round numbers', '52-week high', '52-week low'],
    synonyms: ['support level', 'resistance level', 'price support', 'price resistance', 'floor', 'ceiling']
  },

  {
    id: 'inflation-interest-rates',
    category: 'Macro Economics',
    title: 'Inflation & Interest Rates — The Market Mover',
    content: `Inflation and interest rates are the most powerful macroeconomic forces affecting stock markets.

Inflation: Rate at which prices rise over time. Measured by CPI (Consumer Price Index) in India.
• India's RBI target: 4% inflation (with 2-6% tolerance band)
• High inflation erodes purchasing power of money and stock returns

Interest Rates (RBI Repo Rate): Rate at which RBI lends to commercial banks.
• Current (~2024): 6.5%
• When RBI raises rates: Borrowing becomes expensive → economic slowdown → stocks typically fall
• When RBI cuts rates: Borrowing is cheap → economic stimulus → stocks typically rise

The Seesaw Effect: Interest Rates ↑ → Bond yields ↑ → Stocks become less attractive (relative) → Stock prices ↓

Impact by Sector:
• Rising rates: Bad for Banking (margin compression), Real Estate (EMI increase), Infrastructure
• Rising rates: Less bad for IT, FMCG, Healthcare (less debt-dependent)

Inflation Impact on Stocks:
• Mild inflation (2-4%): Good for stocks (companies can raise prices, earnings grow)
• High inflation (>6%): Bad (erodes real returns, forces rate hikes)
• Deflation: Dangerous (companies can't raise prices, debt burden grows)

Stock Market as Inflation Hedge: Over long periods (10+ years), equities tend to outperform inflation. This is the fundamental argument for long-term equity investing.`,
    keywords: ['inflation', 'interest rates', 'rbi', 'repo rate', 'cpi', 'macro', 'economy', 'monetary policy'],
    synonyms: ['monetary policy', 'rbi policy', 'repo rate', 'cpi', 'inflation rate', 'interest rates']
  },

  {
    id: 'fundamental-analysis',
    category: 'Fundamental Analysis',
    title: 'Fundamental Analysis — Company Valuation',
    content: `Fundamental analysis evaluates a company's intrinsic value by analyzing financial statements and business prospects.

Key Financial Statements:
1. Balance Sheet: Assets, Liabilities, Shareholders' Equity (snapshot at a point in time)
2. Income Statement: Revenue, Expenses, Net Profit (over a period)
3. Cash Flow Statement: Operating, Investing, Financing cash flows (actual cash movement)

Critical Ratios:

VALUATION RATIOS:
• P/E: Price / EPS (covered in detail separately)
• P/B (Price-to-Book): Price / Book Value per Share. Below 1 = trading below asset value. Good for banks.
• EV/EBITDA: Enterprise Value / EBITDA. Better than P/E for comparing companies with different debt levels.

PROFITABILITY RATIOS:
• ROE (Return on Equity): Net Profit / Shareholders' Equity. Higher = more efficient use of shareholder money. Target > 15%.
• ROCE (Return on Capital Employed): EBIT / Capital Employed. Measures how efficiently capital is deployed.
• Net Profit Margin: Net Profit / Revenue × 100. Shows how much of each rupee of sales becomes profit.

DEBT RATIOS:
• Debt-to-Equity: Total Debt / Total Equity. Below 0.5 = conservative. Above 2 = high leverage risk.
• Interest Coverage: EBIT / Interest Expense. Shows if company can pay its interest. Below 2 is concerning.

GROWTH METRICS:
• Revenue CAGR (3-5 year): Consistency of top-line growth
• EPS CAGR: Earnings growth rate
• FCF Yield: Free Cash Flow / Market Cap × 100

Moat: Warren Buffett's concept — companies with durable competitive advantages (brand, patents, network effects, switching costs) can sustain high ROE over time.`,
    keywords: ['fundamental analysis', 'roe', 'eps', 'revenue', 'pe', 'pb', 'debt', 'balance sheet', 'income statement', 'cash flow'],
    synonyms: ['company analysis', 'stock valuation', 'financial analysis', 'balance sheet analysis']
  },

  {
    id: 'risk-management',
    category: 'Risk Management',
    title: 'Risk Management — Protecting Your Capital',
    content: `Risk management is the most important skill in investing, yet it's the least sexy and most ignored.

Key Principles:

1. POSITION SIZING:
• Never invest more than 5-10% in a single stock (for retail investors)
• For higher conviction: max 20-25%
• Keep highest-risk positions smallest

2. STOP LOSS:
• Predetermined price at which you exit to prevent further losses
• Trailing stop loss: Moves up with the price to protect profits
• Example: Buy at ₹100, stop at ₹90 (-10%). If it falls to ₹90, you exit.

3. DIVERSIFICATION (see separate article):
• Across assets, sectors, geographies
• The only true "free lunch" in investing

4. DOLLAR-COST AVERAGING (DCA):
• Invest fixed amounts at regular intervals regardless of price
• Reduces impact of market timing
• Example: ₹5,000 every month in Nifty ETF, regardless of market level

5. THE 1% RULE (Trading):
• Never risk more than 1-2% of portfolio on a single trade
• Ensures survival through losing streaks

6. RISK/REWARD RATIO:
• Only take trades where potential profit ≥ 2-3× potential loss
• A 40% win rate with 2:1 reward/risk ratio is still profitable!

7. REBALANCING:
• Periodically restore target allocation
• Forced discipline: sell high performers, buy underperformers
• Recommended: Quarterly or when any asset exceeds target by 5%+

Psychological Risks:
• FOMO (Fear of Missing Out): Chasing rallies at highs
• Loss Aversion: Holding losers too long, selling winners too early
• Overconfidence: Taking too much risk after a winning streak`,
    keywords: ['risk management', 'stop loss', 'position sizing', 'dca', 'dollar cost averaging', 'rebalancing', 'loss', 'risk reward'],
    synonyms: ['capital protection', 'risk control', 'position management', 'stop loss', 'trade management']
  },

  {
    id: 'herfindahl-index',
    category: 'Portfolio Metrics',
    title: 'Herfindahl-Hirschman Index (HHI) — Concentration Measure',
    content: `The Herfindahl-Hirschman Index (HHI) is a widely used measure of market or portfolio concentration.

Formula: HHI = Σ (Weight_i × 100)² for all holdings

Range: 0 to 10,000
• 0: Theoretical perfect diversification (infinite holdings)
• 10,000: Total concentration (single holding)
• Below 1,500: Competitive/well diversified (regulatory threshold for market competition)
• 1,500-2,500: Moderate concentration
• Above 2,500: Highly concentrated

Example:
5 stocks, each 20%: HHI = 5 × 20² = 5 × 400 = 2,000 (moderate)
10 stocks, each 10%: HHI = 10 × 10² = 10 × 100 = 1,000 (well diversified)
1 stock, 100%: HHI = 100² = 10,000 (maximum concentration)

Why it matters: HHI captures concentration better than just counting stocks. A portfolio of 10 stocks where one has 50% has similar concentration risk to a 2-stock portfolio — HHI reveals this.

Used By: US Department of Justice uses HHI for merger approval decisions. Financial regulators use it for systemic risk assessment.`,
    keywords: ['hhi', 'herfindahl', 'concentration', 'index', 'diversification', 'measurement'],
    synonyms: ['herfindahl hirschman index', 'concentration index', 'hhi score']
  },

  {
    id: 'value-at-risk',
    category: 'Risk Metrics',
    title: 'Value at Risk (VaR) — Loss Probability',
    content: `Value at Risk (VaR) answers the question: "What is the maximum loss I can expect over a specific time period, at a given confidence level?"

Standard Form: "95% 1-day VaR of ₹50,000" means: "There is a 95% chance of not losing more than ₹50,000 in a single day."

Equivalently: There is a 5% chance of losing MORE than ₹50,000 in a single day.

Common Calculation Methods:
1. Parametric (Normal): VaR = Portfolio Value × Daily Volatility × Z-score
   • 95% VaR: Z = 1.645
   • 99% VaR: Z = 2.326
2. Historical Simulation: Use actual past returns, find 5th percentile
3. Monte Carlo: Simulate thousands of scenarios

Example: ₹10 lakh portfolio, daily volatility 1.5%:
95% VaR = ₹10L × 1.5% × 1.645 = ₹24,675

Limitations:
• Assumes normal distribution (markets have fat tails — extreme events happen more often than normal distribution predicts)
• Doesn't tell you HOW MUCH you lose beyond the VaR threshold
• CVaR (Conditional VaR / Expected Shortfall) addresses this: average of the worst 5%

Used by: Banks, insurance companies, hedge funds for risk reporting and regulatory compliance (Basel III requires VaR reporting).`,
    keywords: ['var', 'value at risk', 'probability', 'loss', 'risk', 'confidence interval', 'cvar', 'expected shortfall'],
    synonyms: ['value at risk', 'var', 'loss probability', 'risk measure', '95% confidence']
  }
];

// ─── RETRIEVAL ENGINE ──────────────────────────────────────────────────────────

/**
 * Scores a document's relevance to a query using keyword matching.
 * Higher score = more relevant.
 *
 * Scoring rules:
 * • Exact keyword match: +10 points
 * • Synonym match: +8 points
 * • Title word match: +6 points
 * • Content word match: +2 points
 * • Category match: +5 points
 */
function scoreDocument(doc: KnowledgeDocument, queryTokens: string[]): number {
  let score = 0;

  const titleLower = doc.title.toLowerCase();
  const contentLower = doc.content.toLowerCase();

  for (const token of queryTokens) {
    if (token.length < 3) continue; // Skip very short words

    // Exact keyword match
    if (doc.keywords.some(k => k.toLowerCase() === token || k.toLowerCase().includes(token))) {
      score += 10;
    }

    // Synonym match
    if (doc.synonyms.some(s => s.toLowerCase().includes(token))) {
      score += 8;
    }

    // Title match
    if (titleLower.includes(token)) {
      score += 6;
    }

    // Category match
    if (doc.category.toLowerCase().includes(token)) {
      score += 5;
    }

    // Content match
    const contentMatches = (contentLower.match(new RegExp(token, 'g')) || []).length;
    score += Math.min(6, contentMatches * 2);
  }

  return score;
}

/**
 * Tokenizes a natural language query into searchable terms.
 */
function tokenizeQuery(query: string): string[] {
  // Remove common stop words
  const stopWords = new Set(['what', 'is', 'the', 'a', 'an', 'are', 'how', 'do', 'does',
    'my', 'i', 'me', 'you', 'it', 'its', 'this', 'that', 'in', 'on', 'at', 'for',
    'to', 'of', 'and', 'or', 'not', 'can', 'tell', 'explain', 'about', 'why', 'mean',
    'means', 'with', 'by', 'from', 'be', 'have', 'has', 'had', 'will', 'would', 'good',
    'bad', 'portfolio', 'stock', 'stocks', 'share', 'shares']);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !stopWords.has(t));
}

/**
 * Retrieves the most relevant knowledge documents for a given query.
 *
 * @param query - Natural language question from the user
 * @param topK - Number of results to return (default: 3)
 * @returns Array of RetrievalResult sorted by relevance score
 */
export function retrieveKnowledge(query: string, topK: number = 3): RetrievalResult[] {
  const tokens = tokenizeQuery(query);

  if (tokens.length === 0) return [];

  const scored = KNOWLEDGE_BASE.map(doc => ({
    document: doc,
    score: scoreDocument(doc, tokens),
    excerpt: doc.content.slice(0, 600) + '...'
  }));

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Formats retrieved documents into a clean context string for LLM injection.
 */
export function formatRetrievedContext(results: RetrievalResult[]): string {
  if (results.length === 0) return '';

  return results.map((r, i) =>
    `[Knowledge Source ${i + 1}: ${r.document.title}]\n${r.document.content}`
  ).join('\n\n---\n\n');
}

/**
 * Quick lookup by document ID (for specific topic requests).
 */
export function getDocumentById(id: string): KnowledgeDocument | null {
  return KNOWLEDGE_BASE.find(d => d.id === id) || null;
}

/**
 * Get all documents in a category.
 */
export function getByCategory(category: string): KnowledgeDocument[] {
  return KNOWLEDGE_BASE.filter(d =>
    d.category.toLowerCase().includes(category.toLowerCase())
  );
}

export { KNOWLEDGE_BASE };
