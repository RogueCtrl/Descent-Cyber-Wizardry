/**
 * Spell System
 * Handles magic spells and spell casting
 */
class Spells {
    constructor() {
        this.knownSpells = new Map();
        this.spellDatabase = this.initializeSpellDatabase();
    }
    
    /**
     * Initialize spell database
     */
    initializeSpellDatabase() {
        return {
            // Arcane Spells (Mage School)
            arcane: {
                1: {
                    'Magic Missile': {
                        name: 'Magic Missile',
                        school: 'arcane',
                        level: 1,
                        description: 'Unerring magical projectile',
                        effect: 'damage',
                        dice: { count: 1, sides: 4, bonus: 1 },
                        range: 'medium',
                        duration: 'instantaneous',
                        components: ['V', 'S']
                    },
                    'Shield': {
                        name: 'Shield',
                        school: 'arcane',
                        level: 1,
                        description: 'Magical armor that blocks attacks',
                        effect: 'protection',
                        acBonus: 4,
                        range: 'self',
                        duration: 'combat',
                        components: ['V', 'S']
                    },
                    'Light': {
                        name: 'Light',
                        school: 'arcane',
                        level: 1,
                        description: 'Creates magical illumination',
                        effect: 'utility',
                        range: 'touch',
                        duration: 'long',
                        components: ['V', 'M']
                    }
                },
                2: {
                    'Web': {
                        name: 'Web',
                        school: 'arcane',
                        level: 2,
                        description: 'Entangles enemies in sticky webs',
                        effect: 'control',
                        range: 'medium',
                        duration: 'combat',
                        components: ['V', 'S', 'M']
                    },
                    'Invisibility': {
                        name: 'Invisibility',
                        school: 'arcane',
                        level: 2,
                        description: 'Makes target invisible',
                        effect: 'concealment',
                        range: 'touch',
                        duration: 'long',
                        components: ['V', 'S', 'M']
                    },
                    'Knock': {
                        name: 'Knock',
                        school: 'arcane',
                        level: 2,
                        description: 'Opens locked doors and containers',
                        effect: 'utility',
                        range: 'medium',
                        duration: 'instantaneous',
                        components: ['V']
                    }
                },
                3: {
                    'Fireball': {
                        name: 'Fireball',
                        school: 'arcane',
                        level: 3,
                        description: 'Explosive sphere of flame',
                        effect: 'damage',
                        dice: { count: 3, sides: 6 },
                        range: 'long',
                        duration: 'instantaneous',
                        areaEffect: true,
                        components: ['V', 'S', 'M']
                    },
                    'Lightning Bolt': {
                        name: 'Lightning Bolt',
                        school: 'arcane',
                        level: 3,
                        description: 'Stroke of lightning',
                        effect: 'damage',
                        dice: { count: 3, sides: 6 },
                        range: 'long',
                        duration: 'instantaneous',
                        components: ['V', 'S', 'M']
                    },
                    'Dispel Magic': {
                        name: 'Dispel Magic',
                        school: 'arcane',
                        level: 3,
                        description: 'Removes magical effects',
                        effect: 'dispel',
                        range: 'medium',
                        duration: 'instantaneous',
                        components: ['V', 'S']
                    }
                }
            },
            // Divine Spells (Priest School)
            divine: {
                1: {
                    'Cure Light Wounds': {
                        name: 'Cure Light Wounds',
                        school: 'divine',
                        level: 1,
                        description: 'Heals minor injuries',
                        effect: 'heal',
                        dice: { count: 1, sides: 8, bonus: 1 },
                        range: 'touch',
                        duration: 'instantaneous',
                        components: ['V', 'S']
                    },
                    'Bless': {
                        name: 'Bless',
                        school: 'divine',
                        level: 1,
                        description: 'Grants divine favor in combat',
                        effect: 'buff',
                        bonus: 1,
                        range: 'medium',
                        duration: 'combat',
                        components: ['V', 'S', 'M']
                    },
                    'Protection from Evil': {
                        name: 'Protection from Evil',
                        school: 'divine',
                        level: 1,
                        description: 'Wards against evil creatures',
                        effect: 'protection',
                        acBonus: 2,
                        range: 'touch',
                        duration: 'long',
                        components: ['V', 'S', 'M']
                    }
                },
                2: {
                    'Hold Person': {
                        name: 'Hold Person',
                        school: 'divine',
                        level: 2,
                        description: 'Paralyzes a humanoid',
                        effect: 'control',
                        range: 'medium',
                        duration: 'combat',
                        components: ['V', 'S', 'F']
                    },
                    'Silence': {
                        name: 'Silence',
                        school: 'divine',
                        level: 2,
                        description: 'Creates zone of magical silence',
                        effect: 'control',
                        range: 'long',
                        duration: 'combat',
                        components: ['V', 'S']
                    },
                    'Spiritual Hammer': {
                        name: 'Spiritual Hammer',
                        school: 'divine',
                        level: 2,
                        description: 'Conjures magical weapon',
                        effect: 'damage',
                        dice: { count: 1, sides: 6, bonus: 1 },
                        range: 'medium',
                        duration: 'combat',
                        components: ['V', 'S', 'F']
                    }
                },
                3: {
                    'Cure Disease': {
                        name: 'Cure Disease',
                        school: 'divine',
                        level: 3,
                        description: 'Removes disease and poison',
                        effect: 'heal',
                        range: 'touch',
                        duration: 'instantaneous',
                        components: ['V', 'S']
                    },
                    'Remove Curse': {
                        name: 'Remove Curse',
                        school: 'divine',
                        level: 3,
                        description: 'Breaks curses and enchantments',
                        effect: 'dispel',
                        range: 'touch',
                        duration: 'instantaneous',
                        components: ['V', 'S']
                    },
                    'Prayer': {
                        name: 'Prayer',
                        school: 'divine',
                        level: 3,
                        description: 'Blesses allies and curses enemies',
                        effect: 'buff',
                        bonus: 1,
                        range: 'medium',
                        duration: 'combat',
                        areaEffect: true,
                        components: ['V', 'S', 'F']
                    }
                }
            }
        };
    }
    
