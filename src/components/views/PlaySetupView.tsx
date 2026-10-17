import React, { useState } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  Layers,
  Award,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { CategoryId, Difficulty, GameConfig, SessionLength, TimerMode } from '../../types';
import { CATEGORY_DEFINITIONS, MASTER_QUESTIONS } from '../../data/questions';

interface PlaySetupViewProps {
  initialCategory?: CategoryId;
  missedQuestionCount: number;
  onLaunchGame: (config: GameConfig) => void;
  onCancel: () => void;
}

export const PlaySetupView: React.FC<PlaySetupViewProps> = ({
  initialCategory = 'mixed',
  missedQuestionCount,
  onLaunchGame,
  onCancel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [sessionLength, setSessionLength] = useState<SessionLength>(10);
  const [timerMode, setTimerMode] = useState<TimerMode>('standard');
  const [missedOnly, setMissedOnly] = useState<boolean>(false);

  // Calculate live available verified questions in current filter
  const pool = MASTER_QUESTIONS.filter(q => {
    if (missedOnly) return true;
    const matchCat = selectedCategory === 'mixed' ? true : q.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'all' ? true : q.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  const availableCount = pool.length;

  const handleStart = () => {
    onLaunchGame({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      sessionLength,
      timerMode,
      missedQuestionsOnly: missedOnly,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Configure Session
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Follow the 4-step sequence: choose category → difficulty → round length → pacing.
        </p>
      </div>

      {/* Missed Questions Banner (if any) */}
      {missedQuestionCount > 0 && (
        <div
          onClick={() => setMissedOnly(!missedOnly)}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            missedOnly
              ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/20'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                missedOnly ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Practice Previously Missed Questions ({missedQuestionCount} available)
              </div>
              <div className="text-xs text-slate-400">
                Focus strictly on questions you got wrong in previous rounds without affecting your past scores.
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 text-xs font-semibold rounded-md ${
              missedOnly
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {missedOnly ? 'Enabled' : 'Select'}
          </div>
        </div>
      )}

      {/* Step 1: Category Selection */}
      {!missedOnly && (
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Step 1: Choose Category</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORY_DEFINITIONS.map(cat => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/10'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-amber-400/90">{cat.tagline}</div>
                    <div className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                      {cat.name}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Verified Domain</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Difficulty */}
      {!missedOnly && (
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Step 2: Choose Difficulty</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(
              [
                { id: 'all', label: 'All Levels', desc: 'Balanced mix across all tiers' },
                { id: 'beginner', label: 'Beginner', desc: 'Foundational facts (+0 bonus)' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Moderate knowledge (+25 bonus)' },
                { id: 'advanced', label: 'Advanced', desc: 'Deeper scholarship (+50 bonus)' },
                { id: 'expert', label: 'Expert', desc: 'Pinnacle precision (+75 bonus)' },
              ] as const
            ).map(diff => {
              const isSelected = selectedDifficulty === diff.id;
              const matchingInCat = MASTER_QUESTIONS.filter(q => {
                const matchCat = selectedCategory === 'mixed' ? true : q.category === selectedCategory;
                const matchDiff = diff.id === 'all' ? true : q.difficulty === diff.id;
                return matchCat && matchDiff;
              }).length;

              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{diff.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{diff.desc}</div>
                  <div className="text-[10px] text-amber-400/80 font-mono mt-2">
                    {matchingInCat} questions
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Round Length */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Step 3: Choose Round Length</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { length: 10, label: '10 Questions', desc: 'Quick session (~3 min)' },
              { length: 20, label: '20 Questions', desc: 'Standard round (~6 min)' },
              { length: 50, label: '50 Questions', desc: 'Endurance challenge' },
              { length: 'endless', label: 'Endless Practice', desc: 'Draw until bank completes' },
            ] as const
          ).map(opt => {
            const isSelected = sessionLength === opt.length;
            return (
              <button
                key={String(opt.length)}
                type="button"
                onClick={() => setSessionLength(opt.length)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-sm font-bold text-white">{opt.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Zero-Duplicate Guarantee notice if round length exceeds available unique questions */}
        {!missedOnly && typeof sessionLength === 'number' && sessionLength > availableCount && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold">Zero-Duplicate Guarantee:</span> To guarantee 100% unique questions without repetition or synthetic filler, this session will run with unique verified questions. You can also switch to "All Levels" or "Mixed Quiz" for an extended session.
            </div>
          </div>
        )}

        {/* Empty category filter warning */}
        {availableCount === 0 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              No questions found for this specific category and difficulty combination. Please choose "All Levels" or another difficulty.
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Timer & Pacing Mode */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Step 4: Pacing & Timer Mode</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'relaxed', label: 'Untimed / Relaxed', desc: 'No timer. Read and absorb explanations at your own pace.' },
              { id: 'standard', label: 'Standard (15s)', desc: '15s countdown with speed bonus (up to +30 pts).' },
              { id: 'rapid', label: 'Rapid Fire (8s)', desc: '8s quick reflex round with speed bonus (up to +40 pts).' },
            ] as const
          ).map(tm => {
            const isSelected = timerMode === tm.id;
            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => setTimerMode(tm.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-sm font-bold text-white">{tm.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{tm.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={availableCount === 0}
          onClick={handleStart}
          className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Quiz</span>
        </button>
      </div>
    </div>
  );
};
