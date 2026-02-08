import { Spells } from './Spells.ts';
import { Class } from './CharacterClass.ts';

/**
 * Spell Memorization System
 * Handles spell preparation and memorization mechanics
 */
export class SpellMemorization {
  spellSystem: Spells;
  spellSystemInitialized: boolean;

  constructor() {
    this.spellSystem = new Spells();
    this.spellSystemInitialized = false;
  }

  /**
   * Initialize spell system
   */
  async initializeSpellSystem() {
    if (!this.spellSystemInitialized) {
      await this.spellSystem.initializeEntities();
      this.spellSystemInitialized = true;
    }
  }

  /**
   * Prepare spells for character during rest
   */
  async prepareSpells(character: any, spellSelections: any) {
    await this.initializeSpellSystem();

    const result = await this.validateSpellSelections(character, spellSelections);
    if (!result.valid) {
      return { success: false, reason: result.reason };
    }

    // Clear current memorized spells
    character.memorizedSpells = { arcane: [], divine: [] };

    // Memorize selected spells
    const memorized = this.spellSystem.memorizeSpells(character, spellSelections);

    return {
      success: true,
      memorized: memorized,
      message: 'Spells successfully memorized',
    };
  }

  /**
   * Validate spell selections against character's capabilities
   */
  async validateSpellSelections(character: any, spellSelections: any) {
    await this.initializeSpellSystem();
    const classData = Class.getClassData(character.class);
    if (!classData || !classData.spells) {
      return { valid: false, reason: 'Character cannot cast spells' };
    }

    const availableSlots: Record<string, any> = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    // Check each school
    for (const school of ['arcane', 'divine']) {
      const schoolSpells = spellSelections[school] || [];
      const slots = [...availableSlots[school]]; // Copy to avoid mutation

      // Check if character can cast this school
      const canCastSchool =
        (school === 'arcane' &&
          (classData.spells === 'arcane' ||
            classData.spells === 'both' ||
            classData.spells === 'limited_arcane')) ||
        (school === 'divine' &&
          (classData.spells === 'divine' ||
            classData.spells === 'both' ||
            classData.spells === 'limited_divine'));

      if (!canCastSchool && schoolSpells.length > 0) {
        return { valid: false, reason: `Cannot cast ${school} spells` };
      }

      // Validate each spell selection
      for (const spellSelection of schoolSpells) {
        const spell = this.spellSystem.getSpell(spellSelection.name, school);
        if (!spell) {
          return { valid: false, reason: `Spell ${spellSelection.name} not found` };
        }

        // Check if character has the required spell level
        const levelIndex = spell.level - 1;
        if (levelIndex >= slots.length || slots[levelIndex] <= 0) {
          return {
            valid: false,
            reason: `No spell slots available for ${spell.name} (level ${spell.level})`,
          };
        }

        // Consume slot
        slots[levelIndex]--;
      }
    }

    return { valid: true };
  }

  /**
   * Get recommended spell loadout for character
   */
  async getRecommendedSpells(character: any) {
    const availableSpells = await this.spellSystem.getAvailableSpells(character);
    const slots: Record<string, any> = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    const recommendations: Record<string, any[]> = { arcane: [], divine: [] };

    // Recommend spells based on class and situation
    for (const school of ['arcane', 'divine']) {
      const schoolSpells = availableSpells[school];
      const schoolSlots = slots[school];

      for (let level = 1; level <= schoolSlots.length; level++) {
        const availableSlots = schoolSlots[level - 1];
        if (availableSlots <= 0) continue;

        const levelSpells = schoolSpells.filter((spell: any) => spell.level === level);
        const recommended = this.selectRecommendedSpells(levelSpells, availableSlots, character);

        recommendations[school].push(...recommended);
      }
    }

    return recommendations;
  }

