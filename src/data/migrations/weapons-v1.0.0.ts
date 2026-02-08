/**
 * Weapons Entity Migration - Version 1.0.0
 * Contains all weapon data for the game
 */

// Global assignment for browser compatibility
export const weaponsMigration = {
  version: '1.0.0',
  entity: 'weapons',
  store: 'weapons',
  description: 'Initial weapons data migration',

  data: {
    weapon_dagger_001: {
      name: 'Dagger',
      type: 'weapon',
      subtype: 'dagger',
      damage: { dice: 1, sides: 4 },
      attackBonus: 0,
      weight: 1,
      value: 20,
      allowedClasses: ['all'],
      special: ['throwable'],
    },
    weapon_short_sword_001: {
      name: 'Short Sword',
      type: 'weapon',
      subtype: 'sword',
      damage: { dice: 1, sides: 6 },
      attackBonus: 0,
      weight: 3,
      value: 100,
      allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja'],
    },
    weapon_long_sword_001: {
      name: 'Long Sword',
      type: 'weapon',
      subtype: 'sword',
      damage: { dice: 1, sides: 8 },
      attackBonus: 0,
      weight: 4,
      value: 150,
      allowedClasses: ['Fighter', 'Lord', 'Samurai'],
    },
    weapon_mace_001: {
      name: 'Mace',
      type: 'weapon',
      subtype: 'mace',
      damage: { dice: 1, sides: 6 },
      attackBonus: 1,
      weight: 4,
      value: 80,
      allowedClasses: ['Fighter', 'Priest', 'Lord'],
    },
    weapon_staff_001: {
      name: 'Staff',
      type: 'weapon',
      subtype: 'staff',
      damage: { dice: 1, sides: 6 },
      attackBonus: 0,
      spellBonus: 1,
      weight: 4,
      value: 50,
      allowedClasses: ['Mage', 'Priest', 'Bishop'],
    },
    weapon_spear_001: {
      name: 'Spear',
      type: 'weapon',
      subtype: 'spear',
      damage: { dice: 1, sides: 6 },
      attackBonus: 0,
      weight: 6,
      value: 20,
      allowedClasses: ['Fighter', 'Lord', 'Samurai'],
      special: ['reach', 'throwable'],
    },
    weapon_bow_001: {
      name: 'Bow',
      type: 'weapon',
      subtype: 'bow',
      damage: { dice: 1, sides: 6 },
      attackBonus: 0,
      range: 'long',
      weight: 3,
      value: 75,
      allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja'],
      ammunition: 'arrows',
    },
    weapon_magic_sword_plus_1_001: {
      name: 'Magic Sword +1',
      type: 'weapon',
      subtype: 'sword',
      damage: { dice: 1, sides: 8, bonus: 1 },
      attackBonus: 1,
      weight: 4,
      value: 1000,
      allowedClasses: ['Fighter', 'Lord', 'Samurai'],
      magical: true,
    },
    weapon_cursed_sword_minus_1_001: {
      name: 'Cursed Sword -1',
      type: 'weapon',
      subtype: 'sword',
      damage: { dice: 1, sides: 8, bonus: -1 },
      attackBonus: -1,
      weight: 4,
      value: 50,
      allowedClasses: ['Fighter', 'Lord', 'Samurai'],
      cursed: true,
      curseName: 'Binding Curse',
      curseEffect: 'Cannot be removed, -1 to all attack rolls',
      disguisedAs: 'Magic Sword +1',
      magical: true,
    },
  },

  /**
   * Validate weapon data
   */
  validate: (weaponData) => {
    const required = ['name', 'type', 'subtype'];
    return required.every((field) => weaponData[field] !== undefined);
  },

  /**
   * Transform weapon data if needed (future migrations)
   */
  transform: (weaponData) => {
    // Add any data transformations here for future versions
    return weaponData;
  },
};
