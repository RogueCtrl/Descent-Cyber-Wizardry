/**
 * Accessories Entity Migration - Version 1.0.0
 * Contains all accessory data for the game
 */

// Global assignment for browser compatibility
export const accessoriesMigration = {
  version: '1.0.0',
  entity: 'accessories',
  store: 'accessories',
  description: 'Initial accessories data migration',

  data: {
    accessory_ring_protection_001: {
      name: 'Ring of Protection',
      type: 'accessory',
      subtype: 'ring',
      acBonus: 1,
      weight: 0,
      value: 2000,
      allowedClasses: ['all'],
      magical: true,
    },
    accessory_amulet_health_001: {
      name: 'Amulet of Health',
      type: 'accessory',
      subtype: 'amulet',
      hpBonus: 5,
      weight: 0,
      value: 1500,
      allowedClasses: ['all'],
      magical: true,
    },
    accessory_cloak_elvenkind_001: {
      name: 'Cloak of Elvenkind',
      type: 'accessory',
      subtype: 'cloak',
      stealthBonus: 2,
      weight: 1,
      value: 2500,
      allowedClasses: ['all'],
      magical: true,
    },
    accessory_ring_weakness_001: {
      name: 'Ring of Weakness',
      type: 'accessory',
      subtype: 'ring',
      strengthPenalty: -2,
      weight: 0,
      value: 50,
      allowedClasses: ['all'],
      cursed: true,
      curseName: 'Strength Drain',
      curseEffect: 'Permanently reduces strength by 2',
      disguisedAs: 'Ring of Strength',
      magical: true,
    },
    accessory_cloak_misfortune_001: {
      name: 'Cloak of Misfortune',
      type: 'accessory',
      subtype: 'cloak',
      luckPenalty: -3,
      weight: 1,
      value: 25,
      allowedClasses: ['all'],
      cursed: true,
      curseName: 'Misfortune Curse',
      curseEffect: 'Brings terrible luck to the wearer',
      disguisedAs: 'Cloak of Luck',
      magical: true,
    },
    consumable_potion_unknown_001: {
      name: 'Potion of Unknown Effect',
      type: 'consumable',
      subtype: 'potion',
      weight: 0.5,
      value: 100,
      allowedClasses: ['all'],
      unidentified: true,
      possibleEffects: ['healing', 'poison', 'strength', 'intelligence'],
      identificationDC: 15,
    },
    consumable_scroll_unknown_001: {
      name: 'Scroll of Unknown Spell',
      type: 'consumable',
      subtype: 'scroll',
      weight: 0.1,
      value: 200,
      allowedClasses: ['Mage', 'Priest', 'Bishop'],
      unidentified: true,
      possibleSpells: ['Fireball', 'Heal', 'Teleport', 'Curse'],
      identificationDC: 12,
    },
    accessory_amulet_mysterious_001: {
      name: 'Mysterious Amulet',
      type: 'accessory',
      subtype: 'amulet',
      weight: 0,
      value: 500,
      allowedClasses: ['all'],
      unidentified: true,
      possibleEffects: ['protection', 'curse', 'health', 'magic resistance'],
      identificationDC: 18,
    },
  },

  /**
   * Validate accessory data
   */
  validate: (accessoryData: any) => {
    const required = ['name', 'type'];
    return required.every((field) => accessoryData[field] !== undefined);
  },

  /**
   * Transform accessory data if needed (future migrations)
   */
  transform: (accessoryData: any) => {
    return accessoryData;
  },
};
