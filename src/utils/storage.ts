import { GameSessionResult, PersonalBests, PlayerProgress, Question } from '../types';
import { getRankAndLevel } from './scoring';
import { checkNewAchievements } from './achievements';

export const CURRENT_SCHEMA_VERSION = 2;
const STORAGE_KEY = 'geografist_player_progress_v2';
const LEGACY_STORAGE_KEY_V1 = 'geografist_player_progress_v1';

export const INITIAL_PERSONAL_BESTS: PersonalBests = {
  highestScore: 0,
  highestAccuracySessionScore: 0,
  longestStreak: 0,
  fastestSessionSeconds: 0,
  bestDailyScore: 0,
};

export const INITIAL_PROGRESS: PlayerProgress = {
  version: CURRENT_SCHEMA_VERSION,
  username: 'Navigator',
  avatar: 'Compass',
  createdAt: new Date().toISOString(),
  xp: 0,
  level: 1,
  rank: 'Beginner',
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalSkipped: 0,
  personalBests: { ...INITIAL_PERSONAL_BESTS },
  categoryStats: {
    flags: { answered: 0, correct: 0 },
    capitals: { answered: 0, correct: 0 },
    history: { answered: 0, correct: 0 },
    current_affairs: { answered: 0, correct: 0 },
    explorer: { answered: 0, correct: 0 },
    mixed: { answered: 0, correct: 0 },
  },
  dailyCompleted: {},
  missedQuestionIds: {},
  achievementsUnlocked: {},
  recentSessions: [],
  settings: {
    sound: true,
    timerMode: 'standard',
    reducedMotion: false,
    haptics: true,
  },
};

let inMemoryFallback: PlayerProgress = { ...INITIAL_PROGRESS };
let inMemoryCustomQuestions: Question[] = [];
let inMemoryTemplatesActive: boolean = true;

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test storage availability
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Migrates legacy progress records from v1 to v2 format seamlessly
 */
export function migrateProgressSchema(rawObj: any): PlayerProgress {
  if (!rawObj || typeof rawObj !== 'object') {
    return { ...INITIAL_PROGRESS, createdAt: new Date().toISOString() };
  }

  // Calculate default personal bests if upgrading from v1
  const existingBests: PersonalBests = {
    highestScore: typeof rawObj.personalBests?.highestScore === 'number'
      ? rawObj.personalBests.highestScore
      : Array.isArray(rawObj.recentSessions)
      ? Math.max(0, ...rawObj.recentSessions.map((s: any) => s.totalPoints || 0))
      : 0,
    highestAccuracySessionScore: typeof rawObj.personalBests?.highestAccuracySessionScore === 'number'
      ? rawObj.personalBests.highestAccuracySessionScore
      : Array.isArray(rawObj.recentSessions)
      ? Math.max(0, ...rawObj.recentSessions.filter((s: any) => s.accuracy === 100).map((s: any) => s.totalPoints || 0))
      : 0,
    longestStreak: typeof rawObj.personalBests?.longestStreak === 'number'
      ? rawObj.personalBests.longestStreak
      : Math.max(0, rawObj.bestStreak || 0),
    fastestSessionSeconds: typeof rawObj.personalBests?.fastestSessionSeconds === 'number'
      ? rawObj.personalBests.fastestSessionSeconds
      : 0,
    bestDailyScore: typeof rawObj.personalBests?.bestDailyScore === 'number'
      ? rawObj.personalBests.bestDailyScore
      : rawObj.dailyCompleted && typeof rawObj.dailyCompleted === 'object'
      ? Math.max(0, ...Object.values(rawObj.dailyCompleted).map((d: any) => d?.score || 0))
      : 0,
  };

  const totalSkipped = typeof rawObj.totalSkipped === 'number'
    ? rawObj.totalSkipped
    : Array.isArray(rawObj.recentSessions)
    ? rawObj.recentSessions.reduce((acc: number, s: any) => acc + (s.skippedCount || 0), 0)
    : 0;

  const migrated: PlayerProgress = {
    ...INITIAL_PROGRESS,
    ...rawObj,
    version: CURRENT_SCHEMA_VERSION,
    personalBests: existingBests,
    totalSkipped,
    categoryStats: {
      ...INITIAL_PROGRESS.categoryStats,
      ...(rawObj.categoryStats || {}),
    },
    dailyCompleted: {
      ...(rawObj.dailyCompleted || {}),
    },
    missedQuestionIds: {
      ...(rawObj.missedQuestionIds || {}),
    },
    achievementsUnlocked: {
      ...(rawObj.achievementsUnlocked || {}),
    },
    recentSessions: Array.isArray(rawObj.recentSessions) ? rawObj.recentSessions : [],
    settings: {
      ...INITIAL_PROGRESS.settings,
      ...(rawObj.settings || {}),
    },
  };

  // Re-verify rank and level match cumulative XP
  const { rank, level } = getRankAndLevel(migrated.xp || 0);
  migrated.rank = rank;
  migrated.level = level;

  return migrated;
}

