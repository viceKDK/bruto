/**
 * SeededRandom - Deterministic PRNG for combat replay
 *
 * Uses Mulberry32 algorithm for fast, high-quality pseudorandom number generation.
 * Seeded per battle to ensure replayable combat sequences (Epic 12 requirement).
 *
 * Reference: https://stackoverflow.com/questions/521295
 */

export class SeededRandom {
  private seed: number;
  private readonly originalSeed: number;

  /**
   * Create a new seeded random generator
   * @param seed - Integer seed value (will be converted to uint32)
   */
  constructor(seed: number | string) {
    // Convert string seeds (like battle IDs) to numeric seed
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed >>> 0; // Convert to uint32
    }
    this.originalSeed = this.seed;
  }

  /**
   * Generate next random float in range [0, 1)
   */
  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in range [min, max] (inclusive)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float in range [min, max)
   */
  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Roll dice - returns true with given probability
   * @param chance - Probability between 0.0 and 1.0
   */
  public roll(chance: number): boolean {
    return this.next() < chance;
  }

  /**
   * Roll percentage - returns true with given percentage chance
   * @param percent - Percentage between 0 and 100
   */
  public rollPercent(percent: number): boolean {
    return this.roll(percent / 100);
  }

  /**
   * Get original seed value (for battle record persistence)
   */
  public getSeed(): number {
    return this.originalSeed;
  }

  /**
   * Simple string hash function for converting battle IDs to seeds
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash >>> 0; // Ensure unsigned
  }
}

/**
 * Create a seeded random generator from battle ID or timestamp
 */
export function createBattleRng(battleId?: string): SeededRandom {
  if (battleId) {
    return new SeededRandom(battleId);
  }
  // Fallback to timestamp-based seed
  const seed = Date.now();
  return new SeededRandom(seed);
}
