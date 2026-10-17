import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Flame,
  Clock,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  SkipForward,
  Info,
} from 'lucide-react';
import { CategoryId, GameSessionResult } from '../../types';
import { soundFx } from '../../utils/sound';
import { ConfettiCanvas } from '../common/ConfettiCanvas';
import { CATEGORY_DEFINITIONS } from '../../data/questions';

interface GameResultsViewProps {
  result: GameSessionResult;
  soundEnabled: boolean;
  onPlayAgain: () => void;
  onPracticeMissed: () => void;
  onReturnHome: () => void;
}

export const GameResultsView: React.FC<GameResultsViewProps> = ({
  result,
  soundEnabled,
  onPlayAgain,
  onPracticeMissed,
  onReturnHome,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'missed' | 'skipped'>('all');

  const missedCount = result.answers.filter(a => !a.isCorrect && !a.isSkipped).length;
  const skippedCount = result.answers.filter(a => a.isSkipped).length;

  useEffect(() => {
    if (result.accuracy >= 60) {
      soundFx.playVictory(soundEnabled);
    }
  }, [result.accuracy, soundEnabled]);

  const displayedAnswers = result.answers.filter(a => {
    if (activeFilter === 'missed') return !a.isCorrect && !a.isSkipped;
    if (activeFilter === 'skipped') return !!a.isSkipped;
    return true;
  });

  const formatDuration = (totalSeconds: number = 0) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <ConfettiCanvas active={result.accuracy >= 70} />

      {/* Primary Victory / Completion Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {result.isPracticeMissed
              ? 'Missed Questions Practice Session'
              : result.isDailyChallenge
              ? 'Daily Challenge Completed'
              : 'Round Completed'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
          {result.accuracy === 100
            ? 'Flawless Mastery!'
            : result.accuracy >= 80
            ? 'Outstanding Performance!'
            : result.accuracy >= 50
            ? 'Solid Knowledge, Explorer!'
            : 'Knowledge Acquired!'}
        </h1>

        <p className="text-sm text-slate-300">
          You answered {result.correctCount} of {result.totalQuestions} questions correctly.
        </p>
      </div>

      {/* High-Level Session KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Final Score</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {result.totalPoints.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 mt-0.5">+{result.xpEarned} XP Earned</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Accuracy</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {result.accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {result.correctCount} of {result.totalQuestions} Correct
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Best Streak</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            {result.bestStreak}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Consecutive Correct</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Total Duration</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
            {formatDuration(result.totalDurationSeconds || result.answers.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Avg {result.avgTimeSeconds}s per question
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {result.categoryBreakdown && Object.keys(result.categoryBreakdown).length > 0 && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Layers className="w-4 h-4" />
            <span>Category Performance Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(result.categoryBreakdown).map(([catKey, data]) => {
              const def = CATEGORY_DEFINITIONS.find(c => c.id === catKey);
              const catName = def ? def.name : catKey;

              return (
                <div
                  key={catKey}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{catName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{data.accuracy}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {data.correct} / {data.total} correct
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${data.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        {missedCount > 0 && (
          <button
            type="button"
            onClick={onPracticeMissed}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-rose-200 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Target className="w-4 h-4 text-rose-400" />
            <span>Practice Missed ({missedCount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReturnHome}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>

      {/* Question-by-Question Review with Mistake Review Mode */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Question Review ({displayedAnswers.length} of {result.answers.length})
            </h2>
            <p className="text-xs text-slate-400">
              Inspect your answers against the verified facts and educational citations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({result.answers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('missed')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeFilter === 'missed'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mistakes ({missedCount})
            </button>
            {skippedCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('skipped')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeFilter === 'skipped'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Skipped ({skippedCount})
              </button>
            )}
          </div>
        </div>

        {displayedAnswers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
            No questions in this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAnswers.map((item, idx) => (
              <div
                key={`${item.questionId}_${idx}`}
                className={`p-4 rounded-xl border transition-all ${
                  item.isCorrect
                    ? 'bg-slate-900/50 border-slate-800'
                    : item.isSkipped
                    ? 'bg-amber-950/15 border-amber-500/30'
                    : 'bg-rose-950/15 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      {item.isCorrect ? (
                        <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{item.pointsEarned} pts)
                        </span>
                      ) : item.isSkipped ? (
                        <span className="text-amber-400 inline-flex items-center gap-1 font-semibold">
                          <SkipForward className="w-3.5 h-3.5" /> Skipped (0 pts)
                        </span>
                      ) : (
                        <span className="text-rose-400 inline-flex items-center gap-1 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Missed (0 pts)
                        </span>
                      )}
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 uppercase">{item.category}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{item.timeSpentSeconds}s</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white pt-1">
                      {item.questionText}
                    </h3>
                  </div>
                </div>

                {/* Answers comparison and factual explanation */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                  {!item.isCorrect && (
                    <div className={item.isSkipped ? 'text-amber-300' : 'text-rose-300'}>
                      <span className="text-slate-400">Your Answer:</span>{' '}
                      <span className="font-semibold">
                        {item.selectedAnswer === '__TIMEOUT__'
                          ? 'Time Expired'
                          : item.selectedAnswer === '__SKIPPED__'
                          ? 'Question Skipped'
                          : item.selectedAnswer}
                      </span>
                    </div>
                  )}

                  <div className="text-emerald-300">
                    <span className="text-slate-400">Verified Answer:</span>{' '}
                    <span className="font-semibold">{item.correctAnswer}</span>
                  </div>

                  <div className="text-slate-200 pt-1 leading-relaxed text-[12px]">
                    {item.explanation}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                    Source: {item.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
