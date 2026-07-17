import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  GraduationCap, 
  Play, 
  ArrowRight, 
  BookmarkCheck, 
  ShieldAlert,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Calculator,
  HelpCircle,
  Trophy,
  Star,
  MessageSquare,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { 
  MODULES_DATA, 
  FINAL_ASSESSMENT_QUESTIONS, 
  ModuleData, 
  LessonData, 
  QuizQuestionData 
} from './LearningData';

// ── UTILITY: FISHER-YATES SHUFFLE FOR RANDOMISATION ──
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuiz(questions: QuizQuestionData[]): QuizQuestionData[] {
  // Shuffle the order of questions
  const shuffledQuestions = shuffleArray(questions);
  
  // For each question, shuffle the answer options and update the correct index
  return shuffledQuestions.map((q) => {
    const correctText = q.options[q.correctAnswerIndex];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);
    
    return {
      ...q,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
    };
  });
}

// ── WIDGET 1: BUDGET PLANNER ──
const BudgetPlanner: React.FC = () => {
  const [income, setIncome] = useState<number>(50000);
  const [needs, setNeeds] = useState<number>(25000);
  const [wants, setWants] = useState<number>(15000);
  const [savings, setSavings] = useState<number>(10000);

  const totalSpent = needs + wants + savings;
  const needsPercent = Math.round((needs / income) * 100) || 0;
  const wantsPercent = Math.round((wants / income) * 100) || 0;
  const savingsPercent = Math.round((savings / income) * 100) || 0;

  return (
    <div className="glassmorphism p-5 rounded-2xl border border-white/[0.06] space-y-4 my-6">
      <h4 className="text-white font-display font-semibold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-indigo-400" />
        Interactive Tool: 50/30/20 Budget Planner
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Monthly After-Tax Income (₹)</label>
            <input 
              type="number" 
              value={income}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setIncome(val);
                setNeeds(Math.round(val * 0.5));
                setWants(Math.round(val * 0.3));
                setSavings(Math.round(val * 0.2));
              }}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Needs (Target: 50% = ₹{(income * 0.5).toLocaleString()})</span>
              <span className={needsPercent > 50 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>{needsPercent}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={income} 
              value={needs}
              onChange={(e) => setNeeds(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Wants (Target: 30% = ₹{(income * 0.3).toLocaleString()})</span>
              <span className={wantsPercent > 30 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>{wantsPercent}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={income} 
              value={wants}
              onChange={(e) => setWants(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Savings & Debt (Target: 20% = ₹{(income * 0.2).toLocaleString()})</span>
              <span className={savingsPercent < 20 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>{savingsPercent}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={income} 
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Budget Diagnosis</span>
            <div className="text-sm">
              {totalSpent > income ? (
                <p className="text-rose-400 font-semibold">⚠️ You are overspending! Total allocated: ₹{totalSpent.toLocaleString()} exceeds income by ₹{(totalSpent - income).toLocaleString()}.</p>
              ) : totalSpent < income ? (
                <p className="text-amber-400 font-semibold">ℹ️ You have ₹{(income - totalSpent).toLocaleString()} unallocated monthly income.</p>
              ) : (
                <p className="text-emerald-400 font-semibold">✅ Budget fully balanced! 100% of income is allocated.</p>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-gray-400 mt-2">
              <div className="flex justify-between">
                <span>Needs Actual:</span>
                <span className={needsPercent > 50 ? "text-rose-400" : "text-gray-300"}>₹{needs.toLocaleString()} ({needsPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Wants Actual:</span>
                <span className={wantsPercent > 30 ? "text-rose-400" : "text-gray-300"}>₹{wants.toLocaleString()} ({wantsPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Savings Actual:</span>
                <span className={savingsPercent < 20 ? "text-amber-400" : "text-emerald-400"}>₹{savings.toLocaleString()} ({savingsPercent}%)</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-3 mt-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-2">Visual Split</span>
            <div className="h-4 rounded bg-white/[0.03] overflow-hidden flex">
              <div style={{ width: `${(needs / (totalSpent || 1)) * 100}%`, background: '#4f6bff' }} title="Needs" />
              <div style={{ width: `${(wants / (totalSpent || 1)) * 100}%`, background: '#8b93a7' }} title="Wants" />
              <div style={{ width: `${(savings / (totalSpent || 1)) * 100}%`, background: '#3ecf8e' }} title="Savings" />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>Needs ({Math.round((needs / (totalSpent || 1)) * 100) || 0}%)</span>
              <span>Wants ({Math.round((wants / (totalSpent || 1)) * 100) || 0}%)</span>
              <span>Savings ({Math.round((savings / (totalSpent || 1)) * 100) || 0}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WIDGET 2: EMERGENCY FUND CALCULATOR ──
const EmergencyCalculator: React.FC = () => {
  const [expenses, setExpenses] = useState<number>(30000);
  const [months, setMonths] = useState<number>(6);
  const [saved, setSaved] = useState<number>(45000);

  const targetAmount = expenses * months;
  const progressPercent = Math.min(100, Math.round((saved / (targetAmount || 1)) * 100)) || 0;

  return (
    <div className="glassmorphism p-5 rounded-2xl border border-white/[0.06] space-y-4 my-6">
      <h4 className="text-white font-display font-semibold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-indigo-400" />
        Interactive Tool: Emergency Fund Calculator
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Monthly Essential Expenses (Rent, Food, Bills) (₹)</label>
            <input 
              type="number" 
              value={expenses}
              onChange={(e) => setExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Target Buffer (Months)</label>
            <select 
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="3">3 Months (Basic)</option>
              <option value="6">6 Months (Recommended)</option>
              <option value="9">9 Months (High Safety)</option>
              <option value="12">12 Months (Freelancer / Volatile)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Current Emergency Savings (₹)</label>
            <input 
              type="number" 
              value={saved}
              onChange={(e) => setSaved(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Target Goal</span>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block">Total Fund Target:</span>
              <span className="text-2xl font-mono font-bold text-white">₹{targetAmount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/[0.03] rounded-full h-2.5 mt-2">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-emerald-400 font-semibold">{progressPercent}% Saved</span>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-3 mt-3 text-xs text-gray-400">
            {progressPercent >= 100 ? (
              <p className="text-emerald-400">🎉 Excellent! Your emergency fund is fully loaded. You have a solid financial safety net.</p>
            ) : progressPercent >= 50 ? (
              <p className="text-indigo-300">👍 Decent buffer! You are halfway to your target. Keep contributing consistently.</p>
            ) : (
              <p className="text-amber-400">⚠️ You need to save ₹{(targetAmount - saved).toLocaleString()} more. Automate a monthly transfer to build your buffer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WIDGET 3: COMPOUND INTEREST CALCULATOR ──
const CompoundCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(10);
  const [years, setYears] = useState<number>(10);
  const [freq, setFreq] = useState<number>(1); // 1 = annually, 12 = monthly

  const r = rate / 100;
  const n = freq;
  const t = years;

  const compoundBalance = principal * Math.pow(1 + r / n, n * t);
  const compoundInterest = compoundBalance - principal;

  const simpleBalance = principal * (1 + r * t);
  const difference = compoundBalance - simpleBalance;

  return (
    <div className="glassmorphism p-5 rounded-2xl border border-white/[0.06] space-y-4 my-6">
      <h4 className="text-white font-display font-semibold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-indigo-400" />
        Interactive Tool: Compound Interest Calculator
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Initial Principal Investment (₹)</label>
            <input 
              type="number" 
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Annual Interest Rate (%)</label>
            <input 
              type="number" 
              value={rate}
              step="0.1"
              onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Duration (Years)</span>
              <span className="text-white font-mono font-semibold">{years} Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Compounding Frequency</label>
            <select 
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="1">Annually</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Total Future Balance</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">₹{Math.round(compoundBalance).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 border-t border-white/[0.04] pt-2">
              <div>
                <span>Principal:</span>
                <span className="block text-white font-semibold">₹{principal.toLocaleString()}</span>
              </div>
              <div>
                <span>Interest Earned:</span>
                <span className="block text-emerald-400 font-semibold">₹{Math.round(compoundInterest).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-3 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-400">
              <span>With Compounding:</span>
              <span className="text-white font-mono">₹{Math.round(compoundBalance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>With Simple Interest:</span>
              <span className="text-white font-mono">₹{Math.round(simpleBalance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-dashed border-white/[0.06] pt-1.5 text-indigo-400">
              <span>Compounding Advantage:</span>
              <span>₹{Math.round(difference).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WIDGET 4: RISK PROFILE QUIZ ──
const RiskProfileQuiz: React.FC = () => {
  const [q1, setQ1] = useState<number>(-1);
  const [q2, setQ2] = useState<number>(-1);
  const [q3, setQ3] = useState<number>(-1);
  const [q4, setQ4] = useState<number>(-1);
  const [result, setResult] = useState<string>('');

  const questions = [
    {
      text: "What is your main investment objective?",
      options: [
        { text: "Capital preservation; I cannot afford loss", score: 1 },
        { text: "Balanced growth and capital protection", score: 3 },
        { text: "Aggressive growth over the long run", score: 5 }
      ],
      state: q1,
      setter: setQ1
    },
    {
      text: "How would you react if your stock portfolio dropped by 20% in a month?",
      options: [
        { text: "Panic and liquidate all my positions to prevent further loss", score: 1 },
        { text: "Hold tight, trust the process, and do nothing", score: 3 },
        { text: "View it as a massive discount sale and buy more aggressively", score: 5 }
      ],
      state: q2,
      setter: setQ2
    },
    {
      text: "What is your investment horizon (how long until you need this cash)?",
      options: [
        { text: "Under 2 years", score: 1 },
        { text: "3 to 7 years", score: 3 },
        { text: "Over 8 years", score: 5 }
      ],
      state: q3,
      setter: setQ3
    },
    {
      text: "What is your level of financial knowledge and experience?",
      options: [
        { text: "Beginner; just starting to learn", score: 1 },
        { text: "Intermediate; understand key assets and ratios", score: 3 },
        { text: "Advanced; comfortable with charting and trading mechanics", score: 5 }
      ],
      state: q4,
      setter: setQ4
    }
  ];

  const calculateProfile = () => {
    if (q1 === -1 || q2 === -1 || q3 === -1 || q4 === -1) return;
    const totalScore = q1 + q2 + q3 + q4;
    if (totalScore <= 6) setResult('Conservative');
    else if (totalScore <= 14) setResult('Moderate');
    else setResult('Aggressive');
  };

  const handleReset = () => {
    setQ1(-1);
    setQ2(-1);
    setQ3(-1);
    setQ4(-1);
    setResult('');
  };

  return (
    <div className="glassmorphism p-5 rounded-2xl border border-white/[0.06] space-y-4 my-6">
      <h4 className="text-white font-display font-semibold flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-indigo-400" />
        Interactive Tool: Risk Profile Audit
      </h4>

      {!result ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-xs text-indigo-400 font-semibold">Question {idx + 1}: {q.text}</span>
              <div className="grid gap-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => q.setter(opt.score)}
                    className={`text-left text-xs p-2.5 rounded-lg border transition ${
                      q.state === opt.score
                        ? "bg-indigo-950/30 border-indigo-500 text-white"
                        : "bg-white/[0.01] border-white/[0.06] hover:border-white/[0.1] text-gray-400"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            disabled={q1 === -1 || q2 === -1 || q3 === -1 || q4 === -1}
            onClick={calculateProfile}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Calculate My Risk Profile
          </button>
        </div>
      ) : (
        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl text-center space-y-4">
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Your Calculated Profile</span>
            <span className={`text-3xl font-display font-bold block mt-1 ${
              result === 'Conservative' ? 'text-emerald-400' : result === 'Moderate' ? 'text-indigo-400' : 'text-rose-400'
            }`}>
              {result} Investor
            </span>
          </div>

          <div className="border-t border-white/[0.04] pt-4 max-w-sm mx-auto text-xs text-gray-400 space-y-3">
            {result === 'Conservative' ? (
              <p>🛡️ Your priority is preserving capital. We suggest a **Conservative Allocation**: 20% Equity, 70% Debt/Fixed Income, and 10% Gold.</p>
            ) : result === 'Moderate' ? (
              <p>⚖️ You seek a balance of safety and growth. We suggest a **Moderate Allocation**: 50% Equity, 40% Debt/Fixed Income, and 10% Gold.</p>
            ) : (
              <p>🚀 You embrace volatility for outsized long-term gains. We suggest an **Aggressive Allocation**: 80% Equity, 15% Debt/Fixed Income, and 5% Gold.</p>
            )}

            <div className="h-4 rounded bg-white/[0.03] overflow-hidden flex mt-2">
              <div 
                style={{ 
                  width: result === 'Conservative' ? '20%' : result === 'Moderate' ? '50%' : '80%', 
                  background: 'var(--color-trado-accent)' 
                }} 
                title="Equity" 
              />
              <div 
                style={{ 
                  width: result === 'Conservative' ? '70%' : result === 'Moderate' ? '40%' : '15%', 
                  background: '#8b93a7' 
                }} 
                title="Debt" 
              />
              <div 
                style={{ 
                  width: result === 'Conservative' ? '10%' : result === 'Moderate' ? '10%' : '5%', 
                  background: '#ffd700' 
                }} 
                title="Gold" 
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>Equity ({result === 'Conservative' ? '20%' : result === 'Moderate' ? '50%' : '80%'})</span>
              <span>Debt ({result === 'Conservative' ? '70%' : result === 'Moderate' ? '40%' : '15%'})</span>
              <span>Gold ({result === 'Conservative' ? '10%' : result === 'Moderate' ? '10%' : '5%'})</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-white transition font-mono border border-dashed border-white/[0.1] px-4 py-1.5 rounded-lg cursor-pointer"
          >
            Retake Profile Quiz
          </button>
        </div>
      )}
    </div>
  );
};

// ── WIDGET 5: INVESTMENT GROWTH CALCULATOR (SIP) ──
const InvestmentGrowthCalculator: React.FC = () => {
  const [monthly, setMonthly] = useState<number>(5000);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(15);

  const i = rate / 12 / 100;
  const n = years * 12;

  const futureValue = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const totalInvested = monthly * n;
  const estimatedReturns = futureValue - totalInvested;

  return (
    <div className="glassmorphism p-5 rounded-2xl border border-white/[0.06] space-y-4 my-6">
      <h4 className="text-white font-display font-semibold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-indigo-400" />
        Interactive Tool: SIP Wealth Growth Planner
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Monthly Investment (SIP Amount) (₹)</label>
            <input 
              type="number" 
              value={monthly}
              onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Expected Annual Return Rate (%)</label>
            <input 
              type="number" 
              value={rate}
              step="0.1"
              onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Investment Horizon (Years)</span>
              <span className="text-white font-mono font-semibold">{years} Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 block">Estimated Future Wealth</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">₹{Math.round(futureValue).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 border-t border-white/[0.04] pt-2">
              <div>
                <span>Total Invested:</span>
                <span className="block text-white font-semibold">₹{totalInvested.toLocaleString()}</span>
              </div>
              <div>
                <span>Wealth Gain:</span>
                <span className="block text-emerald-400 font-semibold">₹{Math.round(estimatedReturns).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-3 text-[11px] text-gray-400 leading-relaxed">
            💡 Regularity pays off. By investing ₹{monthly.toLocaleString()} a month for {years} years at {rate}%, you generate an estimated wealth premium of <strong className="text-white">₹{Math.round(estimatedReturns).toLocaleString()}</strong> over your principal capital.
          </div>
        </div>
      </div>
    </div>
  );
};

// ── COMPONENT 6: CELEBRATION EFFECT ──
const ParticleBurst: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  
  const particles = Array.from({ length: 35 }).map((_, idx) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const color = ['#4f6bff', '#3ecf8e', '#ffd700', '#c084fc', '#f43f5e'][Math.floor(Math.random() * 5)];
    const size = 6 + Math.random() * 8;
    const delay = Math.random() * 0.15;
    return { idx, tx, ty, color, size, delay };
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 flex items-center justify-center bg-black/10">
      <style>{`
        @keyframes particleBurst {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
            opacity: 0;
          }
        }
      `}</style>
      <div className="relative w-10 h-10">
        {particles.map((p) => (
          <div
            key={p.idx}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `particleBurst 1.3s cubic-bezier(0.1, 0.8, 0.3, 1) ${p.delay}s forwards`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export const LearningCenterView: React.FC = () => {
  const { setActiveView } = useApp();

  // ── LOCAL STORAGE PROGRESS SYNC ──
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem('stockeasy_completed_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>(() => {
    const saved = localStorage.getItem('stockeasy_completed_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizScores, setQuizScores] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('stockeasy_quiz_scores');
    return saved ? JSON.parse(saved) : {};
  });

  const [finalAssessmentPassed, setFinalAssessmentPassed] = useState<boolean>(() => {
    const saved = localStorage.getItem('stockeasy_final_assessment_passed');
    return saved ? JSON.parse(saved) : false;
  });

  // Sync progress arrays to localStorage
  useEffect(() => {
    localStorage.setItem('stockeasy_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('stockeasy_completed_quizzes', JSON.stringify(completedQuizzes));
  }, [completedQuizzes]);

  useEffect(() => {
    localStorage.setItem('stockeasy_quiz_scores', JSON.stringify(quizScores));
  }, [quizScores]);

  useEffect(() => {
    localStorage.setItem('stockeasy_final_assessment_passed', JSON.stringify(finalAssessmentPassed));
  }, [finalAssessmentPassed]);

  // ── VIEW STATES ──
  // 'roadmap' | 'lesson' | 'quiz' | 'final-assessment' | 'graduation'
  const [step, setStep] = useState<'roadmap' | 'lesson' | 'quiz' | 'final-assessment' | 'graduation'>('roadmap');

  const [activeModule, setActiveModule] = useState<ModuleData | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(0);

  // Active quiz state (shuffled)
  const [shuffledQuizQuestions, setShuffledQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);

  // Active final assessment state (shuffled)
  const [shuffledFinalQuestions, setShuffledFinalQuestions] = useState<QuizQuestionData[]>([]);
  const [finalQuestionIdx, setFinalQuestionIdx] = useState<number>(0);
  const [finalSelectedOptionIdx, setFinalSelectedOptionIdx] = useState<number | null>(null);
  const [finalAnswered, setFinalAnswered] = useState<boolean>(false);
  const [finalCorrectCount, setFinalCorrectCount] = useState<number>(0);

  // Celebration overlay trigger
  const [celebration, setCelebration] = useState<{
    show: boolean;
    title: string;
    subtitle: string;
  } | null>(null);

  const triggerCelebration = (title: string, subtitle: string) => {
    setCelebration({ show: true, title, subtitle });
    setTimeout(() => {
      setCelebration(null);
    }, 2500);
  };

  // ── UTILITY FUNCTIONS ──
  const isModuleUnlocked = (idx: number) => {
    if (idx === 0) return true;
    return completedQuizzes.includes(idx - 1);
  };

  const getModuleLessonsCompletedCount = (mod: ModuleData) => {
    return mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
  };

  const isQuizUnlockedForModule = (mod: ModuleData) => {
    return getModuleLessonsCompletedCount(mod) === mod.lessons.length;
  };

  const totalLessons = MODULES_DATA.reduce((acc, m) => acc + m.lessons.length, 0);

  const getOverallCompletionPercentage = () => {
    const totalItems = totalLessons + 7 + (finalAssessmentPassed ? 1 : 0);
    const completedItems = completedLessons.length + completedQuizzes.length + (finalAssessmentPassed ? 1 : 0);
    return Math.round((completedItems / totalItems) * 100) || 0;
  };

  // ── ROUTING REDIRECT FOR ASK A DOUBT (AI Insights) ──
  const handleAskDoubt = () => {
    // Locate the sidebar option for AI Insights and trigger its exact navigation mechanism
    const sidebarButton = document.querySelector('button[aria-label="AI Insights"]') as HTMLButtonElement | null;
    if (sidebarButton) {
      sidebarButton.click();
    } else {
      // Fallback option in case of timing/unmounting exceptions
      setActiveView('portfolio-analyzer');
    }
  };

  // ── ACTION HANDLERS ──
  const handleStartLesson = (mod: ModuleData, les: LessonData) => {
    setActiveModule(mod);
    setActiveLesson(les);
    setStep('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
      triggerCelebration("Lesson Completed!", `"${activeLesson?.title}" study verified.`);
    }
  };

  const handlePrevLesson = () => {
    if (!activeModule || !activeLesson) return;
    const currentIdx = activeModule.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx > 0) {
      setActiveLesson(activeModule.lessons[currentIdx - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (!activeModule || !activeLesson) return;
    const currentIdx = activeModule.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx < activeModule.lessons.length - 1) {
      setActiveLesson(activeModule.lessons[currentIdx + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Start / retry quiz with shuffling
  const handleStartQuiz = (mod: ModuleData) => {
    setActiveModule(mod);
    const shuffled = shuffleQuiz(mod.quiz);
    setShuffledQuizQuestions(shuffled);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setQuizAnswered(false);
    setQuizCorrectCount(0);
    setStep('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuizOption = (optIdx: number) => {
    if (quizAnswered || !activeModule || shuffledQuizQuestions.length === 0) return;
    setSelectedOptionIdx(optIdx);
    setQuizAnswered(true);
    const correctIdx = shuffledQuizQuestions[currentQuestionIdx].correctAnswerIndex;
    if (optIdx === correctIdx) {
      setQuizCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeModule || shuffledQuizQuestions.length === 0) return;
    if (currentQuestionIdx < shuffledQuizQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setQuizAnswered(false);
    } else {
      // Quiz finished
      const scorePercentage = (quizCorrectCount / shuffledQuizQuestions.length) * 100;
      const passed = scorePercentage >= 75; // >= 75% score required
      
      const currentHighestScore = quizScores[activeModule.id] || 0;
      if (quizCorrectCount > currentHighestScore) {
        setQuizScores((prev) => ({ ...prev, [activeModule.id]: quizCorrectCount }));
      }

      if (passed && !completedQuizzes.includes(activeModule.id)) {
        setCompletedQuizzes((prev) => [...prev, activeModule.id]);
        triggerCelebration("Module Quiz Passed!", `Module ${activeModule.number} Mastered!`);
      }
      
      // Moving index beyond count renders the results summary card
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  // Start / retry final assessment with shuffling
  const handleStartFinalAssessment = () => {
    const shuffled = shuffleQuiz(FINAL_ASSESSMENT_QUESTIONS);
    setShuffledFinalQuestions(shuffled);
    setFinalQuestionIdx(0);
    setFinalSelectedOptionIdx(null);
    setFinalAnswered(false);
    setFinalCorrectCount(0);
    setStep('final-assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFinalOption = (optIdx: number) => {
    if (finalAnswered || shuffledFinalQuestions.length === 0) return;
    setFinalSelectedOptionIdx(optIdx);
    setFinalAnswered(true);
    const correctIdx = shuffledFinalQuestions[finalQuestionIdx].correctAnswerIndex;
    if (optIdx === correctIdx) {
      setFinalCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextFinalQuestion = () => {
    if (shuffledFinalQuestions.length === 0) return;
    if (finalQuestionIdx < shuffledFinalQuestions.length - 1) {
      setFinalQuestionIdx((prev) => prev + 1);
      setFinalSelectedOptionIdx(null);
      setFinalAnswered(false);
    } else {
      // Final exam finished
      const scorePercent = (finalCorrectCount / shuffledFinalQuestions.length) * 100;
      if (scorePercent >= 75 && !finalAssessmentPassed) {
        setFinalAssessmentPassed(true);
        triggerCelebration("Certified Financial Master!", "Academy Course Graduated! 🎓");
        setStep('graduation');
      } else {
        setFinalQuestionIdx((prev) => prev + 1);
      }
    }
  };

  // ── WIDGET INLINE EMBEDDER ──
  const renderLessonWidget = (type?: string) => {
    if (!type) return null;
    switch (type) {
      case 'budget': return <BudgetPlanner />;
      case 'emergency': return <EmergencyCalculator />;
      case 'compound': return <CompoundCalculator />;
      case 'risk': return <RiskProfileQuiz />;
      case 'growth': return <InvestmentGrowthCalculator />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200 relative min-h-screen">
      
      {/* Celebration Overlay */}
      {celebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <ParticleBurst active={celebration.show} />
          <div className="glassmorphism p-8 rounded-3xl border border-white/[0.08] text-center max-w-sm space-y-4 shadow-2xl animate-scale-up" style={{ background: 'rgba(21, 27, 38, 0.95)' }}>
            <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400 animate-bounce">
              <Trophy className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-white">{celebration.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{celebration.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         VIEW 1: ROADMAP DASHBOARD
      ───────────────────────────────────────────────────────── */}
      {step === 'roadmap' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-indigo-400" />
                Finance Learning Academy
              </h1>
              <p className="text-gray-400 text-sm mt-1">Study corporate modules, interact with financial calculators, and pass competency audits.</p>
            </div>
            <button
              onClick={handleAskDoubt}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/20 bg-indigo-500/[0.04] hover:bg-indigo-500/10 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Ask a Doubt (AI Insights)
            </button>
          </div>

          {/* Progress Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Progress */}
            <div className="glassmorphism p-5 rounded-2xl border border-white/[0.04] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Course Progress</span>
                <h2 className="text-3xl font-display font-bold text-white mt-1">
                  {getOverallCompletionPercentage()}% <span className="text-xs text-gray-400 font-sans font-normal">Complete</span>
                </h2>
                <div className="w-full bg-white/[0.03] rounded-full h-2 mt-3">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getOverallCompletionPercentage()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Box 1: Lessons */}
            <div className="glassmorphism p-5 rounded-2xl border border-white/[0.04] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Lessons Completed</span>
                <span className="text-2xl font-mono font-bold text-white block mt-2">
                  {completedLessons.length} <span className="text-xs text-gray-500 font-normal">/ {totalLessons}</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-white/[0.04]">
                Core curriculum content read
              </p>
            </div>

            {/* Stat Box 2: Quizzes */}
            <div className="glassmorphism p-5 rounded-2xl border border-white/[0.04] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Quizzes Passed</span>
                <span className="text-2xl font-mono font-bold text-white block mt-2">
                  {completedQuizzes.length} <span className="text-xs text-gray-500 font-normal">/ 7</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-white/[0.04]">
                Module audits cleared
              </p>
            </div>

          </div>

          {/* ROADMAP TIMELINE */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-white">Learning Roadmap</h3>
            
            {MODULES_DATA.map((mod, idx) => {
              const unlocked = isModuleUnlocked(idx);
              const isCompleted = completedQuizzes.includes(mod.id);
              const lessonsDone = getModuleLessonsCompletedCount(mod);
              const quizUnlocked = isQuizUnlockedForModule(mod);
              const isOpen = expandedModuleId === mod.id;
              
              let statusBorder = 'border-white/[0.04]';
              let badgeText = 'Locked';
              let badgeStyle = 'bg-white/[0.02] border-white/[0.04] text-gray-500';

              if (unlocked) {
                if (isCompleted) {
                  statusBorder = 'border-emerald-500/30';
                  badgeText = 'Completed';
                  badgeStyle = 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400';
                } else if (lessonsDone > 0) {
                  statusBorder = 'border-indigo-500/30';
                  badgeText = 'In Progress';
                  badgeStyle = 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400';
                } else {
                  statusBorder = 'border-white/[0.1]';
                  badgeText = 'Unlocked';
                  badgeStyle = 'bg-white/[0.04] border-white/[0.1] text-gray-300';
                }
              }

              return (
                <div 
                  key={mod.id} 
                  className={`glassmorphism rounded-2xl border transition-all duration-300 relative overflow-hidden ${statusBorder} ${unlocked ? 'opacity-100' : 'opacity-50'}`}
                >
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    !unlocked ? 'bg-gray-600' : isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />

                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer pl-6" onClick={() => unlocked && setExpandedModuleId(isOpen ? null : mod.id)}>
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">{mod.duration} read time</span>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-mono ${badgeStyle}`}>{badgeText}</span>
                      </div>
                      <h4 className="text-base font-display font-bold text-white flex items-center gap-2">
                        {!unlocked ? <Lock className="h-4 w-4 text-gray-500" /> : isCompleted ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Unlock className="h-4 w-4 text-indigo-400" />}
                        Module {mod.number}: {mod.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{mod.description}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/[0.04] pt-3 md:pt-0">
                      
                      {unlocked && (
                        <div className="text-left w-32 shrink-0 hidden sm:block">
                          <span className="text-[10px] text-gray-500 block">Lessons: {lessonsDone} / {mod.lessons.length}</span>
                          <div className="w-full bg-white/[0.03] rounded-full h-1.5 mt-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(lessonsDone / mod.lessons.length) * 100}%` }} />
                          </div>
                        </div>
                      )}

                      {!unlocked ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono hidden md:inline">{isOpen ? 'Hide Lessons' : 'View Lessons'}</span>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      )}

                    </div>
                  </div>

                  {!unlocked && (
                    <div className="px-5 pb-5 pl-6 border-t border-white/[0.02] pt-3 text-xs text-amber-500/80 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Complete previous modules and pass Module {mod.number - 1}'s quiz with 75% or higher to unlock this stage.</span>
                    </div>
                  )}

                  {unlocked && isOpen && (
                    <div className="px-5 pb-5 pl-6 border-t border-white/[0.04] pt-4 space-y-4 bg-white/[0.003]">
                      
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                        <div className="text-xs text-gray-400">
                          {isCompleted ? (
                            <span className="text-emerald-400 font-semibold">✓ Passed (Score: {quizScores[mod.id] || 6}/8)</span>
                          ) : quizUnlocked ? (
                            <span className="text-indigo-300">★ Lessons completed. Take the quiz to unlock the next level!</span>
                          ) : (
                            <span>Finish all 5 lessons below to unlock the Module Quiz.</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAskDoubt}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition cursor-pointer"
                          >
                            Ask a Doubt
                          </button>
                          
                          <button
                            disabled={!quizUnlocked}
                            onClick={() => handleStartQuiz(mod)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ 
                              background: quizUnlocked ? 'var(--color-trado-accent)' : 'rgba(255,255,255,0.03)',
                              border: quizUnlocked ? 'none' : '1px solid rgba(255,255,255,0.06)'
                            }}
                          >
                            <Trophy className="h-3.5 w-3.5" />
                            {isCompleted ? 'Retake Quiz' : 'Take Module Quiz'}
                          </button>
                        </div>
                      </div>

                      {/* Lessons Grid */}
                      <div className="grid gap-2">
                        {mod.lessons.map((les, lIdx) => {
                          const done = completedLessons.includes(les.id);
                          return (
                            <div 
                              key={les.id}
                              onClick={() => handleStartLesson(mod, les)}
                              className="group flex items-center justify-between p-3 rounded-xl border border-white/[0.03] bg-white/[0.005] hover:border-white/[0.08] hover:bg-white/[0.01] transition cursor-pointer"
                            >
                              <div className="flex items-center gap-3 pr-4 truncate">
                                <div className="shrink-0">
                                  {done ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-600 group-hover:text-indigo-400 transition" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="text-[10px] font-mono text-gray-500 block">Lesson {mod.number}.{lIdx + 1}</span>
                                  <span className="text-xs text-gray-300 font-semibold group-hover:text-white transition truncate block">{les.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[9px] font-mono text-gray-500">{les.readTime}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-white transition" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {/* FINAL ASSESSMENT */}
            <div className={`glassmorphism rounded-2xl border p-6 text-center space-y-4 relative overflow-hidden transition-all duration-300 ${
              completedQuizzes.length === 7 ? 'border-amber-500/30' : 'border-white/[0.04] opacity-50'
            }`}>
              <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(245,158,11,0.04)' }} />
              
              <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                completedQuizzes.length === 7 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.02] text-gray-600 border border-white/[0.04]'
              }`}>
                <GraduationCap className="h-8 w-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-display font-bold text-white">Final Finance Competency Exam</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A comprehensive audit consisting of 20 tough financial concepts. Demonstrate mastery of budgeting, valuations, charts, mutual funds, and derivative risks.
                </p>
                {completedQuizzes.length < 7 && (
                  <span className="text-[10px] text-amber-500/80 block mt-2 font-mono">
                    ⚠️ Locked: Complete all 7 module quizzes to unlock graduation credentials.
                  </span>
                )}
              </div>

              {completedQuizzes.length === 7 && (
                <div className="pt-2">
                  {finalAssessmentPassed ? (
                    <div className="space-y-3">
                      <span className="text-emerald-400 font-mono text-xs font-semibold block">🎉 You have passed the Academy and graduated!</span>
                      <button 
                        onClick={() => setStep('graduation')}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                      >
                        View Graduation Certificate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartFinalAssessment}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                    >
                      Begin Final Assessment
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         VIEW 2: DEDICATED LESSON READER
      ───────────────────────────────────────────────────────── */}
      {step === 'lesson' && activeModule && activeLesson && (
        <div className="grid lg:grid-cols-4 gap-6 items-start animate-fade-in">
          
          {/* Reader Left Sidebar */}
          <div className="space-y-4">
            <button
              onClick={() => setStep('roadmap')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 border border-white/[0.06] bg-white/[0.005] hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roadmap
            </button>

            <div className="glassmorphism p-5 rounded-2xl border border-white/[0.04] space-y-4 text-sm">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">MODULE {activeModule.number}</span>
                <span className="text-white font-bold block mt-0.5 truncate">{activeModule.title}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">ESTIMATED TIME</span>
                <span className="text-indigo-400 font-semibold block mt-0.5">{activeLesson.readTime}</span>
              </div>
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                {completedLessons.includes(activeLesson.id) ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </span>
                ) : (
                  <span className="text-indigo-300 flex items-center gap-1 animate-pulse">
                    <Play className="h-3.5 w-3.5" />
                    Reading
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAskDoubt}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/20 bg-indigo-500/[0.04] hover:bg-indigo-500/10 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Ask a Doubt
            </button>
          </div>

          {/* Central Lesson Book */}
          <div className="lg:col-span-3 glassmorphism p-6 sm:p-8 rounded-2xl border border-white/[0.04] space-y-6 shadow-2xl relative">
            
            <div className="absolute right-4 top-4 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/15 px-2 py-0.5 rounded flex items-center gap-1">
              <BookmarkCheck className="h-3.5 w-3.5" />
              Verified Core Syllabus
            </div>

            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                STAGE {activeModule.number} • LESSON
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight border-b border-white/[0.04] pb-4 mt-1">
                {activeLesson.title}
              </h2>
            </div>

            {/* Lesson Body */}
            <div className="space-y-5 text-gray-300 text-sm leading-relaxed">
              <p className="text-base text-gray-200 leading-relaxed font-medium pl-3 border-l-2 border-indigo-500">
                {activeLesson.introduction}
              </p>

              {activeLesson.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2 mt-4">
                  <h3 className="text-base font-display font-bold text-white">{sec.heading}</h3>
                  <p>{sec.body}</p>
                </div>
              ))}

              {/* Spotlight Card */}
              <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-950/[0.12] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-indigo-400/20" />
                  Key Concept Spotlight
                </span>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  {activeLesson.importantConcept}
                </p>
              </div>

              {/* Render Lesson Widget if specified */}
              {renderLessonWidget(activeLesson.widgetType)}

              {/* Real World Example */}
              <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-950/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 block">
                  Real-World Example Case
                </span>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  {activeLesson.realWorldExample}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2 mt-6">
                <span className="text-[10px] font-mono text-indigo-400 uppercase block font-bold">Key Takeaways</span>
                <ul className="grid gap-2 text-xs">
                  {activeLesson.keyTakeaways.map((take, tIdx) => (
                    <li key={tIdx} className="flex gap-2 pl-1 leading-relaxed text-gray-400">
                      <span className="text-indigo-400 shrink-0">•</span>
                      <span>{take}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              {activeLesson.commonMistakes && activeLesson.commonMistakes.length > 0 && (
                <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-950/[0.06] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 block">
                    Common Mistakes to Avoid
                  </span>
                  <ul className="grid gap-1.5 text-xs text-gray-400 pl-1">
                    {activeLesson.commonMistakes.map((mistake, mIdx) => (
                      <li key={mIdx} className="flex gap-2 leading-relaxed">
                        <span className="text-rose-400 shrink-0">✕</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Recap */}
              <div className="border-t border-white/[0.04] pt-4 mt-6">
                <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">Quick Recap</span>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed italic">
                  "{activeLesson.quickRecap}"
                </p>
              </div>

            </div>

            {/* Navigation and Actions */}
            <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  disabled={activeModule.lessons.findIndex((l) => l.id === activeLesson.id) === 0}
                  onClick={handlePrevLesson}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous Lesson
                </button>
                <button
                  disabled={activeModule.lessons.findIndex((l) => l.id === activeLesson.id) === activeModule.lessons.length - 1}
                  onClick={handleNextLesson}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next Lesson
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleAskDoubt}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition cursor-pointer"
                >
                  Ask a Doubt
                </button>
                
                <button
                  onClick={() => handleMarkComplete(activeLesson.id)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    completedLessons.includes(activeLesson.id) 
                      ? 'bg-emerald-600/30 border border-emerald-500/20 text-emerald-300' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,107,255,0.3)]'
                  }`}
                >
                  {completedLessons.includes(activeLesson.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Marked Complete</span>
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         VIEW 3: MODULE QUIZ
      ───────────────────────────────────────────────────────── */}
      {step === 'quiz' && activeModule && shuffledQuizQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                STAGE {activeModule.number} AUDIT
              </span>
              <h2 className="text-xl font-display font-bold text-white mt-0.5">{activeModule.title} Quiz</h2>
            </div>
            <button
              onClick={() => setStep('roadmap')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition cursor-pointer"
            >
              Abort Quiz
            </button>
          </div>

          {currentQuestionIdx < shuffledQuizQuestions.length ? (
            <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-white/[0.04] space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-b border-white/[0.04] pb-3">
                <span>QUESTION {currentQuestionIdx + 1} OF {shuffledQuizQuestions.length}</span>
                <span className="text-indigo-400 font-bold">Score: {quizCorrectCount} / {currentQuestionIdx + (quizAnswered ? 1 : 0)}</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                  {shuffledQuizQuestions[currentQuestionIdx].question}
                </h3>

                <div className="grid gap-2.5 pt-2">
                  {shuffledQuizQuestions[currentQuestionIdx].options.map((opt, i) => {
                    const isSelected = selectedOptionIdx === i;
                    const isCorrectOption = shuffledQuizQuestions[currentQuestionIdx].correctAnswerIndex === i;
                    
                    let styleClass = 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] text-gray-300';
                    if (quizAnswered) {
                      if (isCorrectOption) {
                        styleClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                      } else if (isSelected) {
                        styleClass = 'border-rose-500 bg-rose-950/20 text-rose-300';
                      } else {
                        styleClass = 'border-white/[0.02] bg-white/[0.002] text-gray-600';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={quizAnswered}
                        onClick={() => handleSelectQuizOption(i)}
                        className={`w-full p-4 rounded-xl border text-left transition duration-200 text-xs sm:text-sm flex items-center justify-between cursor-pointer ${styleClass}`}
                      >
                        <span className="leading-relaxed">{opt}</span>
                        {quizAnswered && isCorrectOption && <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-3" />}
                        {quizAnswered && isSelected && !isCorrectOption && <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 ml-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {quizAnswered && (
                <div className="p-4 rounded-xl bg-indigo-950/[0.12] border border-indigo-500/15 space-y-1 animate-fade-in text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 block">Explanation</span>
                  <p className="text-gray-300 leading-relaxed">{shuffledQuizQuestions[currentQuestionIdx].explanation}</p>
                </div>
              )}

              {quizAnswered && (
                <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                  <button
                    onClick={handleAskDoubt}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask a Doubt
                  </button>
                  
                  <button
                    onClick={handleNextQuizQuestion}
                    className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentQuestionIdx === shuffledQuizQuestions.length - 1 ? 'Finish Evaluation' : 'Next Question'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            
            // QUIZ SUMMARY RESULTS CARD
            <div className="glassmorphism p-8 rounded-2xl border border-white/[0.04] text-center space-y-6 shadow-2xl">
              
              {quizCorrectCount >= Math.ceil(shuffledQuizQuestions.length * 0.75) ? (
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
              ) : (
                <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 animate-pulse">
                  <XCircle className="h-8 w-8" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold text-white">
                  {quizCorrectCount >= Math.ceil(shuffledQuizQuestions.length * 0.75) ? 'Competency Achieved!' : 'Evaluation Failed'}
                </h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                  PASS THRESHOLD: 75% ({Math.ceil(shuffledQuizQuestions.length * 0.75)} / {shuffledQuizQuestions.length} CORRECT)
                </span>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl max-w-xs mx-auto">
                <div className="text-4xl font-mono font-bold text-white">
                  {quizCorrectCount} <span className="text-gray-500 font-normal text-2xl font-mono">/ {shuffledQuizQuestions.length}</span>
                </div>
                <span className={`font-mono text-[9px] uppercase font-bold tracking-wider block mt-2 ${
                  quizCorrectCount >= Math.ceil(shuffledQuizQuestions.length * 0.75) ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {quizCorrectCount >= Math.ceil(shuffledQuizQuestions.length * 0.75) ? 'UNLOCKED NEXT SYLLABUS' : 'STUDY CORE LESSONS AGAIN'}
                </span>
              </div>

              {quizCorrectCount >= Math.ceil(shuffledQuizQuestions.length * 0.75) ? (
                <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                  Congratulations! You have verified your competency in **{activeModule.title}**. The next module on your roadmap has been unlocked.
                </p>
              ) : (
                <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                  You scored {Math.round((quizCorrectCount / shuffledQuizQuestions.length) * 100)}%, which is below the 75% required competency mark. Review the lessons inside this module and try again.
                </p>
              )}

              <div className="flex gap-3 justify-center">
                {quizCorrectCount < Math.ceil(shuffledQuizQuestions.length * 0.75) ? (
                  <>
                    <button
                      onClick={() => handleStartQuiz(activeModule)}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Retry Quiz
                    </button>
                    <button
                      onClick={() => setStep('roadmap')}
                      className="px-5 py-2.5 border border-white/[0.06] text-gray-400 hover:text-white rounded-lg text-xs transition cursor-pointer"
                    >
                      Return to Roadmap
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setStep('roadmap');
                        if (activeModule.id < 6) {
                          setExpandedModuleId(activeModule.id + 1);
                        }
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue Roadmap</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         VIEW 4: FINAL ASSESSMENT
      ───────────────────────────────────────────────────────── */}
      {step === 'final-assessment' && shuffledFinalQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div>
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
                COMPREHENSIVE FINAL EXAM
              </span>
              <h2 className="text-xl font-display font-bold text-white mt-0.5">Finance Competency Assessment</h2>
            </div>
            <button
              onClick={() => setStep('roadmap')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/[0.06] hover:text-white transition cursor-pointer"
            >
              Cancel Exam
            </button>
          </div>

          {finalQuestionIdx < shuffledFinalQuestions.length ? (
            <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-white/[0.04] space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-b border-white/[0.04] pb-3">
                <span>QUESTION {finalQuestionIdx + 1} OF {shuffledFinalQuestions.length}</span>
                <span className="text-amber-500 font-bold font-mono">Passed: {finalCorrectCount}</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                  {shuffledFinalQuestions[finalQuestionIdx].question}
                </h3>

                <div className="grid gap-2.5 pt-2">
                  {shuffledFinalQuestions[finalQuestionIdx].options.map((opt, i) => {
                    const isSelected = finalSelectedOptionIdx === i;
                    const isCorrectOption = shuffledFinalQuestions[finalQuestionIdx].correctAnswerIndex === i;
                    
                    let styleClass = 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] text-gray-300';
                    if (finalAnswered) {
                      if (isCorrectOption) {
                        styleClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                      } else if (isSelected) {
                        styleClass = 'border-rose-500 bg-rose-950/20 text-rose-300';
                      } else {
                        styleClass = 'border-white/[0.02] bg-white/[0.002] text-gray-600';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={finalAnswered}
                        onClick={() => handleSelectFinalOption(i)}
                        className={`w-full p-4 rounded-xl border text-left transition duration-200 text-xs sm:text-sm flex items-center justify-between cursor-pointer ${styleClass}`}
                      >
                        <span className="leading-relaxed">{opt}</span>
                        {finalAnswered && isCorrectOption && <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-3" />}
                        {finalAnswered && isSelected && !isCorrectOption && <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 ml-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {finalAnswered && (
                <div className="p-4 rounded-xl bg-indigo-950/[0.12] border border-indigo-500/15 space-y-1 animate-fade-in text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 block">Explanation</span>
                  <p className="text-gray-300 leading-relaxed">{shuffledFinalQuestions[finalQuestionIdx].explanation}</p>
                </div>
              )}

              {finalAnswered && (
                <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                  <button
                    onClick={handleAskDoubt}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask a Doubt
                  </button>
                  
                  <button
                    onClick={handleNextFinalQuestion}
                    className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{finalQuestionIdx === shuffledFinalQuestions.length - 1 ? 'Submit Assessment' : 'Next Question'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            
            // FAILED RESULTS FOR FINAL EXAM (score < 75%)
            <div className="glassmorphism p-8 rounded-2xl border border-white/[0.04] text-center space-y-6 shadow-2xl">
              
              <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <XCircle className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold text-white">Assessment Failed</h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                  REQUIRED TO PASS: 75% ({Math.ceil(shuffledFinalQuestions.length * 0.75)} / {shuffledFinalQuestions.length} CORRECT)
                </span>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl max-w-xs mx-auto">
                <div className="text-4xl font-mono font-bold text-white">
                  {finalCorrectCount} <span className="text-gray-500 font-normal text-2xl font-mono">/ {shuffledFinalQuestions.length}</span>
                </div>
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider block mt-2 text-rose-400">
                  CREDENTIALS WITHHELD
                </span>
              </div>

              <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                You got {finalCorrectCount} out of {shuffledFinalQuestions.length} questions correct ({Math.round((finalCorrectCount / shuffledFinalQuestions.length) * 100)}%). You need at least 15 correct answers to graduate. Revise your module lessons and try again.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleStartFinalAssessment}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Retry Final Exam
                </button>
                <button
                  onClick={() => setStep('roadmap')}
                  className="px-5 py-2.5 border border-white/[0.06] text-gray-400 hover:text-white rounded-lg text-xs transition cursor-pointer"
                >
                  Return to Roadmap
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         VIEW 5: GRADUATION / CERTIFICATE SCREEN
      ───────────────────────────────────────────────────────── */}
      {step === 'graduation' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center">
          
          <div className="glassmorphism p-8 sm:p-12 rounded-3xl border border-amber-500/20 shadow-2xl relative space-y-8 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
            
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl" />

            <div className="space-y-4">
              <div className="h-20 w-20 bg-amber-500/10 border border-amber-500/35 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-bounce">
                <Trophy className="h-10 w-10 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">
                  ACADEMIC GRADUATION RECORD
                </span>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                  Certified Financial Master
                </h2>
              </div>
            </div>

            <div className="py-6 border-y border-white/[0.04] max-w-md mx-auto space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed font-serif italic">
                This document verifies that the student has successfully completed all 7 modules of the finance roadmap, passed every intermediate module quiz audit, and cleared the final cumulative competency assessment.
              </p>
              <div className="text-xs font-mono text-gray-400">
                Granted with honors • Academy Course Graduate
              </div>
            </div>

            <div className="flex justify-center gap-4 py-2">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-gray-300">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span>Roadmap Cleared</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-gray-300">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                <span>Certified Scholar</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => setStep('roadmap')}
                className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleAskDoubt}
                className="px-6 py-2.5 border border-white/[0.08] text-gray-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
              >
                Ask a Doubt
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
