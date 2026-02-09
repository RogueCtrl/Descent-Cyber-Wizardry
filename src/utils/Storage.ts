import { Party } from '../game/Party.ts';
import { weaponsMigration } from '../data/migrations/weapons-v1.0.0.ts';
import { armorMigration } from '../data/migrations/armor-v1.0.0.ts';
import { shieldsMigration } from '../data/migrations/shields-v1.0.0.ts';
import { accessoriesMigration } from '../data/migrations/accessories-v1.0.0.ts';
import { spellsMigration } from '../data/migrations/spells-v1.0.0.ts';
import { conditionsMigration } from '../data/migrations/conditions-v1.0.0.ts';
import { effectsMigration } from '../data/migrations/effects-v1.0.0.ts';
import { monstersMigration } from '../data/migrations/monsters-v1.0.0.ts';
import type {
  CharacterData,
  PartyData,
  CampData,
  SaveData,
  MonsterData,
  EquipmentItem,
  SpellData,
} from '../types/index.ts';

/**
 * Storage Utilities
 * Handles saving and loading game data using localStorage and IndexedDB
 * Enhanced with camp/resume mechanics for dungeon exploration
 * IndexedDB used for character persistence
 */
export class Storage {
  static SAVE_KEY = 'descent_cyber_wizardry_save';
  static SETTINGS_KEY = 'descent_cyber_wizardry_settings';
  static CHARACTERS_KEY = 'descent_cyber_wizardry_characters';
  static CAMP_KEY_PREFIX = 'descent_camp_'; // For individual party camps
  static DUNGEON_STATE_KEY = 'descent_dungeon_states';
  static ACTIVE_PARTY_KEY = 'descent_active_party'; // For tracking current active party

  // IndexedDB configuration
  static DB_NAME = 'DescentCyberWizardry';
  static DB_VERSION = 7; // Incremented for party store
  static CHARACTER_STORE = 'characters';
  static ROSTER_STORE = 'roster';
  static CAMP_STORE = 'camps';
  static PARTY_STORE = 'parties';
  static WEAPON_STORE = 'weapons';
  static ARMOR_STORE = 'armor';
  static SHIELD_STORE = 'shields';
  static ACCESSORY_STORE = 'accessories';
  static SPELL_STORE = 'spells';
  static CONDITION_STORE = 'conditions';
  static EFFECT_STORE = 'effects';
  static MONSTER_STORE = 'monsters';
  static VERSION_STORE = 'entity_versions';
  static DUNGEON_STORE = 'dungeons';
  static PARTY_POSITION_STORE = 'party_positions';

  static _db: IDBDatabase | null = null;
  static _dbInitialized = false;

  // Entity version tracking
  static ENTITY_VERSION = '1.1.0'; // Increment this when migration files change
  static ENTITY_TYPES = [
    'weapons',
    'armor',
    'shields',
    'accessories',
    'spells',
    'conditions',
    'effects',
    'monsters',
  ];

  /**
   * Save game data
   */
  static saveGame(gameData: Record<string, unknown>): boolean {
    try {
      const saveData = {
        ...gameData,
        version: '1.0.0',
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.SAVE_KEY, serialized);

      console.log('Game saved successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game: ' + error.message);
    }
  }

  /**
   * Load game data
   */
  static loadGame(): SaveData | null {
    try {
      const serialized = localStorage.getItem(this.SAVE_KEY);

      if (!serialized) {
        return null;
      }

      const saveData = JSON.parse(serialized);

      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.warn('Invalid save data detected');
        return null;
      }

      console.log('Game loaded successfully');
      return saveData;
    } catch (error: any) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if a save game exists
   */
  static hasSavedGame(): boolean {
    const serialized = localStorage.getItem(this.SAVE_KEY);
    return serialized !== null;
  }

