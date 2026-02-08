/**
 * Effects Entity Migration - Version 1.0.0
 * Contains all effect data for the game
 */

// Global assignment for browser compatibility
export const effectsMigration = {
  version: '1.0.0',
  entity: 'effects',
  store: 'effects',
  description: 'Initial effects data migration',

  data: {
    effect_haste_001: {
      id: 'effect_haste_001',
      name: 'Haste',
      type: 'effect',
      category: 'enhancement',
      description: 'Character moves and acts faster',
      effects: {
        attackBonus: 1,
        acBonus: 1,
        extraActions: 1,
      },
      duration: 'combat',
      turnsRemaining: 10,
      dispellable: true,
      beneficial: true,
    },
    effect_slow_001: {
      id: 'effect_slow_001',
      name: 'Slow',
      type: 'effect',
      category: 'hindrance',
      description: 'Character moves and acts slower',
      effects: {
        attackPenalty: -1,
        acPenalty: -1,
        actionsReduced: 1,
      },
      duration: 'combat',
      turnsRemaining: 10,
      dispellable: true,
      beneficial: false,
    },
    effect_magic_weapon_001: {
      id: 'effect_magic_weapon_001',
      name: 'Magic Weapon',
      type: 'effect',
      category: 'enhancement',
      description: 'Weapon becomes magical with enhanced damage',
      effects: {
        weaponEnhancement: 1,
        damageBonus: 1,
      },
      duration: 'combat',
      turnsRemaining: 20,
      dispellable: true,
      beneficial: true,
    },
    effect_shield_001: {
      id: 'effect_shield_001',
      name: 'Shield',
      type: 'effect',
      category: 'protection',
      description: 'Magical armor provides protection',
      effects: {
        acBonus: 4,
        magicMissileImmunity: true,
      },
      duration: 'combat',
      turnsRemaining: 15,
      dispellable: true,
      beneficial: true,
    },
    effect_invisibility_001: {
      id: 'effect_invisibility_001',
      name: 'Invisibility',
      type: 'effect',
      category: 'concealment',
      description: 'Character is invisible to enemies',
      effects: {
        invisible: true,
        attackBonus: 2,
        acBonus: 2,
      },
      duration: 'until_broken',
      turnsRemaining: null,
      dispellable: true,
      beneficial: true,
      breaksOn: ['attack', 'cast_spell'],
    },
    effect_web_001: {
      id: 'effect_web_001',
      name: 'Web',
      type: 'effect',
      category: 'control',
      description: 'Character is entangled in sticky webs',
      effects: {
        entangled: true,
        cannotMove: true,
        attackPenalty: -2,
      },
      duration: 'combat',
      turnsRemaining: 5,
      dispellable: true,
      beneficial: false,
      escapeChance: 0.2,
    },
    effect_regeneration_001: {
      id: 'effect_regeneration_001',
      name: 'Regeneration',
      type: 'effect',
      category: 'healing',
      description: 'Character slowly regenerates health',
      effects: {
        hpRegeneration: 2,
        interval: 'turn',
      },
      duration: 'temporary',
      turnsRemaining: 10,
      dispellable: true,
      beneficial: true,
    },
    effect_strength_001: {
      id: 'effect_strength_001',
      name: 'Strength',
      type: 'effect',
      category: 'enhancement',
      description: 'Character gains supernatural strength',
      effects: {
        statBonus: {
          strength: 4,
        },
        attackBonus: 2,
        damageBonus: 2,
      },
      duration: 'temporary',
      turnsRemaining: 30,
      dispellable: true,
      beneficial: true,
    },
    effect_confusion_001: {
      id: 'effect_confusion_001',
      name: 'Confusion',
      type: 'effect',
      category: 'mental',
      description: 'Character acts randomly and unpredictably',
      effects: {
        confused: true,
        randomActions: true,
      },
      duration: 'combat',
      turnsRemaining: 8,
      dispellable: true,
      beneficial: false,
    },
    effect_light_001: {
      id: 'effect_light_001',
      name: 'Light',
      type: 'effect',
      category: 'utility',
      description: 'Magical light illuminates the area',
      effects: {
        lightRadius: 30,
        searchBonus: 1,
      },
      duration: 'long',
      turnsRemaining: 100,
      dispellable: true,
      beneficial: true,
    },
  },

  /**
   * Validate effect data
   */
  validate: (effectData) => {
    const required = ['id', 'name', 'type', 'category'];
    return required.every((field) => effectData[field] !== undefined);
  },

  /**
   * Transform effect data if needed (future migrations)
   */
  transform: (effectData) => {
    return effectData;
  },
};
