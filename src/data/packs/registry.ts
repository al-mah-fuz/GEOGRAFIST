import { CategoryId, CategoryPack, CategoryPackStats, Difficulty, Question } from '../../types';
import { FLAG_PACK, getFlagQuestions } from './flags.pack';
import { CAPITAL_PACK, getCapitalQuestions } from './capitals.pack';
import { HISTORY_PACK, getHistoryQuestions } from './history.pack';
import { CURRENT_AFFAIRS_PACK, getCurrentAffairsQuestions } from './currentAffairs.pack';
import { EXPLORER_PACK, getExplorerQuestions } from './explorer.pack';

export {
  FLAG_PACK,
  CAPITAL_PACK,
  HISTORY_PACK,
  CURRENT_AFFAIRS_PACK,
  EXPLORER_PACK,
  getFlagQuestions,
  getCapitalQuestions,
  getHistoryQuestions,
  getCurrentAffairsQuestions,
  getExplorerQuestions,
};

export const CATEGORY_PACK_REGISTRY: Record<CategoryId, CategoryPack> = {
  flags: FLAG_PACK,
  capitals: CAPITAL_PACK,
  history: HISTORY_PACK,
  current_affairs: CURRENT_AFFAIRS_PACK,
  explorer: EXPLORER_PACK,
  mixed: {
    categoryId: 'mixed',
    packTitle: 'Mixed World Quiz Master Pack',
    version: '2.0.0',
    uniqueFactsCount: FLAG_PACK.uniqueFactsCount + CAPITAL_PACK.uniqueFactsCount + HISTORY_PACK.uniqueFactsCount + CURRENT_AFFAIRS_PACK.uniqueFactsCount + EXPLORER_PACK.uniqueFactsCount,
    verifiedDate: '2024-08',
    license: 'Public Domain / Curated Research Dataset',
    byDifficulty: {
      beginner: [...FLAG_PACK.byDifficulty.beginner, ...CAPITAL_PACK.byDifficulty.beginner, ...HISTORY_PACK.byDifficulty.beginner, ...CURRENT_AFFAIRS_PACK.byDifficulty.beginner, ...EXPLORER_PACK.byDifficulty.beginner],
      intermediate: [...FLAG_PACK.byDifficulty.intermediate, ...CAPITAL_PACK.byDifficulty.intermediate, ...HISTORY_PACK.byDifficulty.intermediate, ...CURRENT_AFFAIRS_PACK.byDifficulty.intermediate, ...EXPLORER_PACK.byDifficulty.intermediate],
      advanced: [...FLAG_PACK.byDifficulty.advanced, ...CAPITAL_PACK.byDifficulty.advanced, ...HISTORY_PACK.byDifficulty.advanced, ...CURRENT_AFFAIRS_PACK.byDifficulty.advanced, ...EXPLORER_PACK.byDifficulty.advanced],
      expert: [...FLAG_PACK.byDifficulty.expert, ...CAPITAL_PACK.byDifficulty.expert, ...HISTORY_PACK.byDifficulty.expert, ...CURRENT_AFFAIRS_PACK.byDifficulty.expert, ...EXPLORER_PACK.byDifficulty.expert],
    },
    questions: [
      ...FLAG_PACK.questions,
      ...CAPITAL_PACK.questions,
      ...HISTORY_PACK.questions,
      ...CURRENT_AFFAIRS_PACK.questions,
      ...EXPLORER_PACK.questions,
    ],
  },
};

/**
 * Master collection of all compiled questions in the production pack registry
 */
export const MASTER_PACK_QUESTIONS: Question[] = CATEGORY_PACK_REGISTRY.mixed.questions;

/**
 * Retrieves questions for any category and difficulty with high performance
 */
export function getPackQuestions(
  categoryId: CategoryId,
  difficulty: Difficulty | 'all' = 'all'
): Question[] {
  const pack = CATEGORY_PACK_REGISTRY[categoryId] || CATEGORY_PACK_REGISTRY.mixed;
  if (difficulty === 'all') {
    return pack.questions;
  }
  return pack.byDifficulty[difficulty] || [];
}

/**
 * Returns complete coverage health and statistical audit across all category packs
 */
export function getCategoryPackStats(): CategoryPackStats[] {
  const categories: CategoryId[] = ['flags', 'capitals', 'history', 'current_affairs', 'explorer', 'mixed'];
  const names: Record<CategoryId, string> = {
    flags: 'Flag Master',
    capitals: 'Capital Challenge',
    history: 'World History',
    current_affairs: 'Current Affairs',
    explorer: 'World Explorer',
    mixed: 'Mixed World Quiz',
  };

  return categories.map(cat => {
    const pack = CATEGORY_PACK_REGISTRY[cat];
    const total = pack.questions.length;
    const withSource = pack.questions.filter(q => q.source && q.source.trim().length > 0).length;
    const sourceCoveragePercent = total > 0 ? Math.round((withSource / total) * 100) : 100;

    // Review due check (verified before 2024-01)
    const reviewDueCount = pack.questions.filter(q => {
      const year = parseInt(q.verifiedDate.split('-')[0], 10);
      return year <= 2023;
    }).length;

    return {
      categoryId: cat,
      categoryName: names[cat],
      totalQuestions: total,
      uniqueUnderlyingFacts: pack.uniqueFactsCount,
      byDifficulty: {
        beginner: pack.byDifficulty.beginner.length,
        intermediate: pack.byDifficulty.intermediate.length,
        advanced: pack.byDifficulty.advanced.length,
        expert: pack.byDifficulty.expert.length,
      },
      sourceCoveragePercent,
      verifiedDateRange: '2024-04 to 2024-08',
      targetCount: 10000,
      reviewDueCount,
    };
  });
}
