import { CategoryId, Difficulty, Question } from '../../types';
import { MASTER_PACK_QUESTIONS } from '../packs/registry';
import { flagQuestions } from './flags';
import { capitalQuestions } from './capitals';
import { historyQuestions } from './history';
import { currentAffairsQuestions } from './currentAffairs';
import { explorerQuestions } from './explorer';
import { verifiedExpansionQuestions } from './expansion';

export {
  flagQuestions,
  capitalQuestions,
  historyQuestions,
  currentAffairsQuestions,
  explorerQuestions,
  verifiedExpansionQuestions,
};

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORY_DEFINITIONS: CategoryMeta[] = [
  {
    id: 'flags',
    name: 'Flag Master',
    tagline: 'Vexillology & National Emblems',
    description: 'Identify nations from flags, designs, colors, emblems, and historical symbolism.',
    iconName: 'Flag',
    accentColor: '#3B82F6',
    borderColor: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
  },
  {
    id: 'capitals',
    name: 'Capital Challenge',
    tagline: 'World Seats of Power',
    description: 'Identify world capital cities, purpose-built administrative seats, and reverse country challenges.',
    iconName: 'Landmark',
    accentColor: '#10B981',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
  },
  {
    id: 'history',
    name: 'World History',
    tagline: 'Civilizations, Empires & Milestones',
    description: 'African kingdoms, ancient civilizations, world empires, peace treaties, and dated historical events.',
    iconName: 'Scroll',
    accentColor: '#F59E0B',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
  },
  {
    id: 'current_affairs',
    name: 'Current Affairs',
    tagline: 'International Alliances & Facts',
    description: 'Explicitly dated questions on UN bodies, summits, global treaties, leaders, science, and sports.',
    iconName: 'Globe',
    accentColor: '#8B5CF6',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
  },
  {
    id: 'explorer',
    name: 'World Explorer',
    tagline: 'Geography, Physical Wonders & Extremes',
    description: 'Mountains, major rivers, straits, tectonic landmarks, deserts, oceans, and natural wonders.',
    iconName: 'Compass',
    accentColor: '#06B6D4',
    borderColor: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
  },
  {
    id: 'mixed',
    name: 'Mixed World Quiz',
    tagline: 'The Complete Global Test',
    description: 'A balanced blend across all 5 specialized domains testing comprehensive world mastery.',
    iconName: 'Award',
    accentColor: '#EC4899',
    borderColor: 'border-pink-500/30',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-400',
  },
];

export const SEED_QUESTIONS: Question[] = [
  ...flagQuestions,
  ...capitalQuestions,
  ...historyQuestions,
  ...currentAffairsQuestions,
  ...explorerQuestions,
  ...verifiedExpansionQuestions,
];

/**
 * Production-ready master question bank compiled from verified seed questions
 * and deterministic factual template variants.
 */
export const MASTER_QUESTIONS: Question[] = MASTER_PACK_QUESTIONS;

/**
 * Validates a single question against strict schema criteria:
 * - Non-empty unique ID
 * - Valid category
 * - Exactly 4 options
 * - Options are unique
 * - Correct answer exists exactly in options
 * - Non-empty explanation, source, and verifiedDate
 */
export function validateQuestion(q: Question): { valid: boolean; error?: string } {
  if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') {
    return { valid: false, error: 'Question missing valid id' };
  }
  const validCats: CategoryId[] = ['flags', 'capitals', 'history', 'current_affairs', 'explorer'];
  if (!validCats.includes(q.category)) {
    return { valid: false, error: `Invalid category: ${q.category}` };
  }
  const validDiffs: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  if (!validDiffs.includes(q.difficulty)) {
    return { valid: false, error: `Question ${q.id} has invalid difficulty: ${q.difficulty}` };
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return { valid: false, error: `Question ${q.id} must have exactly 4 options` };
  }
  const uniqueOptions = new Set(q.options.map(o => o.trim().toLowerCase()));
  if (uniqueOptions.size !== 4) {
    return { valid: false, error: `Question ${q.id} contains duplicate options` };
  }
  if (!q.options.includes(q.correctAnswer)) {
    return { valid: false, error: `Question ${q.id} correct answer '${q.correctAnswer}' is not in options` };
  }
  if (!q.explanation || q.explanation.trim().length < 10) {
    return { valid: false, error: `Question ${q.id} missing detailed explanation` };
  }
  if (!q.source || q.source.trim().length === 0) {
    return { valid: false, error: `Question ${q.id} missing verified source citation` };
  }
  if (!q.verifiedDate || !/^\d{4}-\d{2}$/.test(q.verifiedDate)) {
    return { valid: false, error: `Question ${q.id} missing valid verifiedDate (YYYY-MM)` };
  }
  return { valid: true };
}

/**
 * Validates an entire collection of questions and ensures ID uniqueness
 */
export function validateQuestionBank(bank: Question[]): {
  valid: boolean;
  total: number;
  errors: string[];
} {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const q of bank) {
    if (seenIds.has(q.id)) {
      errors.push(`Duplicate question ID detected: ${q.id}`);
    } else {
      seenIds.add(q.id);
    }
    const res = validateQuestion(q);
    if (!res.valid && res.error) {
      errors.push(res.error);
    }
  }

  return {
    valid: errors.length === 0,
    total: bank.length,
    errors,
  };
}

/**
 * Filters verified questions by category and difficulty
 */
export function getFilteredQuestions(
  categoryId: CategoryId,
  difficulty: Difficulty | 'all' = 'all',
  customBank?: Question[]
): Question[] {
  const bank = customBank && customBank.length > 0 ? customBank : MASTER_QUESTIONS;

  let pool: Question[] = [];
  if (categoryId === 'mixed') {
    pool = [...bank];
  } else {
    pool = bank.filter(q => q.category === categoryId);
  }

  if (difficulty !== 'all') {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  return pool;
}

export function getQuestionById(id: string, customBank?: Question[]): Question | undefined {
  const bank = customBank && customBank.length > 0 ? customBank : MASTER_QUESTIONS;
  return bank.find(q => q.id === id);
}
