import { Storage } from '../utils/Storage.ts';
import { Helpers } from '../utils/Helpers.ts';
import { Random } from '../utils/Random.ts';
import { Class } from './CharacterClass.ts';

/**
 * Character Class
 * Represents a single character with stats, class, and abilities
 */
export class Character {
    id: any;
    name: any;
    race: any;
    class: any;
    level: number;
    attributes: Record<string, any>;
    maxHP: number;
    currentHP: number;
    status: string;
    isAlive: boolean;
    experience: number;
    experienceToNext: number;
    age: any;
    maxAge: any;
    classHistory: any[];
    spellSlots: Record<string, any>;
    memorizedSpells: Record<string, any>;
    equipment: Record<string, any>;
    temporaryEffects: any[];
    availability: string;
    partyId: any;
    isPhasedOut: boolean;
    phaseOutReason: any;
    phaseOutDate: any;
    canPhaseBackIn: boolean;
    originalTeamAssignment: any;
    teamAssignmentDate: any;
    teamLoyalty: number;
    isLost: any;

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
        this.status = 'ok';
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
        this.partyId = null; // Must be set for all active characters (except memorial)
        
        // NEW: Phased out system for team membership management
        this.isPhasedOut = false;        // Hidden from UI/combat but still in team
        this.phaseOutReason = null;      // 'combat_disconnect', 'confused', etc.
        this.phaseOutDate = null;        // When they were phased out
        this.canPhaseBackIn = true;      // Whether they can rejoin active roster
        
        // NEW: Team assignment tracking
        this.originalTeamAssignment = null;  // First team they joined
        this.teamAssignmentDate = null;      // When they joined current team
        this.teamLoyalty = 100;              // Thematic stat for team cohesion
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
     * Get current weapon information
     */
    getCurrentWeapon() {
        if (this.equipment.weapon) {
            return this.equipment.weapon;
        } else {
            // Return unarmed "weapon" information
            return {
                name: 'Unarmed',
                type: 'unarmed',
                damageBonus: 0,
                attackBonus: 0,
                description: 'Fighting with fists and feet'
            };
        }
    }
    
    /**
     * Check if character is unarmed
     */
    isUnarmed() {
        return !this.equipment.weapon;
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
            partyId: this.partyId,
            
            // NEW: Save phased out system properties
            isPhasedOut: this.isPhasedOut,
            phaseOutReason: this.phaseOutReason,
            phaseOutDate: this.phaseOutDate,
            canPhaseBackIn: this.canPhaseBackIn,
            
            // NEW: Save team assignment tracking
            originalTeamAssignment: this.originalTeamAssignment,
            teamAssignmentDate: this.teamAssignmentDate,
            teamLoyalty: this.teamLoyalty
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
        
        // NEW: Load phased out system properties
        this.isPhasedOut = saveData.isPhasedOut || false;
        this.phaseOutReason = saveData.phaseOutReason || null;
        this.phaseOutDate = saveData.phaseOutDate || null;
        this.canPhaseBackIn = saveData.canPhaseBackIn !== undefined ? saveData.canPhaseBackIn : true;
        
        // NEW: Load team assignment tracking
        this.originalTeamAssignment = saveData.originalTeamAssignment || null;
        this.teamAssignmentDate = saveData.teamAssignmentDate || null;
        this.teamLoyalty = saveData.teamLoyalty !== undefined ? saveData.teamLoyalty : 100;
    }
    
    /**
     * Save character to persistent storage
     */
    async saveToStorage() {
        try {
            // Use global Storage class (static methods)
            if (typeof Storage !== 'undefined' && Storage.saveCharacter) {
                await Storage.saveCharacter(this);
            } else {
                console.warn(`Storage system not available, character ${this.name} not saved`);
            }
        } catch (error) {
            console.error(`Failed to save character ${this.name} to storage:`, error);
        }
    }
    
    /**
     * NEW: Validate that character has proper team membership
     * Ensures all active characters belong to a Strike Team
     */
    validateTeamMembership() {
        // Check if character is in memorial state (permanently lost)
        const isMemorial = this.isCharacterPermanentlyLost ? this.isCharacterPermanentlyLost() : false;
        
        // Active characters must have a party assignment
        if (!isMemorial && !this.partyId) {
            throw new Error(`Active character ${this.name} must have partyId - all agents must be part of a Strike Team`);
        }
        
        return true;
    }
    
    /**
     * NEW: Check if character can participate in active gameplay
     * Returns true if character is active team member (not phased out or lost)
     */
    isActiveTeamMember() {
        return this.partyId && !this.isPhasedOut && !this.isCharacterPermanentlyLost();
    }
    
    /**
     * NEW: Phase out character while maintaining team membership
     * Removes from active UI/combat but keeps in Strike Team
     */
    phaseOut(reason = 'disconnected') {
        console.log(`Phasing out agent ${this.name}: ${reason}`);
        this.isPhasedOut = true;
        this.phaseOutReason = reason;
        this.phaseOutDate = new Date().toISOString();
        // Keep partyId - they're still team members!
    }
    
    /**
     * NEW: Bring character back to active status
     * Allows agent to rejoin active roster
     */
    phaseIn() {
        if (this.canPhaseBackIn) {
            console.log(`Phasing in agent ${this.name}`);
            this.isPhasedOut = false;
            this.phaseOutReason = null;
            this.phaseOutDate = null;
            return true;
        }
        return false;
    }
    
    /**
     * NEW: Check if character is permanently lost (memorial state)
     * Helper method for team membership validation
     */
    isCharacterPermanentlyLost() {
        // Use existing logic or implement based on death system
        return this.status === 'lost' || this.status === 'uninstalled' || 
               (this.isLost === true) || (this.status === 'ashes' && this.isLost);
    }
}
