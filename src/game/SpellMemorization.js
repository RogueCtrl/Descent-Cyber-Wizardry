/**
 * Spell Memorization System
 * Handles spell preparation and memorization mechanics
 */
class SpellMemorization {
    constructor() {
        this.spellSystem = new Spells();
    }
    
    /**
     * Prepare spells for character during rest
     */
    prepareSpells(character, spellSelections) {
        const result = this.validateSpellSelections(character, spellSelections);
        if (!result.valid) {
            return { success: false, reason: result.reason };
        }
        
        // Clear current memorized spells
        character.memorizedSpells = { arcane: [], divine: [] };
        
        // Memorize selected spells
        const memorized = this.spellSystem.memorizeSpells(character, spellSelections);
        
        return {
            success: true,
            memorized: memorized,
            message: 'Spells successfully memorized'
        };
    }
    
    /**
     * Validate spell selections against character's capabilities
     */
    validateSpellSelections(character, spellSelections) {
        const classData = Class.getClassData(character.class);
        if (!classData || !classData.spells) {
            return { valid: false, reason: 'Character cannot cast spells' };
        }
        
        const availableSlots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        // Check each school
        for (const school of ['arcane', 'divine']) {
            const schoolSpells = spellSelections[school] || [];
            const slots = [...availableSlots[school]]; // Copy to avoid mutation
            
            // Check if character can cast this school
            const canCastSchool = (
                (school === 'arcane' && (classData.spells === 'arcane' || classData.spells === 'both' || classData.spells === 'limited_arcane')) ||
                (school === 'divine' && (classData.spells === 'divine' || classData.spells === 'both' || classData.spells === 'limited_divine'))
            );
            
            if (!canCastSchool && schoolSpells.length > 0) {
                return { valid: false, reason: `Cannot cast ${school} spells` };
            }
            
            // Validate each spell selection
            for (const spellSelection of schoolSpells) {
                const spell = this.spellSystem.getSpell(spellSelection.name, school);
                if (!spell) {
                    return { valid: false, reason: `Spell ${spellSelection.name} not found` };
                }
                
                // Check if character has the required spell level
                const levelIndex = spell.level - 1;
                if (levelIndex >= slots.length || slots[levelIndex] <= 0) {
                    return { valid: false, reason: `No spell slots available for ${spell.name} (level ${spell.level})` };
                }
                
                // Consume slot
                slots[levelIndex]--;
            }
        }
        
        return { valid: true };
    }
    
    /**
     * Get recommended spell loadout for character
     */
    getRecommendedSpells(character) {
        const availableSpells = this.spellSystem.getAvailableSpells(character);
        const slots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        const recommendations = { arcane: [], divine: [] };
        
        // Recommend spells based on class and situation
        for (const school of ['arcane', 'divine']) {
            const schoolSpells = availableSpells[school];
            const schoolSlots = slots[school];
            
            for (let level = 1; level <= schoolSlots.length; level++) {
                const availableSlots = schoolSlots[level - 1];
                if (availableSlots <= 0) continue;
                
                const levelSpells = schoolSpells.filter(spell => spell.level === level);
                const recommended = this.selectRecommendedSpells(levelSpells, availableSlots, character);
                
                recommendations[school].push(...recommended);
            }
        }
        
        return recommendations;
    }
    
    /**
     * Select recommended spells for a specific level
     */
    selectRecommendedSpells(availableSpells, slotCount, character) {
        if (availableSpells.length === 0) return [];
        
        // Priority system based on spell utility
        const spellPriorities = {
            // Healing is always high priority
            'Cure Light Wounds': 10,
            'Cure Disease': 9,
            
            // Damage spells are reliable
            'Magic Missile': 8,
            'Fireball': 8,
            'Lightning Bolt': 8,
            
            // Utility spells
            'Light': 7,
            'Protection from Evil': 7,
            'Bless': 6,
            
            // Control spells
            'Hold Person': 6,
            'Web': 6,
            
            // Defensive spells
            'Shield': 5,
            'Prayer': 5
        };
        
        // Sort spells by priority
        const sortedSpells = availableSpells.sort((a, b) => {
            const priorityA = spellPriorities[a.name] || 1;
            const priorityB = spellPriorities[b.name] || 1;
            return priorityB - priorityA;
        });
        
        // Select top spells up to slot limit
        return sortedSpells.slice(0, slotCount);
    }
    
    /**
     * Get spell preparation interface data
     */
    getPreparationData(character) {
        const availableSpells = this.spellSystem.getAvailableSpells(character);
        const currentSlots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        const spellDescriptions = {
            arcane: this.spellSystem.getSpellDescriptions(availableSpells.arcane),
            divine: this.spellSystem.getSpellDescriptions(availableSpells.divine)
        };
        
        return {
            availableSpells: spellDescriptions,
            slots: currentSlots,
            currentMemorized: character.memorizedSpells || { arcane: [], divine: [] },
            recommendations: this.getRecommendedSpells(character)
        };
    }
    
    /**
     * Auto-prepare spells based on character level and class
     */
    autoPrepareSpells(character) {
        const recommendations = this.getRecommendedSpells(character);
        
        const spellSelections = {
            arcane: recommendations.arcane.map(spell => ({ name: spell.name })),
            divine: recommendations.divine.map(spell => ({ name: spell.name }))
        };
        
        return this.prepareSpells(character, spellSelections);
    }
    
    /**
     * Check if character needs to prepare spells
     */
    needsSpellPreparation(character) {
        const classData = Class.getClassData(character.class);
        if (!classData || !classData.spells) return false;
        
        const slots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        const memorized = character.memorizedSpells || { arcane: [], divine: [] };
        
        // Check if there are available slots that aren't filled
        for (const school of ['arcane', 'divine']) {
            const totalSlots = slots[school].reduce((sum, count) => sum + count, 0);
            const memorizedCount = memorized[school].length;
            
            if (totalSlots > memorizedCount) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get spell casting statistics
     */
    getSpellStatistics(character) {
        const memorized = character.memorizedSpells || { arcane: [], divine: [] };
        const slots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        const stats = {
            arcane: {
                memorized: memorized.arcane.length,
                totalSlots: slots.arcane.reduce((sum, count) => sum + count, 0),
                byLevel: {}
            },
            divine: {
                memorized: memorized.divine.length,
                totalSlots: slots.divine.reduce((sum, count) => sum + count, 0),
                byLevel: {}
            }
        };
        
        // Count memorized spells by level
        for (const school of ['arcane', 'divine']) {
            const schoolSpells = memorized[school];
            
            for (let level = 1; level <= 7; level++) {
                const levelSpells = schoolSpells.filter(spell => spell.level === level);
                const availableSlots = slots[school][level - 1] || 0;
                
                stats[school].byLevel[level] = {
                    memorized: levelSpells.length,
                    available: availableSlots,
                    remaining: Math.max(0, availableSlots - levelSpells.length)
                };
            }
        }
        
        return stats;
    }
    
    /**
     * Rest and recover spell slots
     */
    restAndRecover(character, restType = 'full') {
        const multiplier = restType === 'full' ? 1.0 : 0.5;
        
        // Update spell slots based on current level
        character.updateSpellSlots();
        
        // If full rest, allow spell preparation
        if (restType === 'full') {
            return {
                canPrepareSpells: true,
                message: 'Full rest completed. You may prepare spells.',
                needsPreparation: this.needsSpellPreparation(character)
            };
        } else {
            return {
                canPrepareSpells: false,
                message: 'Partial rest completed. No spell preparation available.',
                needsPreparation: false
            };
        }
    }
}