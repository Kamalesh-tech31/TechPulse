import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { GraduationCap, Briefcase, Award, Target, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OnboardingPreferences } from '../types';
import { PremiumOnboardingBackground } from './PremiumOnboardingBackground';

// ─────────────────────────────────────────────────────────────────────────────
//  Design System
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT = '#4F6BFF';
const SUCCESS = '#3ecf8e';
const SURFACE = '#151B26';
const BG = '#0D1117';
const TEXT = '#E8EAED';
const MUTED = 'rgba(232,234,237,0.5)';

// ─────────────────────────────────────────────────────────────────────────────
//  Onboarding Steps Configuration
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    key: 'occupation',
    icon: GraduationCap,
    title: 'What is your occupation?',
    subtitle: 'We personalize terminology and trading guides based on your daily timeline.',
    options: [
      {
        value: 'Student',
        title: 'Student',
        desc: 'Academics, simplified finance definitions, and long-term habits.',
        icon: GraduationCap,
      },
      {
        value: 'Professional',
        title: 'Professional',
        desc: 'Corporate planning, industry analytics, and wealth compounds.',
        icon: Briefcase,
      },
    ],
  },
  {
    id: 2,
    key: 'experience',
    icon: Award,
    title: 'What is your stock market experience?',
    subtitle: 'This dictates the difficulty of generated quizzes and tutorial modules.',
    options: [
      {
        value: 'Beginner',
        title: 'Beginner',
        desc: 'No prior background. Want to learn terms, simple indicators, and placing orders.',
      },
      {
        value: 'Intermediate',
        title: 'Intermediate',
        desc: 'Understand basics. Interested in technical analysis, moving averages, and P&L strategies.',
      },
      {
        value: 'Advanced',
        title: 'Advanced',
        desc: 'Familiar with valuations. Want to test high-conviction portfolios with advanced AI auditing.',
      },
    ],
  },
  {
    id: 3,
    key: 'primaryGoal',
    icon: Target,
    title: 'What is your primary goal?',
    subtitle: 'Your AI dashboard features will prioritize tracking this outcome.',
    options: [
      {
        value: 'Learning',
        title: 'Learning Market Concepts',
        desc: 'Focus on completing academic modules, lessons, and terminology.',
      },
      {
        value: 'Stock Analysis',
        title: 'Deep Stock Analysis',
        desc: 'Filter, search, and study financial performance tables of corporations.',
      },
      {
        value: 'Virtual Trading',
        title: 'Virtual Active Trading',
        desc: 'Focus on executing transactions, testing strategies, and growing wallet balance.',
      },
      {
        value: 'Portfolio Improvement',
        title: 'Portfolio Optimization',
        desc: 'Analyze asset correlations, diversify sectors, and implement AI audits.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Premium Progress Indicator
// ─────────────────────────────────────────────────────────────────────────────
const PremiumProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < currentStep ? 1 : 0.3 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: i < currentStep ? ACCENT : 'rgba(255,255,255,0.08)',
              transformOrigin: 'left',
              boxShadow: i < currentStep ? `0 0 12px ${ACCENT}60` : 'none',
            }}
          />
        ))}
      </div>

      {/* Step Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStep}
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Step {currentStep} of {totalSteps}
        </motion.div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
          {Math.round((currentStep / totalSteps) * 100)}%
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Option Card Component
// ─────────────────────────────────────────────────────────────────────────────
interface OptionCardProps {
  option: any;
  isSelected: boolean;
  isGrid: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, isSelected, isGrid, onClick }) => {
  const Icon = option.icon;

  return (
    <motion.button
      layout
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'relative',
        width: '100%',
        padding: isGrid ? '24px 20px' : '16px',
        borderRadius: '16px',
        border: isSelected ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.08)',
        background: isSelected ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: isSelected
          ? `0 0 24px ${ACCENT}30, inset 0 1px 1px rgba(255,255,255,0.1)`
          : 'inset 0 1px 1px rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: isGrid ? 'column' : 'row',
        gap: isGrid ? '12px' : '16px',
        alignItems: isGrid ? 'flex-start' : 'flex-start',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${ACCENT}40`;
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
        }
      }}
    >
      {/* Selection Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSelected ? `${ACCENT}20` : 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
          >
            <Check size={12} color={ACCENT} />
          </motion.div>
        )}
      </div>

      {/* Icon */}
      {Icon && (
        <motion.div
          animate={{ scale: isSelected ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          style={{
            width: isGrid ? '32px' : '24px',
            height: isGrid ? '32px' : '24px',
            borderRadius: '10px',
            background: `${ACCENT}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: ACCENT,
            flexShrink: 0,
          }}
        >
          <Icon size={isGrid ? 18 : 16} />
        </motion.div>
      )}

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontSize: isGrid ? '14px' : '13.5px',
            fontWeight: 600,
            color: TEXT,
            margin: '0 0 4px 0',
          }}
        >
          {option.title}
        </h4>
        <p
          style={{
            fontSize: isGrid ? '12px' : '11.5px',
            color: MUTED,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {option.desc}
        </p>
      </div>
    </motion.button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Onboarding Component
// ─────────────────────────────────────────────────────────────────────────────
export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);
  const [prefs, setPrefs] = useState<Partial<OnboardingPreferences>>({
    occupation: undefined,
    experience: undefined,
    primaryGoal: undefined,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStepConfig = STEPS.find((s) => s.id === step);
  
  // Safety check: if step is out of bounds, redirect or reset
  if (!currentStepConfig) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: TEXT }}>
        <div style={{ textAlign: 'center' }}>
          <p>Onboarding configuration error. Resetting...</p>
          <button onClick={() => setStep(1)} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Restart Onboarding
          </button>
        </div>
      </div>
    );
  }

  const selectedValue = prefs[currentStepConfig.key as keyof OnboardingPreferences];

  // Handle option selection with auto-advance
  const handleSelect = (value: string) => {
    if (isTransitioning) return;

    setPrefs((prev) => ({
      ...prev,
      [currentStepConfig.key]: value,
    }));

    // Auto-advance after 350ms
    setIsTransitioning(true);
    setTimeout(() => {
      if (step < 3) {
        setStep((s) => s + 1);
      } else {
        // Final step: complete onboarding
        completeOnboarding({
          ...prefs,
          [currentStepConfig.key]: value,
        } as OnboardingPreferences);
      }
      setIsTransitioning(false);
    }, 350);
  };

  const isGrid = currentStepConfig.options && currentStepConfig.options.length <= 2;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: BG,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PremiumOnboardingBackground />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '520px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Card */}
        <div
          style={{
            background: SURFACE,
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            padding: '32px',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Progress Indicator */}
          <PremiumProgressIndicator currentStep={step} totalSteps={3} />

          {/* Step Header */}
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              {currentStepConfig?.icon && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `${ACCENT}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ACCENT,
                  }}
                >
                  <currentStepConfig.icon size={16} />
                </div>
              )}
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: ACCENT,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Step {step}
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(20px, 4vw, 24px)',
                fontWeight: 700,
                color: TEXT,
                margin: '0 0 8px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {currentStepConfig?.title}
            </h2>
            <p
              style={{
                fontSize: '13.5px',
                color: MUTED,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {currentStepConfig?.subtitle}
            </p>
          </motion.div>

          {/* Options Container with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`options-${step}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: isGrid ? 'repeat(2, 1fr)' : '1fr',
                gap: '12px',
              }}
            >
              {currentStepConfig?.options.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  isSelected={selectedValue === option.value}
                  isGrid={isGrid}
                  onClick={() => handleSelect(option.value)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons (for manual control if needed) */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={() => {
                if (step > 1) setStep((s) => s - 1);
              }}
              disabled={step === 1}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: step === 1 ? 'rgba(255,255,255,0.3)' : TEXT,
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: step === 1 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (step > 1) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              ← Previous
            </button>

            <div style={{ fontSize: '11px', color: MUTED, display: 'flex', alignItems: 'center' }}>
              Selections auto-advance
            </div>
          </div>
        </div>

        {/* Subtle Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Your preferences can be updated in Settings anytime
        </motion.div>
      </motion.div>
    </div>
  );
};