    /**
     * Get spell data
     */
    static getSpellData(spellName, school = null) {
        const spells = new Spells();
        return spells.getSpell(spellName, school);
    }
    
    /**
     * Get spell from database
     */
    getSpell(spellName, school = null) {
        // Search in specified school first
        if (school && this.spellDatabase[school]) {
            for (const level of Object.values(this.spellDatabase[school])) {
                if (level[spellName]) {
                    return level[spellName];
                }
            }
        }
        
        // Search all schools if not found or no school specified
        for (const schoolName of Object.keys(this.spellDatabase)) {
            for (const level of Object.values(this.spellDatabase[schoolName])) {
                if (level[spellName]) {
                    return level[spellName];
                }
            }
        }
        
        return null;
    }
    
    /**
     * Get all spells of a specific school and level
     */
    getSpellsBySchoolAndLevel(school, level) {
        if (!this.spellDatabase[school] || !this.spellDatabase[school][level]) {
            return [];
        }
        
        return Object.values(this.spellDatabase[school][level]);
    }
    
    /**
     * Get available spells for character based on class and level
     */
    getAvailableSpells(character) {
        const classData = Class.getClassData(character.class);
        if (!classData || !classData.spells) {
            return { arcane: [], divine: [] };
        }
        
        const availableSpells = { arcane: [], divine: [] };
        
        // Determine which schools the character can access
        const canCastArcane = classData.spells === 'arcane' || classData.spells === 'both' || classData.spells === 'limited_arcane';
        const canCastDivine = classData.spells === 'divine' || classData.spells === 'both' || classData.spells === 'limited_divine';
        
        // Get spell slots to determine available levels
        if (canCastArcane) {
            const arcaneSlots = Class.getSpellSlots(character, 'arcane');
            for (let level = 1; level <= arcaneSlots.length; level++) {
                if (arcaneSlots[level - 1] > 0) {
                    availableSpells.arcane.push(...this.getSpellsBySchoolAndLevel('arcane', level));
                }
            }
        }
        
        if (canCastDivine) {
            const divineSlots = Class.getSpellSlots(character, 'divine');
            for (let level = 1; level <= divineSlots.length; level++) {
                if (divineSlots[level - 1] > 0) {
                    availableSpells.divine.push(...this.getSpellsBySchoolAndLevel('divine', level));
                }
            }
        }
        
        return availableSpells;
    }
    
