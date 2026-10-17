import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Target,
  Flame,
  Award,
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  Zap,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { CategoryId, PlayerProgress, Question } from '../../types';
import { getRankAndLevel, RANK_THRESHOLDS } from '../../utils/scoring';
import { CATEGORY_DEFINITIONS, MASTER_QUESTIONS } from '../../data/questions';
import { getAllAchievementsWithStatus } from '../../utils/achievements';

interface ProgressViewProps {
  progress: PlayerProgress;
  onPracticeMissed: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  onPracticeMissed,
  onNavigateTab,
}) => {
  const { rank, level, progressPercent, currentRankMinXp, nextRankMinXp } = getRankAndLevel(progress.xp);

  const missedCount = Object.keys(progress.missedQuestionIds).length;
  const overallAccuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100)
      : 0;

  // Retrieve actual question objects for missed questions
  const missedQuestionsList: { question: Question; failCount: number }[] = Object.entries(
    progress.missedQuestionIds
  )
    .map(([qId, failCount]) => {
      const q = MASTER_QUESTIONS.find(item => item.id === qId);
      return q ? { question: q, failCount } : null;
    })
    .filter((item): item is { question: Question; failCount: number } => item !== null);

  const [expandedVault, setExpandedVault] = useState(false);
  const [sessionCategoryFilter, setSessionCategoryFilter] = useState<string>('all');
  const [sessionDateFilter, setSessionDateFilter] = useState<string>('all');

  // Achievements overview
  const achievements = useMemo(() => getAllAchievementsWithStatus(progress), [progress]);
  const unlockedAchievementsCount = achievements.filter(a => a.unlockedAt).length;

  // Personal bests fallback
  const bests = progress.personalBests || {
    highestScore: Math.max(0, ...progress.recentSessions.map(s => s.totalPoints || 0)),
    highestAccuracySessionScore: Math.max(0, ...progress.recentSessions.filter(s => s.accuracy === 100).map(s => s.totalPoints || 0)),
    longestStreak: progress.bestStreak || 0,
    fastestSessionSeconds: 0,
    bestDailyScore: Math.max(0, ...Object.values(progress.dailyCompleted || {}).map(d => d.score || 0)),
  };

  // Filtered recent sessions
  const filteredSessions = useMemo(() => {
    return progress.recentSessions.filter(s => {
      // Category filter
      if (sessionCategoryFilter !== 'all') {
        if (sessionCategoryFilter === 'daily') {
          if (!s.isDailyChallenge) return false;
        } else if (s.category !== sessionCategoryFilter) {
          return false;
        }
      }

      // Date filter
      if (sessionDateFilter !== 'all') {
        const sessionDate = new Date(s.date).getTime();
        const now = Date.now();
        if (sessionDateFilter === 'today') {
          const todayStr = new Date().toISOString().split('T')[0];
          if (!s.date.startsWith(todayStr)) return false;
        } else if (sessionDateFilter === '7days') {
          if (now - sessionDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (sessionDateFilter === '30days') {
          if (now - sessionDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });
  }, [progress.recentSessions, sessionCategoryFilter, sessionDateFilter]);

  // Overall improvement over time metric (comparing first half vs second half of recorded sessions)
  const improvementTrend = useMemo(() => {
    if (progress.recentSessions.length < 4) return null;
    const half = Math.floor(progress.recentSessions.length / 2);
    const recentHalf = progress.recentSessions.slice(0, half);
    const olderHalf = progress.recentSessions.slice(half);

    const recentAvgAcc = Math.round(recentHalf.reduce((a, b) => a + b.accuracy, 0) / recentHalf.length);
    const olderAvgAcc = Math.round(olderHalf.reduce((a, b) => a + b.accuracy, 0) / olderHalf.length);
    const diff = recentAvgAcc - olderAvgAcc;

    return { diff, recentAvgAcc, olderAvgAcc };
  }, [progress.recentSessions]);

  return (
    <div className="space-y-10 pb-20">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Career Progression
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verified player milestones, personal bests, category mastery, and honest local statistics.
          </p>
        </div>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('achievements')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:border-amber-400/40 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Award className="w-4 h-4" />
            <span>Milestones ({unlockedAchievementsCount}/{achievements.length})</span>
          </button>
        )}
      </div>

      {/* Rank Ladder */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Current Rank & Title
            </div>
            <h2 className="text-2xl font-bold text-white font-['Outfit'] mt-1">
              Level {level} · {rank}
            </h2>
          </div>
          <div className="text-right sm:text-right">
            <div className="text-xs text-slate-400">Total Career XP</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tabular-nums">
              {progress.xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Progress bar to next rank */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Floor: {currentRankMinXp} XP</span>
            <span>
              {nextRankMinXp ? `Next Rank: ${nextRankMinXp} XP` : 'Max Rank Achieved'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Rank steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800/80">
          {RANK_THRESHOLDS.map(tier => {
            const isCurrent = tier.rank === rank;
            const isUnlocked = progress.xp >= tier.minXp;

            return (
              <div
                key={tier.rank}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/10'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-700 text-slate-300'
                    : 'bg-slate-900/20 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400">
                  Lvl {tier.level}
                </div>
                <div className={`text-xs font-bold mt-0.5 ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                  {tier.rank}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {tier.minXp.toLocaleString()} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Level Career KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Total Games</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {progress.totalGames}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed Sessions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Career Accuracy</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {progress.totalCorrect} / {progress.totalQuestionsAnswered} answered
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400">All-Time Best Streak</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {progress.bestStreak}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Unbroken Correct</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Dailies Completed</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {Object.keys(progress.dailyCompleted).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Calendar Records</div>
        </div>
      </div>

      {/* Accuracy & Skips Impact Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-white">Scoring & Accuracy Policy:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Accuracy strictly reflects correct responses out of total questions served. Skipped questions award 0 points, break consecutive streaks, and are counted as unattempted/incorrect in accuracy calculations to preserve factual standards. Abandoned sessions are excluded from career stats.
          </p>
        </div>
      </div>

      {/* Personal Bests Showcase */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Hall of Personal Records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">High Session Score</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
              {bests.highestScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Single Round Max</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Longest Streak</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {bests.longestStreak}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Consecutive Correct</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Best Daily Score</div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
              {bests.bestDailyScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Deterministic Daily</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Perfect Round Record</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {bests.highestAccuracySessionScore > 0 ? `${bests.highestAccuracySessionScore} pts` : 'None Yet'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% Accuracy Round</div>
          </div>
        </div>
      </div>

      {/* Category Mastery Breakdown */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
        <h3 className="text-lg font-bold text-white font-['Outfit']">
          Discipline Mastery Breakdown
        </h3>

        <div className="space-y-4">
          {CATEGORY_DEFINITIONS.filter(c => c.id !== 'mixed').map(cat => {
            const stats = progress.categoryStats[cat.id] || { answered: 0, correct: 0 };
            const acc = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <div className="flex items-center gap-4 font-mono text-slate-400">
                    <span>{stats.correct} / {stats.answered} correct</span>
                    <span className="font-bold text-amber-400">{acc}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${acc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed Questions Vault with Detailed Review */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Missed Questions Vault ({missedCount})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and practice questions answered incorrectly in previous games without altering historical attempts.
            </p>
          </div>

          {missedCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExpandedVault(!expandedVault)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{expandedVault ? 'Hide Details' : 'View Question Details'}</span>
                {expandedVault ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onPracticeMissed}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Vault</span>
              </button>
            </div>
          )}
        </div>

        {missedCount === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">Vault is Clean!</p>
            <p>You have zero uncorrected mistakes. All attempted questions have been mastered.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              You have {missedCount} questions queued for reinforcement. Practicing them clears them from this vault upon success.
            </p>

            {expandedVault && (
              <div className="space-y-3 pt-2">
                {missedQuestionsList.map(({ question, failCount }) => (
                  <div
                    key={question.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="uppercase text-amber-400 font-semibold">{question.category} · {question.topic}</span>
                      <span className="text-rose-400 font-medium">Missed {failCount}x</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {question.question}
                    </h4>

                    <div className="text-emerald-300">
                      <span className="text-slate-400">Verified Answer:</span> {question.correctAnswer}
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[12px]">
                      {question.explanation}
                    </p>

                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Source: {question.source} (Verified {question.verifiedDate})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Improvement Over Time Notice */}
      {improvementTrend && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 to-slate-900 border border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Career Improvement Over Time
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Recent sessions average {improvementTrend.recentAvgAcc}% accuracy vs {improvementTrend.olderAvgAcc}% in earlier rounds ({improvementTrend.diff >= 0 ? `+${improvementTrend.diff}% trend` : `${improvementTrend.diff}% trend`}).
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className={improvementTrend.diff >= 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {improvementTrend.diff >= 0 ? `+${improvementTrend.diff}%` : `${improvementTrend.diff}%`}
            </span>
          </div>
        </div>
      )}

      {/* Historical Sessions with Filtering */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Completed Sessions History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter by category or timeframe to track performance evolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sessionCategoryFilter}
                onChange={e => setSessionCategoryFilter(e.target.value)}
                aria-label="Filter sessions by category"
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Disciplines</option>
                <option value="flags">Flags</option>
                <option value="capitals">Capitals</option>
                <option value="history">History</option>
                <option value="current_affairs">Current Affairs</option>
                <option value="explorer">Explorer</option>
                <option value="mixed">Mixed</option>
                <option value="daily">Daily Challenges</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sessionDateFilter}
                onChange={e => setSessionDateFilter(e.target.value)}
                aria-label="Filter sessions by date range"
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No games found matching the selected filter criteria.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">
                      {session.date.split('T')[0]}
                    </td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-white">
                      {session.isDailyChallenge ? 'Daily Challenge' : session.category}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">
                      {session.difficulty}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold tabular-nums">
                      {session.totalPoints.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 tabular-nums">
                      {session.accuracy}% ({session.correctCount}/{session.totalQuestions})
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 tabular-nums">
                      +{session.xpEarned} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