  /**
   * Select recommended spells for a specific level
   */
  selectRecommendedSpells(availableSpells: any, slotCount: any, character: any) {
    if (availableSpells.length === 0) return [];

    // Priority system based on spell utility
    const spellPriorities: Record<string, number> = {
      // Healing is always high priority
      'Cure Light Wounds': 10,
      'Cure Disease': 9,

      // Damage spells are reliable
      'Magic Missile': 8,
      Fireball: 8,
      'Lightning Bolt': 8,

      // Utility spells
      Light: 7,
      'Protection from Evil': 7,
      Bless: 6,

      // Control spells
      'Hold Person': 6,
      Web: 6,

      // Defensive spells
      Shield: 5,
      Prayer: 5,
    };

    // Sort spells by priority
    const sortedSpells = availableSpells.sort((a: any, b: any) => {
      const priorityA = spellPriorities[a.name] || 1;
      const priorityB = spellPriorities[b.name] || 1;
      return priorityB - priorityA;
    });

    // Select top spells up to slot limit
    return sortedSpells.slice(0, slotCount);
  }

  /**
   * Get spell preparation interface data
   */
  async getPreparationData(character: any) {
    const availableSpells = await this.spellSystem.getAvailableSpells(character);
    const currentSlots = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    const spellDescriptions = {
      arcane: this.spellSystem.getSpellDescriptions(availableSpells.arcane),
      divine: this.spellSystem.getSpellDescriptions(availableSpells.divine),
    };

    return {
      availableSpells: spellDescriptions,
      slots: currentSlots,
      currentMemorized: character.memorizedSpells || { arcane: [], divine: [] },
      recommendations: this.getRecommendedSpells(character),
    };
  }

  /**
   * Auto-prepare spells based on character level and class
   */
  async autoPrepareSpells(character: any) {
    const recommendations = await this.getRecommendedSpells(character);

    const spellSelections = {
      arcane: recommendations.arcane.map((spell: any) => ({ name: spell.name })),
      divine: recommendations.divine.map((spell: any) => ({ name: spell.name })),
    };

    return this.prepareSpells(character, spellSelections);
  }

  /**
   * Check if character needs to prepare spells
   */
  needsSpellPreparation(character: any) {
    const classData = Class.getClassData(character.class);
    if (!classData || !classData.spells) return false;

    const slots: Record<string, any> = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    const memorized: Record<string, any[]> = character.memorizedSpells || { arcane: [], divine: [] };

    // Check if there are available slots that aren't filled
    for (const school of ['arcane', 'divine']) {
      const totalSlots = slots[school].reduce((sum: any, count: any) => sum + count, 0);
      const memorizedCount = memorized[school].length;

      if (totalSlots > memorizedCount) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get spell casting statistics
   */
  getSpellStatistics(character: any) {
    const memorized: Record<string, any[]> = character.memorizedSpells || { arcane: [], divine: [] };
    const slots: Record<string, any> = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    const stats: Record<string, any> = {
      arcane: {
        memorized: memorized.arcane.length,
        totalSlots: slots.arcane.reduce((sum: any, count: any) => sum + count, 0),
        byLevel: {} as Record<string, any>,
      },
      divine: {
        memorized: memorized.divine.length,
        totalSlots: slots.divine.reduce((sum: any, count: any) => sum + count, 0),
        byLevel: {} as Record<string, any>,
      },
    };

    // Count memorized spells by level
    for (const school of ['arcane', 'divine']) {
      const schoolSpells = memorized[school];

      for (let level = 1; level <= 7; level++) {
        const levelSpells = schoolSpells.filter((spell: any) => spell.level === level);
        const availableSlots = slots[school][level - 1] || 0;

        stats[school].byLevel[level] = {
          memorized: levelSpells.length,
          available: availableSlots,
          remaining: Math.max(0, availableSlots - levelSpells.length),
        };
      }
    }

    return stats;
  }

  /**
   * Rest and recover spell slots
   */
  restAndRecover(character: any, restType: any = 'full') {
    const multiplier = restType === 'full' ? 1.0 : 0.5;

    // Update spell slots based on current level
    character.updateSpellSlots();

    // If full rest, allow spell preparation
    if (restType === 'full') {
      return {
        canPrepareSpells: true,
        message: 'Full rest completed. You may prepare spells.',
        needsPreparation: this.needsSpellPreparation(character),
      };
    } else {
      return {
        canPrepareSpells: false,
        message: 'Partial rest completed. No spell preparation available.',
        needsPreparation: false,
      };
    }
  }
}
