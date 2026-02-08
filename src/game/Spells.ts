import { Storage } from '../utils/Storage.ts';
import { Class } from './CharacterClass.ts';
import { Random } from '../utils/Random.ts';

/**
 * Spell System
 * Handles magic spells and spell casting
 */
export class Spells {
  knownSpells: Map<any, any>;
  spellCache: Map<any, any>;
  entitiesLoaded: boolean;

  constructor() {
    this.knownSpells = new Map();
    this.spellCache = new Map(); // Cache for frequently accessed spells

    // Initialize entity loading on first use
    this.entitiesLoaded = false;
  }

  /**
   * Initialize spell entities from IndexedDB
   * @param {boolean} forceReload - Force reload entities from JSON
   * @returns {Promise<boolean>} Success status
   */
  async initializeEntities(forceReload = false) {
    if (this.entitiesLoaded && !forceReload) return true;

    try {
      // Entities are already loaded by Engine.js, just mark as initialized
      this.entitiesLoaded = true;

      // Clear cache when entities are reloaded
      if (forceReload) {
        this.spellCache.clear();
        console.log('Spell entity cache cleared');
        // Force reload entities if requested
        await Storage.loadEntitiesFromJSON(forceReload);
      }

      console.log('Spell entities initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize spell entities:', error);
      return false;
    }
  }