  /**
   * Delete saved game
   */
  static deleteSavedGame(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      console.log('Saved game deleted');
      return true;
    } catch (error: any) {
      console.error('Failed to delete saved game:', error);
      return false;
    }
  }

  /**
   * Save game settings
   */
  static saveSettings(settings: Record<string, unknown>): boolean {
    try {
      const settingsData = {
        ...settings,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(settingsData);
      localStorage.setItem(this.SETTINGS_KEY, serialized);

      return true;
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Load game settings
   */
  static loadSettings(): Record<string, unknown> {
    try {
      const serialized = localStorage.getItem(this.SETTINGS_KEY);

      if (!serialized) {
        return this.getDefaultSettings();
      }

      const settings = JSON.parse(serialized);

      // Merge with defaults to ensure all settings exist
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  static getDefaultSettings(): Record<string, unknown> {
    return {
      volume: 0.7,
      soundEffects: true,
      music: true,
      autoSave: true,
      autoSaveInterval: 300, // 5 minutes
      keyBindings: {
        moveForward: 'ArrowUp',
        moveBackward: 'ArrowDown',
        turnLeft: 'ArrowLeft',
        turnRight: 'ArrowRight',
        action: 'Space',
        menu: 'Escape',
        inventory: 'i',
        spells: 's',
        rest: 'r',
        camp: 'c',
      },
      graphics: {
        wireframe: true,
        fillColors: false,
        smoothLines: true,
        showMinimap: true,
      },
      gameplay: {
        confirmActions: true,
        showDamageNumbers: true,
        autoPickup: false,
        pauseOnLostFocus: true,
      },
    };
  }

  // IndexedDB Methods for Character Persistence

  /**
   * Initialize IndexedDB for character storage
   * @returns {Promise<boolean>} Success status
   */
  static async initializeDB(): Promise<boolean> {
    if (this._dbInitialized && this._db) {
      return true;
    }

    if (!window.indexedDB) {
      console.error('IndexedDB not supported');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(false);
      };

      request.onsuccess = () => {
        this._db = request.result;
        this._dbInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create characters store
        if (!db.objectStoreNames.contains(this.CHARACTER_STORE)) {
          const characterStore = db.createObjectStore(this.CHARACTER_STORE, {
            keyPath: 'id',
          });

          // Create indexes for efficient queries
          characterStore.createIndex('name', 'name', { unique: false });
          characterStore.createIndex('race', 'race', { unique: false });
          characterStore.createIndex('class', 'class', { unique: false });
          characterStore.createIndex('level', 'level', { unique: false });
          characterStore.createIndex('status', 'status', { unique: false });
          characterStore.createIndex('dateCreated', 'dateCreated', { unique: false });
          characterStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Create roster store for party management
        if (!db.objectStoreNames.contains(this.ROSTER_STORE)) {
          const rosterStore = db.createObjectStore(this.ROSTER_STORE, {
            keyPath: 'id',
          });

          rosterStore.createIndex('name', 'name', { unique: false });
          rosterStore.createIndex('dateCreated', 'dateCreated', { unique: false });
          rosterStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Create camps store for dungeon camp saves
        if (!db.objectStoreNames.contains(this.CAMP_STORE)) {
          const campStore = db.createObjectStore(this.CAMP_STORE, {
            keyPath: 'campId',
          });

          campStore.createIndex('partyId', 'partyId', { unique: false });
          campStore.createIndex('partyName', 'partyName', { unique: false });
          campStore.createIndex('currentFloor', 'location.currentFloor', { unique: false });
          campStore.createIndex('campTime', 'campTime', { unique: false });
          campStore.createIndex('dungeonId', 'location.dungeonId', { unique: false });
          campStore.createIndex('memberCount', 'memberCount', { unique: false });
          campStore.createIndex('aliveCount', 'aliveCount', { unique: false });
        }

        // Create weapon entity store
        if (!db.objectStoreNames.contains(this.WEAPON_STORE)) {
          const weaponStore = db.createObjectStore(this.WEAPON_STORE, {
            keyPath: 'id',
          });

          weaponStore.createIndex('name', 'name', { unique: false });
          weaponStore.createIndex('type', 'type', { unique: false });
          weaponStore.createIndex('subtype', 'subtype', { unique: false });
          weaponStore.createIndex('magical', 'magical', { unique: false });
          weaponStore.createIndex('cursed', 'cursed', { unique: false });
        }

        // Create armor entity store
        if (!db.objectStoreNames.contains(this.ARMOR_STORE)) {
          const armorStore = db.createObjectStore(this.ARMOR_STORE, {
            keyPath: 'id',
          });

          armorStore.createIndex('name', 'name', { unique: false });
          armorStore.createIndex('type', 'type', { unique: false });
          armorStore.createIndex('subtype', 'subtype', { unique: false });
          armorStore.createIndex('magical', 'magical', { unique: false });
          armorStore.createIndex('cursed', 'cursed', { unique: false });
        }

        // Create shield entity store
        if (!db.objectStoreNames.contains(this.SHIELD_STORE)) {
          const shieldStore = db.createObjectStore(this.SHIELD_STORE, {
            keyPath: 'id',
          });

          shieldStore.createIndex('name', 'name', { unique: false });
          shieldStore.createIndex('type', 'type', { unique: false });
          shieldStore.createIndex('magical', 'magical', { unique: false });
          shieldStore.createIndex('cursed', 'cursed', { unique: false });
        }

        // Create accessory entity store
        if (!db.objectStoreNames.contains(this.ACCESSORY_STORE)) {
          const accessoryStore = db.createObjectStore(this.ACCESSORY_STORE, {
            keyPath: 'id',
          });

          accessoryStore.createIndex('name', 'name', { unique: false });
          accessoryStore.createIndex('type', 'type', { unique: false });
          accessoryStore.createIndex('subtype', 'subtype', { unique: false });
          accessoryStore.createIndex('magical', 'magical', { unique: false });
          accessoryStore.createIndex('cursed', 'cursed', { unique: false });
          accessoryStore.createIndex('unidentified', 'unidentified', { unique: false });
        }

        // Create spell entity store
        if (!db.objectStoreNames.contains(this.SPELL_STORE)) {
          const spellStore = db.createObjectStore(this.SPELL_STORE, {
            keyPath: 'id',
          });

          spellStore.createIndex('name', 'name', { unique: false });
          spellStore.createIndex('school', 'school', { unique: false });
          spellStore.createIndex('level', 'level', { unique: false });
          spellStore.createIndex('effect', 'effect', { unique: false });
        }

        // Create condition entity store
        if (!db.objectStoreNames.contains(this.CONDITION_STORE)) {
          const conditionStore = db.createObjectStore(this.CONDITION_STORE, {
            keyPath: 'id',
          });

          conditionStore.createIndex('name', 'name', { unique: false });
          conditionStore.createIndex('type', 'type', { unique: false });
          conditionStore.createIndex('category', 'category', { unique: false });
          conditionStore.createIndex('severity', 'severity', { unique: false });
        }

        // Create effect entity store
        if (!db.objectStoreNames.contains(this.EFFECT_STORE)) {
          const effectStore = db.createObjectStore(this.EFFECT_STORE, {
            keyPath: 'id',
          });

          effectStore.createIndex('name', 'name', { unique: false });
          effectStore.createIndex('type', 'type', { unique: false });
          effectStore.createIndex('category', 'category', { unique: false });
          effectStore.createIndex('beneficial', 'beneficial', { unique: false });
          effectStore.createIndex('dispellable', 'dispellable', { unique: false });
        }

        // Create monster entity store
        if (!db.objectStoreNames.contains(this.MONSTER_STORE)) {
          const monsterStore = db.createObjectStore(this.MONSTER_STORE, {
            keyPath: 'id',
          });

          monsterStore.createIndex('name', 'name', { unique: false });
          monsterStore.createIndex('type', 'type', { unique: false });
          monsterStore.createIndex('level', 'level', { unique: false });
          monsterStore.createIndex('aiType', 'aiType', { unique: false });
          monsterStore.createIndex('experienceValue', 'experienceValue', { unique: false });
          monsterStore.createIndex('treasureType', 'treasureType', { unique: false });
        }

        // Create version store for tracking entity updates
        if (!db.objectStoreNames.contains(this.VERSION_STORE)) {
          const versionStore = db.createObjectStore(this.VERSION_STORE, {
            keyPath: 'id',
          });

          versionStore.createIndex('version', 'version', { unique: false });
          versionStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Create dungeon store for saving dungeon states (now for shared dungeon instances)
        if (!db.objectStoreNames.contains(this.DUNGEON_STORE)) {
          const dungeonStore = db.createObjectStore(this.DUNGEON_STORE, {
            keyPath: 'dungeonId',
          });

          dungeonStore.createIndex('dungeonType', 'dungeonType', { unique: false });
          dungeonStore.createIndex('dateCreated', 'dateCreated', { unique: false });
          dungeonStore.createIndex('lastModified', 'lastModified', { unique: false });
          dungeonStore.createIndex('testMode', 'testMode', { unique: false });
        }

        // Create party store for persistent party data
        if (!db.objectStoreNames.contains(this.PARTY_STORE)) {
          const partyStore = db.createObjectStore(this.PARTY_STORE, {
            keyPath: 'id',
          });

          partyStore.createIndex('name', 'name', { unique: false });
          partyStore.createIndex('inTown', 'inTown', { unique: false });
          partyStore.createIndex('campId', 'campId', { unique: false });
          partyStore.createIndex('dateCreated', 'dateCreated', { unique: false });
          partyStore.createIndex('lastModified', 'lastModified', { unique: false });
          partyStore.createIndex('memberCount', 'memberCount', { unique: false });
          partyStore.createIndex('aliveCount', 'aliveCount', { unique: false });
        }

        // Create party position store for tracking party locations/state in dungeons
        if (!db.objectStoreNames.contains(this.PARTY_POSITION_STORE)) {
          const partyPositionStore = db.createObjectStore(this.PARTY_POSITION_STORE, {
            keyPath: 'partyId',
          });

          partyPositionStore.createIndex('dungeonId', 'dungeonId', { unique: false });
          partyPositionStore.createIndex('currentFloor', 'currentFloor', { unique: false });
          partyPositionStore.createIndex('lastSaved', 'lastSaved', { unique: false });
        }

        console.log('IndexedDB upgrade completed');
      };
    });
  }

  /**
   * Save character to IndexedDB
   * @param {Object} character - Character object to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveCharacter(character: any): Promise<boolean> {
    try {
      // NEW: Validate team membership before saving
      if (character.validateTeamMembership) {
        try {
          character.validateTeamMembership();
        } catch (validationError: any) {
          console.warn(
            `Team membership validation warning for ${character.name}:`,
            validationError.message
          );
          // Don't throw - just warn for now to avoid breaking existing saves
        }
      }

      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CHARACTER_STORE], 'readwrite');
      const store = transaction.objectStore(this.CHARACTER_STORE);

      // Prepare character data for storage
      const characterData = {
        id: character.id,
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        experience: character.experience,
        attributes: { ...character.attributes },
        currentHP: character.currentHP,
        maxHP: character.maxHP,
        currentSP: character.currentSP,
        maxSP: character.maxSP,
        isAlive: character.isAlive,
        status: character.status,
        age: character.age,
        equipment: character.equipment ? { ...character.equipment } : {},
        inventory: character.inventory ? [...character.inventory] : [],
        memorizedSpells: character.memorizedSpells
          ? { ...character.memorizedSpells }
          : { arcane: [], divine: [] },
        conditions: character.conditions ? [...character.conditions] : [],
        temporaryEffects: character.temporaryEffects ? [...character.temporaryEffects] : [],
        classHistory: character.classHistory ? [...character.classHistory] : [],
        partyId: character.partyId || null,

        // NEW: Phased out system properties
        isPhasedOut: character.isPhasedOut || false,
        phaseOutReason: character.phaseOutReason || null,
        phaseOutDate: character.phaseOutDate || null,
        canPhaseBackIn: character.canPhaseBackIn !== undefined ? character.canPhaseBackIn : true,

        // NEW: Team assignment tracking
        originalTeamAssignment: character.originalTeamAssignment || null,
        teamAssignmentDate: character.teamAssignmentDate || null,
        teamLoyalty: character.teamLoyalty !== undefined ? character.teamLoyalty : 100,

        dateCreated: character.dateCreated || Date.now(),
        lastModified: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(characterData);

        request.onsuccess = () => {
          console.log(`Character ${character.name} saved to IndexedDB`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to save character:', request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error('Failed to save character:', error);
      return false;
    }
  }

  /**
   * Load character from IndexedDB
   * @param {string} characterId - Character ID to load
   * @returns {Promise<Object|null>} Character data or null
   */
  static async loadCharacter(characterId: string): Promise<CharacterData | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CHARACTER_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARACTER_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(characterId);

        request.onsuccess = () => {
          const character = request.result;
          if (character) {
            console.log(`Character ${character.name} loaded from IndexedDB`);
          }
          resolve(character || null);
        };

        request.onerror = () => {
          console.error('Failed to load character:', request.error);
          reject(null);
        };
      });
    } catch (error: any) {
      console.error('Failed to load character:', error);
      return null;
    }
  }

  /**
   * Load all characters from IndexedDB
   * @returns {Promise<Array>} Array of character objects
   */
  static async loadAllCharacters(): Promise<CharacterData[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CHARACTER_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARACTER_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const characters = request.result || [];
          console.log(`Loaded ${characters.length} characters from IndexedDB`);
          resolve(characters);
        };

        request.onerror = () => {
          console.error('Failed to load characters:', request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error('Failed to load characters:', error);
      return [];
    }
  }

  /**
   * Delete character from IndexedDB
   * @param {string} characterId - Character ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteCharacter(characterId: string): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CHARACTER_STORE], 'readwrite');
      const store = transaction.objectStore(this.CHARACTER_STORE);

      return new Promise((resolve, reject) => {
        const request = store.delete(characterId);

        request.onsuccess = () => {
          console.log(`Character ${characterId} deleted from IndexedDB`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to delete character:', request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error('Failed to delete character:', error);
      return false;
    }
  }

  /**
   * Query characters by criteria
   * @param {Object} criteria - Query criteria (race, class, level, status, etc.)
   * @returns {Promise<Array>} Array of matching characters
   */
  static async queryCharacters(criteria: Record<string, any> = {}): Promise<CharacterData[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CHARACTER_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARACTER_STORE);

      // If no criteria, return all characters
      if (Object.keys(criteria).length === 0) {
        return this.loadAllCharacters();
      }

      // Use index if available
      const indexName = Object.keys(criteria)[0];
      const indexValue = criteria[indexName];

      return new Promise((resolve, reject) => {
        let request;

        if (store.indexNames.contains(indexName)) {
          const index = store.index(indexName);
          request = index.getAll(indexValue);
        } else {
          // Fallback to full scan
          request = store.getAll();
        }

        request.onsuccess = () => {
          let characters = request.result || [];

          // Apply additional filters if using fallback
          if (!store.indexNames.contains(indexName) || Object.keys(criteria).length > 1) {
            characters = characters.filter((char) => {
              return Object.entries(criteria).every(([key, value]) => {
                return char[key] === value;
              });
            });
          }

          console.log(`Found ${characters.length} characters matching criteria`);
          resolve(characters);
        };

        request.onerror = () => {
          console.error('Failed to query characters:', request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error('Failed to query characters:', error);
      return [];
    }
  }

  /**
   * Get character statistics
   * @returns {Promise<Object>} Character statistics
   */
  static async getCharacterStatistics(): Promise<Record<string, unknown> | null> {
    try {
      const characters = await this.loadAllCharacters();

      const stats: {
        totalCharacters: number;
        aliveCharacters: number;
        deadCharacters: number;
        byRace: Record<string, number>;
        byClass: Record<string, number>;
        byLevel: Record<string, number>;
        byStatus: Record<string, number>;
        averageLevel: number;
        highestLevel: number;
        oldestCharacter: CharacterData | null;
        newestCharacter: CharacterData | null;
      } = {
        totalCharacters: characters.length,
        aliveCharacters: characters.filter((c) => c.isAlive).length,
        deadCharacters: characters.filter((c) => !c.isAlive).length,
        byRace: {},
        byClass: {},
        byLevel: {},
        byStatus: {},
        averageLevel: 0,
        highestLevel: 0,
        oldestCharacter: null,
        newestCharacter: null,
      };

      if (characters.length > 0) {
        // Calculate distributions
        characters.forEach((char) => {
          // Race distribution
          stats.byRace[char.race] = (stats.byRace[char.race] || 0) + 1;

          // Class distribution
          stats.byClass[char.class] = (stats.byClass[char.class] || 0) + 1;

          // Level distribution
          stats.byLevel[char.level] = (stats.byLevel[char.level] || 0) + 1;

          // Status distribution
          stats.byStatus[char.status] = (stats.byStatus[char.status] || 0) + 1;
        });

        // Calculate averages and extremes
        const levels = characters.map((c) => c.level);
        stats.averageLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
        stats.highestLevel = Math.max(...levels);

        // Find oldest and newest characters
        const sortedByDate = [...characters].sort((a: CharacterData, b: CharacterData) => ((a as any).dateCreated || 0) - ((b as any).dateCreated || 0));
        stats.oldestCharacter = sortedByDate[0];
        stats.newestCharacter = sortedByDate[sortedByDate.length - 1];
      }

      return stats;
    } catch (error: any) {
      console.error('Failed to get character statistics:', error);
      return null;
    }
  }

  /**
   * NEW: Get all active team members for a specific party
   * @param {string} partyId - Party ID to find members for
   * @returns {Promise<Array>} Array of active team members
   */
  static async getActiveTeamMembers(partyId: string): Promise<CharacterData[]> {
    try {
      const allCharacters = await this.loadAllCharacters();
      return allCharacters.filter(
        (char) =>
          (char as any).partyId === partyId && !(char as any).isPhasedOut && !this.isCharacterPermanentlyLost(char)
      );
    } catch (error: any) {
      console.error('Failed to get active team members:', error);
      return [];
    }
  }

  /**
   * NEW: Get all phased out team members for a specific party
   * @param {string} partyId - Party ID to find phased out members for
   * @returns {Promise<Array>} Array of phased out team members
   */
  static async getPhasedOutTeamMembers(partyId: string): Promise<CharacterData[]> {
    try {
      const allCharacters = await this.loadAllCharacters();
      return allCharacters.filter((char) => (char as any).partyId === partyId && (char as any).isPhasedOut);
    } catch (error: any) {
      console.error('Failed to get phased out team members:', error);
      return [];
    }
  }

  /**
   * NEW: Check if character is permanently lost (memorial state)
   * Helper method for team membership validation
   * @param {Object} character - Character to check
   * @returns {boolean} True if character is permanently lost
   */
  static isCharacterPermanentlyLost(character: Record<string, any> | null): boolean {
    if (!character) return false;
    return (
      character.status === 'lost' ||
      character.status === 'uninstalled' ||
      character.isLost === true ||
      (character.status === 'ashes' && character.isLost)
    );
  }

  /**
   * Save character templates (legacy localStorage method)
   */
  static saveCharacterTemplates(templates: CharacterData[]): boolean {
    try {
      const templatesData = {
        templates: templates,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(templatesData);
      localStorage.setItem(this.CHARACTERS_KEY, serialized);

      return true;
    } catch (error: any) {
      console.error('Failed to save character templates:', error);
      return false;
    }
  }

  /**
   * Load character templates
   */
  static loadCharacterTemplates(): CharacterData[] {
    try {
      const serialized = localStorage.getItem(this.CHARACTERS_KEY);

      if (!serialized) {
        return [];
      }

      const data = JSON.parse(serialized);
      return data.templates || [];
    } catch (error: any) {
      console.error('Failed to load character templates:', error);
      return [];
    }
  }

  /**
   * Validate save data structure
   */
  static validateSaveData(saveData: Record<string, unknown>): boolean {
    if (!saveData || typeof saveData !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['timestamp', 'version'];
    for (const field of requiredFields) {
      if (!(field in saveData)) {
        return false;
      }
    }

    // Check version compatibility
    if (saveData.version !== '1.0.0') {
      console.warn('Save data version mismatch:', saveData.version);
      // For now, we'll allow it but this is where migration logic would go
    }

    return true;
  }

  /**
   * Export save data as JSON string
   */
  static exportSave(): string {
    const saveData = this.loadGame();
    if (!saveData) {
      throw new Error('No save data to export');
    }

    return JSON.stringify(saveData, null, 2);
  }

  /**
   * Import save data from JSON string
   */
  static importSave(jsonString: string): boolean {
    try {
      const saveData = JSON.parse(jsonString);

      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data format');
      }

      this.saveGame(saveData);
      return true;
    } catch (error: any) {
      console.error('Failed to import save:', error);
      throw new Error('Failed to import save: ' + error.message);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): Record<string, unknown> | null {
    try {
      const saveSize = localStorage.getItem(this.SAVE_KEY)?.length || 0;
      const settingsSize = localStorage.getItem(this.SETTINGS_KEY)?.length || 0;
      const charactersSize = localStorage.getItem(this.CHARACTERS_KEY)?.length || 0;

      return {
        totalSize: saveSize + settingsSize + charactersSize,
        saveSize: saveSize,
        settingsSize: settingsSize,
        charactersSize: charactersSize,
        hasSave: saveSize > 0,
        hasSettings: settingsSize > 0,
        hasCharacters: charactersSize > 0,
      };
    } catch (error: any) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.CHARACTERS_KEY);

      console.log('All stored data cleared');
      return true;
    } catch (error: any) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available storage space
   */
  static getAvailableSpace(): Record<string, number> | null {
    try {
      const totalSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
      let usedSize = 0;

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usedSize += localStorage[key].length;
        }
      }

      return {
        total: totalSize,
        used: usedSize,
        available: totalSize - usedSize,
        percentage: Math.round((usedSize / totalSize) * 100),
      };
    } catch (error: any) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  // NEW: Camp and Resume System

  /**
   * Save party state when camping in dungeon
   * @param {Object} party - Party to save
   * @param {Object} dungeon - Current dungeon state
   * @param {Object} gameState - Current game state
   * @returns {Object} Save result
   */
  static savePartyInDungeon(party: any, dungeon: any, _gameState: Record<string, unknown> = {}): Record<string, unknown> {
    try {
      const campId = `${this.CAMP_KEY_PREFIX}${party.id}_${Date.now()}`;

      const campData = {
        campId,
        partyId: party.id,
        partyName: party.name,
        members: this.serializePartyMembers(party.members),
        location: {
          currentFloor: dungeon.currentFloor,
          playerX: dungeon.playerX,
          playerY: dungeon.playerY,
          playerDirection: dungeon.playerDirection,
          dungeonId: dungeon.id || 'main_dungeon',
        },
        campTime: Date.now(),
        resources: {
          gold: party.gold || 0,
          food: party.food || 0,
          torches: party.torches || 0,
          lightRemaining: party.lightRemaining || 0,
        },
        dungeonProgress: {
          floorsExplored: dungeon.floorsExplored || [],
          encountersDefeated: dungeon.encountersDefeated || 0,
          treasuresFound: dungeon.treasuresFound || 0,
          secretsDiscovered: dungeon.secretsDiscovered || 0,
        },
        gameVersion: '1.0.0',
        saveType: 'dungeon_camp',
      };

      // Save dungeon state separately for efficiency
      this.saveDungeonStateLocal(dungeon);

      const serialized = JSON.stringify(campData);
      localStorage.setItem(campId, serialized);

      console.log(`Party ${party.name} camped in dungeon at floor ${dungeon.currentFloor}`);

      return {
        success: true,
        campId,
        message: `${party.name} has made camp on floor ${dungeon.currentFloor}.`,
      };
    } catch (error: any) {
      console.error('Failed to save party camp:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save camp state.',
      };
    }
  }

  /**
   * Resume party from dungeon camp
   * @param {string} campId - Camp save ID to resume
   * @returns {Object} Resume result with party and dungeon data
   */
  static resumePartyFromDungeon(campId: string): Record<string, unknown> {
    try {
      const serialized = localStorage.getItem(campId);

      if (!serialized) {
        return {
          success: false,
          error: 'Camp save not found',
          message: 'The specified camp save could not be found.',
        };
      }

      const campData = JSON.parse(serialized);

      // Validate camp data
      if (!this.validateCampData(campData)) {
        return {
          success: false,
          error: 'Invalid camp data',
          message: 'The camp save data is corrupted or invalid.',
        };
      }

      // Deserialize party members
      const party = {
        id: campData.partyId,
        name: campData.partyName,
        members: this.deserializePartyMembers(campData.members),
        gold: campData.resources.gold,
        food: campData.resources.food,
        torches: campData.resources.torches,
        lightRemaining: campData.resources.lightRemaining,
      };

      // Load dungeon state
      const dungeonState = this.loadDungeonStateLocal();

      const resumeResult = {
        success: true,
        party,
        location: campData.location,
        dungeonState,
        campTime: campData.campTime,
        timeCamped: Date.now() - campData.campTime,
        dungeonProgress: campData.dungeonProgress,
        message: `${party.name} resumed exploration from floor ${campData.location.currentFloor}.`,
      };

      console.log(`Party ${party.name} resumed from camp`);
      return resumeResult;
    } catch (error: any) {
      console.error('Failed to resume party from camp:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to resume from camp.',
      };
    }
  }

  /**
   * Get list of all saved camps
   * @returns {Array} List of camp saves
   */
  static getSavedCamps(): Record<string, any>[] {
    const camps: Record<string, any>[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CAMP_KEY_PREFIX)) {
          const serialized = localStorage.getItem(key);
          if (serialized) {
            const campData = JSON.parse(serialized);
            camps.push({
              campId: key,
              partyName: campData.partyName,
              partyId: campData.partyId,
              floor: campData.location.currentFloor,
              campTime: campData.campTime,
              timeCamped: Date.now() - campData.campTime,
              memberCount: campData.members.length,
              aliveCount: campData.members.filter((m: any) => m.isAlive).length,
            });
          }
        }
      }

      // Sort by most recent first
      camps.sort((a, b) => b.campTime - a.campTime);
    } catch (error: any) {
      console.error('Failed to get saved camps:', error);
    }

    return camps;
  }

  /**
   * Delete a saved camp
   * @param {string} campId - Camp ID to delete
   * @returns {boolean} Success status
   */
  static deleteCamp(campId: string): boolean {
    try {
      localStorage.removeItem(campId);
      console.log(`Deleted camp: ${campId}`);
      return true;
    } catch (error: any) {
      console.error('Failed to delete camp:', error);
      return false;
    }
  }

  /**
   * Save dungeon state (floors, exploration data)
   * @param {Object} dungeon - Dungeon object to save
   * @returns {boolean} Success status
   */
  static saveDungeonStateLocal(dungeon: Record<string, any>): boolean {
    try {
      const dungeonStates = this.loadDungeonStates() || {};

      const dungeonId = dungeon.id || 'main_dungeon';
      dungeonStates[dungeonId] = {
        currentFloor: dungeon.currentFloor,
        floors: dungeon.floors || {},
        floorsExplored: dungeon.floorsExplored || [],
        playerX: dungeon.playerX,
        playerY: dungeon.playerY,
        playerDirection: dungeon.playerDirection,
        encountersDefeated: dungeon.encountersDefeated || 0,
        treasuresFound: dungeon.treasuresFound || 0,
        secretsDiscovered: dungeon.secretsDiscovered || 0,
        lastSaved: Date.now(),
      };

      const serialized = JSON.stringify(dungeonStates);
      localStorage.setItem(this.DUNGEON_STATE_KEY, serialized);

      return true;
    } catch (error: any) {
      console.error('Failed to save dungeon state:', error);
      return false;
    }
  }

  /**
   * Load specific dungeon state
   * @param {string} dungeonId - Dungeon ID to load
   * @returns {Object|null} Dungeon state or null
   */
  static loadDungeonStateLocal(dungeonId: string = 'main_dungeon'): Record<string, unknown> | null {
    try {
      const dungeonStates = this.loadDungeonStates();
      return dungeonStates ? dungeonStates[dungeonId] : null;
    } catch (error: any) {
      console.error('Failed to load dungeon state:', error);
      return null;
    }
  }

  /**
   * Load all dungeon states
   * @returns {Object|null} All dungeon states or null
   */
  static loadDungeonStates(): Record<string, Record<string, unknown>> | null {
    try {
      const serialized = localStorage.getItem(this.DUNGEON_STATE_KEY);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error: any) {
      console.error('Failed to load dungeon states:', error);
      return null;
    }
  }

  /**
   * Serialize party members for storage
   * @param {Array} members - Party members array
   * @returns {Array} Serialized member data
   */
  static serializePartyMembers(members: CharacterData[]): Record<string, any>[] {
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      race: member.race,
      class: member.class,
      level: member.level,
      experience: member.experience,
      attributes: { ...member.attributes },
      currentHP: member.currentHP,
      maxHP: member.maxHP,
      currentSP: member.currentSP,
      maxSP: member.maxSP,
      isAlive: member.isAlive,
      status: member.status,
      age: member.age,
      equipment: member.equipment ? { ...member.equipment } : {},
      inventory: member.inventory ? [...member.inventory] : [],
      memorizedSpells: member.memorizedSpells
        ? { ...member.memorizedSpells }
        : { arcane: [], divine: [] },
      conditions: member.conditions ? [...member.conditions] : [],
      temporaryEffects: member.temporaryEffects ? [...member.temporaryEffects] : [],
      classHistory: member.classHistory ? [...member.classHistory] : [],
    }));
  }

  /**
   * Deserialize party members from storage
   * @param {Array} serializedMembers - Serialized member data
   * @returns {Array} Deserialized party members
   */
  static deserializePartyMembers(serializedMembers: CharacterData[]): CharacterData[] {
    return serializedMembers.map((memberData) => {
      // Reconstruct member object with proper structure
      const member = { ...memberData };

      // Ensure arrays and objects are properly reconstructed
      member.inventory = memberData.inventory || [];
      member.memorizedSpells = memberData.memorizedSpells || { arcane: [], divine: [] };
      member.conditions = memberData.conditions || [];
      member.temporaryEffects = memberData.temporaryEffects || [];
      member.classHistory = memberData.classHistory || [];

      return member;
    });
  }

  /**
   * Validate camp save data
   * @param {Object} campData - Camp data to validate
   * @returns {boolean} Whether data is valid
   */
  static validateCampData(campData: Record<string, any>): boolean {
    if (!campData || typeof campData !== 'object') return false;

    const requiredFields = [
      'campId',
      'partyId',
      'partyName',
      'members',
      'location',
      'campTime',
      'resources',
    ];

    for (const field of requiredFields) {
      if (!(field in campData)) {
        console.warn(`Missing required field in camp data: ${field}`);
        return false;
      }
    }

    // Validate location data
    if (
      !campData.location.currentFloor ||
      campData.location.playerX === undefined ||
      campData.location.playerY === undefined
    ) {
      console.warn('Invalid location data in camp save');
      return false;
    }

    // Validate members array
    if (!Array.isArray(campData.members) || campData.members.length === 0) {
      console.warn('Invalid members data in camp save');
      return false;
    }

    return true;
  }

  /**
   * Get camp save statistics
   * @returns {Object} Camp save statistics
   */
  static getCampStatistics(): Record<string, unknown> {
    const camps = this.getSavedCamps();

    return {
      totalCamps: camps.length,
      partiesInDungeons: new Set(camps.map((c) => c.partyId)).size,
      oldestCamp: camps.length > 0 ? Math.min(...camps.map((c) => c.campTime)) : null,
      newestCamp: camps.length > 0 ? Math.max(...camps.map((c) => c.campTime)) : null,
      averageFloor:
        camps.length > 0
          ? Math.round(camps.reduce((sum, c) => sum + c.floor, 0) / camps.length)
          : 0,
      deepestFloor: camps.length > 0 ? Math.max(...camps.map((c) => c.floor)) : 0,
    };
  }

  /**
   * Clean up old camp saves (older than specified days)
   * @param {number} maxAgeDays - Maximum age in days before cleanup
   * @returns {Object} Cleanup result
   */
  static cleanupOldCamps(maxAgeDays: number = 30): Record<string, unknown> {
    const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    try {
      const camps = this.getSavedCamps();

      for (const camp of camps) {
        if (camp.campTime < cutoffTime) {
          this.deleteCamp(camp.campId);
          deletedCount++;
        }
      }

      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old camp saves.`,
      };
    } catch (error: any) {
      console.error('Failed to cleanup old camps:', error);
      return {
        success: false,
        error: error.message,
        deletedCount: 0,
      };
    }
  }

  /**
   * Export camp save data for backup
   * @param {string} campId - Camp ID to export
   * @returns {string|null} JSON string of camp data
   */
  static exportCamp(campId: string): string | null {
    try {
      const serialized = localStorage.getItem(campId);
      if (!serialized) return null;

      const campData = JSON.parse(serialized);
      return JSON.stringify(campData, null, 2);
    } catch (error: any) {
      console.error('Failed to export camp:', error);
      return null;
    }
  }

  /**
   * Import camp save data from backup
   * @param {string} jsonString - JSON string of camp data
   * @returns {Object} Import result
   */
  static importCamp(jsonString: string): Record<string, unknown> {
    try {
      const campData = JSON.parse(jsonString);

      if (!this.validateCampData(campData)) {
        return {
          success: false,
          error: 'Invalid camp data format',
        };
      }

      // Generate new camp ID to avoid conflicts
      const newCampId = `${this.CAMP_KEY_PREFIX}${campData.partyId}_${Date.now()}`;
      campData.campId = newCampId;

      const serialized = JSON.stringify(campData);
      localStorage.setItem(newCampId, serialized);

      return {
        success: true,
        campId: newCampId,
        partyName: campData.partyName,
        message: `Imported camp for ${campData.partyName}.`,
      };
    } catch (error: any) {
      console.error('Failed to import camp:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Entity Management System

  /**
   * Load entity data from JSON files into IndexedDB
   * @returns {Promise<boolean>} Success status
   */
  /**
   * Check if entities need to be updated from JSON files
   * @returns {Promise<boolean>} Whether entities need updating
   */
  static async needsEntityUpdate(): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        return true; // If DB fails, assume we need to load
      }

      const transaction = this._db!.transaction([this.VERSION_STORE], 'readonly');
      const store = transaction.objectStore(this.VERSION_STORE);

      return new Promise((resolve, _reject) => {
        const request = store.get('entity_version');

        request.onsuccess = () => {
          const versionRecord = request.result;
          if (!versionRecord || versionRecord.version !== this.ENTITY_VERSION) {
            console.log('Entity version mismatch or missing, update needed');
            resolve(true);
          } else {
            console.log('Entity version matches, no update needed');
            resolve(false);
          }
        };

        request.onerror = () => {
          console.log('Failed to check entity version, assuming update needed');
          resolve(true);
        };
      });
    } catch (error: any) {
      console.error('Error checking entity version:', error);
      return true; // If error, assume we need to load
    }
  }

  /**
   * Update entity version record
   * @returns {Promise<boolean>} Success status
   */
  static async updateEntityVersion(): Promise<boolean> {
    try {
      const transaction = this._db!.transaction([this.VERSION_STORE], 'readwrite');
      const store = transaction.objectStore(this.VERSION_STORE);

      const versionRecord = {
        id: 'entity_version',
        version: this.ENTITY_VERSION,
        lastUpdated: Date.now(),
        entityTypes: this.ENTITY_TYPES,
      };

      return new Promise((resolve, reject) => {
        const request = store.put(versionRecord);

        request.onsuccess = () => {
          console.log(`Entity version updated to ${this.ENTITY_VERSION}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to update entity version:', request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error('Error updating entity version:', error);
      return false;
    }
  }

  /**
   * Load entity data from migration files into IndexedDB
   * @param {boolean} forceReload - Force reload even if version matches
   * @returns {Promise<boolean>} Success status
   */
  static async loadEntitiesFromJSON(forceReload: boolean = false): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      // Check if update is needed (unless forced)
      if (!forceReload && !(await this.needsEntityUpdate())) {
        console.log('Entities are up to date, skipping migration load');
        return true;
      }

      console.log('Loading entities from migration files...');

      // Load all entities from migrations
      const weapons = await this.loadEntityMigration('weapons');
      await this.bulkSaveEntities(this.WEAPON_STORE, weapons);

      const armor = await this.loadEntityMigration('armor');
      await this.bulkSaveEntities(this.ARMOR_STORE, armor);

      const shields = await this.loadEntityMigration('shields');
      await this.bulkSaveEntities(this.SHIELD_STORE, shields);

      const accessories = await this.loadEntityMigration('accessories');
      await this.bulkSaveEntities(this.ACCESSORY_STORE, accessories);

      const spells = await this.loadEntityMigration('spells');
      await this.bulkSaveEntities(this.SPELL_STORE, spells);

      const conditions = await this.loadEntityMigration('conditions');
      await this.bulkSaveEntities(this.CONDITION_STORE, conditions);

      const effects = await this.loadEntityMigration('effects');
      await this.bulkSaveEntities(this.EFFECT_STORE, effects);

      const monsters = await this.loadEntityMigration('monsters');
      await this.bulkSaveEntities(this.MONSTER_STORE, monsters);

      // Update version record after successful load
      await this.updateEntityVersion();

      console.log('All entities loaded successfully from migration files');
      return true;
    } catch (error: any) {
      console.error('Failed to load entities from migrations:', error);
      return false;
    }
  }

  /**
   * Bulk save entities to a store
   * @param {string} storeName - Name of the store
   * @param {Object} entities - Object containing entities to save
   * @returns {Promise<boolean>} Success status
   */
  static async bulkSaveEntities(storeName: string, entities: Record<string, Record<string, unknown>>): Promise<boolean> {
    try {
      const transaction = this._db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const [id, entity] of Object.entries(entities)) {
        const entityData = { id, ...(entity as any) };
        store.put(entityData);
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`Bulk saved ${Object.keys(entities).length} entities to ${storeName}`);
          resolve(true);
        };

        transaction.onerror = () => {
          console.error(`Failed to bulk save entities to ${storeName}:`, transaction.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error(`Failed to bulk save entities to ${storeName}:`, error);
      return false;
    }
  }

  /**
   * Get entity by ID
   * @param {string} storeName - Name of the store
   * @param {string} entityId - Entity ID to retrieve
   * @returns {Promise<Object|null>} Entity data or null
   */
  static async getEntity(storeName: string, entityId: string): Promise<any> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(entityId);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error(`Failed to get entity ${entityId} from ${storeName}:`, request.error);
          reject(null);
        };
      });
    } catch (error: any) {
      console.error(`Failed to get entity ${entityId} from ${storeName}:`, error);
      return null;
    }
  }

  /**
   * Get weapon by ID
   * @param {string} weaponId - Weapon ID to retrieve
   * @returns {Promise<Object|null>} Weapon data or null
   */
  static async getWeapon(weaponId: string): Promise<EquipmentItem | null> {
    return this.getEntity(this.WEAPON_STORE, weaponId);
  }

  /**
   * Get armor by ID
   * @param {string} armorId - Armor ID to retrieve
   * @returns {Promise<Object|null>} Armor data or null
   */
  static async getArmor(armorId: string): Promise<EquipmentItem | null> {
    return this.getEntity(this.ARMOR_STORE, armorId);
  }

  /**
   * Get shield by ID
   * @param {string} shieldId - Shield ID to retrieve
   * @returns {Promise<Object|null>} Shield data or null
   */
  static async getShield(shieldId: string): Promise<EquipmentItem | null> {
    return this.getEntity(this.SHIELD_STORE, shieldId);
  }

  /**
   * Get accessory by ID
   * @param {string} accessoryId - Accessory ID to retrieve
   * @returns {Promise<Object|null>} Accessory data or null
   */
  static async getAccessory(accessoryId: string): Promise<EquipmentItem | null> {
    return this.getEntity(this.ACCESSORY_STORE, accessoryId);
  }

  /**
   * Get spell by ID
   * @param {string} spellId - Spell ID to retrieve
   * @returns {Promise<Object|null>} Spell data or null
   */
  static async getSpell(spellId: string): Promise<SpellData | null> {
    return this.getEntity(this.SPELL_STORE, spellId);
  }

  /**
   * Get condition by ID
   * @param {string} conditionId - Condition ID to retrieve
   * @returns {Promise<Object|null>} Condition data or null
   */
  static async getCondition(conditionId: string): Promise<Record<string, any> | null> {
    return this.getEntity(this.CONDITION_STORE, conditionId);
  }

  /**
   * Get effect by ID
   * @param {string} effectId - Effect ID to retrieve
   * @returns {Promise<Object|null>} Effect data or null
   */
  static async getEffect(effectId: string): Promise<Record<string, any> | null> {
    return this.getEntity(this.EFFECT_STORE, effectId);
  }

  /**
   * Get monster by ID
   * @param {string} monsterId - Monster ID to retrieve
   * @returns {Promise<Object|null>} Monster data or null
   */
  static async getMonster(monsterId: string): Promise<MonsterData | null> {
    return this.getEntity(this.MONSTER_STORE, monsterId);
  }

  /**
   * Get all entities from a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<Array>} Array of entities
   */
  static async getAllEntities(storeName: string): Promise<any[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          console.error(`Failed to get all entities from ${storeName}:`, request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error(`Failed to get all entities from ${storeName}:`, error);
      return [];
    }
  }

  /**
   * Get all weapons
   * @returns {Promise<Array>} Array of weapons
   */
  static async getAllWeapons(): Promise<EquipmentItem[]> {
    return this.getAllEntities(this.WEAPON_STORE);
  }

  /**
   * Get all armor
   * @returns {Promise<Array>} Array of armor
   */
  static async getAllArmor(): Promise<EquipmentItem[]> {
    return this.getAllEntities(this.ARMOR_STORE);
  }

  /**
   * Get all shields
   * @returns {Promise<Array>} Array of shields
   */
  static async getAllShields(): Promise<EquipmentItem[]> {
    return this.getAllEntities(this.SHIELD_STORE);
  }

  /**
   * Get all accessories
   * @returns {Promise<Array>} Array of accessories
   */
  static async getAllAccessories(): Promise<EquipmentItem[]> {
    return this.getAllEntities(this.ACCESSORY_STORE);
  }

  /**
   * Get all spells
   * @returns {Promise<Array>} Array of spells
   */
  static async getAllSpells(): Promise<SpellData[]> {
    return this.getAllEntities(this.SPELL_STORE);
  }

  /**
   * Get all conditions
   * @returns {Promise<Array>} Array of conditions
   */
  static async getAllConditions(): Promise<Record<string, any>[]> {
    return this.getAllEntities(this.CONDITION_STORE);
  }

  /**
   * Get all effects
   * @returns {Promise<Array>} Array of effects
   */
  static async getAllEffects(): Promise<Record<string, any>[]> {
    return this.getAllEntities(this.EFFECT_STORE);
  }

  /**
   * Get all monsters
   * @returns {Promise<Array>} Array of monsters
   */
  static async getAllMonsters(): Promise<MonsterData[]> {
    return this.getAllEntities(this.MONSTER_STORE);
  }

  /**
   * Query entities by criteria
   * @param {string} storeName - Name of the store
   * @param {Object} criteria - Query criteria
   * @returns {Promise<Array>} Array of matching entities
   */
  static async queryEntities(storeName: string, criteria: Record<string, any> = {}): Promise<any[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      // If no criteria, return all entities
      if (Object.keys(criteria).length === 0) {
        return this.getAllEntities(storeName);
      }

      // Use index if available
      const indexName = Object.keys(criteria)[0];
      const indexValue = criteria[indexName];

      return new Promise((resolve, reject) => {
        let request;

        if (store.indexNames.contains(indexName)) {
          const index = store.index(indexName);
          request = index.getAll(indexValue);
        } else {
          // Fallback to full scan
          request = store.getAll();
        }

        request.onsuccess = () => {
          let entities = request.result || [];

          // Apply additional filters if using fallback or multiple criteria
          if (!store.indexNames.contains(indexName) || Object.keys(criteria).length > 1) {
            entities = entities.filter((entity) => {
              return Object.entries(criteria).every(([key, value]) => {
                return entity[key] === value;
              });
            });
          }

          resolve(entities);
        };

        request.onerror = () => {
          console.error(`Failed to query entities from ${storeName}:`, request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error(`Failed to query entities from ${storeName}:`, error);
      return [];
    }
  }

  /**
   * Camp save/load with entity references
   */

  /**
   * Save camp with character entity references
   * @param {Object} party - Party to save
   * @param {Object} dungeon - Current dungeon state
   * @param {Object} gameState - Current game state
   * @returns {Promise<Object>} Save result
   */
  static async saveCampWithEntityReferences(party: any, dungeon: any, _gameState: any = {}): Promise<Record<string, unknown>> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const campId = `camp_${party.id}_${Date.now()}`;

      // Use existing dungeon ID or generate one
      const dungeonId = dungeon.id || `dungeon_${party.id}_${Date.now()}`;

      // Save full dungeon state
      // Only save if it's a procedural dungeon (which they usually are in this game)
      if (dungeon.getSaveData) {
        const dungeonData = dungeon.getSaveData();
        await this.saveDungeonState(dungeonId, dungeonData);
      }

      const campData = {
        campId,
        partyId: party.id,
        partyName: party.name,

        // Store character entity references instead of full data
        memberIds: party.members.map((member: any) => member.id),

        // Quick stats for indexing
        memberCount: party.members.length,
        aliveCount: party.members.filter((m: any) => m.isAlive).length,

        location: {
          currentFloor: dungeon.currentFloor,
          playerX: dungeon.playerX,
          playerY: dungeon.playerY,
          playerDirection: dungeon.playerDirection,
          dungeonId: dungeonId,
        },

        campTime: Date.now(),

        resources: {
          gold: party.gold || 0,
          food: party.food || 0,
          torches: party.torches || 0,
          lightRemaining: party.lightRemaining || 0,
        },

        dungeonProgress: {
          floorsExplored: dungeon.floorsExplored || [],
          encountersDefeated: dungeon.encountersDefeated || 0,
          treasuresFound: dungeon.treasuresFound || 0,
          secretsDiscovered: dungeon.secretsDiscovered || 0,
        },

        gameVersion: '1.0.0',
        saveType: 'dungeon_camp',
      };

      // Save to IndexedDB camps store
      const transaction = this._db!.transaction([this.CAMP_STORE], 'readwrite');
      const store = transaction.objectStore(this.CAMP_STORE);

      return new Promise((resolve, reject) => {
        const request = store.put(campData);

        request.onsuccess = () => {
          console.log(`Camp saved with entity references: ${campId}`);
          resolve({
            success: true,
            campId,
            message: `${party.name} has made camp on floor ${dungeon.currentFloor}.`,
          });
        };

        request.onerror = () => {
          console.error('Failed to save camp with entity references:', request.error);
          reject({
            success: false,
            error: request.error!.message,
            message: 'Failed to save camp state.',
          });
        };
      });
    } catch (error: any) {
      console.error('Failed to save camp with entity references:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save camp state.',
      };
    }
  }

  /**
   * Resume camp and load characters by entity references
   * @param {string} campId - Camp ID to resume
   * @returns {Promise<Object>} Resume result with party and dungeon data
   */
  static async resumeCampWithEntityReferences(campId: string): Promise<Record<string, unknown>> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      // Get camp data
      const transaction = this._db!.transaction([this.CAMP_STORE], 'readonly');
      const store = transaction.objectStore(this.CAMP_STORE);

      const campData = await new Promise((resolve, reject) => {
        const request = store.get(campId);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });

      if (!campData) {
        return {
          success: false,
          error: 'Camp save not found',
          message: 'The specified camp save could not be found.',
        };
      }

      // Load characters by entity references
      const members: CharacterData[] = [];
      for (const memberId of (campData as any).memberIds) {
        const character = await this.loadCharacter(memberId);
        if (character) {
          members.push(character);
        }
      }

      const party = {
        id: (campData as any).partyId,
        name: (campData as any).partyName,
        members,
        gold: (campData as any).resources.gold,
        food: (campData as any).resources.food,
        torches: (campData as any).resources.torches,
        lightRemaining: (campData as any).resources.lightRemaining,
      };

      return {
        success: true,
        party,
        location: (campData as any).location,
        campTime: (campData as any).campTime,
        timeCamped: Date.now() - (campData as any).campTime,
        dungeonProgress: (campData as any).dungeonProgress,
        message: `${party.name} resumed exploration from floor ${(campData as any).location.currentFloor}.`,
      };
    } catch (error: any) {
      console.error('Failed to resume camp with entity references:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to resume from camp.',
      };
    }
  }

  /**
   * Get all camps with enhanced queries
   * @param {Object} criteria - Query criteria
   * @returns {Promise<Array>} Array of camp data
   */
  static async getAllCamps(criteria: Record<string, any> = {}): Promise<CampData[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      return this.queryEntities(this.CAMP_STORE, criteria);
    } catch (error: any) {
      console.error('Failed to get all camps:', error);
      return [];
    }
  }

  /**
   * Delete camp from IndexedDB
   * @param {string} campId - Camp ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteCampFromDB(campId: string): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.CAMP_STORE], 'readwrite');
      const store = transaction.objectStore(this.CAMP_STORE);

      return new Promise((resolve, reject) => {
        const request = store.delete(campId);

        request.onsuccess = () => {
          console.log(`Camp deleted from IndexedDB: ${campId}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error(`Failed to delete camp from IndexedDB: ${campId}`, request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error(`Failed to delete camp from IndexedDB: ${campId}`, error);
      return false;
    }
  }

  /**
   * Save dungeon state to IndexedDB
   * @param {string} dungeonId - Dungeon ID
   * @param {Object} dungeonData - Dungeon save data
   * @returns {Promise<boolean>} Success status
   */
  static async saveDungeonState(dungeonId: string, dungeonData: Record<string, unknown>): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.DUNGEON_STORE], 'readwrite');
      const store = transaction.objectStore(this.DUNGEON_STORE);

      const record = {
        dungeonId,
        data: dungeonData,
        lastModified: Date.now(),
        type: 'procedural',
      };

      return new Promise((resolve, reject) => {
        const request = store.put(record);

        request.onsuccess = () => {
          console.log(`Dungeon state saved: ${dungeonId}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to save dungeon state:', request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error('Failed to save dungeon state:', error);
      return false;
    }
  }

  /**
   * Load dungeon state from IndexedDB
   * @param {string} dungeonId - Dungeon ID to load
   * @returns {Promise<Object|null>} Dungeon data or null
   */
  static async loadDungeonState(dungeonId: string): Promise<Record<string, unknown> | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.DUNGEON_STORE], 'readonly');
      const store = transaction.objectStore(this.DUNGEON_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(dungeonId);

        request.onsuccess = () => {
          resolve(request.result ? request.result.data : null);
        };

        request.onerror = () => {
          console.error('Failed to load dungeon state:', request.error);
          reject(null);
        };
      });
    } catch (error: any) {
      console.error('Failed to load dungeon state:', error);
      return null;
    }
  }

  /**
   * Force reload entities from JSON files (for development)
   * @returns {Promise<boolean>} Success status
   */
  static async forceReloadEntities(): Promise<boolean> {
    console.log('Force reloading entities from JSON files...');
    return await this.loadEntitiesFromJSON(true);
  }

  /**
   * Clear all entity stores (for development)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllEntities(): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const stores = [
        this.WEAPON_STORE,
        this.ARMOR_STORE,
        this.SHIELD_STORE,
        this.ACCESSORY_STORE,
        this.SPELL_STORE,
        this.CONDITION_STORE,
        this.EFFECT_STORE,
        this.MONSTER_STORE,
        this.VERSION_STORE,
      ];

      const transaction = this._db!.transaction(stores, 'readwrite');

      return new Promise((resolve, reject) => {
        let completedStores = 0;

        stores.forEach((storeName) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => {
            completedStores++;
            console.log(`Cleared ${storeName} store`);

            if (completedStores === stores.length) {
              console.log('All entity stores cleared');
              resolve(true);
            }
          };

          request.onerror = () => {
            console.error(`Failed to clear ${storeName} store:`, request.error);
            reject(false);
          };
        });
      });
    } catch (error: any) {
      console.error('Failed to clear entity stores:', error);
      return false;
    }
  }

  /**
   * Get entity version information
   * @returns {Promise<Object>} Version information
   */
  static async getEntityVersionInfo(): Promise<Record<string, unknown> | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.VERSION_STORE], 'readonly');
      const store = transaction.objectStore(this.VERSION_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get('entity_version');

        request.onsuccess = () => {
          const versionRecord = request.result;
          resolve({
            currentVersion: this.ENTITY_VERSION,
            storedVersion: versionRecord?.version || 'none',
            needsUpdate: !versionRecord || versionRecord.version !== this.ENTITY_VERSION,
            lastUpdated: versionRecord?.lastUpdated || null,
            entityTypes: this.ENTITY_TYPES,
          });
        };

        request.onerror = () => {
          console.error('Failed to get version info:', request.error);
          reject(null);
        };
      });
    } catch (error: any) {
      console.error('Error getting version info:', error);
      return null;
    }
  }

  /**
   * Load entity migration by type
   */
  static async loadEntityMigration(entityType: string): Promise<Record<string, Record<string, unknown>>> {
    try {
      let migration;

      switch (entityType) {
        case 'weapons':
          migration = weaponsMigration;
          break;
        case 'armor':
          migration = armorMigration;
          break;
        case 'shields':
          migration = shieldsMigration;
          break;
        case 'accessories':
          migration = accessoriesMigration;
          break;
        case 'spells':
          migration = spellsMigration;
          break;
        case 'conditions':
          migration = conditionsMigration;
          break;
        case 'effects':
          migration = effectsMigration;
          break;
        case 'monsters':
          migration = monstersMigration;
          break;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      // Validate migration
      if (!migration || !migration.data || !migration.version) {
        throw new Error(`Invalid migration for ${entityType}`);
      }

      console.log(
        `Loading ${entityType} migration v${migration.version}: ${migration.description}`
      );

      // Apply any transformations
      let data: Record<string, any> = migration.data;
      if (migration.transform) {
        data = Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
          acc[key] = migration.transform(value);
          return acc;
        }, {});
      }

      // Validate data if validation function exists
      if (migration.validate) {
        const invalidEntries = Object.entries(data).filter(
          ([_key, value]) => !migration.validate(value)
        );
        if (invalidEntries.length > 0) {
          console.warn(`Invalid entries in ${entityType}:`, invalidEntries);
        }
      }

      return data;
    } catch (error: any) {
      console.error(`Failed to load ${entityType} migration:`, error);
      throw error;
    }
  }

  /**
   * Get embedded weapons data (CORS fallback)
   */
  static async getEmbeddedWeapons(): Promise<Record<string, Record<string, unknown>>> {
    return {
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
    };
  }

  /**
   * Get embedded armor data (CORS fallback)
   */
  static async getEmbeddedArmor(): Promise<Record<string, Record<string, unknown>>> {
    return {
      armor_leather_001: {
        name: 'Leather Armor',
        type: 'armor',
        subtype: 'light',
        acBonus: 2,
        weight: 15,
        value: 100,
        allowedClasses: ['all'],
      },
      armor_studded_leather_001: {
        name: 'Studded Leather',
        type: 'armor',
        subtype: 'light',
        acBonus: 3,
        weight: 20,
        value: 250,
        allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja'],
      },
      armor_chain_mail_001: {
        name: 'Chain Mail',
        type: 'armor',
        subtype: 'medium',
        acBonus: 5,
        weight: 40,
        value: 750,
        allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
      },
      armor_plate_mail_001: {
        name: 'Plate Mail',
        type: 'armor',
        subtype: 'heavy',
        acBonus: 8,
        weight: 50,
        value: 1500,
        allowedClasses: ['Fighter', 'Lord', 'Samurai'],
      },
      armor_chain_mail_plus_1_001: {
        name: 'Chain Mail +1',
        type: 'armor',
        subtype: 'medium',
        acBonus: 6,
        weight: 40,
        value: 2000,
        allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
        magical: true,
      },
      armor_vulnerability_001: {
        name: 'Armor of Vulnerability',
        type: 'armor',
        subtype: 'medium',
        acBonus: -2,
        weight: 40,
        value: 100,
        allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
        cursed: true,
        curseName: 'Vulnerability Curse',
        curseEffect: 'Makes wearer more vulnerable to attacks',
        disguisedAs: 'Chain Mail +1',
        magical: true,
      },
    };
  }

  /**
   * Get embedded shields data (CORS fallback)
   */
  static async getEmbeddedShields(): Promise<Record<string, Record<string, unknown>>> {
    return {
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
    };
  }

  /**
   * Get embedded accessories data (CORS fallback)
   */
  static async getEmbeddedAccessories(): Promise<Record<string, Record<string, unknown>>> {
    return {
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
    };
  }

  /**
   * Get embedded spells data (CORS fallback)
   */
  static async getEmbeddedSpells(): Promise<Record<string, Record<string, unknown>>> {
    return {
      // Arcane Level 1
      spell_magic_missile_001: {
        id: 'spell_magic_missile_001',
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
      spell_shield_001: {
        id: 'spell_shield_001',
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
      spell_light_001: {
        id: 'spell_light_001',
        name: 'Light',
        school: 'arcane',
        level: 1,
        description: 'Creates magical illumination',
        effect: 'utility',
        range: 'touch',
        duration: 'long',
        components: ['V', 'M'],
      },
      // Arcane Level 2
      spell_web_001: {
        id: 'spell_web_001',
        name: 'Web',
        school: 'arcane',
        level: 2,
        description: 'Entangles enemies in sticky webs',
        effect: 'control',
        range: 'medium',
        duration: 'combat',
        components: ['V', 'S', 'M'],
      },
      spell_invisibility_001: {
        id: 'spell_invisibility_001',
        name: 'Invisibility',
        school: 'arcane',
        level: 2,
        description: 'Makes target invisible',
        effect: 'concealment',
        range: 'touch',
        duration: 'long',
        components: ['V', 'S', 'M'],
      },
      spell_knock_001: {
        id: 'spell_knock_001',
        name: 'Knock',
        school: 'arcane',
        level: 2,
        description: 'Opens locked doors and containers',
        effect: 'utility',
        range: 'medium',
        duration: 'instantaneous',
        components: ['V'],
      },
      // Arcane Level 3
      spell_fireball_001: {
        id: 'spell_fireball_001',
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
      spell_lightning_bolt_001: {
        id: 'spell_lightning_bolt_001',
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
      spell_dispel_magic_001: {
        id: 'spell_dispel_magic_001',
        name: 'Dispel Magic',
        school: 'arcane',
        level: 3,
        description: 'Removes magical effects',
        effect: 'dispel',
        range: 'medium',
        duration: 'instantaneous',
        components: ['V', 'S'],
      },
      // Divine Level 1
      spell_cure_light_wounds_001: {
        id: 'spell_cure_light_wounds_001',
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
      spell_bless_001: {
        id: 'spell_bless_001',
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
      spell_protection_from_evil_001: {
        id: 'spell_protection_from_evil_001',
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
      // Divine Level 2
      spell_hold_person_001: {
        id: 'spell_hold_person_001',
        name: 'Hold Person',
        school: 'divine',
        level: 2,
        description: 'Paralyzes a humanoid',
        effect: 'control',
        range: 'medium',
        duration: 'combat',
        components: ['V', 'S', 'F'],
      },
      spell_silence_001: {
        id: 'spell_silence_001',
        name: 'Silence',
        school: 'divine',
        level: 2,
        description: 'Creates zone of magical silence',
        effect: 'control',
        range: 'long',
        duration: 'combat',
        components: ['V', 'S'],
      },
      spell_spiritual_hammer_001: {
        id: 'spell_spiritual_hammer_001',
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
    };
  }

  /**
   * Get embedded conditions data (CORS fallback)
   */
  static async getEmbeddedConditions(): Promise<Record<string, Record<string, unknown>>> {
    return {
      condition_poisoned_001: {
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
    };
  }

  /**
   * Get embedded effects data (CORS fallback)
   */
  static async getEmbeddedEffects(): Promise<Record<string, Record<string, unknown>>> {
    return {
      effect_haste_001: {
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
    };
  }

  /**
   * Get embedded monsters data (CORS fallback)
   */
  static async getEmbeddedMonsters(): Promise<Record<string, Record<string, unknown>>> {
    return {
      // Level 1 Monsters
      monster_kobold_001: {
        name: 'Kobold',
        type: 'humanoid',
        level: 1,
        hitDie: 4,
        strength: 8,
        intelligence: 10,
        agility: 15,
        vitality: 9,
        armorClass: 7,
        attackBonus: 0,
        damageBonus: -1,
        attacks: [
          { name: 'Short Sword', damage: { dice: 1, sides: 6, bonus: -1 } },
          { name: 'Sling', damage: { dice: 1, sides: 4 }, range: 'ranged' },
        ],
        abilities: ['pack_tactics'],
        aiType: 'cowardly',
        preferredTargets: ['weakest'],
        experienceValue: 25,
        treasureType: 'poor',
      },
      monster_giant_rat_001: {
        name: 'Giant Rat',
        type: 'beast',
        level: 1,
        hitDie: 4,
        strength: 7,
        intelligence: 2,
        agility: 15,
        vitality: 12,
        armorClass: 7,
        attackBonus: 1,
        damageBonus: -2,
        attacks: [{ name: 'Bite', damage: { dice: 1, sides: 3 }, special: ['disease'] }],
        abilities: ['disease_bite'],
        resistances: ['disease'],
        aiType: 'aggressive',
        preferredTargets: ['random'],
        experienceValue: 10,
        treasureType: 'none',
      },
      monster_skeleton_001: {
        name: 'Skeleton',
        type: 'undead',
        level: 1,
        hitDie: 6,
        strength: 10,
        intelligence: 10,
        agility: 14,
        vitality: 15,
        armorClass: 7,
        attackBonus: 0,
        damageBonus: 0,
        attacks: [{ name: 'Claw', damage: { dice: 1, sides: 6 } }],
        resistances: ['cold', 'necrotic'],
        immunities: ['poison', 'disease'],
        aiType: 'aggressive',
        preferredTargets: ['front'],
        experienceValue: 50,
        treasureType: 'poor',
      },
      // Level 2-3 Monsters
      monster_orc_001: {
        name: 'Orc',
        type: 'humanoid',
        level: 2,
        hitDie: 6,
        strength: 16,
        intelligence: 7,
        agility: 12,
        vitality: 16,
        armorClass: 6,
        attackBonus: 1,
        damageBonus: 3,
        attacks: [
          { name: 'Battleaxe', damage: { dice: 1, sides: 8, bonus: 3 } },
          { name: 'Javelin', damage: { dice: 1, sides: 6, bonus: 3 }, range: 'thrown' },
        ],
        abilities: ['aggressive'],
        aiType: 'aggressive',
        preferredTargets: ['strongest'],
        experienceValue: 100,
        treasureType: 'standard',
      },
      monster_wolf_001: {
        name: 'Wolf',
        type: 'beast',
        level: 2,
        hitDie: 6,
        strength: 12,
        intelligence: 3,
        agility: 15,
        vitality: 12,
        armorClass: 7,
        attackBonus: 2,
        damageBonus: 1,
        attacks: [
          { name: 'Bite', damage: { dice: 2, sides: 4, bonus: 2 }, special: ['knockdown'] },
        ],
        abilities: ['pack_tactics', 'keen_hearing'],
        aiType: 'pack',
        preferredTargets: ['isolated'],
        experienceValue: 50,
        treasureType: 'none',
      },
      monster_hobgoblin_001: {
        name: 'Hobgoblin',
        type: 'humanoid',
        level: 3,
        hitDie: 8,
        strength: 13,
        intelligence: 12,
        agility: 12,
        vitality: 12,
        armorClass: 5,
        attackBonus: 2,
        damageBonus: 1,
        attacks: [
          { name: 'Longsword', damage: { dice: 1, sides: 8, bonus: 1 } },
          { name: 'Longbow', damage: { dice: 1, sides: 8, bonus: 1 }, range: 'ranged' },
        ],
        abilities: ['martial_advantage'],
        aiType: 'tactical',
        preferredTargets: ['spellcasters'],
        experienceValue: 200,
        treasureType: 'standard',
      },
      // Level 4-5 Monsters
      monster_ogre_001: {
        name: 'Ogre',
        type: 'giant',
        level: 4,
        hitDie: 10,
        strength: 19,
        intelligence: 5,
        agility: 8,
        vitality: 16,
        armorClass: 5,
        attackBonus: 3,
        damageBonus: 4,
        attacks: [
          { name: 'Greatclub', damage: { dice: 2, sides: 8, bonus: 4 } },
          { name: 'Javelin', damage: { dice: 2, sides: 6, bonus: 4 }, range: 'thrown' },
        ],
        abilities: ['powerful_build'],
        aiType: 'aggressive',
        preferredTargets: ['front'],
        experienceValue: 450,
        treasureType: 'standard',
      },
      monster_owlbear_001: {
        name: 'Owlbear',
        type: 'monstrosity',
        level: 5,
        hitDie: 10,
        strength: 20,
        intelligence: 3,
        agility: 12,
        vitality: 17,
        armorClass: 6,
        attackBonus: 4,
        damageBonus: 5,
        attacks: [
          { name: 'Claw', damage: { dice: 2, sides: 8, bonus: 5 } },
          { name: 'Bite', damage: { dice: 1, sides: 10, bonus: 5 } },
        ],
        abilities: ['multiattack', 'keen_sight'],
        aiType: 'aggressive',
        preferredTargets: ['random'],
        experienceValue: 700,
        treasureType: 'rich',
      },
      // Boss Monsters
      monster_orc_chief_001: {
        name: 'Orc Chief',
        type: 'humanoid',
        level: 6,
        hitDie: 8,
        strength: 18,
        intelligence: 12,
        agility: 12,
        vitality: 18,
        armorClass: 4,
        attackBonus: 5,
        damageBonus: 4,
        attacks: [
          { name: 'Magic Axe +1', damage: { dice: 1, sides: 8, bonus: 5 }, magical: true },
          { name: 'Spear', damage: { dice: 1, sides: 6, bonus: 4 }, range: 'thrown' },
        ],
        abilities: ['leadership', 'aggressive', 'multiattack'],
        aiType: 'tactical',
        preferredTargets: ['strongest'],
        experienceValue: 1100,
        treasureType: 'rich',
      },
      monster_young_dragon_001: {
        name: 'Young Dragon',
        type: 'dragon',
        level: 8,
        hitDie: 12,
        strength: 23,
        intelligence: 14,
        agility: 10,
        vitality: 21,
        armorClass: 2,
        attackBonus: 7,
        damageBonus: 6,
        attacks: [
          { name: 'Bite', damage: { dice: 2, sides: 10, bonus: 6 } },
          { name: 'Claw', damage: { dice: 2, sides: 6, bonus: 6 } },
          { name: 'Fire Breath', damage: { dice: 8, sides: 6 }, range: 'area', special: ['fire'] },
        ],
        abilities: ['multiattack', 'breath_weapon', 'frightful_presence', 'magic_resistance'],
        resistances: ['fire', 'physical'],
        immunities: ['fire', 'sleep', 'paralysis'],
        aiType: 'intelligent',
        preferredTargets: ['spellcasters'],
        experienceValue: 2300,
        treasureType: 'hoard',
      },
    };
  }

  /**
   * Save dungeon state to IndexedDB
   * @param {Object} dungeon - Dungeon object to save
   * @param {string} partyId - ID of the party that owns this dungeon
   * @returns {Promise<string>} Dungeon ID if successful
   */
  static async saveDungeon(dungeon: any, _partyId: string): Promise<string> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      // Use fixed dungeon ID for shared instance
      const dungeonId = 'corrupted_network';
      const now = new Date().toISOString();

      // Create deep copy of dungeon structure (without party-specific data)
      const dungeonData = {
        dungeonId,
        dungeonType: 'corrupted_network',
        maxFloors: dungeon.maxFloors,
        testMode: dungeon.testMode,

        // Convert Map to serializable object
        floors: {} as Record<string, Record<string, unknown>>,

        // Metadata
        dateCreated: now,
        lastModified: now,
      };

      // Serialize floors Map to object
      if (dungeon.floors && dungeon.floors instanceof Map) {
        for (const [floorNumber, floorData] of dungeon.floors) {
          dungeonData.floors[floorNumber] = {
            number: floorData.number,
            width: floorData.width,
            height: floorData.height,
            tiles: floorData.tiles, // 2D array
            monsters: floorData.monsters || [],
            treasures: floorData.treasures || [],
            encounters: floorData.encounters || [],
            specialSquares: floorData.specialSquares || [],
            stairs: floorData.stairs || {},
          };
        }
      }

      const transaction = this._db!.transaction([this.DUNGEON_STORE], 'readwrite');
      const store = transaction.objectStore(this.DUNGEON_STORE);

      return new Promise((resolve, reject) => {
        const request = store.put(dungeonData);

        request.onsuccess = () => {
          console.log(`Dungeon saved with ID: ${dungeonId}`);
          resolve(dungeonId);
        };

        request.onerror = () => {
          console.error('Failed to save dungeon:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to save dungeon:', error);
      throw error;
    }
  }

  /**
   * Load dungeon state from IndexedDB
   * @param {string} dungeonId - ID of the dungeon to load
   * @returns {Promise<Object|null>} Dungeon data or null if not found
   */
  static async loadDungeon(dungeonId: string): Promise<Record<string, any> | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.DUNGEON_STORE], 'readonly');
      const store = transaction.objectStore(this.DUNGEON_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(dungeonId);

        request.onsuccess = () => {
          const dungeonData = request.result;

          if (!dungeonData) {
            resolve(null);
            return;
          }

          // Reconstruct dungeon object (shared structure only)
          const reconstructedDungeon = {
            dungeonId: dungeonData.dungeonId,
            dungeonType: dungeonData.dungeonType,
            maxFloors: dungeonData.maxFloors,
            testMode: dungeonData.testMode,

            // Reconstruct Map from serialized object
            floors: new Map(),

            // Initialize empty sets for party-specific data (will be loaded separately)
            discoveredSecrets: new Set(),
            disarmedTraps: new Set(),
            usedSpecials: new Set(),

            // Default position (will be overridden by party position data)
            currentFloor: 1,
            playerX: 1,
            playerY: 2,
            playerDirection: 0,
          };

          // Reconstruct floors Map
          for (const [floorNumber, floorData] of Object.entries(dungeonData.floors || {})) {
            reconstructedDungeon.floors.set(parseInt(floorNumber), floorData);
          }

          // Set initial current floor data
          (reconstructedDungeon as any).currentFloorData = reconstructedDungeon.floors.get(
            reconstructedDungeon.currentFloor
          );

          resolve(reconstructedDungeon);
        };

        request.onerror = () => {
          console.error('Failed to load dungeon:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to load dungeon:', error);
      throw error;
    }
  }

  /**
   * Get saved dungeons for a party (now returns party position data)
   * @param {string} partyId - Party ID to find position for
   * @returns {Promise<Array>} Array containing party position if it exists
   */
  static async getSavedDungeonsForParty(partyId: string): Promise<Record<string, unknown>[]> {
    try {
      const partyPosition = await this.loadPartyPosition(partyId);
      return partyPosition ? [partyPosition] : [];
    } catch (error: any) {
      console.error('Failed to get saved dungeons for party:', error);
      return [];
    }
  }

  /**
   * Delete a saved dungeon
   * @param {string} dungeonId - ID of the dungeon to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteDungeon(dungeonId: string): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.DUNGEON_STORE], 'readwrite');
      const store = transaction.objectStore(this.DUNGEON_STORE);

      return new Promise((resolve, reject) => {
        const request = store.delete(dungeonId);

        request.onsuccess = () => {
          console.log(`Dungeon ${dungeonId} deleted successfully`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to delete dungeon:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to delete dungeon:', error);
      return false;
    }
  }

  /**
   * Save party position and state in a dungeon
   * @param {string} partyId - Party ID
   * @param {string} dungeonId - Dungeon ID
   * @param {Object} positionData - Party position and state data
   * @returns {Promise<boolean>} Success status
   */
  static async savePartyPosition(partyId: string, dungeonId: string, positionData: Record<string, any>): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const now = new Date().toISOString();

      const partyPositionData = {
        partyId,
        dungeonId,
        currentFloor: positionData.currentFloor,
        playerX: positionData.playerX,
        playerY: positionData.playerY,
        playerDirection: positionData.playerDirection,
        testMode: positionData.testMode,

        // Convert Sets to arrays for serialization
        discoveredSecrets: Array.from(positionData.discoveredSecrets || []),
        disarmedTraps: Array.from(positionData.disarmedTraps || []),
        usedSpecials: Array.from(positionData.usedSpecials || []),

        // Metadata
        lastSaved: now,
      };

      const transaction = this._db!.transaction([this.PARTY_POSITION_STORE], 'readwrite');
      const store = transaction.objectStore(this.PARTY_POSITION_STORE);

      return new Promise((resolve, reject) => {
        const request = store.put(partyPositionData);

        request.onsuccess = () => {
          console.log(`Party position saved: ${partyId} in ${dungeonId}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to save party position:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to save party position:', error);
      return false;
    }
  }

  /**
   * Load party position and state from a dungeon
   * @param {string} partyId - Party ID
   * @returns {Promise<Object|null>} Party position data or null if not found
   */
  static async loadPartyPosition(partyId: string): Promise<Record<string, unknown> | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_POSITION_STORE], 'readonly');
      const store = transaction.objectStore(this.PARTY_POSITION_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(partyId);

        request.onsuccess = () => {
          const positionData = request.result;

          if (!positionData) {
            resolve(null);
            return;
          }

          // Reconstruct position data with proper data types
          const reconstructedPosition = {
            partyId: positionData.partyId,
            dungeonId: positionData.dungeonId,
            currentFloor: positionData.currentFloor,
            playerX: positionData.playerX,
            playerY: positionData.playerY,
            playerDirection: positionData.playerDirection,
            testMode: positionData.testMode,

            // Reconstruct Sets from arrays
            discoveredSecrets: new Set(positionData.discoveredSecrets || []),
            disarmedTraps: new Set(positionData.disarmedTraps || []),
            usedSpecials: new Set(positionData.usedSpecials || []),

            lastSaved: positionData.lastSaved,
          };

          resolve(reconstructedPosition);
        };

        request.onerror = () => {
          console.error('Failed to load party position:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to load party position:', error);
      return null;
    }
  }

  /**
   * Get all parties in a specific dungeon
   * @param {string} dungeonId - Dungeon ID to search for parties
   * @returns {Promise<Array>} Array of party position records
   */
  static async getPartiesInDungeon(dungeonId: string): Promise<Record<string, unknown>[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_POSITION_STORE], 'readonly');
      const store = transaction.objectStore(this.PARTY_POSITION_STORE);
      const index = store.index('dungeonId');

      return new Promise((resolve, reject) => {
        const request = index.getAll(dungeonId);

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          console.error('Failed to get parties in dungeon:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to get parties in dungeon:', error);
      return [];
    }
  }

  /**
   * Delete party position data
   * @param {string} partyId - Party ID to delete position for
   * @returns {Promise<boolean>} Success status
   */
  static async deletePartyPosition(partyId: string): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_POSITION_STORE], 'readwrite');
      const store = transaction.objectStore(this.PARTY_POSITION_STORE);

      return new Promise((resolve, reject) => {
        const request = store.delete(partyId);

        request.onsuccess = () => {
          console.log(`Party position deleted: ${partyId}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to delete party position:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to delete party position:', error);
      return false;
    }
  }

  // Party Management Methods

  /**
   * Save party to IndexedDB
   * @param {Object} party - Party object to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveParty(party: any): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const now = Date.now();
      const partyData = {
        id: party.id,
        name: party.name || 'Unnamed Party',
        memberIds:
          party.memberIds || (party.members ? party.members.map((member: any) => member.id) : []),
        memberCount:
          party.memberCount ||
          (party.members ? party.members.length : party.memberIds ? party.memberIds.length : 0),
        aliveCount:
          party.aliveCount ||
          (party.members
            ? party.members.filter((m: any) => m.isAlive).length
            : party.memberIds
              ? party.memberIds.length
              : 0),
        formation: party.formation || 'default',
        gold: party.gold || 0,
        experience: party.experience || 0,
        currentLeaderId: party.currentLeader ? party.currentLeader.id : null,
        inTown: party.isLost ? false : party.inTown !== undefined ? party.inTown : true,
        campId: party.campId || null,
        isLost: party.isLost || false,
        lostDate: party.lostDate || null,
        lostReason: party.lostReason || null,
        lastKnownLocation: party.lastKnownLocation || null,
        dateCreated: party.dateCreated || now,
        lastModified: now,
      };

      const transaction = this._db!.transaction([this.PARTY_STORE], 'readwrite');
      const store = transaction.objectStore(this.PARTY_STORE);

      return new Promise((resolve, reject) => {
        const request = store.put(partyData);

        request.onsuccess = () => {
          console.log(`Party saved: ${party.id}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to save party:', request.error);
          reject(request.error);
        };
      });
    } catch (error: any) {
      console.error('Failed to save party:', error);
      return false;
    }
  }

  /**
   * Load party from IndexedDB
   * @param {string} partyId - Party ID to load
   * @returns {Promise<Object|null>} Party data or null if not found
   */
  static async loadParty(partyId: string): Promise<PartyData | null> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_STORE], 'readonly');
      const store = transaction.objectStore(this.PARTY_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(partyId);

        request.onsuccess = () => {
          const party = request.result;
          if (party) {
            console.log(`Party loaded: ${partyId}`);
          }
          resolve(party || null);
        };

        request.onerror = () => {
          console.error('Failed to load party:', request.error);
          reject(null);
        };
      });
    } catch (error: any) {
      console.error('Failed to load party:', error);
      return null;
    }
  }

  /**
   * Load all parties from IndexedDB
   * @returns {Promise<Array>} Array of party objects
   */
  static async loadAllParties(): Promise<PartyData[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_STORE], 'readonly');
      const store = transaction.objectStore(this.PARTY_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const parties = request.result || [];
          console.log(`Loaded ${parties.length} parties from IndexedDB`);
          resolve(parties);
        };

        request.onerror = () => {
          console.error('Failed to load parties:', request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error('Failed to load parties:', error);
      return [];
    }
  }

  /**
   * Query parties by criteria
   * @param {Object} criteria - Query criteria (inTown, campId, etc.)
   * @returns {Promise<Array>} Array of matching parties
   */
  static async queryParties(criteria: Record<string, any> = {}): Promise<PartyData[]> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_STORE], 'readonly');
      const store = transaction.objectStore(this.PARTY_STORE);

      // If no criteria, return all parties
      if (Object.keys(criteria).length === 0) {
        return this.loadAllParties();
      }

      // Use index if available
      const indexName = Object.keys(criteria)[0];
      const indexValue = criteria[indexName];

      return new Promise((resolve, reject) => {
        let request;

        if (store.indexNames.contains(indexName)) {
          const index = store.index(indexName);
          request = index.getAll(indexValue);
        } else {
          // Fallback to full scan
          request = store.getAll();
        }

        request.onsuccess = () => {
          let parties = request.result || [];

          // Apply additional filters if using fallback
          if (!store.indexNames.contains(indexName) || Object.keys(criteria).length > 1) {
            parties = parties.filter((party) => {
              return Object.entries(criteria).every(([key, value]) => {
                return party[key] === value;
              });
            });
          }

          console.log(`Found ${parties.length} parties matching criteria`);
          resolve(parties);
        };

        request.onerror = () => {
          console.error('Failed to query parties:', request.error);
          reject([]);
        };
      });
    } catch (error: any) {
      console.error('Failed to query parties:', error);
      return [];
    }
  }

  /**
   * Delete party from IndexedDB
   * @param {string} partyId - Party ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteParty(partyId: string): Promise<boolean> {
    try {
      if (!(await this.initializeDB())) {
        throw new Error('Failed to initialize database');
      }

      const transaction = this._db!.transaction([this.PARTY_STORE], 'readwrite');
      const store = transaction.objectStore(this.PARTY_STORE);

      return new Promise((resolve, reject) => {
        const request = store.delete(partyId);

        request.onsuccess = () => {
          console.log(`Party deleted: ${partyId}`);
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to delete party:', request.error);
          reject(false);
        };
      });
    } catch (error: any) {
      console.error('Failed to delete party:', error);
      return false;
    }
  }

  /**
   * Set the active party ID
   * @param {string} partyId - Party ID to set as active
   * @returns {boolean} Success status
   */
  static setActiveParty(partyId: string | null): boolean {
    try {
      if (partyId) {
        localStorage.setItem(this.ACTIVE_PARTY_KEY, partyId);
        console.log(`Active party set to: ${partyId}`);
      } else {
        localStorage.removeItem(this.ACTIVE_PARTY_KEY);
        console.log('Active party cleared');
      }
      return true;
    } catch (error: any) {
      console.error('Failed to set active party:', error);
      return false;
    }
  }

  /**
   * Get the active party ID
   * @returns {string|null} Active party ID or null if none set
   */
  static getActivePartyId(): string | null {
    try {
      return localStorage.getItem(this.ACTIVE_PARTY_KEY);
    } catch (error: any) {
      console.error('Failed to get active party:', error);
      return null;
    }
  }

  /**
   * Load the active party
   * @returns {Promise<Object|null>} Active party object or null if none exists
   */
  static async loadActiveParty(): Promise<PartyData | null> {
    try {
      const activePartyId = this.getActivePartyId();
      if (!activePartyId) {
        return null;
      }

      const party = await this.loadParty(activePartyId);
      if (!party) {
        // Clear invalid active party reference
        this.setActiveParty(null);
        return null;
      }

      return party;
    } catch (error: any) {
      console.error('Failed to load active party:', error);
      return null;
    }
  }

  /**
   * Create and set a new active party
   * @param {string} name - Optional party name
   * @returns {Promise<Object|null>} New party object or null if creation failed
   */
  static async createNewActiveParty(name: string | null = null) {
    try {
      // Import Party class dynamically
      const party = new Party();
      if (name) {
        party.name = name;
      }

      // Save the party
      const saveSuccess = await this.saveParty(party);
      if (!saveSuccess) {
        console.error('Failed to save new party');
        return null;
      }

      // Set as active party
      this.setActiveParty(party.id);

      console.log(`Created new active party: ${party.id}`);
      return party;
    } catch (error: any) {
      console.error('Failed to create new active party:', error);
      return null;
    }
  }

  /**
   * Get all camping parties (parties with campId)
   * @returns {Promise<Array>} Array of camping parties
   */
  static async getCampingParties(): Promise<CampData[]> {
    try {
      // Get all parties and filter for those with campId
      const allParties = await this.loadAllParties();
      return allParties.filter((party) => (party as any).campId != null) as unknown as CampData[];
    } catch (error: any) {
      console.error('Failed to get camping parties:', error);
      return [];
    }
  }

  /**
   * Get all lost parties (parties marked as isLost: true)
   * @returns {Promise<Array>} Array of lost parties
   */
  static async getLostParties(): Promise<PartyData[]> {
    try {
      const allParties = await this.loadAllParties();

      // Filter for parties that are marked as lost
      return allParties.filter((party) => (party as any).isLost === true);
    } catch (error: any) {
      console.error('Failed to get lost parties:', error);
      return [];
    }
  }
}