    /**
     * Cast a spell
     */
    castSpell(caster, spellName, target = null) {
        const spell = this.getSpell(spellName);
        if (!spell) {
            return { success: false, message: 'Spell not found' };
        }
        
        // Check if character can cast this spell
        if (!this.canCastSpell(caster, spell)) {
            return { success: false, message: 'Cannot cast this spell' };
        }
        
        // Check if spell is memorized
        if (!this.isSpellMemorized(caster, spell)) {
            return { success: false, message: 'Spell not memorized' };
        }
        
        // Roll for spell success
        const successChance = this.calculateSpellSuccessChance(caster, spell);
        if (!Random.percent(successChance)) {
            this.removeMemorizedSpell(caster, spell);
            return { success: false, message: 'Spell casting failed' };
        }
        
        // Execute spell effect
        const result = this.executeSpellEffect(spell, caster, target);
        
        // Remove memorized spell
        this.removeMemorizedSpell(caster, spell);
        
        return {
            success: true,
            spell: spell,
            result: result,
            message: `${caster.name} successfully casts ${spell.name}`
        };
    }
    
    /**
     * Check if character can cast a spell
     */
    canCastSpell(caster, spell) {
        const classData = Class.getClassData(caster.class);
        if (!classData || !classData.spells) return false;
        
        // Check if character's class can cast this school of magic
        const canCastSchool = (
            (spell.school === 'arcane' && (classData.spells === 'arcane' || classData.spells === 'both' || classData.spells === 'limited_arcane')) ||
            (spell.school === 'divine' && (classData.spells === 'divine' || classData.spells === 'both' || classData.spells === 'limited_divine'))
        );
        
        if (!canCastSchool) return false;
        
        // Check if character has spell slots of the required level
        const spellSlots = Class.getSpellSlots(caster, spell.school);
        return spellSlots.length >= spell.level && spellSlots[spell.level - 1] > 0;
    }
    
    /**
     * Check if spell is memorized
     */
    isSpellMemorized(caster, spell) {
        if (!caster.memorizedSpells || !caster.memorizedSpells[spell.school]) {
            return false;
        }
        
        return caster.memorizedSpells[spell.school].some(memorizedSpell => 
            memorizedSpell.name === spell.name
        );
    }
    
    /**
     * Calculate spell success chance
     */
    calculateSpellSuccessChance(caster, spell) {
        const baseChance = 85;
        const levelDifference = caster.level - spell.level;
        const attributeBonus = spell.school === 'arcane' ? 
            (caster.attributes.intelligence - 10) * 2 : 
            (caster.attributes.piety - 10) * 2;
        
        const successChance = baseChance + (levelDifference * 5) + attributeBonus;
        
        return Math.min(95, Math.max(5, successChance));
    }
    
    /**
     * Execute spell effect
     */
    executeSpellEffect(spell, caster, target) {
        switch (spell.effect) {
            case 'damage':
                return this.executeDamageSpell(spell, caster, target);
            case 'heal':
                return this.executeHealSpell(spell, caster, target);
            case 'buff':
                return this.executeBuffSpell(spell, caster, target);
            case 'protection':
                return this.executeProtectionSpell(spell, caster, target);
            case 'control':
                return this.executeControlSpell(spell, caster, target);
            case 'utility':
                return this.executeUtilitySpell(spell, caster, target);
            case 'dispel':
                return this.executeDispelSpell(spell, caster, target);
            default:
                return { message: 'Spell effect unknown' };
        }
    }
    
    /**
     * Execute damage spell
     */
    executeDamageSpell(spell, caster, target) {
        if (!target) {
            return { message: 'No target for damage spell' };
        }
        
        let damage = 0;
        if (spell.dice) {
            damage = Random.dice(spell.dice.count, spell.dice.sides) + (spell.dice.bonus || 0);
        }
        
        // Apply caster level bonus for some spells
        if (spell.name === 'Magic Missile') {
            damage += Math.floor(caster.level / 2);
        }
        
        target.currentHP = Math.max(0, target.currentHP - damage);
        
        if (target.currentHP <= 0) {
            target.isAlive = false;
            target.status = 'dead';
        }
        
        return {
            damage: damage,
            message: `${target.name || 'Target'} takes ${damage} damage`
        };
    }
    
    /**
     * Execute healing spell
     */
    executeHealSpell(spell, caster, target) {
        if (!target) {
            return { message: 'No target for healing spell' };
        }
        
        let healing = 0;
        if (spell.dice) {
            healing = Random.dice(spell.dice.count, spell.dice.sides) + (spell.dice.bonus || 0);
        }
        
        const oldHP = target.currentHP;
        target.currentHP = Math.min(target.maxHP, target.currentHP + healing);
        const actualHealing = target.currentHP - oldHP;
        
        return {
            healing: actualHealing,
            message: `${target.name || 'Target'} heals ${actualHealing} hit points`
        };
    }
    
