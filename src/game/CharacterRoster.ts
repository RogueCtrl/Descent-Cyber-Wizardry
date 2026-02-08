import { Helpers } from '../utils/Helpers.ts';
import { Party } from './Party.ts';
import { Random } from '../utils/Random.ts';
import { Character } from './Character.ts';

/**
 * Character Roster System
 * Manages global character pool and multi-party operations
 */
export class CharacterRoster {
  static instance: CharacterRoster | null = null;
  allCharacters: Map<any, any>;
  activeParties: Map<any, any>;
  characterIndex: Record<string, any>;

  constructor() {
    this.allCharacters = new Map(); // Character ID -> Character object
    this.activeParties = new Map(); // Party ID -> Party configuration
    this.characterIndex = {
      byClass: new Map(), // Class -> Set<characterId>
      byLevel: new Map(), // Level -> Set<characterId>
      byStatus: new Map(), // Status -> Set<characterId>
      byRace: new Map(), // Race -> Set<characterId>
    };

    // Static reference for singleton pattern
    if (!CharacterRoster.instance) {
      CharacterRoster.instance = this;
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!CharacterRoster.instance) {
      CharacterRoster.instance = new CharacterRoster();
    }
    return CharacterRoster.instance;
  }

  /**
   * Add a character to the global roster
   */
  addCharacter(character: any) {
    if (!character.id) {
      character.id = Helpers.generateId('char');
    }

    this.allCharacters.set(character.id, character);
    this.updateCharacterIndex(character);

    return character.id;
  }

  /**
   * Remove a character from the roster
   */
  removeCharacter(characterId: any) {
    const character = this.allCharacters.get(characterId);
    if (!character) return false;

    // Remove from all parties first
    this.activeParties.forEach((party) => {
      party.removeMember(character);
    });

    // Remove from indices
    this.removeFromIndex(character);

    // Remove from roster
    this.allCharacters.delete(characterId);

    return true;
  }

  /**
   * Get a character by ID
   */
  getCharacter(characterId: any) {
    return this.allCharacters.get(characterId);
  }

  /**
   * Get all characters
   */
  getAllCharacters() {
    return Array.from(this.allCharacters.values());
  }

  /**
   * Get available characters (not in active parties)
   */
  getAvailableCharacters() {
    return this.getAllCharacters().filter(
      (character) => character.availability === 'available' && character.isAlive
    );
  }

  /**
   * Get characters by class
   */
  getCharactersByClass(className: any) {
    const characterIds = this.characterIndex.byClass.get(className) || new Set();
    return Array.from(characterIds)
      .map((id) => this.allCharacters.get(id))
      .filter(Boolean);
  }

  /**
   * Get characters by level range
   */
  getCharactersByLevel(minLevel: any, maxLevel: any = null) {
    const characters: any[] = [];
    const endLevel = maxLevel || minLevel;

    for (let level = minLevel; level <= endLevel; level++) {
      const characterIds = this.characterIndex.byLevel.get(level) || new Set();
      characterIds.forEach((id: any) => {
        const character = this.allCharacters.get(id);
        if (character) characters.push(character);
      });
    }

    return characters;
  }

  /**
   * Create a new party from character IDs
   */
  createParty(partyName: any, characterIds: any) {
    // Validate party composition
    const validationResult = this.validatePartyComposition(characterIds);
    if (!validationResult.valid) {
      return { success: false, reason: validationResult.reason };
    }

    // Create party
    const party = new Party();
    party.id = Helpers.generateId('party');
    party.name = partyName;

    // Add characters to party
    characterIds.forEach((characterId: any) => {
      const character = this.allCharacters.get(characterId);
      if (character) {
        party.addMember(character);
        character.availability = 'in_party';
        character.partyId = party.id;
      }
    });

    // Store party
    this.activeParties.set(party.id, party);

    return { success: true, party };
  }

  /**
   * Validate party composition
   */
  validatePartyComposition(characterIds: any) {
    if (characterIds.length === 0) {
      return { valid: false, reason: 'Party cannot be empty' };
    }

    if (characterIds.length > 4) {
      return { valid: false, reason: 'Party cannot exceed 4 members' };
    }

    // Check if all characters are available
    for (const characterId of characterIds) {
      const character = this.allCharacters.get(characterId);
      if (!character) {
        return { valid: false, reason: `Character ${characterId} not found` };
      }

      if (character.availability !== 'available') {
        return { valid: false, reason: `Character ${character.name} is not available` };
      }

      if (!character.isAlive) {
        return { valid: false, reason: `Character ${character.name} is not alive` };
      }
    }

    return { valid: true };
  }

  /**
   * Disband a party and return characters to available pool
   */
  disbandParty(partyId: any) {
    const party = this.activeParties.get(partyId);
    if (!party) return false;

    // Return all characters to available status
    party.members.forEach((character: any) => {
      character.availability = 'available';
      character.partyId = null;
    });

    // Remove party
    this.activeParties.delete(partyId);

    return true;
  }

  /**
   * Save party in dungeon (camping)
   */
  savePartyInDungeon(partyId: any, dungeonState: any) {
    const party = this.activeParties.get(partyId);
    if (!party) return false;

    // Update character availability
    party.members.forEach((character: any) => {
      character.availability = 'camped';
    });

    // Store dungeon state with party
    party.dungeonState = dungeonState;
    party.campTime = Date.now();

    return true;
  }

  /**
   * Resume camped party
   */
  resumeCampedParty(partyId: any) {
    const party = this.activeParties.get(partyId);
    if (!party) return { success: false, reason: 'Party not found' };

    // Check if party is camped
    const isCamped = party.members.some((character: any) => character.availability === 'camped');
    if (!isCamped) {
      return { success: false, reason: 'Party is not camped' };
    }

    // Return characters to active status
    party.members.forEach((character: any) => {
      character.availability = 'in_party';
    });

    return { success: true, party, dungeonState: party.dungeonState };
  }

