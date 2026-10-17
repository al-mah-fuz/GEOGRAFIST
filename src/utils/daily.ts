import { MASTER_QUESTIONS } from '../data/questions';
import { Question } from '../types';
import { createMulberry32, hashString, shuffleArray } from './shuffle';

/**
 * Returns the current date string formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically generates a 10-question set for a specific date (YYYY-MM-DD).
 * It selects exactly 2 questions from each of the 5 specific categories:
 * Flags, Capitals, History, Current Affairs, Explorer.
 *
 * Seed is generated purely from the date string hash, so every client gets
 * the exact same question sequence and deterministic shuffle on that day.
 */
export function getDailyChallengeQuestions(dateStr: string = getTodayDateString()): Question[] {
  const seed = hashString(`GEOGRAFIST_DAILY_${dateStr}`);
  const prng = createMulberry32(seed);

  const categories = ['flags', 'capitals', 'history', 'current_affairs', 'explorer'] as const;
  const selectedQuestions: Question[] = [];

  for (const cat of categories) {
    const catPool = MASTER_QUESTIONS.filter(q => q.category === cat);
    // Shuffle the pool using our seeded PRNG
    const shuffledCat = shuffleArray([...catPool], prng);
    // Take first 2 questions
    const picked = shuffledCat.slice(0, 2);
    selectedQuestions.push(...picked);
  }

  // Final seeded shuffle so categories are interspersed nicely
  return shuffleArray(selectedQuestions, prng);
}

/**
 * Calculate milliseconds remaining until next local midnight
 */
export function getTimeUntilNextDaily(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { hours, minutes, seconds, formatted };
}
