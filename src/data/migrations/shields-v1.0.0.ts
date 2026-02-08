/**
 * Shields Entity Migration - Version 1.0.0
 * Contains all shield data for the game
 */

// Global assignment for browser compatibility
export const shieldsMigration = {
  version: '1.0.0',
  entity: 'shields',
  store: 'shields',
  description: 'Initial shields data migration',

  data: {
    shield_small_001: {
      name: 'Small Shield',
      type: 'shield',
      acBonus: 1,
      weight: 5,
      value: 30,
      allowedClasses: ['Fighter', 'Priest', 'Thief', 'Lord', 'Samurai'],
    },
    shield_large_001: {
      name: 'Large Shield',
      type: 'shield',
      acBonus: 2,
      weight: 10,
      value: 70,
      allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
    },
    shield_plus_1_001: {
      name: 'Shield +1',
      type: 'shield',
      acBonus: 3,
      weight: 5,
      value: 500,
      allowedClasses: ['Fighter', 'Priest', 'Thief', 'Lord', 'Samurai'],
      magical: true,
    },
    shield_attraction_001: {
      name: 'Shield of Attraction',
      type: 'shield',
      acBonus: -1,
      weight: 10,
      value: 50,
      allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
      cursed: true,
      curseName: 'Monster Attraction',
      curseEffect: 'Increases random encounter rate',
      disguisedAs: 'Shield +1',
      magical: true,
    },
  },

  /**
   * Validate shield data
   */
  validate: (shieldData) => {
    const required = ['name', 'type', 'acBonus'];
    return required.every((field) => shieldData[field] !== undefined);
  },

  /**
   * Transform shield data if needed (future migrations)
   */
  transform: (shieldData) => {
    return shieldData;
  },
};
