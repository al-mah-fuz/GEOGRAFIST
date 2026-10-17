import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame,
  Clock,
  ArrowRight,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  SkipForward,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AnswerRecord,
  CategoryBreakdownItem,
  CategoryId,
  GameConfig,
  GameSessionResult,
  Question,
} from '../../types';
import { calculateQuestionScore, SCORING_RULES_DOCUMENTATION } from '../../utils/scoring';
import { shuffleOptions } from '../../utils/shuffle';
import { soundFx } from '../../utils/sound';
import { FlagSvg } from '../common/FlagSvg';

interface ActiveGameViewProps {
  questions: Question[];
  config: GameConfig;
  soundEnabled: boolean;
  onFinishGame: (result: GameSessionResult) => void;
  onQuitGame: () => void;
  onToggleSound: () => void;
  isDailyChallenge?: boolean;
}

export const ActiveGameView: React.FC<ActiveGameViewProps> = ({
  questions,
  config,
  soundEnabled,
  onFinishGame,
  onQuitGame,
  onToggleSound,
  isDailyChallenge = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quitModalOpen, setQuitModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Synchronous lock ref to strictly prevent rapid double-clicks / duplicate score dispatches
  const isAnsweredRef = useRef(false);

  // Real-world timestamp references to handle backgrounding properly
  const maxTimerSeconds = config.timerMode === 'rapid' ? 8 : config.timerMode === 'standard' ? 15 : 0;
  const questionStartTimestampRef = useRef<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(maxTimerSeconds);

  // Session aggregate tracking
  const [totalScore, setTotalScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // Current question data
  const currentQuestion = questions[currentIndex];

  // Options shuffled once per question
  const [shuffledOptions, setShuffledOptions] = useState<[string, string, string, string]>(
    currentQuestion ? shuffleOptions(currentQuestion.options) : ['A', 'B', 'C', 'D']
  );

  // Reset state on question index change
  useEffect(() => {
    if (!currentQuestion) return;
    setShuffledOptions(shuffleOptions(currentQuestion.options));
    setSelectedAnswer(null);
    setIsAnswered(false);
    isAnsweredRef.current = false;
    questionStartTimestampRef.current = Date.now();
    setTimeRemaining(maxTimerSeconds);
  }, [currentIndex, currentQuestion, maxTimerSeconds]);

  // Answer selection handler (synchronously guarded against duplicate clicks)
  const handleSelectOption = useCallback(
    (choice: string, isSkip: boolean = false) => {
      // Strict atomic check: immediately lock to prevent double clicks or duplicate score awards
      if (isAnsweredRef.current || !currentQuestion) return;
      isAnsweredRef.current = true;
      setIsAnswered(true);
      setSelectedAnswer(choice);

      // Compute exact elapsed time using wall-clock timestamps (immune to background throttling)
      const now = Date.now();
      const rawElapsedSeconds = (now - questionStartTimestampRef.current) / 1000;
      const timeSpent = Math.max(1, Math.min(rawElapsedSeconds, maxTimerSeconds || 60));

      const isCorrect = !isSkip && choice !== '__TIMEOUT__' && choice === currentQuestion.correctAnswer;

      const scoreRes = calculateQuestionScore({
        isCorrect,
        difficulty: currentQuestion.difficulty,
        currentStreak,
        timeSpentSeconds: timeSpent,
        timerMode: config.timerMode,
        isSkipped: isSkip,
      });

      // Audio feedback and streak logic
      if (isCorrect) {
        soundFx.playCorrect(soundEnabled);
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak >= 3 && newStreak % 3 === 0) {
          soundFx.playStreak(newStreak, soundEnabled);
        }
      } else {
        soundFx.playIncorrect(soundEnabled);
        setCurrentStreak(0);
      }

      setTotalScore(prev => prev + scoreRes.points);

      const record: AnswerRecord = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        category: currentQuestion.category as CategoryId,
        selectedAnswer: choice,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        isSkipped: isSkip,
        timeSpentSeconds: Math.round(timeSpent),
        pointsEarned: scoreRes.points,
        explanation: currentQuestion.explanation,
        source: currentQuestion.source,
      };

      setAnswers(prev => [...prev, record]);
    },
    [currentQuestion, currentStreak, bestStreak, config.timerMode, maxTimerSeconds, soundEnabled]
  );

  // Backgrounding-resilient timer using wall-clock time
  useEffect(() => {
    if (config.timerMode === 'relaxed' || isAnswered || !currentQuestion) return;

    const checkTimerTick = () => {
      if (isAnsweredRef.current) return;
      const elapsed = (Date.now() - questionStartTimestampRef.current) / 1000;
      const remaining = Math.max(0, maxTimerSeconds - elapsed);
      setTimeRemaining(Math.ceil(remaining));

      if (remaining <= 0) {
        // Expired!
        handleSelectOption('__TIMEOUT__', false);
      }
    };

    // Run interval frequently (every 200ms) to update smooth countdown
    const intervalId = setInterval(checkTimerTick, 200);

    // Listen to visibilitychange so when tab returns to foreground, time is evaluated immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimerTick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config.timerMode, isAnswered, currentQuestion, maxTimerSeconds, handleSelectOption]);

  // Session completion aggregator
  const completeSession = useCallback(() => {
    const totalQ = answers.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const skippedCount = answers.filter(a => a.isSkipped).length;
    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const totalTime = answers.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    const avgTime = totalQ > 0 ? Math.round(totalTime / totalQ) : 0;

    // Build category breakdown
    const breakdown: Partial<Record<CategoryId, CategoryBreakdownItem>> = {};
    for (const ans of answers) {
      if (!breakdown[ans.category]) {
        breakdown[ans.category] = { total: 0, correct: 0, accuracy: 0 };
      }
      const item = breakdown[ans.category]!;
      item.total += 1;
      if (ans.isCorrect) item.correct += 1;
    }
    for (const cat in breakdown) {
      const item = breakdown[cat as CategoryId]!;
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    }

    // XP calculation: 15% of points + accuracy bonus
    let xpBonus = 0;
    if (accuracy === 100) xpBonus = 50;
    else if (accuracy >= 80) xpBonus = 25;
    else if (accuracy >= 60) xpBonus = 10;
    const xpEarned = Math.max(10, Math.round(totalScore * 0.15) + xpBonus);

    const result: GameSessionResult = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString(),
      category: config.category,
      difficulty: config.difficulty,
      totalQuestions: totalQ,
      correctCount,
      skippedCount,
      accuracy,
      totalPoints: totalScore,
      xpEarned,
      bestStreak,
      avgTimeSeconds: avgTime,
      totalDurationSeconds: totalTime,
      isDailyChallenge,
      isPracticeMissed: config.missedQuestionsOnly,
      categoryBreakdown: breakdown,
      answers,
    };

    onFinishGame(result);
  }, [answers, totalScore, bestStreak, config, isDailyChallenge, onFinishGame]);

  // Advance to Next Question or finish
  const handleNext = () => {
    soundFx.playSelect(soundEnabled);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeSession();
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quitModalOpen || rulesModalOpen) return;

      if (!isAnsweredRef.current) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleSelectOption(shuffledOptions[0]);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleSelectOption(shuffledOptions[1]);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleSelectOption(shuffledOptions[2]);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleSelectOption(shuffledOptions[3]);
        else if (e.key === 's' || e.key === 'S') handleSelectOption('__SKIPPED__', true);
        else if (e.key === 'Escape') setQuitModalOpen(true);
      } else {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shuffledOptions, quitModalOpen, rulesModalOpen, handleSelectOption]);

  if (!currentQuestion) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400">No questions available in this session.</p>
        <button
          onClick={onQuitGame}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const timerPercentage = config.timerMode === 'relaxed' ? 100 : (timeRemaining / maxTimerSeconds) * 100;
  const isTimeLow = config.timerMode !== 'relaxed' && timeRemaining <= 3;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Game HUD Bar */}
      <header className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex items-center justify-between gap-4">
        {/* Left: Progress info */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            {isDailyChallenge
              ? `Daily · Question ${currentIndex + 1} of ${questions.length}`
              : config.sessionLength === 'endless'
              ? `Question ${currentIndex + 1} · Endless`
              : `Question ${currentIndex + 1} of ${questions.length}`}
          </span>
        </div>

        {/* Center: Live Timer if enabled */}
        {config.timerMode !== 'relaxed' && (
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${isTimeLow ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}
            />
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                isTimeLow ? 'text-rose-400' : 'text-white'
              }`}
            >
              {timeRemaining}s
            </span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-300 ${
                  isTimeLow ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Right: Score, Streak, Rules, Sound & Quit */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 hidden sm:inline">Score:</span>
            <span className="text-white font-bold tabular-nums text-sm">{totalScore}</span>
          </div>

          {currentStreak > 1 && (
            <div className="flex items-center gap-1 text-xs font-mono text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{currentStreak}</span>
            </div>
          )}

          <button
            onClick={() => setRulesModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Scoring Rules Reference"
            aria-label="View scoring rules"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setQuitModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            title="Quit Session"
            aria-label="Quit session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Question Card */}
      <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Topic kicker & Difficulty indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="font-semibold uppercase tracking-wider text-amber-400/90">
            {currentQuestion.category.toUpperCase()} · {currentQuestion.topic}
          </div>
          <div className="capitalize font-mono text-[11px] text-slate-400 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              {currentQuestion.difficulty}
            </span>
          </div>
        </div>

        {/* Flag SVG display if Flag Master question with media */}
        {currentQuestion.media?.type === 'flag' && (
          <div className="flex justify-center py-2">
            <FlagSvg
              countryCode={currentQuestion.media.countryCode}
              flagEmoji={currentQuestion.media.flagEmoji}
              className="w-56 h-36 sm:w-64 sm:h-40"
            />
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] leading-snug">
          {currentQuestion.question}
        </h2>

        {/* 4 Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {shuffledOptions.map((choice, idx) => {
            const letter = optionLetters[idx];
            const isSelected = selectedAnswer === choice;
            const isCorrectAnswer = choice === currentQuestion.correctAnswer;

            let buttonStyle = 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/80 text-white';

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Correct answer highlighted emerald
                buttonStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/30';
              } else if (isSelected) {
                // Selected wrong answer highlighted rose
                buttonStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
              } else {
                // Other options dimmed
                buttonStyle = 'bg-slate-900/30 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={`${currentIndex}_opt_${idx}`}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(choice, false)}
                className={`relative min-h-[58px] p-4 rounded-xl text-left border text-sm font-semibold transition-all duration-150 flex items-center gap-3.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${buttonStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                    isAnswered && isCorrectAnswer
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswered && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {letter}
                </span>

                <span className="flex-1 leading-snug">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Skip Question Option (Active before answering) */}
        {!isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleSelectOption('__SKIPPED__', true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip Question (Key: S)</span>
            </button>
          </div>
        )}

        {/* Educational Feedback Expansion (Shown immediately upon answering) */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div
              className={`p-4 rounded-xl border ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Correct Fact</span>
                    </>
                  ) : selectedAnswer === '__SKIPPED__' ? (
                    <>
                      <SkipForward className="w-4 h-4 text-amber-400" />
                      <span>Question Skipped</span>
                    </>
                  ) : selectedAnswer === '__TIMEOUT__' ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Time Expired</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Fact Clarification</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {currentQuestion.source}
                </span>
              </div>

              <div className="mt-2 text-xs">
                {selectedAnswer !== currentQuestion.correctAnswer && (
                  <p className="text-amber-300 font-semibold mb-1">
                    Correct Answer: {currentQuestion.correctAnswer}
                  </p>
                )}
                <p className="text-slate-200 leading-relaxed text-sm">
                  {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-mono">
                <span>Verified: {currentQuestion.verifiedDate}</span>
                {selectedAnswer === currentQuestion.correctAnswer && (
                  <span className="text-emerald-400 font-semibold">
                    +{answers[answers.length - 1]?.pointsEarned || 100} pts
                  </span>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Round'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scoring Rules Reference Modal */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Documented Scoring Rules</span>
              </h3>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div>
                <strong className="text-white">Base Points:</strong> {SCORING_RULES_DOCUMENTATION.basePoints} pts for every correct answer.
              </div>
              <div>
                <strong className="text-white">Difficulty Bonus:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 font-mono">
                  <li>Beginner: +0 pts (100 base)</li>
                  <li>Intermediate: +25 pts (125 base)</li>
                  <li>Advanced: +50 pts (150 base)</li>
                  <li>Expert: +75 pts (175 base)</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Streak Multiplier:</strong> +10 pts per consecutive correct answer up to a max cap of +50 bonus pts.
              </div>
              <div>
                <strong className="text-white">Time Bonus (Timed Modes):</strong> Up to +30 pts in Standard (15s) and +40 pts in Rapid (8s) based on remaining time.
              </div>
              <div className="pt-1 text-slate-400 text-[11px] border-t border-slate-800">
                {SCORING_RULES_DOCUMENTATION.penalties}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {quitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Outfit']">Abandon Session?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your answered questions will be recorded in your history, but unfinished questions will not count toward completion points.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setQuitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                Resume Playing
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuitModalOpen(false);
                  if (answers.length > 0) {
                    completeSession();
                  } else {
                    onQuitGame();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
              >
                End Session Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
