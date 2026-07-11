import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { GraduationCap, Briefcase, ChevronRight, HelpCircle, Target, Award, LineChart } from 'lucide-react';
import { motion } from 'motion/react';
import { OnboardingPreferences } from '../types';
import { MotionGraphics } from './MotionGraphics';

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);
  const [prefs, setPrefs] = useState<Partial<OnboardingPreferences>>({
    occupation: undefined,
    experience: undefined,
    primaryGoal: undefined,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      if (prefs.occupation && prefs.experience && prefs.primaryGoal) {
        completeOnboarding(prefs as OnboardingPreferences);
      }
    }
  };

  const handleSelect = (key: keyof OnboardingPreferences, value: any) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    // Auto-advance to improve UX flow
    setTimeout(() => {
      if (step < 3) {
        setStep((s) => s + 1);
      } else {
        if (key === 'primaryGoal' && prefs.occupation && prefs.experience) {
          completeOnboarding({
            ...prefs,
            primaryGoal: value,
          } as OnboardingPreferences);
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden z-10" style={{ background: 'var(--color-trado-bg)' }}>
      {/* Background gradients and premium motion graphics background */}
      <MotionGraphics />
      
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full opacity-[0.05] blur-[150px] pointer-events-none z-0" style={{ background: 'var(--color-trado-accent)' }}></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full opacity-[0.04] blur-[150px] pointer-events-none z-0" style={{ background: 'var(--color-trado-accent)' }}></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2 w-full">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  s <= step ? 'shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-white/[0.08]'
                }`}
                style={{ background: s <= step ? 'var(--color-trado-accent)' : undefined }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-gray-500 ml-4 shrink-0 uppercase tracking-wider">
            Step {step} of 3
          </span>
        </div>

        {/* Step Content */}
        <div className="glassmorphism p-8 rounded-2xl border-white/[0.05] glow-border">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" style={{ color: 'var(--color-trado-accent)' }} />
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-trado-accent)' }}>PROFILE TYPES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                What is your occupation?
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                We personalize terminology and trading guides based on your daily timeline.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelect('occupation', 'Student')}
                  className={`p-6 rounded-xl border text-left transition duration-200 group flex flex-col justify-between h-40 ${
                    prefs.occupation === 'Student'
                      ? 'text-white'
                      : 'border-white/[0.06] bg-white/[0.01] text-gray-300'
                  }`}
                  style={prefs.occupation === 'Student' ? { borderColor: 'var(--color-trado-accent)', background: 'rgba(59,130,246,0.06)', boxShadow: '0 0 15px rgba(59,130,246,0.12)' } : undefined}
                  onMouseEnter={e => { if (prefs.occupation !== 'Student') (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.3)'; }}
                  onMouseLeave={e => { if (prefs.occupation !== 'Student') (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <GraduationCap className="h-8 w-8 transition" style={{ color: prefs.occupation === 'Student' ? 'var(--color-trado-accent)' : undefined, transform: prefs.occupation === 'Student' ? 'scale(1.1)' : undefined }} />
                  <div>
                    <h3 className="font-display font-semibold text-white">Student</h3>
                    <p className="text-gray-500 text-xs mt-1">Academics, simplified finance definitions, and long-term habits.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('occupation', 'Professional')}
                  className={`p-6 rounded-xl border text-left transition duration-200 group flex flex-col justify-between h-40 ${
                    prefs.occupation === 'Professional'
                      ? 'text-white'
                      : 'border-white/[0.06] bg-white/[0.01] text-gray-300'
                  }`}
                  style={prefs.occupation === 'Professional' ? { borderColor: 'var(--color-trado-accent)', background: 'rgba(59,130,246,0.06)', boxShadow: '0 0 15px rgba(59,130,246,0.12)' } : undefined}
                  onMouseEnter={e => { if (prefs.occupation !== 'Professional') (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.3)'; }}
                  onMouseLeave={e => { if (prefs.occupation !== 'Professional') (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <Briefcase className="h-8 w-8 transition" style={{ color: prefs.occupation === 'Professional' ? 'var(--color-trado-accent)' : undefined, transform: prefs.occupation === 'Professional' ? 'scale(1.1)' : undefined }} />
                  <div>
                    <h3 className="font-display font-semibold text-white">Professional</h3>
                    <p className="text-gray-500 text-xs mt-1">Corporate planning, industry analytics, and wealth compounds.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6" style={{ color: 'var(--color-trado-accent)' }} />
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-trado-accent)' }}>EXPERIENCE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                What is your stock market experience?
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                This dictates the difficulty of generated quizzes and tutorial modules.
              </p>

              <div className="space-y-3">
                {[
                  { value: 'Beginner', title: 'Beginner', desc: 'No prior background. Want to learn terms, simple indicators, and placing orders.' },
                  { value: 'Intermediate', title: 'Intermediate', desc: 'Understand basics. Interested in technical analysis, moving averages, and P&L strategies.' },
                  { value: 'Advanced', title: 'Advanced', desc: 'Familiar with valuations. Want to test high-conviction portfolios with advanced AI auditing.' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelect('experience', item.value)}
                    className={`w-full p-4 rounded-xl border text-left transition duration-200 flex items-start gap-4 ${
                      prefs.experience === item.value
                        ? 'text-white'
                        : 'border-white/[0.06] bg-white/[0.01] text-gray-300'
                    }`}
                    style={prefs.experience === item.value ? { borderColor: 'var(--color-trado-accent)', background: 'rgba(59,130,246,0.05)' } : undefined}
                    onMouseEnter={e => { if (prefs.experience !== item.value) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.25)'; }}
                    onMouseLeave={e => { if (prefs.experience !== item.value) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div className="h-5 w-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0" style={{ borderColor: prefs.experience === item.value ? 'var(--color-trado-accent)' : '#4B5563' }}>
                      {prefs.experience === item.value && <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-trado-accent)' }} />}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-6 w-6" style={{ color: 'var(--color-trado-accent)' }} />
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-trado-accent)' }}>PRIMARY OBJECTIVE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                What is your primary goal?
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Your AI dashboard features will prioritize tracking this outcome.
              </p>

              <div className="space-y-3">
                {[
                  { value: 'Learning', title: 'Learning Market Concepts', desc: 'Focus on completing academic modules, lessons, and terminology.' },
                  { value: 'Stock Analysis', title: 'Deep Stock Analysis', desc: 'Filter, search, and study financial performance tables of corporations.' },
                  { value: 'Virtual Trading', title: 'Virtual Active Trading', desc: 'Focus on executing transactions, testing strategies, and growing wallet balance.' },
                  { value: 'Portfolio Improvement', title: 'Portfolio Optimization', desc: 'Analyze asset correlations, diversify sectors, and implement AI audits.' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelect('primaryGoal', item.value)}
                    className={`w-full p-4 rounded-xl border text-left transition duration-200 flex items-start gap-4 ${
                      prefs.primaryGoal === item.value
                        ? 'text-white'
                        : 'border-white/[0.06] bg-white/[0.01] text-gray-300'
                    }`}
                    style={prefs.primaryGoal === item.value ? { borderColor: 'var(--color-trado-accent)', background: 'rgba(59,130,246,0.05)' } : undefined}
                    onMouseEnter={e => { if (prefs.primaryGoal !== item.value) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.25)'; }}
                    onMouseLeave={e => { if (prefs.primaryGoal !== item.value) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div className="h-5 w-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0" style={{ borderColor: prefs.primaryGoal === item.value ? 'var(--color-trado-accent)' : '#4B5563' }}>
                      {prefs.primaryGoal === item.value && <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-trado-accent)' }} />}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-gray-500 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none text-sm font-medium"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !prefs.occupation) ||
                (step === 2 && !prefs.experience) ||
                (step === 3 && !prefs.primaryGoal)
              }
              className="bg-white hover:bg-gray-200 text-black px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
