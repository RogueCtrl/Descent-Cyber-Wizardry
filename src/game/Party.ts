import { Storage } from '../utils/Storage.ts';
import { Character } from './Character.ts';

/**
 * Party Management
 * Handles the player's party of characters
 */
export class Party {
  _isTemporary: boolean = false;
  isRescueMission: boolean = false;
  targetLocation: any;
  isInTown: boolean = true;
  id: string;
  name: any;
  members: any[];
  maxSize: number;
  currentLeader: any;
  formation: string;
  gold: number;
  experience: number;
  inTown: boolean;
  inventory: any[];
  campId: any;
  dateCreated: number;
  lastModified: number;

  constructor() {
    this.id = `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = null; // Will be set when first created
    this.members = [];
    this.maxSize = 4;
    this.currentLeader = null;
    this.formation = 'default';
    this.gold = 0;
    this.experience = 0;
    this.inTown = true; // Parties start in town
    this.inventory = []; // Pool for all unequipped items and loot
    this.campId = null; // Reference to camp if party is camping
    this.dateCreated = Date.now();
    this.lastModified = Date.now();
  }

  /**
   * Add a character to the party
   */
  addMember(character: any) {
    if (this.members.length >= this.maxSize) {
      return false;
    }

    this.members.push(character);

    // Set the character's partyId to link them to this party
    character.partyId = this.id;

    if (this.members.length === 1) {
      this.currentLeader = character;
    }

    return true;
  }

  /**
   * Remove a character from the party
   */
  removeMember(character: any) {
    const index = this.members.indexOf(character);
    if (index === -1) {
      return false;
    }

    this.members.splice(index, 1);

    // Clear the character's partyId since they're no longer in this party
    character.partyId = null;

    if (this.currentLeader === character && this.members.length > 0) {
      this.currentLeader = this.members[0];
    }

    return true;
  }

  /**
   * Get party size
   */
  get size() {
    return this.members.length;
  }

  /**
   * Check if party is empty
   */
  get isEmpty() {
    return this.members.length === 0;
  }

  /**
   * Check if party is full
   */
  get isFull() {
    return this.members.length >= this.maxSize;
  }

  /**
   * Get alive members
   */
  get aliveMembers() {
    return this.members.filter((member) => member.isAlive);
  }

  /**
   * Update party (called each frame)
   */
  update(deltaTime: any) {
    this.members.forEach((member) => {
      if (member.update) {
        member.update(deltaTime);
      }
    });
  }

  /**
   * Get save data
   */
  getSaveData() {
    return {
      members: this.members.map((member) => (member.getSaveData ? member.getSaveData() : member)),
      maxSize: this.maxSize,
      currentLeader: this.currentLeader ? this.currentLeader.id : null,
      formation: this.formation,
      gold: this.gold,
      experience: this.experience,
      inventory: [...this.inventory],
    };
  }

  /**
   * Load from save data
   */
  loadFromSave(saveData: any) {
    if (!saveData) return;

    this.id = saveData.id || this.id; // Keep existing ID if not in save data
    this.maxSize = saveData.maxSize || 4;
    this.formation = saveData.formation || 'default';
    this.gold = saveData.gold || 0;
    this.experience = saveData.experience || 0;
    this.inventory = saveData.inventory || [];

    // Rehydrate members
    this.members = (saveData.members || []).map((memberData: any) => {
      const character = new Character();
      character.loadFromSave(memberData);
      return character;
    });

    if (saveData.currentLeader && this.members.length > 0) {
      this.currentLeader =
        this.members.find((member) => member.id === saveData.currentLeader) || this.members[0];
    }
  }

  /**
   * Convert party to save data
   */
  toSaveData() {
    return {
      id: this.id,
      name: this.name,
      maxSize: this.maxSize,
      formation: this.formation,
      gold: this.gold,
      experience: this.experience,
      inventory: this.inventory,
      members: this.members,
      currentLeader: this.currentLeader ? this.currentLeader.id : null,
      inTown: this.inTown,
      campId: this.campId,
      dateCreated: this.dateCreated,
      lastModified: this.lastModified,
    };
  }

  /**
   * Save party to persistent storage
   * @param {boolean} setAsActive - Whether to set this party as active (default: true)
   */
  async save(setAsActive = true) {
    try {
      this.lastModified = Date.now();
      const success = await Storage.saveParty(this);
      if (success) {
        console.log(`Party ${this.id} saved successfully`);

        // Only set as active if requested and not camping
        if (setAsActive && !this.campId && Storage.getActivePartyId() !== this.id) {
          Storage.setActiveParty(this.id);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to save party:', error);
      return false;
    }
  }

  /**
   * Load party from persistent storage
   */
  static async load(partyId: any) {
    try {
      const partyData = await Storage.loadParty(partyId);
      if (!partyData) {
        return null;
      }

      const party = new Party();
      party.id = (partyData as any).id;
      party.name = (partyData as any).name;
      party.formation = (partyData as any).formation || 'default';
      party.gold = (partyData as any).gold || 0;
      party.experience = (partyData as any).experience || 0;
      party.inventory = (partyData as any).inventory || [];
      party.inTown = (partyData as any).inTown !== undefined ? (partyData as any).inTown : true;
      party.campId = (partyData as any).campId || null;
      party.dateCreated = (partyData as any).dateCreated || Date.now();
      party.lastModified = (partyData as any).lastModified || Date.now();

      // Load members from character storage
      if ((partyData as any).memberIds && (partyData as any).memberIds.length > 0) {
        const members: any[] = [];
        for (const memberId of (partyData as any).memberIds) {
          const characterData = await Storage.loadCharacter(memberId);
          if (characterData) {
            const character = new Character();
            character.loadFromSave(characterData);
            members.push(character);
          }
        }
        party.members = members;
      }

      // Set current leader
      if ((partyData as any).currentLeaderId && party.members.length > 0) {
        party.currentLeader =
          party.members.find((m) => m.id === (partyData as any).currentLeaderId) ||
          party.members[0];
      } else if (party.members.length > 0) {
        party.currentLeader = party.members[0];
      }

      return party;
    } catch (error) {
      console.error('Failed to load party:', error);
      return null;
    }
  }

  /**
   * Load all parties from persistent storage
   */
  static async loadAll() {
    try {
      const partiesData = await Storage.loadAllParties();
      const parties: any[] = [];

      for (const partyData of partiesData as any) {
        const party = await Party.load(partyData.id);
        if (party) {
          parties.push(party);
        }
      }

      return parties;
    } catch (error) {
      console.error('Failed to load all parties:', error);
      return [];
    }
  }

  /**
   * Delete party from persistent storage
   */
  async delete() {
    try {
      const success = await Storage.deleteParty(this.id);
      if (success) {
        console.log(`Party ${this.id} deleted successfully`);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete party:', error);
      return false;
    }
  }

  /**
   * Mark party as in town
   */
  returnToTown() {
    this.inTown = true;
    this.campId = null; // Clear camp reference when returning to town
    this.lastModified = Date.now();
  }

  /**
   * Mark party as leaving town (entering dungeon)
   */
  leaveTown() {
    this.inTown = false;
    this.lastModified = Date.now();
  }

  /**
   * Set camp reference
   */
  setCamp(campId: any) {
    this.campId = campId;
    this.lastModified = Date.now();
  }

  /**
   * Clear camp reference
   */
  clearCamp() {
    this.campId = null;
    this.lastModified = Date.now();
  }

  /**
   * Get party status summary
   */
  getStatusSummary() {
    const aliveMembers = this.aliveMembers;
    return {
      id: this.id,
      name: this.name,
      memberCount: this.members.length,
      aliveCount: aliveMembers.length,
      location: this.inTown ? 'Town' : 'Dungeon',
      isCamping: !!this.campId,
      hasLeader: !!this.currentLeader,
      isEmpty: this.isEmpty,
      isFull: this.isFull,
    };
  }
}