    /**
     * Execute buff spell
     */
    executeBuffSpell(spell, caster, target) {
        const targets = spell.areaEffect ? [caster] : [target || caster]; // Simplified area effect
        
        targets.forEach(t => {
            if (t && t.temporaryEffects) {
                t.addTemporaryEffect({
                    type: 'buff',
                    source: spell.name,
                    bonus: spell.bonus || 1,
                    duration: spell.duration
                });
            }
        });
        
        return {
            message: `${spell.name} grants a bonus to ${targets.length} target(s)`
        };
    }
    
    /**
     * Execute protection spell
     */
    executeProtectionSpell(spell, caster, target) {
        const recipient = target || caster;
        
        if (recipient.temporaryEffects) {
            recipient.addTemporaryEffect({
                type: 'ac_bonus',
                source: spell.name,
                bonus: spell.acBonus || 2,
                duration: spell.duration
            });
        }
        
        return {
            message: `${recipient.name || 'Target'} gains magical protection`
        };
    }
    
    /**
     * Execute control spell
     */
    executeControlSpell(spell, caster, target) {
        if (!target) {
            return { message: 'No target for control spell' };
        }
        
        // Simple control effect - could be expanded
        const saveChance = this.calculateSaveChance(target, spell);
        
        if (Random.percent(saveChance)) {
            return { message: `${target.name || 'Target'} resists the spell` };
        }
        
        if (target.temporaryEffects) {
            target.addTemporaryEffect({
                type: 'control',
                source: spell.name,
                effect: spell.name.toLowerCase().replace(' ', '_'),
                duration: spell.duration
            });
        }
        
        return {
            message: `${target.name || 'Target'} is affected by ${spell.name}`
        };
    }
    
    /**
     * Execute utility spell
     */
    executeUtilitySpell(spell, caster, target) {
        // Utility spells have various effects
        return {
            message: `${spell.name} takes effect`
        };
    }
    
    /**
     * Execute dispel spell
     */
    executeDispelSpell(spell, caster, target) {
        if (!target) {
            return { message: 'No target for dispel spell' };
        }
        
        if (target.temporaryEffects) {
            const removedEffects = target.temporaryEffects.length;
            target.temporaryEffects = [];
            
            return {
                message: `${removedEffects} magical effect(s) dispelled from ${target.name || 'target'}`
            };
        }
        
        return { message: 'No magical effects to dispel' };
    }
    
    /**
     * Calculate save chance against spell
     */
    calculateSaveChance(target, spell) {
        const baseSave = 50;
        const levelBonus = (target.level || 1) * 5;
        const attributeBonus = spell.school === 'arcane' ? 
            (target.attributes?.intelligence || 10) - 10 : 
            (target.attributes?.piety || 10) - 10;
        
        return Math.min(95, Math.max(5, baseSave + levelBonus + attributeBonus));
    }
    
    /**
     * Remove memorized spell
     */
    removeMemorizedSpell(caster, spell) {
        if (!caster.memorizedSpells || !caster.memorizedSpells[spell.school]) {
            return;
        }
        
        const spells = caster.memorizedSpells[spell.school];
        const index = spells.findIndex(s => s.name === spell.name);
        if (index !== -1) {
            spells.splice(index, 1);
        }
    }
    
    /**
     * Memorize spells for character
     */
    memorizeSpells(character, selectedSpells) {
        const availableSlots = {
            arcane: Class.getSpellSlots(character, 'arcane'),
            divine: Class.getSpellSlots(character, 'divine')
        };
        
        const memorized = { arcane: [], divine: [] };
        
        // Process each school
        for (const school of ['arcane', 'divine']) {
            const schoolSpells = selectedSpells[school] || [];
            const slots = availableSlots[school];
            
            for (const spellSelection of schoolSpells) {
                const spell = this.getSpell(spellSelection.name, school);
                if (!spell) continue;
                
                const levelIndex = spell.level - 1;
                if (levelIndex < slots.length && slots[levelIndex] > 0) {
                    memorized[school].push(spell);
                    slots[levelIndex]--;
                }
            }
        }
        
        character.memorizedSpells = memorized;
        return memorized;
    }
    
    /**
     * Get spell descriptions for UI
     */
    getSpellDescriptions(spells) {
        return spells.map(spell => ({
            name: spell.name,
            level: spell.level,
            school: spell.school,
            description: spell.description,
            range: spell.range,
            duration: spell.duration,
            components: spell.components?.join(', ') || 'None'
        }));
    }
}