import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { exec } from 'child_process';
import { getStock, getMultipleStocks, getStockHistory } from "./server/services/marketService";
import backendApp from './backend/app';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(backendApp);


app._router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods), r.route.path);
  } else if (r.name === "router") {
    r.handle.stack.forEach((s: any) => {
      if (s.route) {
        console.log(Object.keys(s.route.methods), s.route.path);
      }
    });
  }
});

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not set or using placeholder. Running in Simulation/Fallback Mode.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Route 1: AI Learning Notes Generator
app.post('/api/learning-notes', async (req, res) => {
  const { occupation, experience, primaryGoal, category } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Elegant Simulated Learning Notes
    return res.json({
      title: `Understanding ${category || 'Stock Market Basics'} as a ${occupation}`,
      category: category || 'General',
      level: experience,
      content: `### Deep Dive: ${category || 'Stock Trading Rules'}\n\nAs a **${occupation}** with **${experience}** experience, your primary objective is **${primaryGoal}**. In this simulation, you are learning to trade with virtual resources.\n\n#### Why this matters for a ${occupation}:\n- Time management: Active trading might conflict with your schedule, so swing trading or long-term investing might suit you best.\n- Capital preservation: Since you are focused on ${primaryGoal}, starting with zero-risk virtual money helps build psychological discipline.\n\n#### Core Concept of ${category || 'Value Investing'}:\nAlways research a company's fundamentals before hitting 'Buy'. Check if the company operates in a growing sector (such as energy or technology) and look for low P/E ratios which might signal undervaluation.\n\n### Key Lesson Objectives:\n1. Understand market orders and order matching mechanics.\n2. Analyze percentage gains versus volume to filter out low-liquidity volatility.\n3. Formulate a personal risk tolerance index.`,
      summary: `Tailored lessons for a ${experience} looking to master ${primaryGoal} through virtual stock assets.`,
      keywords: [category || 'Investing', experience, 'Virtual Portfolio', 'Risk Analysis']
    });
  }

  try {
    const prompt = `Generate a comprehensive stock market lesson for a user who is a "${occupation}", has an experience level of "${experience}", and their primary goal is "${primaryGoal}". The category/topic of the lesson is "${category || 'Basics and Fundamentals'}". Ensure the content is structured using clean markdown, has bullet points, clear headings, is highly informative, educational, and professional. Return the response as a JSON object matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite financial academic and veteran quantitative trader. Provide clear, accurate, high-quality lessons tailored specifically to the user\'s background, avoiding generic explanations.',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            level: { type: Type.STRING },
            content: { type: Type.STRING, description: 'The comprehensive lesson content written in Markdown' },
            summary: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'category', 'level', 'content', 'summary', 'keywords']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini');
    }
    const result = JSON.parse(text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error('Gemini Learning Notes error:', error);
    return res.status(500).json({ error: 'Failed to generate personalized notes', details: error.message });
  }
});

// Route 2: AI Quiz Generator
app.post('/api/quiz', async (req, res) => {
  const { experience, primaryGoal } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Simulated Quiz questions based on experience
    const fallbackQuestions = [
      {
        id: 'q1',
        question: `If a stock's Relative Strength Index (RSI) is 82, what does this typically suggest to a trader?`,
        options: [
          'The stock is heavily oversold and ready for a long buy entry.',
          'The stock is overbought, potentially overvalued, and may experience a pullback.',
          'The volume of trades is decreasing and volatility will flatline.',
          'The company is distributing a surprise cash dividend.'
        ],
        correctAnswerIndex: 1,
        explanation: 'An RSI above 70 is conventionally considered overbought, signaling that the stock may be overvalued or due for a trend reversal.'
      },
      {
        id: 'q2',
        question: `What represents a "Golden Cross" buy signal in technical stock analysis?`,
        options: [
          'When the stock price hits a new 52-week high.',
          'When a short-term moving average crosses above a long-term moving average.',
          'When the volume traded exactly doubles from the previous day.',
          'When the price-to-earnings (P/E) ratio matches the industry sector average.'
        ],
        correctAnswerIndex: 1,
        explanation: 'A Golden Cross is a bullish signal that occurs when a short-term moving average (like the 50-day SMA) crosses above a long-term moving average (like the 200-day SMA).'
      },
      {
        id: 'q3',
        question: `Why is diversification vital when managing your virtual wallet on StockEasy?`,
        options: [
          'It guarantees a profit on every transaction.',
          'It reduces transaction volume and lowers fees.',
          'It spreads risk across different sectors, limiting damage if one stock falls.',
          'It increases the maximum PE ratio of the entire portfolio.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Diversification ensures that your capital is not overly exposed to a single company or sector, smoothing out overall volatility.'
      }
    ];
    return res.json({ questions: fallbackQuestions });
  }

  try {
    const prompt = `Generate a set of 3 highly challenging and educational multiple-choice quiz questions for a user with "${experience}" level in stock trading. Their primary trading goal is "${primaryGoal}". Make the questions highly practical, related to reading charts, evaluating PE ratios, or executing simulated simulator trades. Return the response as a JSON array of questions matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an expert financial educator. Create 3 highly relevant and non-trivial multiple choice questions. Each question must have exactly 4 choices, a correct index (0 to 3), and a detailed explanation of why the correct option is right and others are wrong.',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini');
    }
    const result = JSON.parse(text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error('Gemini Quiz error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
  }
});

// Route 3: AI Portfolio Analyzer
app.post('/api/portfolio-analyzer', async (req, res) => {
  const { holdings, walletBalance } = req.body;
  const ai = getGeminiClient();

  // If no holdings are present, create a clean message
  if (!holdings || holdings.length === 0) {
    return res.json({
      riskScore: 0,
      riskCategory: 'Low',
      diversificationScore: 0,
      diversificationAnalysis: 'Your portfolio is completely empty. Buy shares of Nifty 50 companies in the Virtual Trading Simulator to start tracking risk factors.',
      sectorAllocation: [],
      topPerforming: [],
      worstPerforming: [],
      recommendations: ['Utilize your virtual money to purchase blue-chip companies like Reliance or HDFC Bank to start your investment journey.'],
      explanation: 'Please acquire shares in the stock market module to enable real-time risk, correlation, and sectoral allocation analysis.'
    });
  }

  if (!ai) {
    // Simulation / Fallback calculation
    const totalPortfolioValue = holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);
    const totalCapital = totalPortfolioValue + (walletBalance || 0);

    // Calculate sectors
    const sectorsMap: { [key: string]: number } = {};
    holdings.forEach((h: any) => {
      sectorsMap[h.sector || 'Unclassified'] = (sectorsMap[h.sector || 'Unclassified'] || 0) + h.currentValue;
    });

    const sectorAllocation = Object.entries(sectorsMap).map(([sector, value]) => ({
      sector,
      value,
      percentage: Math.round((value / totalPortfolioValue) * 100)
    }));

    // Diversification score is higher if we have more holdings spread across sectors
    const uniqueSectorsCount = Object.keys(sectorsMap).length;
    const diversificationScore = Math.min(100, Math.max(15, uniqueSectorsCount * 25 + holdings.length * 5));

    // Simple Risk scoring based on concentration
    let riskScore = 40; // baseline
    const largestHoldingPct = holdings.length > 0 
      ? Math.max(...holdings.map((h: any) => (h.currentValue / totalPortfolioValue) * 100))
      : 0;
    if (largestHoldingPct > 60) riskScore += 30; // highly concentrated is high risk
    else if (largestHoldingPct > 40) riskScore += 15;
    
    if (uniqueSectorsCount === 1) riskScore += 15; // single sector is high risk
    riskScore = Math.min(95, Math.max(10, riskScore));

    const riskCategory = riskScore < 35 ? 'Low' : riskScore < 70 ? 'Medium' : 'High';

    // Top and worst
    const sortedPerformers = [...holdings].sort((a: any, b: any) => b.profitLossPercentage - a.profitLossPercentage);
    const topPerforming = sortedPerformers.slice(0, 2).map((h: any) => ({
      symbol: h.symbol,
      gain: Math.round(h.profitLossPercentage * 10) / 10
    }));
    const worstPerforming = sortedPerformers.slice(-2).reverse().map((h: any) => ({
      symbol: h.symbol,
      loss: Math.round(h.profitLossPercentage * 10) / 10
    }));

    return res.json({
      riskScore,
      riskCategory,
      diversificationScore,
      diversificationAnalysis: `Your virtual portfolio is spread across ${uniqueSectorsCount} sectors. A diversification score of ${diversificationScore}/100 indicates ${diversificationScore > 60 ? 'healthy' : 'sub-optimal'} distribution. Sector concentration is highest in **${sectorAllocation[0]?.sector || 'N/A'}** at ${sectorAllocation[0]?.percentage || 0}%.`,
      sectorAllocation,
      topPerforming,
      worstPerforming,
      recommendations: [
        uniqueSectorsCount < 3 ? 'Diversify your virtual funds into at least 3 distinct sectors to cushion against systemic market corrections.' : 'Excellent sector balance! Continue maintaining equal-weight distributions.',
        largestHoldingPct > 50 ? 'Reduce your exposure in your top stock; currently, a single asset comprises over 50% of your net asset value.' : 'Healthy asset allocation. No single company dominates more than 35% of your portfolio.',
        'Consider reserving some liquid virtual cash (10-15%) in your wallet to capitalize on market downturns (buying the dip).'
      ],
      explanation: `This portfolio report outlines your virtual metrics. By analyzing holdings, we determined that you have an overall **${riskCategory} Risk** stance with a risk index of ${riskScore}. Your top holding is ${holdings[0]?.symbol}, and your average profit-and-loss ratio stands at ${Math.round((holdings.reduce((sum: number, h: any) => sum + h.profitLoss, 0) / Math.max(1, holdings.reduce((sum: number, h: any) => sum + h.totalCost, 0))) * 1000) / 10}% across the board.`
    });
  }

  try {
    const prompt = `Analyze the following user stock portfolio from our virtual simulator:
- Holdings: ${JSON.stringify(holdings)}
- Wallet cash remaining: ${walletBalance}

Generate a formal portfolio evaluation. Break down the risk factor, diversification coefficient, sector composition, performance metrics, specific recommendations to improve P&L, and an educational, easy-to-digest explanation of these metrics. Return the output as a structured JSON object according to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are a Senior Portfolio Manager and Chartered Financial Analyst (CFA). Provide actionable, intelligent, objective insights into the user\'s virtual stock holdings. Speak constructively to help them learn risk management, allocation weighting, and volatility mitigation.',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER, description: 'Risk score from 1 (lowest risk) to 100 (extreme risk)' },
            riskCategory: { type: Type.STRING, description: '"Low", "Medium", or "High"' },
            diversificationScore: { type: Type.INTEGER, description: 'Diversification score from 1 to 100' },
            diversificationAnalysis: { type: Type.STRING, description: 'Detailed analysis of their asset diversification' },
            sectorAllocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sector: { type: Type.STRING },
                  percentage: { type: Type.INTEGER },
                  value: { type: Type.NUMBER }
                },
                required: ['sector', 'percentage', 'value']
              }
            },
            topPerforming: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  gain: { type: Type.NUMBER }
                },
                required: ['symbol', 'gain']
              }
            },
            worstPerforming: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  loss: { type: Type.NUMBER }
                },
                required: ['symbol', 'loss']
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING, description: 'An educational, clear, beginner-friendly explanation of why their portfolio scored this way' }
          },
          required: ['riskScore', 'riskCategory', 'diversificationScore', 'diversificationAnalysis', 'sectorAllocation', 'topPerforming', 'worstPerforming', 'recommendations', 'explanation']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini');
    }
    const result = JSON.parse(text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error('Gemini Portfolio Analyzer error:', error);
    return res.status(500).json({ error: 'Failed to analyze portfolio', details: error.message });
  }
});

