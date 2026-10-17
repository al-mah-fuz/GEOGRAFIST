/**
 * GEOGRAFIST — Deterministic & Standard Shuffling Utilities
 */

/**
 * Simple Mulberry32 pseudo-random number generator for deterministic daily seeded runs
 */
export function createMulberry32(seed: number): () => number {
  let state = seed | 0;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a 32-bit integer hash from a string (e.g., date string "2026-10-09")
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Fisher-Yates array shuffle using optional custom PRNG or standard Math.random
 */
export function shuffleArray<T>(array: T[], prng?: () => number): T[] {
  const result = [...array];
  const random = prng || Math.random;

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

/**
 * Shuffles 4 options deterministically or randomly, returning new array of options
 */
export function shuffleOptions(
  options: [string, string, string, string],
  seed?: number
): [string, string, string, string] {
  const prng = seed !== undefined ? createMulberry32(seed) : undefined;
  const shuffled = shuffleArray([...options], prng);
  return shuffled as [string, string, string, string];
}
