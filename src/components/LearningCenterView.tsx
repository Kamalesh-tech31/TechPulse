import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Lesson, QuizQuestion } from '../types';
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
  ShieldAlert
} from 'lucide-react';

export const LearningCenterView: React.FC = () => {
  const { user } = useApp();
  
  // Unified module definitions
  const modules = [
    { id: 0, name: 'Basics & Valuations', label: 'Basics', level: 'Beginner' },
    { id: 1, name: 'Technical Indicators', label: 'Technical', level: 'Intermediate' },
    { id: 2, name: 'Fundamental Valuations', label: 'Fundamental', level: 'Intermediate' },
    { id: 3, name: 'Risk Management & Allocation', label: 'Risk Mgmt', level: 'Advanced' },
    { id: 4, name: 'Trading Psychology', label: 'Psychology', level: 'Advanced' }
  ];

  // Load progress from local storage
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(() => {
    const saved = localStorage.getItem('stockeasy_active_module_idx');
    return saved ? parseInt(saved) : 0;
  });

  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('stockeasy_completed_modules');
    return saved ? JSON.parse(saved) : [];
  });

  // Flow State: 'lesson' | 'quiz' | 'completed'
  const [step, setStep] = useState<'lesson' | 'quiz' | 'completed'>('lesson');

  // Lesson state
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Sync progress to local storage
  useEffect(() => {
    localStorage.setItem('stockeasy_active_module_idx', activeModuleIdx.toString());
  }, [activeModuleIdx]);

  useEffect(() => {
    localStorage.setItem('stockeasy_completed_modules', JSON.stringify(completedModules));
  }, [completedModules]);

  // Load or fetch lesson content when active module changes
  useEffect(() => {
    fetchLesson();
  }, [activeModuleIdx]);

  const fetchLesson = async () => {
    if (!user) return;
    setLessonLoading(true);
    setLesson(null);
    setStep('lesson');

    try {
      const response = await fetch('/api/learning-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: user.onboarding?.occupation || 'Student',
          experience: user.onboarding?.experience || 'Beginner',
          primaryGoal: user.onboarding?.primaryGoal || 'Learning',
          category: modules[activeModuleIdx].name
        })
      });
      const data = await response.json();
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLessonLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!user) return;
    setQuizLoading(true);
    setStep('quiz');
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setQuizLocked(false);
    setQuizScore(0);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: user.onboarding?.experience || 'Beginner',
          primaryGoal: user.onboarding?.primaryGoal || 'Learning'
        })
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (quizLocked) return;
    setSelectedOptionIdx(idx);
    setQuizLocked(true);

    const correctIdx = questions[currentQuestionIdx].correctAnswerIndex;
    if (idx === correctIdx) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setQuizLocked(false);
    } else {
      // Completed! Mark module as completed
      if (!completedModules.includes(activeModuleIdx)) {
        setCompletedModules((prev) => [...prev, activeModuleIdx]);
      }
      setStep('completed');
    }
  };

  const handleNextLesson = () => {
    if (activeModuleIdx < modules.length - 1) {
      setActiveModuleIdx((prev) => prev + 1);
      setStep('lesson');
    } else {
      // Completed all modules! Reset or congratulate
      alert('Congratulations! You have completed all curriculum levels in the Trado Academic Center!');
      setActiveModuleIdx(0);
      setStep('lesson');
    }
  };

  const renderCustomMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-display font-bold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-base font-display font-semibold mt-4 mb-2" style={{ color: 'var(--color-trado-accent)' }}>{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="text-white font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-2.5 pl-2 text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-trado-muted)' }}>
            <span style={{ color: 'var(--color-trado-accent)' }}>•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      
      // Inline highlights for bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={idx} className="text-gray-400 text-sm leading-relaxed mt-2.5">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part)}
          </p>
        );
      }

      return <p key={idx} className="text-gray-400 text-sm leading-relaxed mt-2.5">{line}</p>;
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8" style={{ color: 'var(--color-trado-accent)' }} />
            Academic Learning Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">Acquire stock concepts via Gemini lessons, pass quizzes, and graduate across professional curriculum levels.</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="glassmorphism p-5 rounded-2xl border-white/[0.04]">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-4">Curriculum Progress</span>
        
        {/* Responsive horizontal step visualizer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {modules.map((m, idx) => {
            const isActive = activeModuleIdx === idx;
            const isCompleted = completedModules.includes(idx);
            
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModuleIdx(idx);
                  setStep('lesson');
                }}
                className={`p-3 rounded-xl border transition text-left relative overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : isCompleted 
                      ? 'bg-emerald-950/[0.05] border-emerald-500/20 text-gray-300' 
                      : 'bg-white/[0.01] border-white/[0.04] text-gray-500 hover:border-white/[0.08]'
                }`}
                style={isActive ? { borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.04)', boxShadow: '0 0 15px rgba(59,130,246,0.1)' } : undefined}
              >
                {/* Micro-indicators */}
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 block">Level {idx + 1}</span>
                  {isCompleted && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  {isActive && !isCompleted && <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--color-trado-accent)' }} />}
                </div>
                <span className="font-display font-bold text-xs block mt-1.5 truncate">{m.label}</span>
                <span className="text-[9px] font-mono text-gray-500 block mt-0.5">{m.level}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WORKSPACE AREA */}

      {/* STEP 1: LESSON PHASE */}
      {step === 'lesson' && (
        <div className="space-y-6">
          
          {lessonLoading && (
            <div className="glassmorphism rounded-2xl p-12 border-white/[0.04] text-center max-w-md mx-auto py-24 space-y-6">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto animate-spin" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)' }}>
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Generating Academic Lesson</h3>
                <p className="font-mono text-xs mt-1 animate-pulse" style={{ color: 'var(--color-trado-accent)' }}>Gemini preparing verified curriculum material...</p>
              </div>
            </div>
          )}

          {lesson && (
            <div className="grid lg:grid-cols-4 gap-6 items-start">
              
              {/* Sidebar metadata column */}
              <div className="space-y-4">
                <div className="glassmorphism p-5 rounded-2xl border-white/[0.04] space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">MODULE TOPIC</span>
                    <span className="text-white font-bold text-sm block mt-1">{lesson.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">ACADEMIC LEVEL</span>
                    <span className="font-bold text-sm block mt-1 capitalize" style={{ color: 'var(--color-trado-accent)' }}>{lesson.level} course</span>
                  </div>
                  {lesson.keywords && lesson.keywords.length > 0 && (
                    <div className="border-t border-white/[0.04] pt-3">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-2">KEY TERMINOLOGIES</span>
                      <div className="flex flex-wrap gap-1.5">
                        {lesson.keywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05] text-[10px] font-mono text-gray-400 capitalize">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchLesson}
                  className="w-full text-xs font-mono text-gray-500 hover:text-white transition py-2.5 border border-dashed border-white/[0.05] hover:border-white/[0.1] rounded-xl bg-white/[0.005] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate Lesson
                </button>
              </div>

              {/* Central Lesson Book */}
              <div className="lg:col-span-3 glassmorphism p-6 sm:p-8 rounded-2xl border-white/[0.04] space-y-6 shadow-2xl relative">
                <div className="absolute right-4 top-4 text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/15 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  Academic Material Validated
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight border-b border-white/[0.04] pb-4">
                    {lesson.title}
                  </h2>
                </div>

                {/* Lesson body */}
                <div className="space-y-4 prose prose-invert max-w-none">
                  {renderCustomMarkdown(lesson.content)}
                </div>

                {/* Summary / Takeaway Callout */}
                {lesson.summary && (
                  <div className="p-4 rounded-r-xl mt-6" style={{ background: 'rgba(59,130,246,0.02)', borderLeft: '2px solid var(--color-trado-accent)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: 'var(--color-trado-accent)' }}>Key Takeaway</span>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">{lesson.summary}</p>
                  </div>
                )}

                {/* Step Transition CTA */}
                <div className="border-t border-white/[0.04] pt-6 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">Next: Interactive Module Audit</span>
                  <button
                    onClick={startQuiz}
                    className="px-6 py-3 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 15px rgba(59,130,246,0.35)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent-dark)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent)'; }}
                  >
                    <span>Proceed to Module Quiz</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* STEP 2: QUIZ PHASE */}
      {step === 'quiz' && (
        <div className="space-y-6">
          
          {quizLoading && (
            <div className="glassmorphism rounded-2xl p-12 border-white/[0.04] text-center max-w-md mx-auto py-24 space-y-6">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto animate-spin" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)' }}>
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Preparing Module Quiz</h3>
                <p className="font-mono text-xs mt-1 animate-pulse" style={{ color: 'var(--color-trado-accent)' }}>Compiling curriculum-specific evaluation...</p>
              </div>
            </div>
          )}

          {questions.length > 0 && !quizLoading && (
            <div className="glassmorphism rounded-2xl p-6 sm:p-8 border-white/[0.04] max-w-2xl mx-auto space-y-6 shadow-2xl">
              
              {/* Quiz Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  QUESTION {currentQuestionIdx + 1} OF {questions.length}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Score: {quizScore}/{currentQuestionIdx + (quizLocked ? 1 : 0)}
                </span>
              </div>

              {/* Active Question */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-snug">
                  {questions[currentQuestionIdx].question}
                </h3>
                
                {/* Options list */}
                <div className="space-y-2.5 pt-2">
                  {questions[currentQuestionIdx].options.map((opt, i) => {
                    const isSelected = selectedOptionIdx === i;
                    const isCorrectOption = questions[currentQuestionIdx].correctAnswerIndex === i;
                    
                    let btnStyle = 'border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] text-gray-300';
                    if (quizLocked) {
                      if (isCorrectOption) {
                        btnStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                      } else if (isSelected) {
                        btnStyle = 'border-trado-danger bg-rose-950/20 text-rose-300';
                      } else {
                        btnStyle = 'border-white/[0.02] bg-white/[0.002] text-gray-600';
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={quizLocked}
                        onClick={() => handleSelectOption(i)}
                        className={`w-full p-4 rounded-xl border text-left transition duration-200 text-sm flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span className="leading-relaxed">{opt}</span>
                        {quizLocked && isCorrectOption && <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-3" />}
                        {quizLocked && isSelected && !isCorrectOption && <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 ml-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanations section */}
              {quizLocked && (
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] space-y-1.5 animate-fade-in">
                  <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: 'var(--color-trado-accent)' }}>Academic Explanation</span>
                  <p className="text-gray-400 text-xs leading-relaxed">{questions[currentQuestionIdx].explanation}</p>
                </div>
              )}

              {/* Advance controls */}
              {quizLocked && (
                <div className="flex justify-end pt-3 border-t border-white/[0.04]">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentQuestionIdx === questions.length - 1 ? 'Finish Module Quiz' : 'Next Question'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {!quizLoading && questions.length === 0 && (
            <div className="glassmorphism rounded-2xl p-12 border-white/[0.04] text-center max-w-md mx-auto py-24 space-y-4">
              <ShieldAlert className="h-10 w-10 text-trado-danger mx-auto" />
              <h3 className="text-white font-semibold">Quiz Compilation Error</h3>
              <p className="text-gray-400 text-sm">We couldn't compile the live quiz for this lesson. Please try starting the quiz again.</p>
              <button
                onClick={startQuiz}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
                style={{ background: 'var(--color-trado-accent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent-dark)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent)'; }}
              >
                Retry Loading Quiz
              </button>
            </div>
          )}

        </div>
      )}

      {/* STEP 3: COMPLETED MODULE PHASE */}
      {step === 'completed' && (
        <div className="glassmorphism rounded-2xl p-8 border-white/[0.04] text-center max-w-md mx-auto py-16 space-y-6 shadow-2xl">
          <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto animate-bounce" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-trado-accent)', boxShadow: '0 0 15px rgba(59,130,246,0.15)' }}>
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-display font-bold text-white">Curriculum Level Passed</h2>
            <span className="text-gray-500 font-mono text-xs block uppercase">UNLOCKED NEXT ACADEMIC STAGE</span>
          </div>

          <div className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl max-w-xs mx-auto">
            <div className="text-4xl font-mono font-bold text-white">
              {quizScore} <span className="text-gray-500 font-normal text-2xl">/ {questions.length}</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider block mt-2" style={{ color: 'var(--color-trado-accent)' }}>
              {quizScore === questions.length ? 'EXCELLENT SCORE ACCRUED' : quizScore >= 2 ? 'COMPETENCY MET' : 'ACADEMIC STUDY VERIFIED'}
            </span>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
            Your quiz audit results are registered. You have mastered **{modules[activeModuleIdx].name}** and can now unlock the next syllabus level.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleNextLesson}
              className="text-white font-semibold py-2.5 px-6 rounded-lg transition duration-150 text-xs flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
              style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 15px rgba(59,130,246,0.2)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent-dark)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-trado-accent)'; }}
            >
              Unlock Next Lesson
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStep('lesson')}
              className="text-xs font-mono text-gray-500 hover:text-white border border-white/[0.05] bg-white/[0.002] hover:bg-white/[0.02] px-5 py-2.5 rounded-lg transition cursor-pointer"
            >
              Review Notes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
