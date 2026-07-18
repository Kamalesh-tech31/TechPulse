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
    throw new Error('Groq API Key is not set or invalid. Running in strict AI mode.');
  }

  // ── Build full context ─────────────────────────────────────────────────
  const { systemPrompt, conversationHistory } = buildChatContext(
    session, resolvedMessage, holdings, walletBalance, latestReport
  );
  console.log('Prompt built');

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

  console.log('Groq request starting');
  console.log('[Groq API Request Params]', {
    model: 'llama-3.3-70b-versatile',
    messagesCount: messages.length,
    temperature: 0.7,
    max_tokens: 1200
  });

  const response = await aiClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1200
  });

  console.log('Groq response received');
  console.log('[Groq API Raw Response]', JSON.stringify(response, null, 2));

  const replyText = response.choices[0]?.message?.content;
  if (!replyText) {
    throw new Error('Groq API returned an empty completion response.');
  }

  // ── Add assistant reply to session ────────────────────────────────────
  addMessageToSession(sessionId, {
    role: 'assistant',
    content: replyText,
    timestamp: new Date().toISOString(),
    sources
  });

  return { reply: replyText, sources, sessionId, suggestedFollowUps };
}

/**
 * Gets the conversation history for a session.
 */
export function getSessionHistory(sessionId: string): ChatMessage[] {
  return sessions.get(sessionId)?.messages || [];
}
