/**
 * Spells Entity Migration - Version 1.0.0
 * Contains all spell data for the game
 */

// Global assignment for browser compatibility
export const spellsMigration = {
    version: '1.0.0',
    entity: 'spells',
    store: 'spells',
    description: 'Initial spells data migration',
    
    data: {
        // Arcane Level 1
        "spell_magic_missile_001": {
            "id": "spell_magic_missile_001",
            "name": "Magic Missile",
            "school": "arcane",
            "level": 1,
            "description": "Unerring magical projectile",
            "effect": "damage",
            "dice": { "count": 1, "sides": 4, "bonus": 1 },
            "range": "medium",
            "duration": "instantaneous",
            "components": ["V", "S"]
        },
        "spell_shield_001": {
            "id": "spell_shield_001",
            "name": "Shield",
            "school": "arcane",
            "level": 1,
            "description": "Magical armor that blocks attacks",
            "effect": "protection",
            "acBonus": 4,
            "range": "self",
            "duration": "combat",
            "components": ["V", "S"]
        },
        "spell_light_001": {
            "id": "spell_light_001",
            "name": "Light",
            "school": "arcane",
            "level": 1,
            "description": "Creates magical illumination",
            "effect": "utility",
            "range": "touch",
            "duration": "long",
            "components": ["V", "M"]
        },
        // Arcane Level 2
        "spell_web_001": {
            "id": "spell_web_001",
            "name": "Web",
            "school": "arcane",
            "level": 2,
            "description": "Entangles enemies in sticky webs",
            "effect": "control",
            "range": "medium",
            "duration": "combat",
            "components": ["V", "S", "M"]
        },
        "spell_invisibility_001": {
            "id": "spell_invisibility_001",
            "name": "Invisibility",
            "school": "arcane",
            "level": 2,
            "description": "Makes target invisible",
            "effect": "concealment",
            "range": "touch",
            "duration": "long",
            "components": ["V", "S", "M"]
        },
        "spell_knock_001": {
            "id": "spell_knock_001",
            "name": "Knock",
            "school": "arcane",
            "level": 2,
            "description": "Opens locked doors and containers",
            "effect": "utility",
            "range": "medium",
            "duration": "instantaneous",
            "components": ["V"]
        },
        // Arcane Level 3
        "spell_fireball_001": {
            "id": "spell_fireball_001",
            "name": "Fireball",
            "school": "arcane",
            "level": 3,
            "description": "Explosive sphere of flame",
            "effect": "damage",
            "dice": { "count": 3, "sides": 6 },
            "range": "long",
            "duration": "instantaneous",
            "areaEffect": true,
            "components": ["V", "S", "M"]
        },
        "spell_lightning_bolt_001": {
            "id": "spell_lightning_bolt_001",
            "name": "Lightning Bolt",
            "school": "arcane",
            "level": 3,
            "description": "Stroke of lightning",
            "effect": "damage",
            "dice": { "count": 3, "sides": 6 },
            "range": "long",
            "duration": "instantaneous",
            "components": ["V", "S", "M"]
        },
        "spell_dispel_magic_001": {
            "id": "spell_dispel_magic_001",
            "name": "Dispel Magic",
            "school": "arcane",
            "level": 3,
            "description": "Removes magical effects",
            "effect": "dispel",
            "range": "medium",
            "duration": "instantaneous",
            "components": ["V", "S"]
        },
        // Divine Level 1
        "spell_cure_light_wounds_001": {
            "id": "spell_cure_light_wounds_001",
            "name": "Cure Light Wounds",
            "school": "divine",
            "level": 1,
            "description": "Heals minor injuries",
            "effect": "heal",
            "dice": { "count": 1, "sides": 8, "bonus": 1 },
            "range": "touch",
            "duration": "instantaneous",
            "components": ["V", "S"]
        },
        "spell_bless_001": {
            "id": "spell_bless_001",
            "name": "Bless",
            "school": "divine",
            "level": 1,
            "description": "Grants divine favor in combat",
            "effect": "buff",
            "bonus": 1,
            "range": "medium",
            "duration": "combat",
            "components": ["V", "S", "M"]
        },
        "spell_protection_from_evil_001": {
            "id": "spell_protection_from_evil_001",
            "name": "Protection from Evil",
            "school": "divine",
            "level": 1,
            "description": "Wards against evil creatures",
            "effect": "protection",
            "acBonus": 2,
            "range": "touch",
            "duration": "long",
            "components": ["V", "S", "M"]
        },
        // Divine Level 2
        "spell_hold_person_001": {
            "id": "spell_hold_person_001",
            "name": "Hold Person",
            "school": "divine",
            "level": 2,
            "description": "Paralyzes a humanoid",
            "effect": "control",
            "range": "medium",
            "duration": "combat",
            "components": ["V", "S", "F"]
        },
        "spell_silence_001": {
            "id": "spell_silence_001",
            "name": "Silence",
            "school": "divine",
            "level": 2,
            "description": "Creates zone of magical silence",
            "effect": "control",
            "range": "long",
            "duration": "combat",
            "components": ["V", "S"]
        },
        "spell_spiritual_hammer_001": {
            "id": "spell_spiritual_hammer_001",
            "name": "Spiritual Hammer",
            "school": "divine",
            "level": 2,
            "description": "Conjures magical weapon",
            "effect": "damage",
            "dice": { "count": 1, "sides": 6, "bonus": 1 },
            "range": "medium",
            "duration": "combat",
            "components": ["V", "S", "F"]
        }
    },
    
    /**
     * Validate spell data
     */
    validate: (spellData) => {
        const required = ['id', 'name', 'school', 'level'];
        return required.every(field => spellData[field] !== undefined);
    },
    
    /**
     * Transform spell data if needed (future migrations)
     */
    transform: (spellData) => {
        return spellData;
    }
};
// Backwards compat
if (typeof window !== 'undefined') { window.spellsMigration = spellsMigration; }
