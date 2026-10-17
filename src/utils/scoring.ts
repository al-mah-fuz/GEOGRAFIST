import { Difficulty, PlayerRank, TimerMode } from '../types';

export interface ScoreCalculationInput {
  isCorrect: boolean;
  difficulty: Difficulty;
  currentStreak: number;
  timeSpentSeconds: number;
  timerMode: TimerMode;
  isSkipped?: boolean;
}

export interface ScoreResult {
  points: number;
  basePoints: number;
  difficultyBonus: number;
  streakBonus: number;
  speedBonus: number;
}

export const SCORING_RULES_DOCUMENTATION = {
  basePoints: 100,
  difficultyBonuses: {
    beginner: 0,
    intermediate: 25,
    advanced: 50,
    expert: 75,
  },
  streakBonus: {
    incrementPerQuestion: 10,
    maxStreakBonus: 50,
  },
  timeBonuses: {
    standard: 'Up to +30 pts (linear scaling based on remaining seconds within 15s limit)',
    rapid: 'Up to +40 pts (linear scaling based on remaining seconds within 8s limit)',
    relaxed: '0 pts (untimed mode)',
  },
  penalties: 'Incorrect or skipped questions award 0 points and reset the consecutive streak to 0.',
};

export const RANK_THRESHOLDS: { rank: PlayerRank; minXp: number; level: number }[] = [
  { rank: 'Beginner', minXp: 0, level: 1 },
  { rank: 'Explorer', minXp: 250, level: 2 },
  { rank: 'Geographer', minXp: 750, level: 3 },
  { rank: 'Historian', minXp: 1800, level: 4 },
  { rank: 'Scholar', minXp: 3500, level: 5 },
  { rank: 'World Master', minXp: 6000, level: 6 },
];

/**
 * Calculates points for a single question response based on documented fair scoring rules:
 * - Base points: exactly 100 for any correct answer, 0 for incorrect/skipped
 * - Difficulty bonus:
 *   - Beginner: +0 (100 total base)
 *   - Intermediate: +25 (125 total base)
 *   - Advanced: +50 (150 total base)
 *   - Expert: +75 (175 total base)
 * - Streak bonus: +10 pts per streak step, capped at +50
 * - Speed bonus: awarded if timerMode is active ('standard' 15s or 'rapid' 8s) and answered quickly
 * - Idempotent: same parameters always generate the exact same score
 */
export function calculateQuestionScore(input: ScoreCalculationInput): ScoreResult {
  if (!input.isCorrect || input.isSkipped) {
    return {
      points: 0,
      basePoints: 0,
      difficultyBonus: 0,
      streakBonus: 0,
      speedBonus: 0,
    };
  }

  const basePoints = 100;

  // Difficulty bonus based on verified difficulty level
  let difficultyBonus = 0;
  if (input.difficulty === 'intermediate') {
    difficultyBonus = 25;
  } else if (input.difficulty === 'advanced') {
    difficultyBonus = 50;
  } else if (input.difficulty === 'expert') {
    difficultyBonus = 75;
  }

  // Streak bonus (+10 per consecutive correct, capped at +50)
  const streakBonus = Math.min(Math.max(0, input.currentStreak) * 10, 50);

  // Speed bonus
  let speedBonus = 0;
  if (input.timerMode === 'standard') {
    const timeRemaining = Math.max(0, 15 - Math.max(0, input.timeSpentSeconds));
    speedBonus = Math.round((timeRemaining / 15) * 30);
  } else if (input.timerMode === 'rapid') {
    const timeRemaining = Math.max(0, 8 - Math.max(0, input.timeSpentSeconds));
    speedBonus = Math.round((timeRemaining / 8) * 40);
  }

  const total = basePoints + difficultyBonus + streakBonus + speedBonus;

  return {
    points: total,
    basePoints,
    difficultyBonus,
    streakBonus,
    speedBonus,
  };
}

/**
 * Converts points to local player XP
 */
export function calculateXpEarned(points: number, accuracy: number): number {
  const base = Math.round(points * 0.15); // e.g. 1000 points => 150 XP
  // Accuracy tier bonus
  let accuracyBonus = 0;
  if (accuracy === 100) accuracyBonus = 50;
  else if (accuracy >= 80) accuracyBonus = 25;
  else if (accuracy >= 60) accuracyBonus = 10;

  return Math.max(10, base + accuracyBonus);
}

/**
 * Resolves player rank and level from cumulative XP
 */
export function getRankAndLevel(totalXp: number): {
  rank: PlayerRank;
  level: number;
  currentRankMinXp: number;
  nextRankMinXp: number | null;
  progressPercent: number;
} {
  let currentTier = RANK_THRESHOLDS[0];

  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= RANK_THRESHOLDS[i].minXp) {
      currentTier = RANK_THRESHOLDS[i];
      break;
    }
  }

  const currentIndex = RANK_THRESHOLDS.findIndex(t => t.rank === currentTier.rank);
  const nextTier = currentIndex < RANK_THRESHOLDS.length - 1 ? RANK_THRESHOLDS[currentIndex + 1] : null;

  let progressPercent = 100;
  if (nextTier) {
    const range = nextTier.minXp - currentTier.minXp;
    const currentOver = totalXp - currentTier.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentOver / range) * 100)));
  }

  return {
    rank: currentTier.rank,
    level: currentTier.level,
    currentRankMinXp: currentTier.minXp,
    nextRankMinXp: nextTier ? nextTier.minXp : null,
    progressPercent,
  };
}
