/**
 * Party Management
 * Handles the player's party of characters
 */
class Party {
    constructor() {
        this.id = `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = null; // Will be set when first created
        this.members = [];
        this.maxSize = 6;
        this.currentLeader = null;
        this.formation = 'default';
        this.gold = 0;
        this.experience = 0;
        this.inTown = true; // Parties start in town
        this.campId = null; // Reference to camp if party is camping
        this.dateCreated = Date.now();
        this.lastModified = Date.now();
    }
    
    /**
     * Add a character to the party
     */
    addMember(character) {
        if (this.members.length >= this.maxSize) {
            return false;
        }
        
        this.members.push(character);
        
        if (this.members.length === 1) {
            this.currentLeader = character;
        }
        
        return true;
    }
    
    /**
     * Remove a character from the party
     */
    removeMember(character) {
        const index = this.members.indexOf(character);
        if (index === -1) {
            return false;
        }
        
        this.members.splice(index, 1);
        
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
        return this.members.filter(member => member.isAlive);
    }
    
    /**
     * Update party (called each frame)
     */
    update(deltaTime) {
        this.members.forEach(member => {
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
            members: this.members.map(member => member.getSaveData ? member.getSaveData() : member),
            maxSize: this.maxSize,
            currentLeader: this.currentLeader ? this.currentLeader.id : null,
            formation: this.formation,
            gold: this.gold,
            experience: this.experience
        };
    }
    
    /**
     * Load from save data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        this.id = saveData.id || this.id; // Keep existing ID if not in save data
        this.maxSize = saveData.maxSize || 6;
        this.formation = saveData.formation || 'default';
        this.gold = saveData.gold || 0;
        this.experience = saveData.experience || 0;
        
        // For now, just create placeholder members
        this.members = saveData.members || [];
        
        if (saveData.currentLeader && this.members.length > 0) {
            this.currentLeader = this.members.find(member => member.id === saveData.currentLeader) || this.members[0];
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
            members: this.members,
            currentLeader: this.currentLeader ? this.currentLeader.id : null,
            inTown: this.inTown,
            campId: this.campId,
            dateCreated: this.dateCreated,
            lastModified: this.lastModified
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
    static async load(partyId) {
        try {
            const partyData = await Storage.loadParty(partyId);
            if (!partyData) {
                return null;
            }
            
            const party = new Party();
            party.id = partyData.id;
            party.name = partyData.name;
            party.formation = partyData.formation || 'default';
            party.gold = partyData.gold || 0;
            party.experience = partyData.experience || 0;
            party.inTown = partyData.inTown !== undefined ? partyData.inTown : true;
            party.campId = partyData.campId || null;
            party.dateCreated = partyData.dateCreated || Date.now();
            party.lastModified = partyData.lastModified || Date.now();
            
            // Load members from character storage
            if (partyData.memberIds && partyData.memberIds.length > 0) {
                const members = [];
                for (const memberId of partyData.memberIds) {
                    const character = await Storage.loadCharacter(memberId);
                    if (character) {
                        members.push(character);
                    }
                }
                party.members = members;
            }
            
            // Set current leader
            if (partyData.currentLeaderId && party.members.length > 0) {
                party.currentLeader = party.members.find(m => m.id === partyData.currentLeaderId) || party.members[0];
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
            const parties = [];
            
            for (const partyData of partiesData) {
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
    setCamp(campId) {
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
            isFull: this.isFull
        };
    }
}