// Google OAuth Authorization URLs and Callback handlers
app.get('/api/auth/google/url', (req, res) => {
  const { redirectUri } = req.query;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || !clientSecret) {
    // Fall back to sandbox simulator mode if environment variables aren't configured yet
    return res.json({ isSandbox: true, url: '/auth/google/sandbox' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri as string,
    response_type: 'code',
    scope: 'openid email profile',
    state: redirectUri as string, // use state parameter to pass back client's redirect URI
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return res.json({ isSandbox: false, url: authUrl });
});

app.get('/auth/google/sandbox', (req, res) => {
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with Google - StockEasy Sandbox</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="bg-[#030303] text-gray-200 flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md bg-[#09090b] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <!-- Accent Glows -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <!-- Google Header Icon -->
        <div class="flex flex-col items-center text-center mb-6">
          <svg class="h-10 w-10 mb-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.29c1.92,-1.77 3.03,-4.38 3.03,-7.38C21.65,11.83 21.54,11.43 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.62c2.43,0 4.47,-0.81 5.96,-2.18l-3.29,-2.58c-0.91,0.61 -2.07,0.98 -3.67,0.98 -2.82,0 -5.21,-1.91 -6.06,-4.47H1.54v2.66c1.49,2.96 4.54,4.96 8.1,4.96z" fill="#34A853" />
              <path d="M5.94,12.35c-0.22,-0.66 -0.35,-1.37 -0.35,-2.1s0.13,-1.44 0.35,-2.1V5.49H1.54c-0.74,1.48 -1.18,3.14 -1.18,4.91s0.44,3.43 1.18,4.91l4.4,-3.96z" fill="#FBBC05" />
              <path d="M12,5.26c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.57 14.42,1.75 12,1.75c-3.56,0 -6.61,2 -8.1,4.96l4.4,3.96c0.85,-2.56 3.24,-4.41 6.06,-4.41z" fill="#EA4335" />
            </g>
          </svg>
          <h2 class="text-xl font-bold text-white">Google Account Sign-In</h2>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-400 mt-2 uppercase tracking-widest font-bold">
            Developer Sandbox
          </span>
        </div>

        <p class="text-sm text-gray-400 text-center mb-6 leading-relaxed">
          This simulated sign-in workspace is active because Google client credentials are not configured yet in '.env'. Choose an identity to test the seamless flow:
        </p>

        <!-- Quick Pick Identities -->
        <div class="space-y-3 mb-6">
          <button 
            type="button" 
            onclick="selectIdentity('Karthikeyan', 'karthikeyankamalesh8@gmail.com')"
            class="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.12] transition duration-200 rounded-xl p-3 flex items-center gap-3 text-left group"
          >
            <div class="w-10 h-10 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/20 group-hover:scale-105 transition">
              K
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Karthikeyan</p>
              <p class="text-xs text-gray-500 font-mono">karthikeyankamalesh8@gmail.com</p>
            </div>
            <span class="ml-auto text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-md font-mono">User Email</span>
          </button>

          <button 
            type="button" 
            onclick="selectIdentity('Elena Rostova', 'elena.ro@gmail.com')"
            class="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.12] transition duration-200 rounded-xl p-3 flex items-center gap-3 text-left group"
          >
            <div class="w-10 h-10 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/20 group-hover:scale-105 transition">
              ER
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Elena Rostova</p>
              <p class="text-xs text-gray-500 font-mono font-medium">elena.ro@gmail.com</p>
            </div>
          </button>
        </div>

        <div class="relative flex py-2 items-center mb-4">
          <div class="flex-grow border-t border-white/[0.06]"></div>
          <span class="flex-shrink mx-4 text-xs text-gray-600 font-mono uppercase tracking-wider">Or Use Custom</span>
          <div class="flex-grow border-t border-white/[0.06]"></div>
        </div>

        <!-- Custom Input Form -->
        <form id="sandboxForm" onsubmit="handleCustomSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              id="customName" 
              type="text" 
              placeholder="Jane Doe" 
              required
              class="w-full bg-[#121214] border border-white/[0.08] focus:border-rose-500/60 focus:outline-none rounded-xl py-2.5 px-4 text-sm text-gray-200 transition focus:ring-1 focus:ring-rose-500/10"
            />
          </div>
          <div>
            <label class="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Gmail Address</label>
            <input 
              id="customEmail" 
              type="email" 
              placeholder="jane.doe@gmail.com" 
              required
              class="w-full bg-[#121214] border border-white/[0.08] focus:border-rose-500/60 focus:outline-none rounded-xl py-2.5 px-4 text-sm text-gray-200 transition focus:ring-1 focus:ring-rose-500/10"
            />
          </div>

          <button 
            type="submit" 
            class="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl transition duration-200 shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            Authorize Simulated Google Sign-In
          </button>
        </form>

        <!-- Informative footer -->
        <div class="mt-6 pt-4 border-t border-white/[0.05] text-[10px] text-gray-500 leading-normal">
          <p class="font-semibold text-rose-400/80 mb-1">To enable real Google Sign-In in production:</p>
          <ol class="list-decimal list-inside space-y-1">
            <li>Generate credentials in Google Cloud Console</li>
            <li>Configure <code class="text-white font-mono">GOOGLE_CLIENT_ID</code> and <code class="text-white font-mono">GOOGLE_CLIENT_SECRET</code> in Settings</li>
          </ol>
        </div>
      </div>

      <script>
        function selectIdentity(name, email) {
          submitAuth(name, email);
        }

        function handleCustomSubmit(e) {
          e.preventDefault();
          const name = document.getElementById(\'customName\').value.trim();
          const email = document.getElementById(\'customEmail\').value.trim();
          if (name && email) {
            submitAuth(name, email);
          }
        }

        function submitAuth(name, email) {
          const picture = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=e11d48&color=fff&bold=true";

          if (window.opener) {
            window.opener.postMessage({
              type: \'OAUTH_AUTH_SUCCESS\',
              user: {
                name: name,
                email: email,
                picture: picture
              }
            }, \'*\');
            
            document.body.innerHTML = \`
              <div class="w-full max-w-sm bg-[#09090b] border border-white/[0.08] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div class="w-12 h-12 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20 animate-pulse">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">Authenticated successfully</h3>
                <p class="text-sm text-gray-400">Simulator accepted identity: <strong>\${name}</strong></p>
                <p class="text-xs text-gray-500 mt-2">Closing this window...</p>
              </div>
            \`;
            
            setTimeout(() => {
              window.close();
            }, 800);
          } else {
            alert("This popup window is lost. Please start Google Sign-In from the StockEasy application.");
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.send(`
      <html>
        <body style="background:#030303;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:20px;border:1px solid rgba(255,255,255,0.1);background:#0a0a0a;border-radius:12px;max-width:400px;">
            <h2 style="color:#f43f5e;margin-bottom:10px;">Auth Failed</h2>
            <p style="color:#9ca3af;font-size:14px;line-height:1.5;">Authorization code is missing. Please try signing in again.</p>
            <button onclick="window.close()" style="background:#e11d48;border:none;color:white;padding:10px 20px;border-radius:6px;cursor:pointer;margin-top:15px;font-weight:600;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  // State contains the original client's redirect URI
  const redirectUri = (state as string) || `${req.protocol}://${req.get('host')}/auth/callback`;

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const tokens = await tokenResponse.json() as any;
    const accessToken = tokens.access_token;

    // Fetch user details from Google UserInfo API endpoint
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile from Google API');
    }

    const googleUser = await userResponse.json() as any;

    // Post message back to opener window and close
    return res.send(`
      <html>
        <body style="background:#030303;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:20px;border:1px solid rgba(255,255,255,0.1);background:#0a0a0a;border-radius:12px;max-width:400px;">
            <div style="width:60px;height:60px;border-radius:50%;background:#e11d48;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;box-shadow:0 0 15px rgba(225,29,72,0.4);">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style="color:#fff;margin-bottom:10px;">Authenticated</h2>
            <p style="color:#9ca3af;font-size:14px;line-height:1.5;">Welcome, ${googleUser.name}! Returning you to Trado...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                user: {
                  name: ${JSON.stringify(googleUser.name)},
                  email: ${JSON.stringify(googleUser.email)},
                  picture: ${JSON.stringify(googleUser.picture || '')}
                }
              }, '*');
              setTimeout(() => {
                window.close();
              }, 800);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);

  } catch (error: any) {
    console.error('Google OAuth Callback exchange error:', error);
    return res.send(`
      <html>
        <body style="background:#030303;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:25px;border:1px solid rgba(225,29,72,0.2);background:#0a0a0a;border-radius:12px;max-width:450px;box-shadow:0 4px 20px rgba(0,0,0,0.5);">
            <h2 style="color:#f43f5e;margin-bottom:10px;font-size:22px;">OAuth Exchange Failed</h2>
            <p style="color:#9ca3af;font-size:14px;line-height:1.5;margin-bottom:20px;">We were unable to exchange Google credentials. Verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correctly configured in Settings.</p>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);padding:10px;border-radius:8px;font-family:monospace;font-size:12px;color:#f43f5e;word-break:break-all;margin-bottom:20px;">
              \${error.message}
            </div>
            <button onclick="window.close()" style="background:#374151;border:none;color:white;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Serve Vite dev server middleware in development mode
// Test Route - Live Reliance Stock Price


// Lightweight wrapper to fetch stock data from stock-nse-india client.
// The library exposes different method names across versions, so try common ones.

app.get("/api/test-stock", async (req, res) => {

  try {
    const data = await getStock("RELIANCE.NS");
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/nifty25", async (req, res) => {
  try {
    const symbols = [
      "RELIANCE.NS",
      "TCS.NS",
      "INFY.NS",
      "HDFCBANK.NS",
      "ICICIBANK.NS",
      "SBIN.NS",
      "BHARTIARTL.NS",
      "ITC.NS",
      "LT.NS",
      "HINDUNILVR.NS",
      "AXISBANK.NS",
      "KOTAKBANK.NS",
      "BAJFINANCE.NS",
      "MARUTI.NS",
      "ASIANPAINT.NS",
      "SUNPHARMA.NS",
      "TITAN.NS",
      "NESTLEIND.NS",
      "ULTRACEMCO.NS",
      "ONGC.NS",
      "POWERGRID.NS",
      "NTPC.NS",
      "WIPRO.NS",
      "TECHM.NS",
      "ADANIPORTS.NS"
    ];

    const data = await getMultipleStocks(symbols);

    res.json(data);
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/stocks/:symbol/history", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const history = await getStockHistory(symbol);
    const quote = await getStock(symbol);
    res.json({
      quotes: history,
      marketState: quote?.marketState || "CLOSED"
    });
  } catch (err: any) {
    console.error(`Failed to fetch history for ${req.params.symbol}:`, err);
    res.status(500).json({
      error: err.message,
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`[Trado Server] Running on ${url}`);

    

    // Automatically open the app in browser in development mode
    if (process.env.NODE_ENV !== 'production') {
      const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      const command = process.platform === 'win32' ? `start "" "${url}"` : `${start} "${url}"`;
      exec(command, (err) => {
        if (err) {
          console.error(`Failed to open browser: ${err.message}`);
        }
      });
    }
  });
}

startServer();
