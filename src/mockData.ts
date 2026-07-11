import { Stock } from './types';

export const INITIAL_STOCKS: Stock[] = [
  {
    id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Retail Conglomerate',
    price: 2450.75,
    change: 1.25,
    high: 2468.00,
    low: 2415.50,
    volume: '5.2M',
    marketCap: '₹16.58T',
    peRatio: 26.4,
    high52: 2630.00,
    low52: 2180.00,
    history: [2410, 2415, 2430, 2420, 2435, 2440, 2450.75],
    description: 'Reliance Industries is a Fortune 500 company and India’s largest private sector enterprise. It has evolved from being a textiles and polyester company into an integrated player across energy, materials, retail, entertainment, and digital services.'
  },
  {
    id: '2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    sector: 'IT Services',
    price: 3820.40,
    change: -0.65,
    high: 3855.00,
    low: 3801.10,
    volume: '1.8M',
    marketCap: '₹13.98T',
    peRatio: 30.1,
    high52: 4250.00,
    low52: 3120.00,
    history: [3860, 3850, 3845, 3830, 3815, 3832, 3820.40],
    description: 'TCS is a global leader in IT services, consulting, and business solutions. As part of the Tata Group, India’s largest multinational business group, TCS has over 600,000 of the world’s best-trained consultants across 46 countries.'
  },
  {
    id: '3',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking & Financials',
    price: 1610.20,
    change: 2.10,
    high: 1622.00,
    low: 1572.30,
    volume: '8.4M',
    marketCap: '₹12.22T',
    peRatio: 18.5,
    high52: 1725.00,
    low52: 1360.00,
    history: [1565, 1570, 1572, 1580, 1595, 1590, 1610.20],
    description: 'HDFC Bank is India’s leading private sector bank and was amongst the first to receive an ‘in principle’ approval from the RBI to set up a private sector bank. It offers a wide range of commercial and transactional banking services.'
  },
  {
    id: '4',
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'IT Services',
    price: 1485.50,
    change: -1.45,
    high: 1515.00,
    low: 1472.00,
    volume: '3.9M',
    marketCap: '₹6.16T',
    peRatio: 24.8,
    high52: 1760.00,
    low52: 1220.00,
    history: [1510, 1505, 1498, 1512, 1490, 1502, 1485.50],
    description: 'Infosys is a global leader in next-generation digital services and consulting. It enables clients in more than 50 countries to navigate their digital transformation, powered by an AI-first core and cloud-based services.'
  },
  {
    id: '5',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking & Financials',
    price: 1045.30,
    change: 0.85,
    high: 1052.40,
    low: 1032.00,
    volume: '6.1M',
    marketCap: '₹7.32T',
    peRatio: 17.2,
    high52: 1110.00,
    low52: 890.00,
    history: [1025, 1030, 1035, 1032, 1038, 1042, 1045.30],
    description: 'ICICI Bank is a leading private sector bank in India. The bank’s consolidated total assets stood at over ₹15 trillion, catering to retail, corporate, and treasury clients with digital and physical touchpoints.'
  },
  {
    id: '6',
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Financials',
    price: 785.15,
    change: 1.70,
    high: 792.00,
    low: 768.40,
    volume: '11.5M',
    marketCap: '₹7.01T',
    peRatio: 12.9,
    high52: 810.00,
    low52: 550.00,
    history: [760, 765, 772, 768, 775, 780, 785.15],
    description: 'State Bank of India is a Fortune 500 Indian multinational bank and financial services statutory body. Headquartered in Mumbai, SBI has a rich heritage of over 200 years and is the largest commercial public sector bank in India.'
  },
  {
    id: '7',
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'Consumer Goods (FMCG)',
    price: 432.80,
    change: 0.15,
    high: 436.00,
    low: 429.50,
    volume: '4.8M',
    marketCap: '₹5.40T',
    peRatio: 27.5,
    high52: 499.00,
    low52: 399.00,
    history: [431, 432, 430, 433, 431, 432, 432.80],
    description: 'ITC is one of India’s foremost private sector companies with a diversified presence in FMCG, Hotels, Packaging, Paperboards & Specialty Papers, and Agri-Business. It is rated highly for ESG and sustainable business practices.'
  },
  {
    id: '8',
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    price: 1180.10,
    change: -0.30,
    high: 1195.00,
    low: 1172.00,
    volume: '2.5M',
    marketCap: '₹6.80T',
    peRatio: 42.1,
    high52: 1240.00,
    low52: 850.00,
    history: [1185, 1190, 1182, 1188, 1175, 1184, 1180.10],
    description: 'Bharti Airtel is a leading global telecommunications company with operations in 17 countries across Asia and Africa. Airtel ranks amongst the top three mobile service providers globally in terms of subscribers.'
  },
  {
    id: '9',
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    sector: 'Engineering & Construction',
    price: 3410.50,
    change: 0.95,
    high: 3432.00,
    low: 3375.00,
    volume: '1.2M',
    marketCap: '₹4.79T',
    peRatio: 33.6,
    high52: 3740.00,
    low52: 2450.00,
    history: [3360, 3375, 3380, 3372, 3390, 3405, 3410.50],
    description: 'Larsen & Toubro is an Indian multinational conglomerate engaged in EPC projects, hi-tech manufacturing, and services. It operates in over 50 countries and is a primary builder of India’s core infrastructure.'
  },
  {
    id: '10',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automotive',
    price: 925.60,
    change: 3.45,
    high: 932.00,
    low: 890.10,
    volume: '7.8M',
    marketCap: '₹3.07T',
    peRatio: 16.4,
    high52: 1065.00,
    low52: 520.00,
    history: [885, 890, 892, 902, 908, 915, 925.60],
    description: 'Tata Motors is a leading global automobile manufacturer. It produces cars, utility vehicles, buses, trucks, and defense vehicles. It is also the pioneer of electric mobility solutions in India and owns the Jaguar Land Rover brand.'
  }
];

