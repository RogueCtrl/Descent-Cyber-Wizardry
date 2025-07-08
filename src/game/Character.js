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
        
        // Aging and progression
        this.age = Random.integer(16, 25);
        this.maxAge = this.calculateMaxAge();
        this.classHistory = [{ class: characterClass, level: 1, maxLevel: 1, timestamp: Date.now() }];
        
        // Magic system
        this.spellSlots = { arcane: [], divine: [] };
        this.memorizedSpells = { arcane: [], divine: [] };
        
        // Equipment (placeholder)
        this.equipment = {
            weapon: null,
            armor: null,
            shield: null,
            accessory: null
        };
        
        // Temporary effects (curses, buffs, etc.)
        this.temporaryEffects = [];
        
        // Availability status for multi-party system
        this.availability = 'available'; // available, in_party, dead, missing
        this.partyId = null;
    }
    
    /**
     * Update character (called each frame)
     */
    update(deltaTime) {
        // Handle any character-specific updates
        // For now, this is a placeholder
    }
    
    /**
     * Calculate maximum age based on race and constitution
     */
    calculateMaxAge() {
        const baseAge = {
            Human: 80,
            Elf: 400,
            Dwarf: 300,
            Hobbit: 100,
            Gnome: 350
        };
        
        const raceMaxAge = baseAge[this.race] || 80;
        const vitalityBonus = (this.attributes.vitality - 10) * 2;
        return raceMaxAge + vitalityBonus + Random.integer(-10, 10);
    }
    
    /**
     * Age the character by specified months
     */
    ageCharacter(months) {
        this.age += months / 12;
        this.applyAgingEffects();
    }
    
    /**
     * Apply aging effects to attributes
     */
    applyAgingEffects() {
        const agePercent = this.age / this.maxAge;
        
        if (agePercent > 0.7) {
            // Start experiencing age penalties
            const penalty = Math.floor((agePercent - 0.7) * 10);
            // In a real implementation, would apply temporary stat penalties
            // For now, just track that aging is occurring
        }
    }
    
    /**
     * Change character class
     */
    changeClass(newClass) {
        const changeCheck = Class.checkClassChangeRequirements(this, newClass);
        if (!changeCheck.canChange) {
            return { success: false, reason: changeCheck.reason };
        }
        
        // Update class history
        const currentClassHistory = this.classHistory.find(h => h.class === this.class);
        if (currentClassHistory) {
            currentClassHistory.maxLevel = Math.max(currentClassHistory.maxLevel, this.level);
        }
        
        // Change class and reset level
        this.class = newClass;
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        
        // Add new class to history
        this.classHistory.push({ 
            class: newClass, 
            level: 1, 
            maxLevel: 1, 
            timestamp: Date.now() 
        });
        
        // Recalculate HP (keep current HP ratio)
        const hpRatio = this.currentHP / this.maxHP;
        this.recalculateHP();
        this.currentHP = Math.floor(this.maxHP * hpRatio);
        
        return { success: true };
    }
    
    /**
     * Recalculate maximum HP based on current class and level
     */
    recalculateHP() {
        const classData = Class.getClassData(this.class);
        const hitDie = classData ? classData.hitDie : 6;
        const vitBonus = Math.floor((this.attributes.vitality - 10) / 2);
        
        this.maxHP = Math.max(1, hitDie + vitBonus + (this.level - 1) * (Math.floor(hitDie / 2) + vitBonus));
    }
    
    /**
     * Level up the character
     */
    async levelUp() {
        if (this.experience >= this.experienceToNext) {
            this.level++;
            this.experience -= this.experienceToNext;
            this.experienceToNext = this.calculateExperienceToNext();
            
            // Update class history
            const currentClassHistory = this.classHistory.find(h => h.class === this.class);
            if (currentClassHistory) {
                currentClassHistory.level = this.level;
                currentClassHistory.maxLevel = Math.max(currentClassHistory.maxLevel, this.level);
            }
            
            // Recalculate HP with level bonus
            const oldMaxHP = this.maxHP;
            this.recalculateHP();
            const hpGain = this.maxHP - oldMaxHP;
            this.currentHP += hpGain;
            
            // Update spell slots
            this.updateSpellSlots();
            
            // Save to persistent storage
            this.saveToStorage();
            
            return { success: true, hpGain, newLevel: this.level };
        }
        
        return { success: false, reason: 'Not enough experience' };
    }
    
    /**
     * Calculate experience needed for next level
     */
    calculateExperienceToNext() {
        // Simple progression: each level requires 100 * level XP
        return 100 * this.level;
    }
    
    /**
     * Update spell slots based on current class and level
     */
    updateSpellSlots() {
        const classData = Class.getClassData(this.class);
        if (!classData || !classData.spellProgression) {
            this.spellSlots = { arcane: [], divine: [] };
            return;
        }
        
        if (classData.spells === 'arcane' || classData.spells === 'both' || classData.spells === 'limited_arcane') {
            this.spellSlots.arcane = Class.getSpellSlots(this, 'arcane');
        }
        
        if (classData.spells === 'divine' || classData.spells === 'both' || classData.spells === 'limited_divine') {
            this.spellSlots.divine = Class.getSpellSlots(this, 'divine');
        }
    }
    
    /**
     * Add temporary effect (curse, buff, etc.)
     */
    addTemporaryEffect(effect) {
        this.temporaryEffects.push({
            ...effect,
            id: Helpers.generateId('effect'),
            appliedAt: Date.now()
        });
    }
    
    /**
     * Remove temporary effect
     */
    removeTemporaryEffect(effectId) {
        this.temporaryEffects = this.temporaryEffects.filter(e => e.id !== effectId);
    }
    
    /**
     * Get effective attributes (including temporary effects)
     */
    getEffectiveAttributes() {
        const effective = { ...this.attributes };
        
        this.temporaryEffects.forEach(effect => {
            if (effect.type === 'stat_drain' && effect.stat) {
                effective[effect.stat] = Math.max(1, effective[effect.stat] - (effect.amount || 1));
            }
        });
        
        return effective;
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
            age: this.age,
            maxAge: this.maxAge,
            classHistory: [...this.classHistory],
            spellSlots: { ...this.spellSlots },
            memorizedSpells: { ...this.memorizedSpells },
            equipment: { ...this.equipment },
            temporaryEffects: [...this.temporaryEffects],
            availability: this.availability,
            partyId: this.partyId
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
        this.age = saveData.age || Random.integer(16, 25);
        this.maxAge = saveData.maxAge || this.calculateMaxAge();
        this.classHistory = saveData.classHistory || [{ class: this.class, level: 1, maxLevel: 1, timestamp: Date.now() }];
        this.spellSlots = saveData.spellSlots || { arcane: [], divine: [] };
        this.memorizedSpells = saveData.memorizedSpells || { arcane: [], divine: [] };
        this.equipment = { ...this.equipment, ...saveData.equipment };
        this.temporaryEffects = saveData.temporaryEffects || [];
        this.availability = saveData.availability || 'available';
        this.partyId = saveData.partyId || null;
    }
    
    /**
     * Save character to persistent storage
     */
    async saveToStorage() {
        try {
            // Import Storage dynamically to avoid circular dependencies
            const { default: Storage } = await import('../utils/Storage.js');
            await Storage.saveCharacter(this);
        } catch (error) {
            console.error(`Failed to save character ${this.name} to storage:`, error);
        }
    }
}