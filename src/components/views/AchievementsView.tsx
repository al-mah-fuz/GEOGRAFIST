import React from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Globe,
  Flag,
  Landmark,
  Scroll,
  Compass,
  GraduationCap,
  Crown,
  Calendar,
  Zap,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PlayerProgress } from '../../types';
import { getAllAchievementsWithStatus } from '../../utils/achievements';

interface AchievementsViewProps {
  progress: PlayerProgress;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ progress }) => {
  const achievements = getAllAchievementsWithStatus(progress);
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flag': return <Flag className="w-5 h-5" />;
      case 'Landmark': return <Landmark className="w-5 h-5" />;
      case 'Scroll': return <Scroll className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'RotateCcw': return <RotateCcw className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Career Milestones & Achievements
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Permanent accolades unlocked through proven factual mastery.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          Unlocked: <strong className="text-amber-400">{unlockedCount}</strong> / {achievements.length}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(ach => {
          const isUnlocked = !!ach.unlockedAt;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-amber-400/40 shadow-md shadow-amber-400/5'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isUnlocked ? renderIcon(ach.icon) : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm font-bold truncate font-['Outfit'] ${
                      isUnlocked ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {ach.title}
                  </h3>
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono text-emerald-400 inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {ach.progress}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ach.description}
                </p>

                <div className="pt-2">
                  {isUnlocked ? (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Unlocked on {ach.unlockedAt?.split('T')[0]}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${ach.progress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Requirement: {ach.reqText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
