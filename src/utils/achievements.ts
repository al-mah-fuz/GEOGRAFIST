import { Achievement, CategoryId, PlayerProgress } from '../types';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: CategoryId | 'general';
  icon: string;
  reqText: string;
  check: (progress: PlayerProgress) => boolean;
  getProgress: (progress: PlayerProgress) => number; // 0 to 100
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first quiz session in any category.',
    category: 'general',
    icon: 'Compass',
    reqText: 'Play 1 session',
    check: p => p.totalGames >= 1,
    getProgress: p => Math.min(100, (p.totalGames / 1) * 100),
  },
  {
    id: 'perfect_round',
    title: 'Flawless Intellect',
    description: 'Complete a full quiz round with 100% accuracy (minimum 10 questions).',
    category: 'general',
    icon: 'Sparkles',
    reqText: '100% accuracy in a 10+ Q session',
    check: p => p.recentSessions.some(s => s.totalQuestions >= 10 && s.accuracy === 100),
    getProgress: p => (p.recentSessions.some(s => s.totalQuestions >= 10 && s.accuracy === 100) ? 100 : 0),
  },
  {
    id: 'first_history',
    title: 'Echoes of Antiquity',
    description: 'Complete your first dedicated World History quiz session.',
    category: 'history',
    icon: 'Scroll',
    reqText: 'Complete 1 History session',
    check: p => p.recentSessions.some(s => s.category === 'history') || (p.categoryStats.history?.answered || 0) >= 5,
    getProgress: p => (p.recentSessions.some(s => s.category === 'history') || (p.categoryStats.history?.answered || 0) >= 5 ? 100 : 0),
  },
  {
    id: 'unyielding_focus',
    title: 'Unyielding Focus',
    description: 'Complete a round of 10+ questions without skipping a single question.',
    category: 'general',
    icon: 'ShieldCheck',
    reqText: '0 skips in a 10+ Q session',
    check: p => p.recentSessions.some(s => s.totalQuestions >= 10 && (!s.skippedCount || s.skippedCount === 0)),
    getProgress: p => (p.recentSessions.some(s => s.totalQuestions >= 10 && (!s.skippedCount || s.skippedCount === 0)) ? 100 : 0),
  },
  {
    id: 'category_turnaround',
    title: 'Category Turnaround',
    description: 'Achieve 80%+ accuracy in a category after practicing or overcoming mistakes.',
    category: 'general',
    icon: 'RotateCcw',
    reqText: '80%+ accuracy in a session with prior misses',
    check: p => p.recentSessions.some(s => s.accuracy >= 80 && s.totalQuestions >= 5 && (s.isPracticeMissed || Object.keys(p.missedQuestionIds).length > 0 || p.totalGames >= 3)),
    getProgress: p => (p.recentSessions.some(s => s.accuracy >= 80 && s.totalQuestions >= 5) ? 100 : 0),
  },
  {
    id: 'flag_apprentice',
    title: 'Flag Apprentice',
    description: 'Answer 10 Flag Master questions correctly.',
    category: 'flags',
    icon: 'Flag',
    reqText: '10 correct Flag questions',
    check: p => (p.categoryStats.flags?.correct || 0) >= 10,
    getProgress: p => Math.min(100, Math.round(((p.categoryStats.flags?.correct || 0) / 10) * 100)),
  },
  {
    id: 'capital_citizen',
    title: 'Capital Citizen',
    description: 'Answer 10 Capital Challenge questions correctly.',
    category: 'capitals',
    icon: 'Landmark',
    reqText: '10 correct Capital questions',
    check: p => (p.categoryStats.capitals?.correct || 0) >= 10,
    getProgress: p => Math.min(100, Math.round(((p.categoryStats.capitals?.correct || 0) / 10) * 100)),
  },
  {
    id: 'history_chronicler',
    title: 'History Chronicler',
    description: 'Answer 10 World History questions correctly.',
    category: 'history',
    icon: 'Scroll',
    reqText: '10 correct History questions',
    check: p => (p.categoryStats.history?.correct || 0) >= 10,
    getProgress: p => Math.min(100, Math.round(((p.categoryStats.history?.correct || 0) / 10) * 100)),
  },
  {
    id: 'world_diplomat',
    title: 'World Diplomat',
    description: 'Answer 10 Current Affairs questions correctly.',
    category: 'current_affairs',
    icon: 'Globe',
    reqText: '10 correct Current Affairs questions',
    check: p => (p.categoryStats.current_affairs?.correct || 0) >= 10,
    getProgress: p => Math.min(100, Math.round(((p.categoryStats.current_affairs?.correct || 0) / 10) * 100)),
  },
  {
    id: 'globe_explorer',
    title: 'Globe Explorer',
    description: 'Answer 10 World Explorer questions correctly.',
    category: 'explorer',
    icon: 'MapPin',
    reqText: '10 correct Explorer questions',
    check: p => (p.categoryStats.explorer?.correct || 0) >= 10,
    getProgress: p => Math.min(100, Math.round(((p.categoryStats.explorer?.correct || 0) / 10) * 100)),
  },
  {
    id: 'hot_streak',
    title: 'Precision Streak',
    description: 'Attain a streak of 5 consecutive correct answers.',
    category: 'general',
    icon: 'Zap',
    reqText: 'Streak of 5',
    check: p => p.bestStreak >= 5,
    getProgress: p => Math.min(100, Math.round((p.bestStreak / 5) * 100)),
  },
  {
    id: 'streak_titan',
    title: 'Streak Titan',
    description: 'Attain an unbroken streak of 10 consecutive correct answers.',
    category: 'general',
    icon: 'Flame',
    reqText: 'Streak of 10',
    check: p => p.bestStreak >= 10,
    getProgress: p => Math.min(100, Math.round((p.bestStreak / 10) * 100)),
  },
  {
    id: 'daily_pioneer',
    title: 'Daily Pioneer',
    description: 'Complete your first official Daily Challenge.',
    category: 'general',
    icon: 'Calendar',
    reqText: 'Complete 1 Daily Challenge',
    check: p => Object.keys(p.dailyCompleted || {}).length >= 1,
    getProgress: p => Math.min(100, Object.keys(p.dailyCompleted || {}).length >= 1 ? 100 : 0),
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer 100 total questions across all modes.',
    category: 'general',
    icon: 'Award',
    reqText: '100 questions answered',
    check: p => p.totalQuestionsAnswered >= 100,
    getProgress: p => Math.min(100, Math.round((p.totalQuestionsAnswered / 100) * 100)),
  },
  {
    id: 'scholar_elevation',
    title: 'Scholar Rank',
    description: 'Earn 3,500 total XP to attain the Scholar rank.',
    category: 'general',
    icon: 'GraduationCap',
    reqText: 'Reach 3,500 XP',
    check: p => p.xp >= 3500,
    getProgress: p => Math.min(100, Math.round((p.xp / 3500) * 100)),
  },
  {
    id: 'world_mastery',
    title: 'World Master',
    description: 'Reach the pinnacle rank of World Master with 6,000+ XP.',
    category: 'general',
    icon: 'Crown',
    reqText: 'Reach 6,000 XP',
    check: p => p.xp >= 6000,
    getProgress: p => Math.min(100, Math.round((p.xp / 6000) * 100)),
  },
];

/**
 * Evaluates player progress against achievements and returns newly unlocked ones
 */
export function checkNewAchievements(progress: PlayerProgress): {
  newlyUnlocked: string[];
  updatedUnlockedMap: Record<string, string>;
} {
  const currentUnlocked = { ...progress.achievementsUnlocked };
  const newlyUnlocked: string[] = [];
  const nowIso = new Date().toISOString();

  for (const ach of ACHIEVEMENTS_LIST) {
    if (!currentUnlocked[ach.id]) {
      if (ach.check(progress)) {
        currentUnlocked[ach.id] = nowIso;
        newlyUnlocked.push(ach.id);
      }
    }
  }

  return {
    newlyUnlocked,
    updatedUnlockedMap: currentUnlocked,
  };
}

export function getAllAchievementsWithStatus(progress: PlayerProgress): Achievement[] {
  return ACHIEVEMENTS_LIST.map(ach => ({
    id: ach.id,
    title: ach.title,
    description: ach.description,
    category: ach.category,
    icon: ach.icon,
    unlockedAt: progress.achievementsUnlocked[ach.id],
    progress: ach.getProgress(progress),
    reqText: ach.reqText,
  }));
}