  /**
   * DEPRECATED: Legacy spell database (kept for compatibility)
   * Use getSpellFromStorage() instead
   */
  initializeSpellDatabase() {
    return {
      // Arcane Spells (Mage School)
      arcane: {
        1: {
          'Magic Missile': {
            name: 'Magic Missile',
            school: 'arcane',
            level: 1,
            description: 'Unerring magical projectile',
            effect: 'damage',
            dice: { count: 1, sides: 4, bonus: 1 },
            range: 'medium',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          Shield: {
            name: 'Shield',
            school: 'arcane',
            level: 1,
            description: 'Magical armor that blocks attacks',
            effect: 'protection',
            acBonus: 4,
            range: 'self',
            duration: 'combat',
            components: ['V', 'S'],
          },
          Light: {
            name: 'Light',
            school: 'arcane',
            level: 1,
            description: 'Creates magical illumination',
            effect: 'utility',
            range: 'touch',
            duration: 'long',
            components: ['V', 'M'],
          },
        },
        2: {
          Web: {
            name: 'Web',
            school: 'arcane',
            level: 2,
            description: 'Entangles enemies in sticky webs',
            effect: 'control',
            range: 'medium',
            duration: 'combat',
            components: ['V', 'S', 'M'],
          },
          Invisibility: {
            name: 'Invisibility',
            school: 'arcane',
            level: 2,
            description: 'Makes target invisible',
            effect: 'concealment',
            range: 'touch',
            duration: 'long',
            components: ['V', 'S', 'M'],
          },
          Knock: {
            name: 'Knock',
            school: 'arcane',
            level: 2,
            description: 'Opens locked doors and containers',
            effect: 'utility',
            range: 'medium',
            duration: 'instantaneous',
            components: ['V'],
          },
        },
        3: {
          Fireball: {
            name: 'Fireball',
            school: 'arcane',
            level: 3,
            description: 'Explosive sphere of flame',
            effect: 'damage',
            dice: { count: 3, sides: 6 },
            range: 'long',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
          'Lightning Bolt': {
            name: 'Lightning Bolt',
            school: 'arcane',
            level: 3,
            description: 'Stroke of lightning',
            effect: 'damage',
            dice: { count: 3, sides: 6 },
            range: 'long',
            duration: 'instantaneous',
            components: ['V', 'S', 'M'],
          },
          'Dispel Magic': {
            name: 'Dispel Magic',
            school: 'arcane',
            level: 3,
            description: 'Removes magical effects',
            effect: 'dispel',
            range: 'medium',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
        },
        4: {
          'Dimension Door': {
            name: 'Dimension Door',
            school: 'arcane',
            level: 4,
            description: 'Short-range teleportation',
            effect: 'utility',
            range: 'long',
            duration: 'instantaneous',
            components: ['V'],
          },
          'Ice Storm': {
            name: 'Ice Storm',
            school: 'arcane',
            level: 4,
            description: 'Hail of ice and cold',
            effect: 'damage',
            dice: { count: 4, sides: 6 },
            range: 'long',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
          Confusion: {
            name: 'Confusion',
            school: 'arcane',
            level: 4,
            description: 'Causes targets to act randomly',
            effect: 'control',
            range: 'medium',
            duration: 'combat',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
        },
        5: {
          Teleport: {
            name: 'Teleport',
            school: 'arcane',
            level: 5,
            description: 'Instantly transport party',
            effect: 'utility',
            range: 'unlimited',
            duration: 'instantaneous',
            components: ['V'],
          },
          'Cone of Cold': {
            name: 'Cone of Cold',
            school: 'arcane',
            level: 5,
            description: 'Blast of freezing air',
            effect: 'damage',
            dice: { count: 5, sides: 6 },
            range: 'medium',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
          Feeblemind: {
            name: 'Feeblemind',
            school: 'arcane',
            level: 5,
            description: "Destroys target's intellect",
            effect: 'control',
            range: 'medium',
            duration: 'permanent',
            components: ['V', 'S'],
          },
        },
        6: {
          'Death Spell': {
            name: 'Death Spell',
            school: 'arcane',
            level: 6,
            description: 'Kills creatures with low hit points',
            effect: 'damage',
            special: 'death',
            range: 'medium',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S'],
          },
          Disintegrate: {
            name: 'Disintegrate',
            school: 'arcane',
            level: 6,
            description: 'Reduces target to dust',
            effect: 'damage',
            dice: { count: 6, sides: 6, bonus: 40 },
            range: 'medium',
            duration: 'instantaneous',
            components: ['V', 'S', 'M'],
          },
          'Mass Invisibility': {
            name: 'Mass Invisibility',
            school: 'arcane',
            level: 6,
            description: 'Makes entire party invisible',
            effect: 'concealment',
            range: 'touch',
            duration: 'long',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
        },
        7: {
          'Meteor Swarm': {
            name: 'Meteor Swarm',
            school: 'arcane',
            level: 7,
            description: 'Devastating rain of meteors',
            effect: 'damage',
            dice: { count: 8, sides: 6 },
            range: 'long',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S'],
          },
          'Time Stop': {
            name: 'Time Stop',
            school: 'arcane',
            level: 7,
            description: 'Briefly stops time',
            effect: 'utility',
            range: 'self',
            duration: 'special',
            components: ['V'],
          },
          Wish: {
            name: 'Wish',
            school: 'arcane',
            level: 7,
            description: 'Alters reality itself',
            effect: 'utility',
            range: 'unlimited',
            duration: 'permanent',
            components: ['V'],
          },
        },
      },
      // Divine Spells (Priest School)
      divine: {
        1: {
          'Cure Light Wounds': {
            name: 'Cure Light Wounds',
            school: 'divine',
            level: 1,
            description: 'Heals minor injuries',
            effect: 'heal',
            dice: { count: 1, sides: 8, bonus: 1 },
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          Bless: {
            name: 'Bless',
            school: 'divine',
            level: 1,
            description: 'Grants divine favor in combat',
            effect: 'buff',
            bonus: 1,
            range: 'medium',
            duration: 'combat',
            components: ['V', 'S', 'M'],
          },
          'Protection from Evil': {
            name: 'Protection from Evil',
            school: 'divine',
            level: 1,
            description: 'Wards against evil creatures',
            effect: 'protection',
            acBonus: 2,
            range: 'touch',
            duration: 'long',
            components: ['V', 'S', 'M'],
          },
        },
        2: {
          'Hold Person': {
            name: 'Hold Person',
            school: 'divine',
            level: 2,
            description: 'Paralyzes a humanoid',
            effect: 'control',
            range: 'medium',
            duration: 'combat',
            components: ['V', 'S', 'F'],
          },
          Silence: {
            name: 'Silence',
            school: 'divine',
            level: 2,
            description: 'Creates zone of magical silence',
            effect: 'control',
            range: 'long',
            duration: 'combat',
            components: ['V', 'S'],
          },
          'Spiritual Hammer': {
            name: 'Spiritual Hammer',
            school: 'divine',
            level: 2,
            description: 'Conjures magical weapon',
            effect: 'damage',
            dice: { count: 1, sides: 6, bonus: 1 },
            range: 'medium',
            duration: 'combat',
            components: ['V', 'S', 'F'],
          },
        },
        3: {
          'Cure Disease': {
            name: 'Cure Disease',
            school: 'divine',
            level: 3,
            description: 'Removes disease and poison',
            effect: 'heal',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          'Remove Curse': {
            name: 'Remove Curse',
            school: 'divine',
            level: 3,
            description: 'Breaks curses and enchantments',
            effect: 'dispel',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          Prayer: {
            name: 'Prayer',
            school: 'divine',
            level: 3,
            description: 'Blesses allies and curses enemies',
            effect: 'buff',
            bonus: 1,
            range: 'medium',
            duration: 'combat',
            areaEffect: true,
            components: ['V', 'S', 'F'],
          },
        },
        4: {
          'Neutralize Poison': {
            name: 'Neutralize Poison',
            school: 'divine',
            level: 4,
            description: 'Cures poison and prevents death',
            effect: 'heal',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          "Protection from Evil 10' Radius": {
            name: "Protection from Evil 10' Radius",
            school: 'divine',
            level: 4,
            description: 'Wards entire party from evil',
            effect: 'protection',
            acBonus: 2,
            range: 'touch',
            duration: 'long',
            areaEffect: true,
            components: ['V', 'S', 'M'],
          },
          'Freedom of Movement': {
            name: 'Freedom of Movement',
            school: 'divine',
            level: 4,
            description: 'Protects from paralysis and binding',
            effect: 'protection',
            range: 'touch',
            duration: 'long',
            components: ['V', 'S', 'M'],
          },
        },
        5: {
          'Flame Strike': {
            name: 'Flame Strike',
            school: 'divine',
            level: 5,
            description: 'Column of divine fire',
            effect: 'damage',
            dice: { count: 6, sides: 8 },
            range: 'medium',
            duration: 'instantaneous',
            components: ['V', 'S', 'F'],
          },
          'Raise Dead': {
            name: 'Raise Dead',
            school: 'divine',
            level: 5,
            description: 'Restores life to the dead',
            effect: 'resurrection',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S', 'M'],
          },
          'True Seeing': {
            name: 'True Seeing',
            school: 'divine',
            level: 5,
            description: 'Reveals all illusions and hidden things',
            effect: 'utility',
            range: 'touch',
            duration: 'long',
            components: ['V', 'S', 'M'],
          },
        },
        6: {
          Heal: {
            name: 'Heal',
            school: 'divine',
            level: 6,
            description: 'Restores all hit points and removes ailments',
            effect: 'heal',
            special: 'full_heal',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          Harm: {
            name: 'Harm',
            school: 'divine',
            level: 6,
            description: 'Reduces target to 1 hit point',
            effect: 'damage',
            special: 'near_death',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S'],
          },
          'Word of Recall': {
            name: 'Word of Recall',
            school: 'divine',
            level: 6,
            description: 'Instantly transports party to safety',
            effect: 'utility',
            range: 'unlimited',
            duration: 'instantaneous',
            components: ['V'],
          },
        },
        7: {
          Resurrection: {
            name: 'Resurrection',
            school: 'divine',
            level: 7,
            description: 'Restores life without aging penalty',
            effect: 'resurrection',
            special: 'perfect',
            range: 'touch',
            duration: 'instantaneous',
            components: ['V', 'S', 'M'],
          },
          Earthquake: {
            name: 'Earthquake',
            school: 'divine',
            level: 7,
            description: 'Devastating earth tremor',
            effect: 'damage',
            dice: { count: 8, sides: 6 },
            range: 'long',
            duration: 'instantaneous',
            areaEffect: true,
            components: ['V', 'S', 'F'],
          },
          Gate: {
            name: 'Gate',
            school: 'divine',
            level: 7,
            description: 'Opens portal to other planes',
            effect: 'utility',
            range: 'medium',
            duration: 'long',
            components: ['V', 'S', 'M'],
          },
        },
      },
    };
  }

  /**
   * Get spell data
   */
  static getSpellData(spellName, school: string | null = null) {
    const spells = new Spells();
    return spells.getSpell(spellName, school);
  }

  /**
   * Get spell from storage by entity ID
   * @param {string} spellId - Spell entity ID
   * @returns {Promise<Object|null>} Spell data or null
   */
  async getSpellFromStorage(spellId) {
    if (!spellId) return null;

    // Check cache first
    if (this.spellCache.has(spellId)) {
      return { ...this.spellCache.get(spellId) };
    }

    await this.initializeEntities();

    const spell = await Storage.getSpell(spellId);
    if (spell) {
      this.spellCache.set(spellId, spell);
      return { ...(spell as any) };
    }

    return null;
  }

  /**
   * Get spell by name (searches all spell entities)
   * @param {string} spellName - Name of the spell
   * @param {string} school - Optional school filter
   * @returns {Promise<Object|null>} Spell data or null
   */
  async getSpellByName(spellName, school: string | null = null) {
    await this.initializeEntities();

    const criteria: any = { name: spellName };
    if (school) {
      criteria.school = school;
    }

    const spells: any = await Storage.queryEntities(Storage.SPELL_STORE, criteria);
    if ((spells as any).length > 0) {
      const spell = spells[0];
      this.spellCache.set(spell.id, spell);
      return { ...spell };
    }

    return null;
  }

  /**
   * DEPRECATED: Legacy getSpell method (kept for compatibility)
   * Use getSpellByName() or getSpellFromStorage() instead
   */
  getSpell(spellName, school: string | null = null) {
    // For backward compatibility, use synchronous fallback
    const spellDatabase = this.initializeSpellDatabase();

    // Search in specified school first
    if (school && spellDatabase[school]) {
      for (const level of Object.values(spellDatabase[school]) as any[]) {
        if (level[spellName]) {
          return level[spellName];
        }
      }
    }

    // Search all schools if not found or no school specified
    for (const schoolName of Object.keys(spellDatabase)) {
      for (const level of Object.values(spellDatabase[schoolName]) as any[]) {
        if (level[spellName]) {
          return level[spellName];
        }
      }
    }

    return null;
  }

  /**
   * Get all spells of a specific school and level (async version)
   * @param {string} school - School name
   * @param {number} level - Spell level
   * @returns {Promise<Array>} Array of spells
   */
  async getSpellsBySchoolAndLevel(school, level) {
    await this.initializeEntities();

    const spells = await Storage.queryEntities(Storage.SPELL_STORE, {
      school: school,
      level: level,
    });
    return spells;
  }

  /**
   * Get available spells for character based on class and level
   */
  async getAvailableSpells(character) {
    const classData = Class.getClassData(character.class);
    if (!classData || !classData.spells) {
      return { arcane: [] as any[], divine: [] as any[] };
    }

    const availableSpells = { arcane: [] as any[], divine: [] as any[] };

    // Determine which schools the character can access
    const canCastArcane =
      classData.spells === 'arcane' ||
      classData.spells === 'both' ||
      classData.spells === 'limited_arcane';
    const canCastDivine =
      classData.spells === 'divine' ||
      classData.spells === 'both' ||
      classData.spells === 'limited_divine';

    // Get spell slots to determine available levels
    if (canCastArcane) {
      const arcaneSlots = Class.getSpellSlots(character, 'arcane');
      for (let level = 1; level <= arcaneSlots.length; level++) {
        if (arcaneSlots[level - 1] > 0) {
          availableSpells.arcane.push(
            ...((await this.getSpellsBySchoolAndLevel('arcane', level)) as any[])
          );
        }
      }
    }

    if (canCastDivine) {
      const divineSlots = Class.getSpellSlots(character, 'divine');
      for (let level = 1; level <= divineSlots.length; level++) {
        if (divineSlots[level - 1] > 0) {
          availableSpells.divine.push(
            ...((await this.getSpellsBySchoolAndLevel('divine', level)) as any[])
          );
        }
      }
    }

    return availableSpells;
  }

  /**
   * Cast a spell
   */
  /**
   * Cast a spell (async version using entity references)
   * @param {Object} caster - Character casting the spell
   * @param {string} spellNameOrId - Spell name or entity ID
   * @param {Object} target - Target of the spell
   * @returns {Promise<Object>} Casting result
   */
  async castSpell(caster, spellNameOrId, target: any = null) {
    let spell = await this.getSpellFromStorage(spellNameOrId);
    if (!spell) {
      spell = await this.getSpellByName(spellNameOrId);
    }
    if (!spell) {
      return { success: false, message: 'Spell not found' };
    }

    // Check if character can cast this spell
    if (!this.canCastSpell(caster, spell)) {
      return { success: false, message: 'Cannot cast this spell' };
    }

    // Check if spell is memorized
    if (!this.isSpellMemorized(caster, spell)) {
      return { success: false, message: 'Spell not memorized' };
    }

    // Roll for spell success
    const successChance = this.calculateSpellSuccessChance(caster, spell);
    if (!Random.percent(successChance)) {
      this.removeMemorizedSpell(caster, spell);
      return { success: false, message: 'Spell casting failed' };
    }

    // Execute spell effect
    const result = this.executeSpellEffect(spell, caster, target);

    // Remove memorized spell
    this.removeMemorizedSpell(caster, spell);

    return {
      success: true,
      spell: spell,
      result: result,
      message: `${caster.name} successfully casts ${spell.name}`,
    };
  }

  /**
   * Check if character can cast a spell
   */
  canCastSpell(caster, spell) {
    const classData = Class.getClassData(caster.class);
    if (!classData || !classData.spells) return false;

    // Check if character's class can cast this school of magic
    const canCastSchool =
      (spell.school === 'arcane' &&
        (classData.spells === 'arcane' ||
          classData.spells === 'both' ||
          classData.spells === 'limited_arcane')) ||
      (spell.school === 'divine' &&
        (classData.spells === 'divine' ||
          classData.spells === 'both' ||
          classData.spells === 'limited_divine'));

    if (!canCastSchool) return false;

    // Check if character has spell slots of the required level
    const spellSlots = Class.getSpellSlots(caster, spell.school);
    return spellSlots.length >= spell.level && spellSlots[spell.level - 1] > 0;
  }

  /**
   * Check if spell is memorized
   */
  isSpellMemorized(caster, spell) {
    if (!caster.memorizedSpells || !caster.memorizedSpells[spell.school]) {
      return false;
    }

    return caster.memorizedSpells[spell.school].some(
      (memorizedSpell) => memorizedSpell.name === spell.name
    );
  }

  /**
   * Calculate spell success chance
   */
  calculateSpellSuccessChance(caster, spell) {
    const baseChance = 85;
    const levelDifference = caster.level - spell.level;
    const attributeBonus =
      spell.school === 'arcane'
        ? (caster.attributes.intelligence - 10) * 2
        : (caster.attributes.piety - 10) * 2;

    const successChance = baseChance + levelDifference * 5 + attributeBonus;

    return Math.min(95, Math.max(5, successChance));
  }

  /**
   * Execute spell effect
   */
  executeSpellEffect(spell, caster, target) {
    switch (spell.effect) {
      case 'damage':
        return this.executeDamageSpell(spell, caster, target);
      case 'heal':
        return this.executeHealSpell(spell, caster, target);
      case 'buff':
        return this.executeBuffSpell(spell, caster, target);
      case 'protection':
        return this.executeProtectionSpell(spell, caster, target);
      case 'control':
        return this.executeControlSpell(spell, caster, target);
      case 'utility':
        return this.executeUtilitySpell(spell, caster, target);
      case 'dispel':
        return this.executeDispelSpell(spell, caster, target);
      case 'concealment':
        return this.executeConcealmentSpell(spell, caster, target);
      case 'resurrection':
        return this.executeResurrectionSpell(spell, caster, target);
      default:
        return { message: 'Spell effect unknown' };
    }
  }

  /**
   * Execute damage spell
   */
  executeDamageSpell(spell, caster, target) {
    if (!target) {
      return { message: 'No target for damage spell' };
    }

    let damage = 0;
    if (spell.dice) {
      damage = Random.dice(spell.dice.count, spell.dice.sides) + (spell.dice.bonus || 0);
    }

    // Apply caster level bonus for some spells
    if (spell.name === 'Magic Missile') {
      damage += Math.floor(caster.level / 2);
    }

    // Special spell effects
    if (spell.special === 'death') {
      // Death spell affects creatures with low HP
      const hpThreshold = caster.level * 4;
      if (target.currentHP <= hpThreshold) {
        target.currentHP = 0;
        target.isAlive = false;
        target.status = 'dead';
        return { message: `${target.name || 'Target'} is slain by death magic!` };
      } else {
        return { message: `${target.name || 'Target'} resists the death spell` };
      }
    }

    if (spell.special === 'near_death') {
      // Harm spell (divine equivalent of death)
      const saveChance = this.calculateSaveChance(target, spell);
      if (!Random.percent(saveChance)) {
        target.currentHP = 1;
        return { message: `${target.name || 'Target'} is reduced to near death!` };
      } else {
        damage = Math.floor(damage / 2);
      }
    }

    target.currentHP = Math.max(0, target.currentHP - damage);

    if (target.currentHP <= 0) {
      target.isAlive = false;
      target.status = 'dead';
    }

    return {
      damage: damage,
      message: `${target.name || 'Target'} takes ${damage} damage`,
    };
  }

  /**
   * Execute healing spell
   */
  executeHealSpell(spell, caster, target) {
    if (!target) {
      return { message: 'No target for healing spell' };
    }

    let healing = 0;

    // Special healing effects
    if (spell.special === 'full_heal') {
      // Heal spell restores all HP
      const oldHP = target.currentHP;
      target.currentHP = target.maxHP;

      // Remove all negative effects
      if (target.temporaryEffects) {
        target.temporaryEffects = target.temporaryEffects.filter(
          (effect) => effect.type === 'buff' || effect.type === 'protection'
        );
      }

      // Cure diseases and poison
      if (target.status && target.status !== 'ok') {
        target.status = 'ok';
      }

      const actualHealing = target.currentHP - oldHP;
      return {
        healing: actualHealing,
        message: `${target.name || 'Target'} is fully healed and cleansed!`,
      };
    }

    if (spell.dice) {
      healing = Random.dice(spell.dice.count, spell.dice.sides) + (spell.dice.bonus || 0);
    }

    const oldHP = target.currentHP;
    target.currentHP = Math.min(target.maxHP, target.currentHP + healing);
    const actualHealing = target.currentHP - oldHP;

    return {
      healing: actualHealing,
      message: `${target.name || 'Target'} heals ${actualHealing} hit points`,
    };
  }

  /**
   * Execute buff spell
   */
  executeBuffSpell(spell, caster, target) {
    const targets = spell.areaEffect ? [caster] : [target || caster]; // Simplified area effect

    targets.forEach((t) => {
      if (t && t.temporaryEffects) {
        t.addTemporaryEffect({
          type: 'buff',
          source: spell.name,
          bonus: spell.bonus || 1,
          duration: spell.duration,
        });
      }
    });

    return {
      message: `${spell.name} grants a bonus to ${targets.length} target(s)`,
    };
  }

  /**
   * Execute protection spell
   */
  executeProtectionSpell(spell, caster, target) {
    const recipient = target || caster;

    if (recipient.temporaryEffects) {
      recipient.addTemporaryEffect({
        type: 'ac_bonus',
        source: spell.name,
        bonus: spell.acBonus || 2,
        duration: spell.duration,
      });
    }

    return {
      message: `${recipient.name || 'Target'} gains magical protection`,
    };
  }

  /**
   * Execute control spell
   */
  executeControlSpell(spell, caster, target) {
    if (!target) {
      return { message: 'No target for control spell' };
    }

    // Simple control effect - could be expanded
    const saveChance = this.calculateSaveChance(target, spell);

    if (Random.percent(saveChance)) {
      return { message: `${target.name || 'Target'} resists the spell` };
    }

    if (target.temporaryEffects) {
      target.addTemporaryEffect({
        type: 'control',
        source: spell.name,
        effect: spell.name.toLowerCase().replace(' ', '_'),
        duration: spell.duration,
      });
    }

    return {
      message: `${target.name || 'Target'} is affected by ${spell.name}`,
    };
  }

  /**
   * Execute utility spell
   */
  executeUtilitySpell(spell, caster, target) {
    // Utility spells have various effects
    return {
      message: `${spell.name} takes effect`,
    };
  }

  /**
   * Execute dispel spell
   */
  executeDispelSpell(spell, caster, target) {
    if (!target) {
      return { message: 'No target for dispel spell' };
    }

    if (target.temporaryEffects) {
      const removedEffects = target.temporaryEffects.length;
      target.temporaryEffects = [];

      return {
        message: `${removedEffects} magical effect(s) dispelled from ${target.name || 'target'}`,
      };
    }

    return { message: 'No magical effects to dispel' };
  }

  /**
   * Calculate save chance against spell
   */
  calculateSaveChance(target, spell) {
    const baseSave = 50;
    const levelBonus = (target.level || 1) * 5;
    const attributeBonus =
      spell.school === 'arcane'
        ? (target.attributes?.intelligence || 10) - 10
        : (target.attributes?.piety || 10) - 10;

    return Math.min(95, Math.max(5, baseSave + levelBonus + attributeBonus));
  }

  /**
   * Remove memorized spell
   */
  removeMemorizedSpell(caster, spell) {
    if (!caster.memorizedSpells || !caster.memorizedSpells[spell.school]) {
      return;
    }

    const spells = caster.memorizedSpells[spell.school];
    const index = spells.findIndex((s) => s.name === spell.name);
    if (index !== -1) {
      spells.splice(index, 1);
    }
  }

  /**
   * Memorize spells for character
   */
  memorizeSpells(character, selectedSpells) {
    const availableSlots = {
      arcane: Class.getSpellSlots(character, 'arcane'),
      divine: Class.getSpellSlots(character, 'divine'),
    };

    const memorized = { arcane: [], divine: [] };

    // Process each school
    for (const school of ['arcane', 'divine']) {
      const schoolSpells = selectedSpells[school] || [];
      const slots = availableSlots[school];

      for (const spellSelection of schoolSpells) {
        const spell = this.getSpell(spellSelection.name, school);
        if (!spell) continue;

        const levelIndex = spell.level - 1;
        if (levelIndex < slots.length && slots[levelIndex] > 0) {
          memorized[school].push(spell);
          slots[levelIndex]--;
        }
      }
    }

    character.memorizedSpells = memorized;
    return memorized;
  }

  /**
   * Execute concealment spell (invisibility, etc.)
   */
  executeConcealmentSpell(spell, caster, target) {
    const targets = spell.areaEffect ? [caster] : [target || caster]; // For mass invisibility

    targets.forEach((t) => {
      if (t && t.temporaryEffects) {
        t.addTemporaryEffect({
          type: 'concealment',
          source: spell.name,
          effect: 'invisible',
          duration: spell.duration,
        });
      }
    });

    return {
      message: `${targets.length} target(s) become invisible`,
    };
  }

  /**
   * Execute resurrection spell
   */
  executeResurrectionSpell(spell, caster, target) {
    if (!target) {
      return { message: 'No target for resurrection spell' };
    }

    if (target.isAlive) {
      return { message: 'Target is already alive' };
    }

    // Check if target can be resurrected
    if (target.status === 'lost') {
      return { message: 'Target is lost forever and cannot be resurrected' };
    }

    // Calculate resurrection chance
    const baseChance = spell.special === 'perfect' ? 95 : 75; // Perfect resurrection has higher chance
    const levelPenalty = Math.max(0, (target.level - caster.level) * 5);
    const vitalityBonus = (target.attributes?.vitality || 10) - 10;

    const successChance = Math.min(95, Math.max(5, baseChance - levelPenalty + vitalityBonus));

    if (Random.percent(successChance)) {
      // Successful resurrection
      target.isAlive = true;
      target.status = 'ok';
      target.currentHP = 1;

      // Aging effect (unless perfect resurrection)
      let ageIncrease = 0;
      if (spell.special !== 'perfect') {
        ageIncrease = Random.integer(1, 3);
        if (target.ageCharacter) {
          target.ageCharacter(ageIncrease);
        }
      }

      return {
        success: true,
        message: `${target.name || 'Target'} is restored to life!`,
        ageIncrease: ageIncrease,
      };
    } else {
      // Failed resurrection - character gets worse
      if (target.status === 'dead') {
        target.status = 'ashes';
        return {
          success: false,
          message: `Resurrection failed! ${target.name || 'Target'} crumbles to ashes!`,
        };
      } else if (target.status === 'ashes') {
        target.status = 'lost';
        return {
          success: false,
          message: `Resurrection failed! ${target.name || 'Target'} is lost forever!`,
        };
      }
    }

    return { success: false, message: 'Resurrection failed' };
  }

  /**
   * Get spell descriptions for UI
   */
  getSpellDescriptions(spells) {
    return spells.map((spell) => ({
      name: spell.name,
      level: spell.level,
      school: spell.school,
      description: spell.description,
      range: spell.range,
      duration: spell.duration,
      components: spell.components?.join(', ') || 'None',
    }));
  }
}