export function loadPlayerProgress(): PlayerProgress {
  try {
    const storage = getSafeStorage();
    if (!storage) {
      return { ...inMemoryFallback };
    }

    // Attempt to load current v2 storage key
    let raw = storage.getItem(STORAGE_KEY);
    let isLegacy = false;

    // Fall back to legacy v1 key if v2 not yet created
    if (!raw) {
      raw = storage.getItem(LEGACY_STORAGE_KEY_V1);
      if (raw) isLegacy = true;
    }

    if (!raw) {
      return { ...INITIAL_PROGRESS };
    }

    const parsed = JSON.parse(raw);
    const progress = migrateProgressSchema(parsed);

    // If loaded from legacy, persist to new v2 key
    if (isLegacy) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (err) {
        // Safe ignore
      }
    }

    inMemoryFallback = progress;
    return progress;
  } catch (err) {
    console.warn('Storage read or migration failed, safely falling back to defaults:', err);
    return { ...inMemoryFallback };
  }
}

export function savePlayerProgress(progress: PlayerProgress): boolean {
  inMemoryFallback = { ...progress };
  try {
    const storage = getSafeStorage();
    if (storage) {
      const serialized = JSON.stringify(progress);
      storage.setItem(STORAGE_KEY, serialized);
    }
    return true;
  } catch (err) {
    console.warn('LocalStorage quota or write failure, preserved in memory:', err);
    // If quota exceeded, attempt pruning older sessions to free up space
    try {
      const storage = getSafeStorage();
      if (storage && progress.recentSessions.length > 5) {
        const pruned = {
          ...progress,
          recentSessions: progress.recentSessions.slice(0, 5),
        };
        storage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      }
    } catch (retryErr) {
      // Memory fallback remains intact
    }
    return true;
  }
}

