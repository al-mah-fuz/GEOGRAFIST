import React from 'react';
import {
  Play,
  Calendar,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { CategoryId, PlayerProgress } from '../../types';
import { NavTab } from '../common/Navbar';
import { CATEGORY_DEFINITIONS, MASTER_QUESTIONS } from '../../data/questions';
import { getRankAndLevel } from '../../utils/scoring';
import { getTodayDateString, getTimeUntilNextDaily } from '../../utils/daily';

interface HomeViewProps {
  progress: PlayerProgress;
  onStartGame: (categoryId?: CategoryId) => void;
  onOpenDaily: () => void;
  onNavigateTab: (tab: NavTab) => void;
  totalQuestionsInBank?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  onStartGame,
  onOpenDaily,
  onNavigateTab,
  totalQuestionsInBank = MASTER_QUESTIONS.length,
}) => {
  const todayStr = getTodayDateString();
  const dailyCompletedRecord = progress.dailyCompleted[todayStr];
  const { rank, level, progressPercent, nextRankMinXp, currentRankMinXp } = getRankAndLevel(progress.xp);
  const timeToTomorrow = getTimeUntilNextDaily();

  const missedCount = Object.keys(progress.missedQuestionIds).length;
  const overallAccuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Compass className="w-4 h-4" />
            <span>Master the Facts · Verified World Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-['Outfit'] text-balance">
            Know the World. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Master the Facts.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Challenge your mind with curated questions covering world flags, capitals, ancient empires, international relations, and physical geographical extremes. Built entirely on verified static facts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onStartGame()}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Quiz</span>
            </button>

            <button
              onClick={onOpenDaily}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                dailyCompletedRecord
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/30'
                  : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                {dailyCompletedRecord ? 'Review Daily Challenge' : "Today's Daily Challenge"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard KPI Strip & Player Rank Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Rank & Progression Card */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-['Outfit']">Career Level {level}</h2>
                  <p className="text-xs text-slate-400">Current Rank: <span className="text-amber-300 font-semibold">{rank}</span></p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('progress')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Ladder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                <span>XP {progress.xp.toLocaleString()}</span>
                <span>
                  {nextRankMinXp
                    ? `Next Rank: ${nextRankMinXp.toLocaleString()} XP`
                    : 'Pinnacle Master Achieved'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Tier floor: {currentRankMinXp} XP</span>
                <span>{progressPercent}% to next promotion</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-xs text-slate-400">Total Answered</div>
              <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {progress.totalQuestionsAnswered}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                {overallAccuracy}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Best Streak</div>
              <div className="text-lg font-bold text-amber-400 font-mono tabular-nums mt-0.5">
                {progress.bestStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Challenge Card */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Set · 10 Questions
              </span>
              <span className="text-xs font-mono text-amber-400">{todayStr}</span>
            </div>

            <h3 className="text-lg font-bold text-white font-['Outfit'] mt-2">
              {dailyCompletedRecord ? 'Challenge Completed' : "Today's Challenge"}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {dailyCompletedRecord
                ? `You scored ${dailyCompletedRecord.score} points with ${dailyCompletedRecord.accuracy}% accuracy today.`
                : '10 deterministic questions drawn across all 5 disciplines. One recorded official attempt per day.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {dailyCompletedRecord ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recorded</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next: {timeToTomorrow.formatted}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenDaily}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer text-center"
              >
                Start Daily Challenge
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Missed Questions Quick Banner (if any) */}
      {missedCount > 0 && (
        <section className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {missedCount} Missed {missedCount === 1 ? 'Question' : 'Questions'} Ready for Review
              </h3>
              <p className="text-xs text-slate-300">
                Sharpen your mastery by retesting questions you previously answered incorrectly.
              </p>
            </div>
          </div>
          <button
            onClick={() => onStartGame()}
            className="px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Review Missed Questions
          </button>
        </section>
      )}

      {/* Category Showcase Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">Game Categories</h2>
            <p className="text-xs text-slate-400">
              Choose a dedicated discipline or test your comprehensive world mastery
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('categories')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORY_DEFINITIONS.map(cat => {
            const catStats = progress.categoryStats[cat.id];
            const accuracy =
              catStats && catStats.answered > 0
                ? Math.round((catStats.correct / catStats.answered) * 100)
                : null;

            return (
              <div
                key={cat.id}
                onClick={() => onStartGame(cat.id)}
                className="group relative rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 tracking-wide">
                      {cat.tagline}
                    </span>
                    {accuracy !== null && (
                      <span className="text-xs text-emerald-400 font-mono tabular-nums">
                        {accuracy}% acc
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white font-['Outfit'] group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Curated & Verified</span>
                  </span>
                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                    Play <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Static Integrity Footer Notice */}
      <section className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs text-slate-400">
            <span className="text-slate-200 font-semibold">100% Curated & Fact-Checked.</span>{' '}
            Every question features primary source citations and verification dates. Zero generative models or synthetic hallucinations.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('bank')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap cursor-pointer shrink-0"
          >
            Question Bank Studio →
          </button>
        </div>
      </section>
    </div>
  );
};
