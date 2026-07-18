import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import type {
  FullPortfolioAnalysis, RiskProfile, Recommendation, PortfolioReport, ChatMessage
} from '../types';
import {
  Brain, TrendingUp, TrendingDown, MessageCircle, Send,
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle,
  RefreshCw, ArrowUpRight, ArrowDownRight, Zap, BarChart3,
  Download, FileText, Target, Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// ─── Design tokens ───────────────────────────────────────────────────────────
const accent  = '#4f6bff';
const success = '#3ecf8e';
const danger  = '#f0576b';
const warn    = '#ff9f43';

const API_BASE = '/api/ai';

type TabKey = 'overview' | 'chat';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) => isNaN(n) ? '0.00' : n.toFixed(d);

const priorityMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(240,87,107,0.08)',  border: 'rgba(240,87,107,0.25)', text: '#f0576b', dot: '#f0576b' },
  high:     { bg: 'rgba(255,159,67,0.08)',  border: 'rgba(255,159,67,0.25)', text: '#ff9f43', dot: '#ff9f43' },
  medium:   { bg: 'rgba(255,214,0,0.06)',   border: 'rgba(255,214,0,0.20)',  text: '#ffd600', dot: '#ffd600' },
  low:      { bg: 'rgba(79,107,255,0.07)',  border: 'rgba(79,107,255,0.20)', text: '#4f6bff', dot: '#4f6bff' },
};

const LOADING_STEPS = [
  'Scanning holdings…',
  'Computing metrics…',
  'Evaluating risk…',
  'Generating recommendations…',
  'Compiling report…',
];

const SUGGESTED_PROMPTS = [
  'How is my portfolio doing?',
  'What are my biggest risks?',
  'Suggest a rebalancing strategy',
  'Explain Sharpe ratio',
  'Which sector am I missing?',
  'How can I reduce my risk?',
];

// ─── Glass Card ───────────────────────────────────────────────────────────────
const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hover?: boolean;
}> = ({ children, style, className = '', hover }) => (
  <div
    className={className}
    style={{
      background: 'rgba(21,27,38,0.7)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 20,
      backdropFilter: 'blur(16px)',
      transition: hover ? 'all 0.25s ease' : undefined,
      ...style,
    }}
    onMouseEnter={hover ? e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(79,107,255,0.2)';
      el.style.transform = 'translateY(-2px)';
    } : undefined}
    onMouseLeave={hover ? e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(255,255,255,0.05)';
      el.style.transform = 'translateY(0)';
    } : undefined}
  >
    {children}
  </div>
);

