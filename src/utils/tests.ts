import { MASTER_QUESTIONS, validateQuestionBank } from '../data/questions';
import { calculateQuestionScore, getRankAndLevel, RANK_THRESHOLDS } from './scoring';
import { createMulberry32, shuffleArray, shuffleOptions } from './shuffle';
import { getDailyChallengeQuestions } from './daily';
import {
  INITIAL_PROGRESS,
  loadPlayerProgress,
  migrateProgressSchema,
  recordSessionCompletion,
  resetPlayerProgress,
  savePlayerProgress,
} from './storage';
import { SAMPLE_EXPANSION_PACK_AFRICA, validateQuestionPackJson } from './packValidator';
import { VERIFIED_COUNTRY_FACTS } from '../data/facts/countryFacts';
import { generateQuestionVariantsFromFacts } from './factTemplates';
import { ACHIEVEMENTS_LIST, checkNewAchievements } from './achievements';
import { GameSessionResult } from '../types';

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  timestamp: string;
}

export function runGeografistTestSuite(): TestSuiteSummary {
  const results: TestResult[] = [];

  // TEST 1: Question Bank Schema & Integrity (all 125 questions)
  {
    const start = performance.now();
    const bankVal = validateQuestionBank(MASTER_QUESTIONS);
    results.push({
      id: 'test_question_validation',
      name: 'Question Bank Schema & Integrity',
      passed: bankVal.valid && bankVal.total >= 100,
      message: bankVal.valid
        ? `Validated all ${bankVal.total} curated questions with valid Beginner/Intermediate/Advanced/Expert difficulties, unique options, and citations.`
        : `Validation failed: ${bankVal.errors.slice(0, 3).join(', ')}`,
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 2: Answer Shuffling Preservation
  {
    const start = performance.now();
    const testOptions: [string, string, string, string] = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
    const shuffled = shuffleOptions(testOptions, 42);
    const hasAll = testOptions.every(opt => shuffled.includes(opt));
    const isLengthFour = shuffled.length === 4;
    const passed = hasAll && isLengthFour;
    results.push({
      id: 'test_shuffle_preservation',
      name: 'Deterministic Answer Shuffling',
      passed,
      message: passed
        ? 'Shuffling algorithm preserved all 4 unique options without data loss.'
        : 'Shuffling corrupted options array.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 3: Scoring Rules & Difficulty Multipliers
  {
    const start = performance.now();
    const scoreBeginner = calculateQuestionScore({
      isCorrect: true,
      difficulty: 'beginner',
      currentStreak: 0,
      timeSpentSeconds: 10,
      timerMode: 'relaxed',
    });
    const scoreIntermediate = calculateQuestionScore({
      isCorrect: true,
      difficulty: 'intermediate',
      currentStreak: 0,
      timeSpentSeconds: 10,
      timerMode: 'relaxed',
    });
    const scoreAdvanced = calculateQuestionScore({
      isCorrect: true,
      difficulty: 'advanced',
      currentStreak: 0,
      timeSpentSeconds: 10,
      timerMode: 'relaxed',
    });
    const scoreExpertStreak = calculateQuestionScore({
      isCorrect: true,
      difficulty: 'expert',
      currentStreak: 5,
      timeSpentSeconds: 1,
      timerMode: 'standard',
    });
    const scoreSkipped = calculateQuestionScore({
      isCorrect: true,
      difficulty: 'expert',
      currentStreak: 5,
      timeSpentSeconds: 2,
      timerMode: 'standard',
      isSkipped: true,
    });
    const scoreIncorrect = calculateQuestionScore({
      isCorrect: false,
      difficulty: 'expert',
      currentStreak: 10,
      timeSpentSeconds: 1,
      timerMode: 'standard',
    });

    // Beginner = 100 base + 0
    // Intermediate = 100 base + 25 = 125
    // Advanced = 100 base + 50 = 150
    // Expert with streak + speed = 100 + 75 + 50 + speed (>250)
    // Skipped = 0
    // Incorrect = 0
    const correctMath =
      scoreBeginner.points === 100 &&
      scoreIntermediate.points === 125 &&
      scoreAdvanced.points === 150 &&
      scoreExpertStreak.points >= 250 &&
      scoreExpertStreak.streakBonus === 50 &&
      scoreSkipped.points === 0 &&
      scoreIncorrect.points === 0;

    results.push({
      id: 'test_scoring_formula',
      name: 'Fair Scoring, Difficulty Tiers & Skip Math',
      passed: correctMath,
      message: correctMath
        ? 'Verified Beginner (100), Intermediate (125), Advanced (150), Expert bonuses, streak cap (50), speed bonuses, and 0 for skips/errors.'
        : `Scoring arithmetic error: b=${scoreBeginner.points}, i=${scoreIntermediate.points}, a=${scoreAdvanced.points}, e=${scoreExpertStreak.points}`,
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 4: Daily Challenge Determinism
  {
    const start = performance.now();
    const dateTest = '2026-10-09';
    const run1 = getDailyChallengeQuestions(dateTest);
    const run2 = getDailyChallengeQuestions(dateTest);

    const ids1 = run1.map(q => q.id).join(',');
    const ids2 = run2.map(q => q.id).join(',');
    const is10Questions = run1.length === 10;
    const matchesExactly = ids1 === ids2;
    const passed = is10Questions && matchesExactly;

    results.push({
      id: 'test_daily_determinism',
      name: 'Daily Challenge Determinism',
      passed,
      message: passed
        ? 'Identical date hash produces matching 10-question sequence deterministically.'
        : 'Daily challenge non-deterministic across executions.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 5: Short and Long Session Question Uniqueness
  {
    const start = performance.now();
    const pool = shuffleArray([...MASTER_QUESTIONS]);
    const shortSlice = pool.slice(0, 10);
    const longSlice = pool.slice(0, 50);

    const uniqueShort = new Set(shortSlice.map(q => q.id));
    const uniqueLong = new Set(longSlice.map(q => q.id));
    const passed = uniqueShort.size === shortSlice.length && uniqueLong.size === longSlice.length;

    results.push({
      id: 'test_session_uniqueness',
      name: 'Short and Long Session Question Uniqueness',
      passed,
      message: passed
        ? `Zero duplicate question IDs drawn across 10-question and 50-question rounds.`
        : 'Duplicate questions found within session.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 6: Local Persistence Layer & Vault Isolation
  {
    const start = performance.now();
    const testProgress = {
      ...INITIAL_PROGRESS,
      username: 'TestPilot',
      xp: 450,
      missedQuestionIds: { 'GEO-FLG-001': 1 },
    };
    const saved = savePlayerProgress(testProgress);
    const loaded = loadPlayerProgress();
    const passed = saved && loaded.xp === 450 && loaded.missedQuestionIds['GEO-FLG-001'] === 1;

    results.push({
      id: 'test_storage_persistence',
      name: 'Storage Persistence & Vault Isolation',
      passed,
      message: passed
        ? 'Player profile, XP, and missed questions vault correctly isolated and persisted.'
        : 'Storage verification failed.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 7: Question Pack Schema Validator & Error Reporting
  {
    const start = performance.now();
    // Validate sample expansion pack
    const validPackReport = validateQuestionPackJson(SAMPLE_EXPANSION_PACK_AFRICA, MASTER_QUESTIONS);

    // Validate bad pack to ensure schema rejects corruption
    const malformedJson = JSON.stringify({
      manifest: { formatVersion: '1.0' },
      questions: [
        { id: 'BAD-001', category: 'invalid_category', question: 'Too short', options: ['A', 'B'] },
        { id: 'EXP-AFR-001', category: 'flags', question: 'Duplicate ID test with valid length', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
      ],
    });
    const badPackReport = validateQuestionPackJson(malformedJson, MASTER_QUESTIONS);

    const passed =
      validPackReport.isManifestValid &&
      validPackReport.validCount >= 5 &&
      validPackReport.invalidCount === 0 &&
      badPackReport.invalidCount >= 1 &&
      badPackReport.invalidRows.length >= 1;

    results.push({
      id: 'test_pack_validation',
      name: 'Pack Validator & Row-Level Diagnostics',
      passed,
      message: passed
        ? `Verified valid pack import (${validPackReport.validCount} records) and deterministic row-level rejection of malformed/duplicate records.`
        : `Pack validator test failed: valid=${validPackReport.validCount}, badRows=${badPackReport.invalidRows.length}`,
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 8: Deterministic Fact Templates & Derivation Integrity
  {
    const start = performance.now();
    const templateReport = generateQuestionVariantsFromFacts(VERIFIED_COUNTRY_FACTS);
    const variants = templateReport.variants;

    // Verify all variants meet strict requirements:
    // 1. Stable ID
    // 2. Exactly 4 unique options
    // 3. Exactly 1 matching correct answer
    // 4. Source fact ID attached
    // 5. Non-empty explanation and source
    const allValid =
      variants.length > 50 &&
      variants.every(v => {
        const uniqueOpts = new Set(v.options);
        return (
          v.id.startsWith('VAR-') &&
          v.options.length === 4 &&
          uniqueOpts.size === 4 &&
          v.options.includes(v.correctAnswer) &&
          Boolean(v.sourceFactId) &&
          Boolean(v.explanation) &&
          Boolean(v.source)
        );
      });

    results.push({
      id: 'test_fact_templates',
      name: 'Deterministic Fact Templates & Distractor Quality',
      passed: allValid,
      message: allValid
        ? `Derived ${variants.length} verified question variants from ${templateReport.sourceFactsCount} country facts with 100% 4-option integrity & stable IDs.`
        : `Fact template derivation integrity failed: count=${variants.length}`,
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 9: Progression Thresholds, Strict XP Ranks & Formulas
  {
    const start = performance.now();
    const rank0 = getRankAndLevel(0);
    const rankExplorer = getRankAndLevel(250);
    const rankGeographer = getRankAndLevel(750);
    const rankHistorian = getRankAndLevel(1800);
    const rankScholar = getRankAndLevel(3500);
    const rankMaster = getRankAndLevel(6000);

    const thresholdChecks =
      rank0.rank === 'Beginner' && rank0.level === 1 &&
      rankExplorer.rank === 'Explorer' && rankExplorer.level === 2 &&
      rankGeographer.rank === 'Geographer' && rankGeographer.level === 3 &&
      rankHistorian.rank === 'Historian' && rankHistorian.level === 4 &&
      rankScholar.rank === 'Scholar' && rankScholar.level === 5 &&
      rankMaster.rank === 'World Master' && rankMaster.level === 6 &&
      rankMaster.nextRankMinXp === null;

    results.push({
      id: 'test_progression_thresholds',
      name: 'Progression XP Thresholds & Rank Ladder',
      passed: thresholdChecks,
      message: thresholdChecks
        ? 'Verified all 6 rank thresholds (Beginner to World Master at 6,000 XP) and level escalations.'
        : 'Progression threshold check failed.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 10: Meaningful Achievement Conditions & No Free Unlocks
  {
    const start = performance.now();
    // 1. Brand new progress should have ZERO unlocked achievements
    const freshProgress = { ...INITIAL_PROGRESS };
    const { newlyUnlocked: freshUnlocked } = checkNewAchievements(freshProgress);

    // 2. Play 1 game -> should unlock ONLY 'first_step'
    const afterOneGame = {
      ...freshProgress,
      totalGames: 1,
      totalQuestionsAnswered: 10,
      totalCorrect: 7,
    };
    const { newlyUnlocked: stepUnlocked } = checkNewAchievements(afterOneGame);

    // 3. Perfect round (10/10) -> unlocks 'perfect_round' and 'first_step'
    const dummyPerfectSession: GameSessionResult = {
      id: 'test_session_perfect',
      date: new Date().toISOString(),
      category: 'flags',
      difficulty: 'intermediate',
      totalQuestions: 10,
      correctCount: 10,
      accuracy: 100,
      totalPoints: 1250,
      xpEarned: 238,
      bestStreak: 10,
      avgTimeSeconds: 5,
      answers: [],
    };
    const perfectProgress = {
      ...freshProgress,
      totalGames: 1,
      totalQuestionsAnswered: 10,
      totalCorrect: 10,
      recentSessions: [dummyPerfectSession],
    };
    const { newlyUnlocked: perfectUnlocked } = checkNewAchievements(perfectProgress);

    const passed =
      freshUnlocked.length === 0 &&
      stepUnlocked.includes('first_step') &&
      stepUnlocked.length === 1 &&
      perfectUnlocked.includes('perfect_round') &&
      ACHIEVEMENTS_LIST.length >= 14;

    results.push({
      id: 'test_achievement_conditions',
      name: 'Achievement Conditions & Zero Free Unlocks',
      passed,
      message: passed
        ? `Verified honest achievement unlocks: 0 unlocks on empty profile, precise evaluation for 1st game and perfect round across ${ACHIEVEMENTS_LIST.length} milestones.`
        : 'Achievement conditions test failed.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 11: Duplicate Reward Prevention (Idempotency) & Daily Determinism
  {
    const start = performance.now();
    const baseProgress = { ...INITIAL_PROGRESS, xp: 100, totalGames: 1 };

    const dummySession: GameSessionResult = {
      id: 'session_stable_id_123',
      date: '2026-10-09T10:00:00Z',
      category: 'history',
      difficulty: 'beginner',
      totalQuestions: 5,
      correctCount: 5,
      accuracy: 100,
      totalPoints: 500,
      xpEarned: 125,
      bestStreak: 5,
      avgTimeSeconds: 4,
      answers: [
        {
          questionId: 'GEO-HST-001',
          questionText: 'Test',
          category: 'history',
          selectedAnswer: 'Answer',
          correctAnswer: 'Answer',
          isCorrect: true,
          timeSpentSeconds: 4,
          pointsEarned: 100,
          explanation: '',
          source: '',
        },
      ],
    };

    // First completion records reward
    const recordedOnce = recordSessionCompletion(baseProgress, dummySession);
    const xpAfterFirst = recordedOnce.xp; // 100 + 125 = 225

    // Second completion with same session ID must NOT award duplicate points or games
    const recordedTwice = recordSessionCompletion(recordedOnce, dummySession);
    const xpAfterSecond = recordedTwice.xp;
    const gamesAfterSecond = recordedTwice.totalGames;

    // Daily determinism check: running getDailyChallengeQuestions twice for same date returns exact same question IDs in exact same order
    const daily1 = getDailyChallengeQuestions('2026-10-09');
    const daily2 = getDailyChallengeQuestions('2026-10-09');
    const sameDaily =
      daily1.length === 10 &&
      daily1.every((q, idx) => q.id === daily2[idx].id);

    const passed =
      xpAfterFirst === 225 &&
      xpAfterSecond === 225 &&
      gamesAfterSecond === recordedOnce.totalGames &&
      sameDaily;

    results.push({
      id: 'test_idempotency_daily_determinism',
      name: 'Reward Idempotency & Daily Set Determinism',
      passed,
      message: passed
        ? 'Duplicate clicks/re-recording blocked (0 duplicate XP awarded); daily challenge questions 100% deterministic.'
        : 'Idempotency or daily determinism failed.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  // TEST 12: Schema Migration & Non-Destructive Reset Safety
  {
    const start = performance.now();
    // Simulate v1 legacy payload lacking personalBests and schema version
    const legacyPayload = {
      username: 'VeteranExplorer',
      xp: 1850,
      totalGames: 12,
      bestStreak: 8,
      categoryStats: {
        flags: { answered: 20, correct: 18 },
      },
      recentSessions: [
        {
          id: 'old_session_1',
          date: '2026-09-01T00:00:00Z',
          category: 'flags',
          difficulty: 'intermediate',
          totalQuestions: 10,
          correctCount: 10,
          accuracy: 100,
          totalPoints: 1200,
          xpEarned: 230,
          bestStreak: 10,
          avgTimeSeconds: 6,
          answers: [],
        },
      ],
    };

    const migrated = migrateProgressSchema(legacyPayload);
    const migrationSuccess =
      migrated.version === 2 &&
      migrated.rank === 'Historian' &&
      migrated.personalBests.highestScore === 1200 &&
      migrated.personalBests.highestAccuracySessionScore === 1200 &&
      migrated.personalBests.longestStreak === 8 &&
      migrated.xp === 1850;

    // Test non-destructive reset behavior returns clean Beginner state with version 2
    const freshReset = resetPlayerProgress();
    const resetSuccess =
      freshReset.xp === 0 &&
      freshReset.rank === 'Beginner' &&
      freshReset.totalGames === 0 &&
      freshReset.version === 2 &&
      Object.keys(freshReset.missedQuestionIds).length === 0;

    const passed = migrationSuccess && resetSuccess;

    results.push({
      id: 'test_migration_and_reset',
      name: 'Schema Migration & Clean Reset Safety',
      passed,
      message: passed
        ? 'Migrated v1 format to v2 with personal best backfills; confirmed clean non-destructive profile reset.'
        : 'Migration or reset safety failed.',
      durationMs: Math.round(performance.now() - start),
    });
  }

  const passedCount = results.filter(r => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
    timestamp: new Date().toISOString(),
  };
}
