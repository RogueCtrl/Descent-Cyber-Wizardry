/**
 * Character Class
 * Represents a single character with stats, class, and abilities
 */
class Character {
    constructor(name = '', race = '', characterClass = '') {
        this.id = Helpers.generateId('char');
        this.name = name;
        this.race = race;
        this.class = characterClass;
        this.level = 1;
        
        // Base attributes
        this.attributes = {
            strength: 10,
            intelligence: 10,
            piety: 10,
            vitality: 10,
            agility: 10,
            luck: 10
        };
        
        // Health points
        this.maxHP = 10;
        this.currentHP = 10;
        
        // Status
        this.status = 'OK';
        this.isAlive = true;
        
        // Experience
        this.experience = 0;
        this.experienceToNext = 100;
        
        // Equipment (placeholder)
        this.equipment = {
            weapon: null,
            armor: null,
            shield: null,
            accessory: null
        };
    }
    
    /**
     * Update character (called each frame)
     */
    update(deltaTime) {
        // Handle any character-specific updates
        // For now, this is a placeholder
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            id: this.id,
            name: this.name,
            race: this.race,
            class: this.class,
            level: this.level,
            attributes: { ...this.attributes },
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            status: this.status,
            isAlive: this.isAlive,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            equipment: { ...this.equipment }
        };
    }
    
    /**
     * Load from save data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        this.id = saveData.id || this.id;
        this.name = saveData.name || '';
        this.race = saveData.race || '';
        this.class = saveData.class || '';
        this.level = saveData.level || 1;
        this.attributes = { ...this.attributes, ...saveData.attributes };
        this.maxHP = saveData.maxHP || 10;
        this.currentHP = saveData.currentHP || 10;
        this.status = saveData.status || 'OK';
        this.isAlive = saveData.isAlive !== undefined ? saveData.isAlive : true;
        this.experience = saveData.experience || 0;
        this.experienceToNext = saveData.experienceToNext || 100;
        this.equipment = { ...this.equipment, ...saveData.equipment };
    }
}