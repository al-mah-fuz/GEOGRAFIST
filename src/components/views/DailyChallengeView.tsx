import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PlayerProgress } from '../../types';
import { getTodayDateString, getTimeUntilNextDaily } from '../../utils/daily';

interface DailyChallengeViewProps {
  progress: PlayerProgress;
  onStartDaily: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  progress,
  onStartDaily,
}) => {
  const todayStr = getTodayDateString();
  const completedToday = progress.dailyCompleted[todayStr];
  const [countdown, setCountdown] = useState(getTimeUntilNextDaily());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextDaily());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const totalDailiesCompleted = Object.keys(progress.dailyCompleted).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Official Daily Ritual</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
          Daily Challenge
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {todayFormatted} · Fixed 10-Question Curated Set
        </p>
      </div>

      {/* Main Status Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Date Seed: {todayStr}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] mt-1">
              {completedToday ? 'Today’s Attempt Completed' : 'Today’s Challenge is Ready'}
            </h2>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Resets In</div>
              <div className="font-mono font-bold text-white tabular-nums text-sm">
                {countdown.formatted}
              </div>
            </div>
          </div>
        </div>

        {completedToday ? (
          /* Already completed today */
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-200">
                  Official Record Logged for {todayStr}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  To prevent score inflation and protect tournament integrity, only your first official run is recorded in career stats.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Score</div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                  {completedToday.score.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Accuracy</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {completedToday.accuracy}%
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Total Answered</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1">
                  {completedToday.total} / {completedToday.total}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Not yet completed */
          <div className="space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              Every day at midnight, GEOGRAFIST deterministically selects a 10-question set consisting of exactly 2 questions from each discipline: Flags, Capitals, History, Current Affairs, and World Explorer. Every player receives the exact same questions on that calendar date.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>10 Curated Questions</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Standard 15s Timer</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>1 Official Record</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartDaily}
              className="w-full py-4 px-6 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Today’s Daily Challenge</span>
            </button>
          </div>
        )}
      </div>

      {/* Career Daily Records & Synchronization Notice */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>All-Time Daily Challenges Completed:</span>
          <strong className="text-white font-mono text-sm">{totalDailiesCompleted}</strong>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-semibold">Local Storage Notice:</span> Daily challenge records and scores are preserved locally in your browser. Cross-device cloud synchronization is not supported until user accounts and a backend server exist. You can export or import your career file at any time in Settings.
          </div>
        </div>
      </div>
    </div>
  );
};