export const MOCK_LESSONS: { [key: string]: string } = {
  'Beginner-Learning': `### Lesson 1: Introduction to Stock Market Basics

Welcome to Trado! Today, you are starting your journey with **Virtual Capital**. The stock market is essentially a marketplace where shares of publicly listed companies are bought and sold.

#### What is a Share?
A **share** (or stock) represents fractional ownership in a corporation. If a company has 1,000 total shares and you own 10, you own 1% of that company. As the company grows, profits increase, and its assets appreciate, the value of your shares increases.

#### Key Vocabulary:
1. **LTP (Last Traded Price)**: The current price at which a share is trading.
2. **Bull Market**: A market period where stock prices are generally rising. Symbolized by the Bull, which attacks by thrusting its horns upward.
3. **Bear Market**: A market period where stock prices are generally falling. Symbolized by the Bear, which attacks by pawing downward.
4. **Volume**: The total number of shares traded during a specific period.

#### How Do You Make Money?
- **Capital Appreciation**: Buying a stock at ₹100 and selling it at ₹150.
- **Dividends**: A portion of company earnings distributed to shareholders.

---

### Lesson 2: How to Buy Your First Stock
Since you are using a **Virtual Simulator**, there is no real-money risk! 

1. **Research**: Look at the Nifty 50 list. Choose stable companies with recognizable products (like Tata Motors or Reliance).
2. **Analyze**: Check the percentage change. Is it a good entry point? Look at the 52-week High/Low. If a stock is close to its 52-week low but is financially strong, it might be undervalued.
3. **Place an Order**: Enter the quantity, check the total amount, and click 'BUY'. The simulator automatically deducts the capital from your virtual wallet!`,

  'Intermediate-Virtual Trading': `### Technical Indicators: Moving Averages & RSI

As an intermediate virtual trader on **Trado**, you want to optimize your entries and exits using data-driven technical metrics.

#### Simple Moving Average (SMA)
An SMA calculates the average of a stock's price over a specific number of time periods (e.g., 50-day SMA, 200-day SMA).
- **Golden Cross**: Occurs when a short-term moving average (e.g., 50-day) crosses *above* a long-term moving average (e.g., 200-day). This is a strong **Bullish (Buy)** signal.
- **Death Cross**: Occurs when a short-term average crosses *below* a long-term average. This is a strong **Bearish (Sell)** signal.

#### Relative Strength Index (RSI)
RSI is a momentum oscillator that measures the speed and change of price movements on a scale of 0 to 100.
- **RSI > 70**: Indicates the stock is **Overbought**. It may be overvalued and due for a price correction.
- **RSI < 30**: Indicates the stock is **Oversold**. It may be undervalued and presents a potential buying opportunity.

---

### Strategic Virtual Trading Rules:
1. **Never Allocate More than 10% to a Single Stock**: Maintain diversification to absorb sector-specific drops.
2. **Utilize Stop Loss (Concept)**: Decide on an exit price before buying to preserve your virtual capital.`,

  'Advanced-Stock Analysis': `### Advanced Fundamental Valuation & Sector Analysis

Welcome, Professional. Let's delve into advanced stock valuations that institutional analysts use to select high-conviction portfolios.

#### 1. Price-to-Earnings (P/E) Ratio
The P/E ratio relates a company's share price to its Earnings Per Share (EPS). 
$$\\text{P/E} = \\frac{\\text{Market Price per Share}}{\\text{Earnings Per Share (EPS)}}$$
- **High P/E (e.g., FMCG/Telecom like Bharti Airtel)**: Investors expect high future growth.
- **Low P/E (e.g., Public Banks like SBI)**: Can mean the stock is undervalued, or that the company has structural issues. Compare P/E ratios *only* within the same sector.

#### 2. Enterprise Value & ROE (Return on Equity)
ROE measures a corporation's profitability by revealing how much profit a company generates with the money shareholders have invested.
$$\\text{ROE} = \\frac{\\text{Net Income}}{\\text{Shareholders' Equity}}$$
An ROE above 15-20% is generally considered excellent, indicating efficient capital deployment.

#### 3. Market Breadth & Conglomerate Valuations
When analyzing conglomerates (like Reliance Industries), analysts often use **SOTP (Sum of the Parts) valuation**, evaluating the retail, digital/telecom, and oil-to-chemicals divisions independently before aggregating.`
};
