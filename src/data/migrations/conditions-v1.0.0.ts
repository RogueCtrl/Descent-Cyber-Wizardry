/**
 * Conditions Entity Migration - Version 1.0.0
 * Contains all condition data for the game
 */

// Global assignment for browser compatibility
export const conditionsMigration = {
  version: '1.0.0',
  entity: 'conditions',
  store: 'conditions',
  description: 'Initial conditions data migration',

  data: {
    condition_poisoned_001: {
      id: 'condition_poisoned_001',
      name: 'Poisoned',
      type: 'condition',
      category: 'affliction',
      description: 'Character is suffering from poison',
      effects: {
        hpLoss: 1,
        interval: 'turn',
        statPenalty: {
          constitution: -2,
        },
      },
      duration: 'temporary',
      removable: true,
      removesWith: ['Neutralize Poison', 'Cure Disease'],
      severity: 'moderate',
    },
    condition_cursed_001: {
      id: 'condition_cursed_001',
      name: 'Cursed',
      type: 'condition',
      category: 'magical',
      description: 'Character is under a magical curse',
      effects: {
        statPenalty: {
          luck: -3,
        },
        combatPenalty: -1,
      },
      duration: 'permanent',
      removable: true,
      removesWith: ['Remove Curse'],
      severity: 'severe',
    },
    condition_paralyzed_001: {
      id: 'condition_paralyzed_001',
      name: 'Paralyzed',
      type: 'condition',
      category: 'affliction',
      description: 'Character cannot move or act',
      effects: {
        cannotAct: true,
        acPenalty: -4,
      },
      duration: 'temporary',
      removable: true,
      removesWith: ['Dispel Magic', 'Freedom of Movement'],
      severity: 'severe',
    },
    condition_blessed_001: {
      id: 'condition_blessed_001',
      name: 'Blessed',
      type: 'condition',
      category: 'beneficial',
      description: 'Character is under divine blessing',
      effects: {
        attackBonus: 1,
        savingThrowBonus: 1,
      },
      duration: 'temporary',
      removable: false,
      severity: 'beneficial',
    },
    condition_asleep_001: {
      id: 'condition_asleep_001',
      name: 'Asleep',
      type: 'condition',
      category: 'affliction',
      description: 'Character is magically sleeping',
      effects: {
        cannotAct: true,
        vulnerable: true,
      },
      duration: 'temporary',
      removable: true,
      removesWith: ['damage', 'Dispel Magic'],
      severity: 'moderate',
    },
    condition_afraid_001: {
      id: 'condition_afraid_001',
      name: 'Afraid',
      type: 'condition',
      category: 'mental',
      description: 'Character is frightened and less effective',
      effects: {
        attackPenalty: -2,
        damagePenalty: -1,
        moralePenalty: -2,
      },
      duration: 'temporary',
      removable: true,
      removesWith: ['Bless', 'Remove Fear'],
      severity: 'moderate',
    },
    condition_silenced_001: {
      id: 'condition_silenced_001',
      name: 'Silenced',
      type: 'condition',
      category: 'affliction',
      description: 'Character cannot speak or cast spells with verbal components',
      effects: {
        cannotCastSpells: true,
        verbalSpellsBlocked: true,
      },
      duration: 'temporary',
      removable: true,
      removesWith: ['Dispel Magic'],
      severity: 'moderate',
    },
    condition_aged_001: {
      id: 'condition_aged_001',
      name: 'Aged',
      type: 'condition',
      category: 'permanent',
      description: 'Character has been magically aged',
      effects: {
        ageIncrease: 1,
        statPenalty: {
          strength: -1,
          constitution: -1,
        },
      },
      duration: 'permanent',
      removable: false,
      severity: 'severe',
    },
  },

  /**
   * Validate condition data
   */
  validate: (conditionData) => {
    const required = ['id', 'name', 'type', 'category'];
    return required.every((field) => conditionData[field] !== undefined);
  },

  /**
   * Transform condition data if needed (future migrations)
   */
  transform: (conditionData) => {
    return conditionData;
  },
};
