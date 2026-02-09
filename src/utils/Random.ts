/**
 * Random Number Generation Utilities
 * Provides various random number generation methods for game mechanics
 */
export class Random {
  /**
   * Generate a random integer between min and max (inclusive)
   */
  static integer(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min and max
   */
  static float(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Roll a single die with specified number of sides
   */
  static die(sides: number): number {
    return this.integer(1, sides);
  }

  /**
   * Roll multiple dice and return sum
   */
  static dice(count: number, sides: number): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.die(sides);
    }
    return total;
  }

  /**
   * Roll 3d6 (standard attribute roll)
   */
  static attribute(): number {
    return this.dice(3, 6);
  }

  /**
   * Roll with advantage (roll twice, take higher)
   */
  static advantage(count: number, sides: number): number {
    const roll1 = this.dice(count, sides);
    const roll2 = this.dice(count, sides);
    return Math.max(roll1, roll2);
  }

  /**
   * Roll with disadvantage (roll twice, take lower)
   */
  static disadvantage(count: number, sides: number): number {
    const roll1 = this.dice(count, sides);
    const roll2 = this.dice(count, sides);
    return Math.min(roll1, roll2);
  }

  /**
   * Return true with specified probability (0-1)
   */
  static chance(probability: number): boolean {
    return Math.random() < probability;
  }

  /**
   * Return true with specified percentage chance (0-100)
   */
  static percent(percentage: number): boolean {
    return Math.random() * 100 < percentage;
  }

  /**
   * Pick a random element from an array
   */
  static choice<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    return array[this.integer(0, array.length - 1)];
  }

  /**
   * Pick multiple random elements from an array without replacement
   */
  static choices<T>(array: T[], count: number): T[] {
    if (count >= array.length) return [...array];

    const result: T[] = [];
    const remaining = [...array];

    for (let i = 0; i < count; i++) {
      const index = this.integer(0, remaining.length - 1);
      result.push(remaining.splice(index, 1)[0]);
    }

    return result;
  }

  /**
   * Shuffle an array in place
   */
  static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.integer(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Return a new shuffled copy of an array
   */
  static shuffled<T>(array: T[]): T[] {
    return this.shuffle([...array]);
  }

  /**
   * Generate a random boolean
   */
  static boolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Generate a random sign (-1 or 1)
   */
  static sign(): number {
    return this.boolean() ? 1 : -1;
  }

  /**
   * Generate a random UUID (simple version)
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate a random string of specified length
   */
  static string(
    length: number,
    chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(this.integer(0, chars.length - 1));
    }
    return result;
  }

  /**
   * Generate a random color (hex format)
   */
  static color(): string {
    return '#' + this.string(6, '0123456789ABCDEF');
  }

  /**
   * Weighted random choice
   */
  static weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights arrays must have the same length');
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomValue = Math.random() * totalWeight;

    let currentWeight = 0;
    for (let i = 0; i < items.length; i++) {
      currentWeight += weights[i];
      if (randomValue <= currentWeight) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Generate a random number with normal distribution
   */
  static normal(mean: number = 0, stdDev: number = 1): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Generate a random integer with normal distribution
   */
  static normalInt(mean: number = 0, stdDev: number = 1): number {
    return Math.round(this.normal(mean, stdDev));
  }

  /**
   * Seed the random number generator (for testing)
   */
  static seed(seed: number): void {
    // Simple seeded random number generator
    let s = seed;
    Math.random = function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /**
   * Reset random number generator to default
   */
  static reset(): void {
    delete (Math as any).random;
  }
}
