/**
 * Party Management
 * Handles the player's party of characters
 */
class Party {
    constructor() {
        this.id = `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.members = [];
        this.maxSize = 6;
        this.currentLeader = null;
        this.formation = 'default';
        this.gold = 0;
        this.experience = 0;
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
            maxSize: this.maxSize,
            formation: this.formation,
            gold: this.gold,
            experience: this.experience,
            members: this.members,
            currentLeader: this.currentLeader ? this.currentLeader.id : null
        };
    }
}