export function resetPlayerProgress(): PlayerProgress {
  const fresh: PlayerProgress = {
    ...INITIAL_PROGRESS,
    createdAt: new Date().toISOString(),
  };
  try {
    const storage = getSafeStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
      storage.removeItem(LEGACY_STORAGE_KEY_V1);
      storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
  inMemoryFallback = fresh;
  return fresh;
}

/**
 * Updates progress with a completed game session.
 * Prevents duplicate session recording via stable session ID idempotency check.
 */
export function recordSessionCompletion(
  prev: PlayerProgress,
  session: GameSessionResult,
  updatedAchievementsMap?: Record<string, string>
): PlayerProgress {
  // Idempotency check: if this exact session ID was already processed, do not duplicate awards
  if (prev.recentSessions.some(s => s.id === session.id)) {
    return prev;
  }

  // Prevent duplicate daily recording for same date if score has already been officially awarded
  const isDaily = Boolean(session.isDailyChallenge);
  const todayStr = session.date.split('T')[0];
  const existingDaily = isDaily ? prev.dailyCompleted[todayStr] : undefined;

  // If daily was already completed today, do not award duplicate XP or game count;
  // only record if this was a practice replay or higher score
  const isFirstDailyAttempt = isDaily ? !existingDaily : true;

  const xpEarned = isFirstDailyAttempt ? session.xpEarned : 0;
  const newXp = prev.xp + xpEarned;
  const { rank, level } = getRankAndLevel(newXp);

  // Update category stats
  const catStats = { ...prev.categoryStats };
  const cat = session.category;
  if (!catStats[cat]) {
    catStats[cat] = { answered: 0, correct: 0 };
  }
  catStats[cat] = {
    answered: catStats[cat].answered + session.totalQuestions,
    correct: catStats[cat].correct + session.correctCount,
  };

  // Update missed questions
  const missed = { ...prev.missedQuestionIds };
  for (const ans of session.answers) {
    if (!ans.isCorrect) {
      missed[ans.questionId] = (missed[ans.questionId] || 0) + 1;
    } else if (missed[ans.questionId]) {
      // If answered correctly now, decrease fail count or remove
      if (missed[ans.questionId] <= 1) {
        delete missed[ans.questionId];
      } else {
        missed[ans.questionId] -= 1;
      }
    }
  }

  // Update daily completed if this was daily
  const dailyCompleted = { ...prev.dailyCompleted };
  if (isDaily) {
    if (!existingDaily) {
      dailyCompleted[todayStr] = {
        date: todayStr,
        score: session.totalPoints,
        total: session.totalQuestions,
        accuracy: session.accuracy,
        completedAt: session.date,
        bestScore: session.totalPoints,
        attemptsCount: 1,
      };
    } else {
      // Replay attempt: keep best score, increment attempts count
      dailyCompleted[todayStr] = {
        ...existingDaily,
        bestScore: Math.max(existingDaily.bestScore || existingDaily.score, session.totalPoints),
        attemptsCount: (existingDaily.attemptsCount || 1) + 1,
      };
    }
  }

  // Update Personal Bests
  const personalBests: PersonalBests = {
    highestScore: Math.max(prev.personalBests?.highestScore || 0, session.totalPoints),
    highestAccuracySessionScore: session.accuracy === 100
      ? Math.max(prev.personalBests?.highestAccuracySessionScore || 0, session.totalPoints)
      : (prev.personalBests?.highestAccuracySessionScore || 0),
    longestStreak: Math.max(prev.personalBests?.longestStreak || 0, session.bestStreak),
    fastestSessionSeconds: session.totalQuestions >= 10 && session.totalDurationSeconds
      ? (prev.personalBests?.fastestSessionSeconds === 0
          ? session.totalDurationSeconds
          : Math.min(prev.personalBests?.fastestSessionSeconds || session.totalDurationSeconds, session.totalDurationSeconds))
      : (prev.personalBests?.fastestSessionSeconds || 0),
    bestDailyScore: isDaily
      ? Math.max(prev.personalBests?.bestDailyScore || 0, session.totalPoints)
      : (prev.personalBests?.bestDailyScore || 0),
  };

  // Recent sessions list (keep last 20)
  const recentSessions = [session, ...prev.recentSessions].slice(0, 20);

  const candidate: PlayerProgress = {
    ...prev,
    version: CURRENT_SCHEMA_VERSION,
    xp: newXp,
    rank,
    level,
    totalGames: prev.totalGames + 1,
    totalQuestionsAnswered: prev.totalQuestionsAnswered + session.totalQuestions,
    totalCorrect: prev.totalCorrect + session.correctCount,
    totalSkipped: (prev.totalSkipped || 0) + (session.skippedCount || 0),
    bestStreak: Math.max(prev.bestStreak, session.bestStreak),
    currentStreak: session.accuracy >= 60 ? prev.currentStreak + 1 : 0,
    personalBests,
    categoryStats: catStats,
    dailyCompleted,
    missedQuestionIds: missed,
    achievementsUnlocked: updatedAchievementsMap || prev.achievementsUnlocked,
    recentSessions,
  };

  // Evaluate new achievements against the freshly recorded stats
  const { updatedUnlockedMap } = checkNewAchievements(candidate);
  const updated: PlayerProgress = {
    ...candidate,
    achievementsUnlocked: updatedUnlockedMap,
  };

  savePlayerProgress(updated);
  return updated;
}

/**
 * Exports progress as JSON string for backup
 */
export function exportProgressToJson(progress: PlayerProgress): string {
  return JSON.stringify(progress, null, 2);
}

/**
 * Validates and imports progress from JSON
 */
export function importProgressFromJson(jsonStr: string): { success: boolean; progress?: PlayerProgress; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File is not a valid JSON object' };
    }
    if (typeof parsed.xp !== 'number' || isNaN(parsed.xp) || parsed.xp < 0) {
      return { success: false, error: 'Progress is missing valid XP value' };
    }
    const migrated = migrateProgressSchema(parsed);
    savePlayerProgress(migrated);
    return { success: true, progress: migrated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON file' };
  }
}

const CUSTOM_QUESTIONS_STORAGE_KEY = 'geografist_custom_questions_v1';
const TEMPLATES_ACTIVE_STORAGE_KEY = 'geografist_templates_active_v1';

export function loadCustomQuestions(): Question[] {
  try {
    const storage = getSafeStorage();
    if (!storage) return inMemoryCustomQuestions;
    const raw = storage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (!raw) return inMemoryCustomQuestions;
    const parsed = JSON.parse(raw);
    const result = Array.isArray(parsed) ? parsed : [];
    inMemoryCustomQuestions = result;
    return result;
  } catch (e) {
    return inMemoryCustomQuestions;
  }
}

export function saveCustomQuestions(questions: Question[]): boolean {
  inMemoryCustomQuestions = [...questions];
  try {
    const storage = getSafeStorage();
    if (storage) {
      storage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    }
    return true;
  } catch (e) {
    return true;
  }
}

export function loadIncludeTemplatesPreference(): boolean {
  try {
    const storage = getSafeStorage();
    if (!storage) return inMemoryTemplatesActive;
    const raw = storage.getItem(TEMPLATES_ACTIVE_STORAGE_KEY);
    const result = raw !== null ? raw === 'true' : true;
    inMemoryTemplatesActive = result;
    return result;
  } catch (e) {
    return inMemoryTemplatesActive;
  }
}

export function saveIncludeTemplatesPreference(include: boolean): void {
  inMemoryTemplatesActive = include;
  try {
    const storage = getSafeStorage();
    if (storage) {
      storage.setItem(TEMPLATES_ACTIVE_STORAGE_KEY, String(include));
    }
  } catch (e) {}
}