  /**
   * Handle character death in dungeon
   */
  handleCharacterDeath(characterId: any, deathType: any = 'dead') {
    const character = this.allCharacters.get(characterId);
    if (!character) return false;

    character.isAlive = false;
    character.status = deathType;
    character.availability = 'dead';

    // Update indices
    this.updateCharacterIndex(character);

    return true;
  }

  /**
   * Create rescue party for recovering dead/lost characters
   */
  createRescueParty(rescuerIds: any, targetLocation: any) {
    const rescueParty = this.createParty('Rescue Mission', rescuerIds);
    if (!rescueParty.success) return rescueParty;

    rescueParty.party!.isRescueMission = true;
    rescueParty.party!.targetLocation = targetLocation;

    return rescueParty;
  }

  /**
   * Attempt to rescue a character
   */
  rescueCharacter(rescuerPartyId: any, targetCharacterId: any) {
    const rescuerParty = this.activeParties.get(rescuerPartyId);
    const targetCharacter = this.allCharacters.get(targetCharacterId);

    if (!rescuerParty || !targetCharacter) {
      return { success: false, reason: 'Invalid party or character' };
    }

    if (targetCharacter.availability !== 'dead' && targetCharacter.availability !== 'missing') {
      return { success: false, reason: 'Character does not need rescue' };
    }

    // Simple rescue mechanics - in real game would involve dungeon exploration
    const rescueChance = 0.7; // 70% base chance

    if (Random.chance(rescueChance)) {
      targetCharacter.availability = 'available';
      targetCharacter.partyId = null;

      // Character might be injured or weakened
      if (targetCharacter.status === 'missing') {
        targetCharacter.status = 'ok';
        targetCharacter.isAlive = true;
      }

      return { success: true, character: targetCharacter };
    } else {
      return { success: false, reason: 'Rescue attempt failed' };
    }
  }

  /**
   * Update character indices
   */
  updateCharacterIndex(character: any) {
    this.removeFromIndex(character);
    this.addToIndex(character);
  }

  /**
   * Add character to indices
   */
  addToIndex(character: any) {
    // By class
    if (!this.characterIndex.byClass.has(character.class)) {
      this.characterIndex.byClass.set(character.class, new Set());
    }
    this.characterIndex.byClass.get(character.class).add(character.id);

    // By level
    if (!this.characterIndex.byLevel.has(character.level)) {
      this.characterIndex.byLevel.set(character.level, new Set());
    }
    this.characterIndex.byLevel.get(character.level).add(character.id);

    // By status
    if (!this.characterIndex.byStatus.has(character.availability)) {
      this.characterIndex.byStatus.set(character.availability, new Set());
    }
    this.characterIndex.byStatus.get(character.availability).add(character.id);

    // By race
    if (!this.characterIndex.byRace.has(character.race)) {
      this.characterIndex.byRace.set(character.race, new Set());
    }
    this.characterIndex.byRace.get(character.race).add(character.id);
  }

  /**
   * Remove character from indices
   */
  removeFromIndex(character: any) {
    // Remove from all indices
    Object.values(this.characterIndex).forEach((indexMap: any) => {
      indexMap.forEach((characterSet: any) => {
        characterSet.delete(character.id);
      });
    });
  }

  /**
   * Get statistics about the roster
   */
  getStatistics() {
    const stats = {
      total: this.allCharacters.size,
      alive: 0,
      dead: 0,
      available: 0,
      inParty: 0,
      camped: 0,
      missing: 0,
      byClass: {} as Record<string, number>,
      byRace: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
    };

    this.getAllCharacters().forEach((character: any) => {
      if (character.isAlive) stats.alive++;
      else stats.dead++;

      switch (character.availability) {
        case 'available':
          stats.available++;
          break;
        case 'in_party':
          stats.inParty++;
          break;
        case 'camped':
          stats.camped++;
          break;
        case 'missing':
          stats.missing++;
          break;
      }

      stats.byClass[character.class] = (stats.byClass[character.class] || 0) + 1;
      stats.byRace[character.race] = (stats.byRace[character.race] || 0) + 1;
      stats.byLevel[character.level] = (stats.byLevel[character.level] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get save data for all characters and parties
   */
  getSaveData() {
    return {
      characters: Array.from(this.allCharacters.values()).map((char) => char.getSaveData()),
      parties: Array.from(this.activeParties.values()).map((party) => party.getSaveData()),
    };
  }

  /**
   * Load from save data
   */
  loadFromSave(saveData: any) {
    if (!saveData) return;

    // Clear current data
    this.allCharacters.clear();
    this.activeParties.clear();
    this.characterIndex = {
      byClass: new Map(),
      byLevel: new Map(),
      byStatus: new Map(),
      byRace: new Map(),
    };

    // Load characters
    if (saveData.characters) {
      saveData.characters.forEach((charData: any) => {
        const character = new Character();
        character.loadFromSave(charData);
        this.addCharacter(character);
      });
    }

    // Load parties
    if (saveData.parties) {
      saveData.parties.forEach((partyData: any) => {
        const party = new Party();
        party.loadFromSave(partyData);

        // Reconnect characters to party
        party.members = party.members
          .map((memberData) => {
            if (typeof memberData === 'string') {
              return this.allCharacters.get(memberData);
            } else if (memberData.id) {
              return this.allCharacters.get(memberData.id);
            }
            return null;
          })
          .filter(Boolean);

        this.activeParties.set(party.id, party);
      });
    }
  }
}
