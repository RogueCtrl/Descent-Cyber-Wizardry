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
                if (levelIndex >= slots.length || slots[levelIndex] <= 0) {\n                    return { valid: false, reason: `No spell slots available for ${spell.name} (level ${spell.level})` };\n                }\n                \n                // Consume slot\n                slots[levelIndex]--;\n            }\n        }\n        \n        return { valid: true };\n    }\n    \n    /**\n     * Get recommended spell loadout for character\n     */\n    getRecommendedSpells(character) {\n        const availableSpells = this.spellSystem.getAvailableSpells(character);\n        const slots = {\n            arcane: Class.getSpellSlots(character, 'arcane'),\n            divine: Class.getSpellSlots(character, 'divine')\n        };\n        \n        const recommendations = { arcane: [], divine: [] };\n        \n        // Recommend spells based on class and situation\n        for (const school of ['arcane', 'divine']) {\n            const schoolSpells = availableSpells[school];\n            const schoolSlots = slots[school];\n            \n            for (let level = 1; level <= schoolSlots.length; level++) {\n                const availableSlots = schoolSlots[level - 1];\n                if (availableSlots <= 0) continue;\n                \n                const levelSpells = schoolSpells.filter(spell => spell.level === level);\n                const recommended = this.selectRecommendedSpells(levelSpells, availableSlots, character);\n                \n                recommendations[school].push(...recommended);\n            }\n        }\n        \n        return recommendations;\n    }\n    \n    /**\n     * Select recommended spells for a specific level\n     */\n    selectRecommendedSpells(availableSpells, slotCount, character) {\n        if (availableSpells.length === 0) return [];\n        \n        // Priority system based on spell utility\n        const spellPriorities = {\n            // Healing is always high priority\n            'Cure Light Wounds': 10,\n            'Cure Disease': 9,\n            \n            // Damage spells are reliable\n            'Magic Missile': 8,\n            'Fireball': 8,\n            'Lightning Bolt': 8,\n            \n            // Utility spells\n            'Light': 7,\n            'Protection from Evil': 7,\n            'Bless': 6,\n            \n            // Control spells\n            'Hold Person': 6,\n            'Web': 6,\n            \n            // Defensive spells\n            'Shield': 5,\n            'Prayer': 5\n        };\n        \n        // Sort spells by priority\n        const sortedSpells = availableSpells.sort((a, b) => {\n            const priorityA = spellPriorities[a.name] || 1;\n            const priorityB = spellPriorities[b.name] || 1;\n            return priorityB - priorityA;\n        });\n        \n        // Select top spells up to slot limit\n        return sortedSpells.slice(0, slotCount);\n    }\n    \n    /**\n     * Get spell preparation interface data\n     */\n    getPreparationData(character) {\n        const availableSpells = this.spellSystem.getAvailableSpells(character);\n        const currentSlots = {\n            arcane: Class.getSpellSlots(character, 'arcane'),\n            divine: Class.getSpellSlots(character, 'divine')\n        };\n        \n        const spellDescriptions = {\n            arcane: this.spellSystem.getSpellDescriptions(availableSpells.arcane),\n            divine: this.spellSystem.getSpellDescriptions(availableSpells.divine)\n        };\n        \n        return {\n            availableSpells: spellDescriptions,\n            slots: currentSlots,\n            currentMemorized: character.memorizedSpells || { arcane: [], divine: [] },\n            recommendations: this.getRecommendedSpells(character)\n        };\n    }\n    \n    /**\n     * Auto-prepare spells based on character level and class\n     */\n    autoPrepareSpells(character) {\n        const recommendations = this.getRecommendedSpells(character);\n        \n        const spellSelections = {\n            arcane: recommendations.arcane.map(spell => ({ name: spell.name })),\n            divine: recommendations.divine.map(spell => ({ name: spell.name }))\n        };\n        \n        return this.prepareSpells(character, spellSelections);\n    }\n    \n    /**\n     * Check if character needs to prepare spells\n     */\n    needsSpellPreparation(character) {\n        const classData = Class.getClassData(character.class);\n        if (!classData || !classData.spells) return false;\n        \n        const slots = {\n            arcane: Class.getSpellSlots(character, 'arcane'),\n            divine: Class.getSpellSlots(character, 'divine')\n        };\n        \n        const memorized = character.memorizedSpells || { arcane: [], divine: [] };\n        \n        // Check if there are available slots that aren't filled\n        for (const school of ['arcane', 'divine']) {\n            const totalSlots = slots[school].reduce((sum, count) => sum + count, 0);\n            const memorizedCount = memorized[school].length;\n            \n            if (totalSlots > memorizedCount) {\n                return true;\n            }\n        }\n        \n        return false;\n    }\n    \n    /**\n     * Get spell casting statistics\n     */\n    getSpellStatistics(character) {\n        const memorized = character.memorizedSpells || { arcane: [], divine: [] };\n        const slots = {\n            arcane: Class.getSpellSlots(character, 'arcane'),\n            divine: Class.getSpellSlots(character, 'divine')\n        };\n        \n        const stats = {\n            arcane: {\n                memorized: memorized.arcane.length,\n                totalSlots: slots.arcane.reduce((sum, count) => sum + count, 0),\n                byLevel: {}\n            },\n            divine: {\n                memorized: memorized.divine.length,\n                totalSlots: slots.divine.reduce((sum, count) => sum + count, 0),\n                byLevel: {}\n            }\n        };\n        \n        // Count memorized spells by level\n        for (const school of ['arcane', 'divine']) {\n            const schoolSpells = memorized[school];\n            \n            for (let level = 1; level <= 7; level++) {\n                const levelSpells = schoolSpells.filter(spell => spell.level === level);\n                const availableSlots = slots[school][level - 1] || 0;\n                \n                stats[school].byLevel[level] = {\n                    memorized: levelSpells.length,\n                    available: availableSlots,\n                    remaining: Math.max(0, availableSlots - levelSpells.length)\n                };\n            }\n        }\n        \n        return stats;\n    }\n    \n    /**\n     * Rest and recover spell slots\n     */\n    restAndRecover(character, restType = 'full') {\n        const multiplier = restType === 'full' ? 1.0 : 0.5;\n        \n        // Update spell slots based on current level\n        character.updateSpellSlots();\n        \n        // If full rest, allow spell preparation\n        if (restType === 'full') {\n            return {\n                canPrepareSpells: true,\n                message: 'Full rest completed. You may prepare spells.',\n                needsPreparation: this.needsSpellPreparation(character)\n            };\n        } else {\n            return {\n                canPrepareSpells: false,\n                message: 'Partial rest completed. No spell preparation available.',\n                needsPreparation: false\n            };\n        }\n    }\n}"