// ─── PDF Generator (jsPDF) ───────────────────────────────────────────────────
function generatePDF(report: PortfolioReport, analysis: FullPortfolioAnalysis, recommendations: Recommendation[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width mm
  const H = 297; // A4 height mm
  const ML = 15; // left margin
  const MR = 15; // right margin
  const CONTENT_W = W - ML - MR; // 180mm usable width
  let y = 0;

  // ── Colour helpers ──────────────────────────────────────────────────────────
  type RGB = [number, number, number];
  const C = {
    navy:    [13,  27,  52]  as RGB,
    accent:  [79, 107, 255]  as RGB,
    accent2: [108, 92, 231]  as RGB,
    green:   [62, 207, 142]  as RGB,
    red:     [240, 87, 107]  as RGB,
    orange:  [255,159,  67]  as RGB,
    yellow:  [255,210,   0]  as RGB,
    grey:    [110,120,140]   as RGB,
    lgrey:   [190,195,210]   as RGB,
    bg:      [248,249,255]   as RGB,
    bgCard:  [240,242,252]   as RGB,
    white:   [255,255,255]   as RGB,
    divider: [225,228,245]   as RGB,
  };

  const setFill  = (c: RGB) => doc.setFillColor(c[0],  c[1],  c[2]);
  const setStroke= (c: RGB) => doc.setDrawColor(c[0],  c[1],  c[2]);
  const setTxt   = (c: RGB) => doc.setTextColor(c[0],  c[1],  c[2]);
  const bold     = (size: number) => { doc.setFont('helvetica','bold');   doc.setFontSize(size); };
  const normal   = (size: number) => { doc.setFont('helvetica','normal'); doc.setFontSize(size); };

  const fmtMoney = (n: number) => 'Rs.' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const fmtP     = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

  const addPageIfNeeded = (need: number) => {
    if (y + need > H - 18) {
      drawFooter();
      doc.addPage();
      y = 22;
    }
  };

  // ── Divider line ──────────────────────────────────────────────────────────
  const divider = (lx = ML, w = CONTENT_W) => {
    setStroke(C.divider);
    doc.setLineWidth(0.3);
    doc.line(lx, y, lx + w, y);
    y += 3;
  };

  // ── Section heading strip ─────────────────────────────────────────────────
  const sectionHeading = (title: string) => {
    addPageIfNeeded(16);
    setFill(C.accent); doc.rect(ML, y, CONTENT_W, 8, 'F');
    setFill(C.accent2); doc.rect(ML, y, 3, 8, 'F');
    setTxt(C.white); bold(9);
    doc.text(title, ML + 6, y + 5.5);
    y += 12;
  };

  // ── Body paragraph text ───────────────────────────────────────────────────
  const paragraph = (str: string, indent = 0, size = 8.5) => {
    if (!str) return;
    normal(size); setTxt(C.navy);
    const lines = doc.splitTextToSize(str, CONTENT_W - indent);
    addPageIfNeeded(lines.length * 5 + 2);
    doc.text(lines, ML + indent, y);
    y += lines.length * 5 + 3;
  };

  // ── Footer ────────────────────────────────────────────────────────────────
  const drawFooter = () => {
    const page = (doc as any).internal.getCurrentPageInfo().pageNumber;
    setFill(C.navy); doc.rect(0, H - 12, W, 12, 'F');
    setTxt(C.lgrey); normal(7);
    doc.text('TRADO  |  Virtual Portfolio Intelligence Report  |  Educational Use Only', ML, H - 5);
    setTxt(C.accent); bold(7);
    doc.text('Page ' + page, W - MR, H - 5, { align: 'right' });
  };

  // ── Rounded stat card ─────────────────────────────────────────────────────
  const statCard = (x: number, y0: number, w: number, h: number,
                    label: string, value: string, sub: string,
                    valColor: RGB = C.accent, bgColor: RGB = C.bgCard) => {
    setFill(bgColor);
    setStroke(C.divider);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y0, w, h, 3, 3, 'FD');
    // label
    normal(6.5); setTxt(C.grey);
    doc.text(label.toUpperCase(), x + w / 2, y0 + 6.5, { align: 'center' });
    // value
    bold(12); setTxt(valColor);
    doc.text(value, x + w / 2, y0 + 14, { align: 'center' });
    // sub
    if (sub) { normal(6); setTxt(C.lgrey); doc.text(sub, x + w / 2, y0 + 19, { align: 'center' }); }
  };

  // ════════════════════════════════════════════════════════════════════════════
  //  PAGE 1 — COVER / HEADER
  // ════════════════════════════════════════════════════════════════════════════

  // Background gradient effect (navy top bar)
  setFill(C.navy); doc.rect(0, 0, W, 52, 'F');
  // Accent stripe
  setFill(C.accent); doc.rect(0, 52, W, 2, 'F');

  // Logo & brand
  bold(22); setTxt(C.white);
  doc.text('TRADO', ML, 18);

  bold(10); setTxt(C.accent);
  doc.text('AI Portfolio Intelligence Report', ML, 27);

  normal(8); setTxt(C.lgrey);
  const genDate = new Date(report.generatedAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.text('Generated: ' + genDate, ML, 35);
  normal(7.5); setTxt(C.lgrey);
  doc.text('This is a virtual simulation report for educational purposes only.', ML, 42);

  // Health Score Badge (top-right)
  const hs = analysis.healthScore ?? 0;
  const hsRGB: RGB = hs >= 70 ? C.green : hs >= 40 ? C.yellow : C.red;
  setFill(hsRGB);
  doc.roundedRect(W - MR - 36, 8, 36, 36, 4, 4, 'F');
  bold(20); setTxt(C.white);
  doc.text(String(hs), W - MR - 18, 26, { align: 'center' });
  normal(6.5); setTxt(C.white);
  doc.text('HEALTH SCORE', W - MR - 18, 33, { align: 'center' });
  doc.text('/100', W - MR - 18, 38, { align: 'center' });

  y = 62;

  // ── Key Metrics Row (4 cards) ───────────────────────────────────────────────
  const cardW  = (CONTENT_W - 9) / 4;
  const cardH  = 26;
  const pnlPos = analysis.totalProfitLoss >= 0;

  const metrics = [
    { label: 'Portfolio Value',  value: fmtMoney(analysis.totalPortfolioValue),  sub: 'Current Market Value', color: C.accent },
    { label: 'Total P&L',        value: fmtP(analysis.totalProfitLossPct),        sub: fmtMoney(analysis.totalProfitLoss), color: pnlPos ? C.green : C.red },
    { label: 'Sharpe Ratio',     value: (analysis.sharpeRatio ?? 0).toFixed(2),   sub: analysis.sharpeRatio >= 1 ? 'Good' : 'Below Avg', color: analysis.sharpeRatio >= 1 ? C.green : C.orange },
    { label: 'Diversification',  value: ((analysis.diversificationScore ?? 0)).toFixed(0) + '/100', sub: 'Portfolio Spread', color: C.accent },
  ];

  metrics.forEach((m, i) => {
    statCard(ML + i * (cardW + 3), y, cardW, cardH, m.label, m.value, m.sub, m.color as RGB);
  });
  y += cardH + 8;

  // ── Executive Summary ───────────────────────────────────────────────────────
  sectionHeading('EXECUTIVE SUMMARY');
  paragraph(report.executiveSummary || 'No summary available.');
  y += 2;

  // ── Portfolio Overview ──────────────────────────────────────────────────────
  if (report.portfolioOverview) {
    sectionHeading('PORTFOLIO OVERVIEW');
    paragraph(report.portfolioOverview);
    y += 2;
  }

  // ── Performance Analysis ────────────────────────────────────────────────────
  sectionHeading('PERFORMANCE ANALYSIS');
  paragraph(report.performanceAnalysis || '');
  y += 2;

  // ── Risk Analysis ────────────────────────────────────────────────────────────
  sectionHeading('RISK ANALYSIS');
  paragraph(report.riskAnalysis || '');
  y += 2;

  // ── Sector Allocation ────────────────────────────────────────────────────────
  if (analysis.sectorAllocation?.length > 0) {
    sectionHeading('SECTOR ALLOCATION');

    // Table header
    const SC = { label: ML, pct: ML + 90, bar: ML + 108, val: ML + 168 };
    setFill(C.bgCard); doc.rect(ML, y, CONTENT_W, 7, 'F');
    bold(7.5); setTxt(C.grey);
    doc.text('SECTOR', SC.label + 1, y + 5);
    doc.text('WEIGHT', SC.pct, y + 5);
    doc.text('ALLOCATION BAR', SC.bar, y + 5);
    doc.text('VALUE', SC.val, y + 5, { align: 'right' });
    y += 8;

    analysis.sectorAllocation.forEach((s, idx) => {
      addPageIfNeeded(8);
      const rowBg: RGB = idx % 2 === 0 ? C.white : C.bg;
      setFill(rowBg); doc.rect(ML, y - 1, CONTENT_W, 7.5, 'F');

      normal(8); setTxt(C.navy);
      doc.text(s.sector, SC.label + 1, y + 4);

      bold(8); setTxt(C.accent);
      doc.text(s.percentage.toFixed(1) + '%', SC.pct + 6, y + 4, { align: 'center' });

      // bar background
      const barMaxW = 55;
      const barH2   = 4;
      const barY    = y + 1.5;
      setFill(C.divider); doc.roundedRect(SC.bar, barY, barMaxW, barH2, 1, 1, 'F');
      // bar fill
      setFill(C.accent); doc.roundedRect(SC.bar, barY, Math.min(s.percentage / 100, 1) * barMaxW, barH2, 1, 1, 'F');

      normal(7.5); setTxt(C.grey);
      doc.text(fmtMoney(s.value), SC.val, y + 4, { align: 'right' });

      y += 7.5;
    });
    y += 4;
  }

  // ── Top & Worst Performers ──────────────────────────────────────────────────
  const hasTop   = (analysis.topPerforming?.length  ?? 0) > 0;
  const hasWorst = (analysis.worstPerforming?.length ?? 0) > 0;

  if (hasTop || hasWorst) {
    sectionHeading('TOP & WORST PERFORMERS');
    addPageIfNeeded(40);

    const halfW = (CONTENT_W - 6) / 2;
    const startY2 = y;

    // TOP performers — left column
    if (hasTop) {
      setFill(C.bgCard); doc.roundedRect(ML, y, halfW, 8, 2, 2, 'F');
      bold(8); setTxt(C.green);
      doc.text('TOP PERFORMERS', ML + halfW / 2, y + 5.5, { align: 'center' });
      y += 9;

      analysis.topPerforming.slice(0, 5).forEach((h, idx) => {
        addPageIfNeeded(7);
        const bg: RGB = idx % 2 === 0 ? C.white : C.bg;
        setFill(bg); doc.rect(ML, y, halfW, 6.5, 'F');
        bold(8.5); setTxt(C.navy);
        doc.text(h.symbol, ML + 3, y + 4.5);
        normal(8); setTxt(C.green);
        doc.text('+' + h.gain.toFixed(2) + '%', ML + halfW - 3, y + 4.5, { align: 'right' });
        y += 6.5;
      });
    }

    // WORST performers — right column
    if (hasWorst) {
      const rx = ML + halfW + 6;
      y = startY2;

      setFill(C.bgCard); doc.roundedRect(rx, y, halfW, 8, 2, 2, 'F');
      bold(8); setTxt(C.red);
      doc.text('WORST PERFORMERS', rx + halfW / 2, y + 5.5, { align: 'center' });
      y += 9;

      analysis.worstPerforming.slice(0, 5).forEach((h, idx) => {
        const bg: RGB = idx % 2 === 0 ? C.white : C.bg;
        setFill(bg); doc.rect(rx, y, halfW, 6.5, 'F');
        bold(8.5); setTxt(C.navy);
        doc.text(h.symbol, rx + 3, y + 4.5);
        normal(8); setTxt(C.red);
        doc.text(h.loss.toFixed(2) + '%', rx + halfW - 3, y + 4.5, { align: 'right' });
        y += 6.5;
      });
    }
    y += 6;
  }

  // ── Strengths ─────────────────────────────────────────────────────────────
  if ((report.strengths?.length ?? 0) > 0) {
    sectionHeading('STRENGTHS');
    report.strengths.slice(0, 6).forEach(s => {
      addPageIfNeeded(10);
      setFill(C.green); doc.roundedRect(ML, y, 4, 4, 0.5, 0.5, 'F');
      normal(8.5); setTxt([40, 80, 60] as RGB);
      const lines = doc.splitTextToSize(s, CONTENT_W - 8);
      doc.text(lines, ML + 7, y + 3.5);
      y += lines.length * 4.5 + 3;
    });
    y += 2;
  }

  // ── Weaknesses ────────────────────────────────────────────────────────────
  if ((report.weaknesses?.length ?? 0) > 0) {
    sectionHeading('AREAS FOR IMPROVEMENT');
    report.weaknesses.slice(0, 6).forEach(w => {
      addPageIfNeeded(10);
      setFill(C.red); doc.roundedRect(ML, y, 4, 4, 0.5, 0.5, 'F');
      normal(8.5); setTxt([120, 30, 40] as RGB);
      const lines = doc.splitTextToSize(w, CONTENT_W - 8);
      doc.text(lines, ML + 7, y + 3.5);
      y += lines.length * 4.5 + 3;
    });
    y += 2;
  }

  // ── Recommendations ──────────────────────────────────────────────────────
  if (recommendations.length > 0) {
    sectionHeading('AI RECOMMENDATIONS');

    const pMap: Record<string, { rgb: RGB; label: string }> = {
      critical: { rgb: C.red,    label: 'CRITICAL' },
      high:     { rgb: C.orange, label: 'HIGH'     },
      medium:   { rgb: C.yellow, label: 'MEDIUM'   },
      low:      { rgb: C.accent, label: 'LOW'      },
    };

    recommendations.forEach((rec, idx) => {
      const pm    = pMap[rec.priority] ?? pMap.low;
      normal(8); // for splitTextToSize estimation
      const iL = doc.splitTextToSize((rec.issue  || ''), CONTENT_W - 22).length;
      const aL = doc.splitTextToSize((rec.action || ''), CONTENT_W - 22).length;
      const imL= doc.splitTextToSize((rec.expectedImpact || ''), CONTENT_W - 22).length;
      const cardHeight = 14 + (iL + aL + imL) * 4.5 + 6;

      addPageIfNeeded(cardHeight);

      // Card background
      setFill(C.bg); setStroke(C.divider); doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CONTENT_W, cardHeight, 3, 3, 'FD');

      // Left colour accent strip
      setFill(pm.rgb); doc.roundedRect(ML, y, 4, cardHeight, 2, 2, 'F');

      // Number & priority badge
      const badgeX = ML + 8;
      bold(7); setTxt(C.white);
      setFill(pm.rgb);
      doc.roundedRect(badgeX, y + 4, 22, 6, 1.5, 1.5, 'F');
      doc.text(pm.label, badgeX + 11, y + 8.5, { align: 'center' });

      // Title
      bold(9.5); setTxt(C.navy);
      doc.text(`${idx + 1}.  ${rec.title}`, badgeX + 26, y + 9);

      // Category chip
      if (rec.category) {
        normal(6.5); setTxt(C.grey);
        doc.text('[' + rec.category + ']', W - MR, y + 9, { align: 'right' });
      }

      let ry = y + 14;

      // Issue
      normal(7.5); setTxt(C.grey);
      doc.text('Issue:', ML + 7, ry);
      setTxt(C.navy);
      const iLines = doc.splitTextToSize(rec.issue || '', CONTENT_W - 22);
      doc.text(iLines, ML + 22, ry);
      ry += iLines.length * 4.5 + 1;

      // Action
      setTxt(C.grey);
      doc.text('Action:', ML + 7, ry);
      setTxt([40, 100, 60] as RGB);
      const aLines = doc.splitTextToSize(rec.action || '', CONTENT_W - 22);
      doc.text(aLines, ML + 22, ry);
      ry += aLines.length * 4.5 + 1;

      // Impact
      setTxt(C.grey);
      doc.text('Impact:', ML + 7, ry);
      setTxt(C.accent);
      const imLines = doc.splitTextToSize(rec.expectedImpact || '', CONTENT_W - 22);
      doc.text(imLines, ML + 22, ry);

      y += cardHeight + 4;
    });
  }

  // ── Beginner Tips ─────────────────────────────────────────────────────────
  if ((report.beginnerTips?.length ?? 0) > 0) {
    sectionHeading('TIPS FOR BEGINNERS');
    (report.beginnerTips||[]).slice(0, 5).forEach(tip => {
      addPageIfNeeded(10);
      setFill(C.yellow); doc.roundedRect(ML, y, 4, 4, 0.5, 0.5, 'F');
      normal(8.5); setTxt([80, 60, 0] as RGB);
      const lines = doc.splitTextToSize(tip, CONTENT_W - 8);
      doc.text(lines, ML + 7, y + 3.5);
      y += lines.length * 4.5 + 3;
    });
    y += 2;
  }

  // ── Disclaimer ────────────────────────────────────────────────────────────
  addPageIfNeeded(24);
  setFill(C.bgCard); setStroke(C.divider); doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CONTENT_W, 20, 3, 3, 'FD');
  setFill(C.accent); doc.roundedRect(ML, y, 4, 20, 2, 2, 'F');

  bold(8); setTxt(C.accent);
  doc.text('DISCLAIMER', ML + 8, y + 6);

  normal(7.5); setTxt(C.grey);
  const discText = report.disclaimer ||
    'This report is generated for educational purposes only within the Trado virtual stock market simulation. All portfolio holdings, transactions, and funds are entirely virtual and simulated. This does NOT constitute real financial advice. Please consult a licensed financial advisor before making any real investment decisions.';
  const discLines = doc.splitTextToSize(discText, CONTENT_W - 12);
  doc.text(discLines, ML + 8, y + 12);
  y += 24;

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter();
  }

  doc.save(`Trado_Portfolio_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}


// ─── Main Component ───────────────────────────────────────────────────────────

export const AIAssistantView: React.FC = () => {
  const { holdings, user, aiState, setAiState, aiChatMessages, setAiChatMessages, aiChatSessions, setAiChatSessions } = useApp();
  const { analysis, riskProfile, recommendations, report, hasAnalyzed } = aiState;

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const saved = sessionStorage.getItem('ai_assistant_default_tab');
    if (saved === 'chat') {
      sessionStorage.removeItem('ai_assistant_default_tab');
      return 'chat';
    }
    return 'overview';
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg]   = useState('');
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Chat state
  const [chatInput, setChatInput]   = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const currentSessionId = activeSessionId || 'default';

  const chatEndRef  = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── Scroll chat to bottom ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages, isChatLoading]);

  // ── Loading step progress ──
  useEffect(() => {
    if (!isAnalyzing) { setLoadingStep(0); return; }
    const interval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev);
    }, 1600);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // ── API: Run full analysis + report ──
  const runAnalysis = async () => {
    if (!user || holdings.length === 0) return;
    setIsAnalyzing(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('trado_token');
      const res = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ holdings, walletBalance: user.walletBalance }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAiState({
        report: data.report,
        analysis: data.analysis,
        riskProfile: data.riskProfile,
        recommendations: data.recommendations || [],
        hasAnalyzed: true
      });
    } catch (err: any) {
      setErrorMsg('Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── API: Chat ──
  const sendChatMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || !user) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setAiChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    setSuggestedFollowUps([]);

    try {
      const token = localStorage.getItem('trado_token');
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId: currentSessionId,
          userEmail: user.email,
          holdings,
          walletBalance: user.walletBalance,
          latestReport: report,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      
      const newAssistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        sources: data.sources,
      };
      
      setAiChatMessages(prev => {
        const updated = [...prev, newAssistantMsg];
        syncSession(updated);
        return updated;
      });
      if (data.suggestedFollowUps?.length) setSuggestedFollowUps(data.suggestedFollowUps);
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: '⚠️ I encountered an error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      };
      setAiChatMessages(prev => {
        const updated = [...prev, errorMsg];
        syncSession(updated);
        return updated;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const syncSession = (messages: ChatMessage[]) => {
    if (messages.length === 0) return;
    setAiChatSessions(prev => {
      const existingIdx = prev.findIndex(s => s.id === currentSessionId);
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 30) + '...' || 'New Chat';
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], messages };
        return next;
      }
      return [{ id: currentSessionId, title, date: new Date().toISOString(), messages }, ...prev];
    });
  };

  const startNewChat = () => {
    setActiveSessionId(`sess_${Date.now()}`);
    setAiChatMessages([]);
    setSuggestedFollowUps([]);
  };

  const loadSession = (sessionId: string) => {
    const session = aiChatSessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setAiChatMessages(session.messages);
      setSuggestedFollowUps([]);
    }
  };

  // ── Toggle recommendation expansion ──
  const toggleRec = (id: string) =>
    setExpandedRecs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Handle PDF download ──
  const handleDownloadPDF = async () => {
    if (!report || !analysis) return;
    setIsPdfGenerating(true);
    await new Promise(r => setTimeout(r, 100)); // brief pause for UI
    generatePDF(report, analysis, recommendations);
    setIsPdfGenerating(false);
  };

  // ─── RENDER: Landing (before analysis) ───────────────────────────────────────
  const renderLanding = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Card style={{ maxWidth: 520, textAlign: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,107,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(79,107,255,0.2), rgba(108,92,231,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(79,107,255,0.25)',
        }}>
          <Brain size={36} color={accent} />
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
          AI Portfolio Assistant
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
          Get AI-powered portfolio analysis, smart recommendations, and a downloadable PDF report — all in one click.
        </p>

        {holdings.length === 0 ? (
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(255,214,0,0.08)', border: '1px solid rgba(255,214,0,0.2)',
            color: '#ffd600', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <AlertTriangle size={16} />
            Add holdings in Virtual Trading to unlock AI analysis.
          </div>
        ) : (
          <>
            {errorMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(240,87,107,0.1)', border: '1px solid rgba(240,87,107,0.25)',
                color: danger, fontSize: 13,
              }}>
                {errorMsg}
              </div>
            )}
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              style={{
                width: '100%', padding: '15px 32px', borderRadius: 14, border: 'none',
                background: isAnalyzing
                  ? 'rgba(79,107,255,0.3)'
                  : 'linear-gradient(135deg, #4f6bff 0%, #6c5ce7 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: isAnalyzing ? 'default' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: isAnalyzing ? 'none' : '0 4px 20px rgba(79,107,255,0.35)',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
              onMouseEnter={e => { if (!isAnalyzing) (e.currentTarget).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; }}
            >
              {isAnalyzing
                ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <Zap size={18} />
              }
              {isAnalyzing ? 'Analyzing Portfolio…' : 'Launch AI Analysis'}
            </button>

            {isAnalyzing && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                {LOADING_STEPS.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                    opacity: i <= loadingStep ? 1 : 0.25, transition: 'opacity 0.4s ease',
                  }}>
                    {i < loadingStep
                      ? <CheckCircle size={14} color={success} />
                      : i === loadingStep
                        ? <RefreshCw size={14} color={accent} style={{ animation: 'spin 1s linear infinite' }} />
                        : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                    }
                    <span style={{ fontSize: 12, color: i <= loadingStep ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );

  // ─── RENDER: Overview Tab ─────────────────────────────────────────────────────
  const renderOverview = () => {
    if (!analysis || !report) return renderLanding();

    const pnlPositive = analysis.totalProfitLoss >= 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Top action bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: success, boxShadow: `0 0 8px ${success}` }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Analysis active • {new Date(report.generatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,107,255,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <RefreshCw size={14} style={isAnalyzing ? { animation: 'spin 1s linear infinite' } : {}} />
              Refresh
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isPdfGenerating}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: isPdfGenerating ? 'rgba(79,107,255,0.3)' : 'linear-gradient(135deg, #4f6bff, #6c5ce7)',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: isPdfGenerating ? 'default' : 'pointer',
                boxShadow: '0 2px 12px rgba(79,107,255,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isPdfGenerating) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              <Download size={14} />
              {isPdfGenerating ? 'Generating…' : 'Download PDF Report'}
            </button>
          </div>
        </div>

        {/* ── Key metrics row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            {
              label: 'Portfolio Value',
              value: fmt(analysis.totalPortfolioValue),
              icon: <BarChart3 size={16} />,
              color: accent,
              sub: null,
            },
            {
              label: 'Total P&L',
              value: fmt(Math.abs(analysis.totalProfitLoss)),
              icon: pnlPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
              color: pnlPositive ? success : danger,
              sub: fmtPct(analysis.totalProfitLossPct),
            },
            {
              label: 'Sharpe Ratio',
              value: fmtNum(analysis.sharpeRatio),
              icon: <Activity size={16} />,
              color: analysis.sharpeRatio >= 1 ? success : analysis.sharpeRatio >= 0 ? warn : danger,
              sub: analysis.sharpeRatio >= 1 ? 'Good' : analysis.sharpeRatio >= 0 ? 'Average' : 'Poor',
            },
            {
              label: 'Health Score',
              value: `${analysis.healthScore ?? '--'}/100`,
              icon: <Target size={16} />,
              color: (analysis.healthScore ?? 0) >= 70 ? success : (analysis.healthScore ?? 0) >= 40 ? warn : danger,
              sub: null,
            },
          ].map((stat, i) => (
            <Card key={i} hover style={{ position: 'relative', overflow: 'hidden', padding: '18px 20px' }}>
              <div style={{
                position: 'absolute', top: -24, right: -24, width: 80, height: 80,
                borderRadius: '50%', background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {pnlPositive && stat.label === 'Total P&L' ? '+' : stat.label === 'Total P&L' && !pnlPositive ? '-' : ''}
                {stat.value}
              </div>
              {stat.sub && (
                <div style={{ fontSize: 12, color: stat.color, fontWeight: 600, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  {stat.sub}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* ── Executive Summary ── */}
        <Card style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FileText size={18} color={accent} />
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>
              Executive Summary
            </h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            {report.executiveSummary}
          </p>
          {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
              {report.strengths?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: success, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    ✅ Strengths
                  </div>
                  {report.strengths.slice(0, 3).map((s, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                      background: 'rgba(62,207,142,0.07)', borderLeft: `3px solid ${success}`,
                      fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
              {report.weaknesses?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: danger, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    ⚠️ Areas to Improve
                  </div>
                  {report.weaknesses.slice(0, 3).map((w, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                      background: 'rgba(240,87,107,0.07)', borderLeft: `3px solid ${danger}`,
                      fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
                    }}>
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Sector Allocation + Performers row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Sector allocation */}
          <Card style={{ padding: '20px 22px' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Sector Allocation
            </h3>
            {(analysis.sectorAllocation || []).map((s, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>{s.sector}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.percentage.toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${Math.min(s.percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${accent}, #6c5ce7)`,
                    boxShadow: `0 0 8px ${accent}44`,
                    transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Top & Worst */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card style={{ flex: 1, padding: '18px 22px' }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: success, marginBottom: 12 }}>
                🏆 Top Performers
              </h3>
              {(analysis.topPerforming || []).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < analysis.topPerforming.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{h.symbol}</span>
                  <span style={{ fontSize: 13, color: success, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    <ArrowUpRight size={12} style={{ display: 'inline', marginRight: 2 }} />
                    {h.gain.toFixed(2)}%
                  </span>
                </div>
              ))}
            </Card>
            <Card style={{ flex: 1, padding: '18px 22px' }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: danger, marginBottom: 12 }}>
                📉 Worst Performers
              </h3>
              {(analysis.worstPerforming || []).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < analysis.worstPerforming.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{h.symbol}</span>
                  <span style={{ fontSize: 13, color: danger, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    <ArrowDownRight size={12} style={{ display: 'inline', marginRight: 2 }} />
                    {h.loss.toFixed(2)}%
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Target size={18} color={accent} />
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>
                AI Recommendations
              </h3>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                {recommendations.length} suggestions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommendations.map(rec => {
                const pm = priorityMap[rec.priority] || priorityMap.low;
                const isOpen = expandedRecs.has(rec.id);
                return (
                  <Card key={rec.id} style={{ padding: 0, overflow: 'hidden', border: `1px solid ${pm.border}` }}>
                    <button
                      onClick={() => toggleRec(rec.id)}
                      style={{
                        width: '100%', padding: '16px 20px', background: pm.bg,
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{rec.icon || '💡'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                            letterSpacing: 0.5, background: `${pm.text}22`, color: pm.text,
                          }}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{rec.title}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{rec.category}</span>
                      </div>
                      {isOpen
                        ? <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                        : <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
                      }
                    </button>

                    {isOpen && (
                      <div style={{ padding: '16px 20px', borderTop: `1px solid ${pm.border}`, background: 'rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Issue</div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{rec.issue}</p>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Action</div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{rec.action}</p>
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Why it matters</div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{rec.reason}</p>
                        </div>
                        {rec.advantages?.length > 0 && (
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, color: success, fontWeight: 600, marginBottom: 6 }}>✅ Advantages</div>
                              {rec.advantages.map((a, i) => <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>• {a}</div>)}
                            </div>
                            {rec.disadvantages?.length > 0 && (
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: warn, fontWeight: 600, marginBottom: 6 }}>⚠️ Trade-offs</div>
                                {rec.disadvantages.map((d, i) => <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>• {d}</div>)}
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{
                          padding: '10px 14px', borderRadius: 8,
                          background: 'rgba(79,107,255,0.08)', border: '1px solid rgba(79,107,255,0.15)',
                          fontSize: 12.5, color: 'rgba(255,255,255,0.65)',
                        }}>
                          <span style={{ color: accent, fontWeight: 600 }}>Expected Impact: </span>
                          {rec.expectedImpact}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11.5, color: 'rgba(255,255,255,0.28)', lineHeight: 1.7,
        }}>
          ⚠️ All analysis is for educational purposes within the Trado virtual simulation. This is not real financial advice. Consult a licensed financial advisor for real investment decisions.
        </div>
      </div>
    );
  };

  // ─── RENDER: Chat Tab ─────────────────────────────────────────────────────────
  const renderChat = () => (
    <div style={{ display: 'flex', gap: 20, height: '80vh', minHeight: 600 }}>
      {/* Sidebar: Chat History */}
      <div style={{
        width: 260, display: 'flex', flexDirection: 'column', gap: 12,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16, padding: 16, overflowY: 'auto'
      }}>
        <button
          onClick={startNewChat}
          style={{
            padding: '12px', borderRadius: 12, border: '1px solid rgba(79,107,255,0.3)',
            background: 'rgba(79,107,255,0.1)', color: accent, fontSize: 13,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.1)'; }}
        >
          + New Chat
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 }}>
          Past Sessions
        </div>
        {aiChatSessions.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            No past sessions yet.
          </div>
        ) : (
          aiChatSessions.map(session => (
            <div
              key={session.id}
              onClick={() => loadSession(session.id)}
              style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: activeSessionId === session.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid',
                borderColor: activeSessionId === session.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (activeSessionId !== session.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeSessionId !== session.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.title}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                {new Date(session.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Chat Window */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, maxWidth: 800, margin: '0 auto', width: '100%' }}>

      {/* Chat window */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(79,107,255,0.05)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #4f6bff22, #6c5ce711)',
            border: '1px solid rgba(79,107,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color={accent} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>FinBot — AI Financial Assistant</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: success }} />
              Online • Ask me anything about your portfolio or markets
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          minHeight: 380, maxHeight: 480, overflowY: 'auto',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {aiChatMessages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                background: 'rgba(79,107,255,0.1)', border: '1px solid rgba(79,107,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={26} color={accent} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 20px' }}>
                Ask me anything about your portfolio or financial concepts
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SUGGESTED_PROMPTS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendChatMessage(q)}
                    style={{
                      padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(79,107,255,0.2)',
                      background: 'rgba(79,107,255,0.07)', color: accent,
                      fontSize: 12.5, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.07)'; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiChatMessages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeInUp 0.3s ease',
            }}>
              <div style={{
                maxWidth: '75%', padding: '13px 17px', borderRadius: 16,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #4f6bff, #6c5ce7)'
                  : 'rgba(255,255,255,0.04)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius:  msg.role === 'user' ? 16 : 4,
              }}>
                <p style={{
                  margin: 0, fontSize: 13.5, lineHeight: 1.75,
                  color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.8)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </p>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                      Sources
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {msg.sources.map((src, j) => (
                        <span key={j} style={{
                          padding: '2px 9px', borderRadius: 5, fontSize: 11,
                          background: 'rgba(79,107,255,0.12)', color: accent,
                        }}>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <span style={{
                  display: 'block', fontSize: 10, marginTop: 6,
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div style={{ display: 'flex' }}>
              <div style={{
                padding: '13px 20px', borderRadius: 16, borderBottomLeftRadius: 4,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {[0, 1, 2].map(k => (
                  <div key={k} style={{
                    width: 7, height: 7, borderRadius: '50%', background: accent,
                    animation: `typingBounce 1.4s ease-in-out ${k * 0.2}s infinite`, opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 10,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '0 14px', transition: 'border-color 0.2s',
          }}
            onFocus={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,107,255,0.35)'}
            onBlur={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(chatInput); } }}
              placeholder="Ask about your portfolio, markets, or financial concepts…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13.5, padding: '13px 0',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <button
            onClick={() => sendChatMessage(chatInput)}
            disabled={!chatInput.trim() || isChatLoading}
            style={{
              width: 48, height: 48, borderRadius: 12, border: 'none',
              background: chatInput.trim() ? 'linear-gradient(135deg, #4f6bff, #6c5ce7)' : 'rgba(79,107,255,0.12)',
              color: '#fff', cursor: chatInput.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: chatInput.trim() ? '0 2px 12px rgba(79,107,255,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Send size={17} />
          </button>
        </div>
      </Card>

      {/* Suggested follow-ups */}
      {suggestedFollowUps.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {suggestedFollowUps.map((q, i) => (
            <button
              key={i}
              onClick={() => sendChatMessage(q)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(79,107,255,0.2)',
                background: 'rgba(79,107,255,0.07)', color: accent,
                fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,107,255,0.07)'; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      `}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(79,107,255,0.2), rgba(79,107,255,0.06))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(79,107,255,0.2)',
        }}>
          <Brain size={22} color={accent} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>
            AI Assistant
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: '2px 0 0' }}>
            Portfolio analysis, recommendations & financial advisor
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24, padding: 4, borderRadius: 12,
        background: 'rgba(21,27,38,0.7)', border: '1px solid rgba(255,255,255,0.04)',
        width: 'fit-content', backdropFilter: 'blur(12px)',
      }}>
        {([
          { key: 'overview' as TabKey, label: 'Overview',    icon: <BarChart3 size={15} /> },
          { key: 'chat'     as TabKey, label: 'AI Chatbot',  icon: <MessageCircle size={15} /> },
        ]).map(tab => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 9, border: 'none',
                background: active ? 'rgba(79,107,255,0.18)' : 'transparent',
                color: active ? accent : 'rgba(255,255,255,0.42)',
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: active ? '0 0 16px rgba(79,107,255,0.1)' : 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.42)'; }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'chat'     && renderChat()}
      </div>
    </div>
  );
};
