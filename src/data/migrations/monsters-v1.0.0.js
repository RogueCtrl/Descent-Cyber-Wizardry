/**
 * Monsters Entity Migration - Version 1.0.0
 * Contains all monster data for the game
 */

// Global assignment for browser compatibility
window.monstersMigration = {
    version: '1.0.0',
    entity: 'monsters',
    store: 'monsters',
    description: 'Initial monsters data migration',
    
    data: {
        // Level 1 Monsters
        "monster_kobold_001": {
            "id": "monster_kobold_001",
            "name": "Kobold",
            "type": "humanoid",
            "level": 1,
            "hitDie": 4,
            "strength": 8,
            "intelligence": 10,
            "agility": 15,
            "vitality": 9,
            "armorClass": 7,
            "attackBonus": 0,
            "damageBonus": -1,
            "attacks": [
                { "name": "Short Sword", "damage": { "dice": 1, "sides": 6, "bonus": -1 } },
                { "name": "Sling", "damage": { "dice": 1, "sides": 4 }, "range": "ranged" }
            ],
            "abilities": ["pack_tactics"],
            "aiType": "cowardly",
            "preferredTargets": ["weakest"],
            "experienceValue": 25,
            "treasureType": "poor",
            "asciiArt": "  👺\n /||\ \n  /\\  "
        },
        "monster_giant_rat_001": {
            "id": "monster_giant_rat_001",
            "name": "Giant Rat",
            "type": "beast",
            "level": 1,
            "hitDie": 4,
            "strength": 7,
            "intelligence": 2,
            "agility": 15,
            "vitality": 12,
            "armorClass": 7,
            "attackBonus": 1,
            "damageBonus": -2,
            "attacks": [
                { "name": "Bite", "damage": { "dice": 1, "sides": 3 }, "special": ["disease"] }
            ],
            "abilities": ["disease_bite"],
            "resistances": ["disease"],
            "aiType": "aggressive",
            "preferredTargets": ["random"],
            "experienceValue": 10,
            "treasureType": "none",
            "asciiArt": "  🐀\n /||\\\n  /\\  "
        },
        "monster_skeleton_001": {
            "id": "monster_skeleton_001",
            "name": "Skeleton",
            "type": "undead",
            "level": 1,
            "hitDie": 6,
            "strength": 10,
            "intelligence": 10,
            "agility": 14,
            "vitality": 15,
            "armorClass": 7,
            "attackBonus": 0,
            "damageBonus": 0,
            "attacks": [
                { "name": "Claw", "damage": { "dice": 1, "sides": 6 } }
            ],
            "resistances": ["cold", "necrotic"],
            "immunities": ["poison", "disease"],
            "aiType": "aggressive",
            "preferredTargets": ["front"],
            "experienceValue": 50,
            "treasureType": "poor",
            "asciiArt": "  💀\n /|||\\\n  /\\  "
        },
        
        // Level 2-3 Monsters
        "monster_orc_001": {
            "id": "monster_orc_001",
            "name": "Orc",
            "type": "humanoid",
            "level": 2,
            "hitDie": 6,
            "strength": 16,
            "intelligence": 7,
            "agility": 12,
            "vitality": 16,
            "armorClass": 6,
            "attackBonus": 1,
            "damageBonus": 3,
            "attacks": [
                { "name": "Battleaxe", "damage": { "dice": 1, "sides": 8, "bonus": 3 } },
                { "name": "Javelin", "damage": { "dice": 1, "sides": 6, "bonus": 3 }, "range": "thrown" }
            ],
            "abilities": ["aggressive"],
            "aiType": "aggressive",
            "preferredTargets": ["strongest"],
            "experienceValue": 100,
            "treasureType": "standard",
            "asciiArt": "  🗡️\n /|||\\\n  /\\  "
        },
        "monster_wolf_001": {
            "id": "monster_wolf_001",
            "name": "Wolf",
            "type": "beast",
            "level": 2,
            "hitDie": 6,
            "strength": 12,
            "intelligence": 3,
            "agility": 15,
            "vitality": 12,
            "armorClass": 7,
            "attackBonus": 2,
            "damageBonus": 1,
            "attacks": [
                { "name": "Bite", "damage": { "dice": 2, "sides": 4, "bonus": 2 }, "special": ["knockdown"] }
            ],
            "abilities": ["pack_tactics", "keen_hearing"],
            "aiType": "pack",
            "preferredTargets": ["isolated"],
            "experienceValue": 50,
            "treasureType": "none",
            "asciiArt": "  🐺\n /|||\\\n  /\\  "
        },
        "monster_hobgoblin_001": {
            "id": "monster_hobgoblin_001",
            "name": "Hobgoblin",
            "type": "humanoid",
            "level": 3,
            "hitDie": 8,
            "strength": 13,
            "intelligence": 12,
            "agility": 12,
            "vitality": 12,
            "armorClass": 5,
            "attackBonus": 2,
            "damageBonus": 1,
            "attacks": [
                { "name": "Longsword", "damage": { "dice": 1, "sides": 8, "bonus": 1 } },
                { "name": "Longbow", "damage": { "dice": 1, "sides": 8, "bonus": 1 }, "range": "ranged" }
            ],
            "abilities": ["martial_advantage"],
            "aiType": "tactical",
            "preferredTargets": ["spellcasters"],
            "experienceValue": 200,
            "treasureType": "standard",
            "asciiArt": "  👹\n /|||\\\n  /\\  "
        },
        
        // Level 4-5 Monsters
        "monster_ogre_001": {
            "id": "monster_ogre_001",
            "name": "Ogre",
            "type": "giant",
            "level": 4,
            "hitDie": 10,
            "strength": 19,
            "intelligence": 5,
            "agility": 8,
            "vitality": 16,
            "armorClass": 5,
            "attackBonus": 3,
            "damageBonus": 4,
            "attacks": [
                { "name": "Greatclub", "damage": { "dice": 2, "sides": 8, "bonus": 4 } },
                { "name": "Javelin", "damage": { "dice": 2, "sides": 6, "bonus": 4 }, "range": "thrown" }
            ],
            "abilities": ["powerful_build"],
            "aiType": "aggressive",
            "preferredTargets": ["front"],
            "experienceValue": 450,
            "treasureType": "standard",
            "asciiArt": "  👹\n /|||\\\n  /\\  "
        },
        "monster_owlbear_001": {
            "id": "monster_owlbear_001",
            "name": "Owlbear",
            "type": "monstrosity",
            "level": 5,
            "hitDie": 10,
            "strength": 20,
            "intelligence": 3,
            "agility": 12,
            "vitality": 17,
            "armorClass": 6,
            "attackBonus": 4,
            "damageBonus": 5,
            "attacks": [
                { "name": "Claw", "damage": { "dice": 2, "sides": 8, "bonus": 5 } },
                { "name": "Bite", "damage": { "dice": 1, "sides": 10, "bonus": 5 } }
            ],
            "abilities": ["multiattack", "keen_sight"],
            "aiType": "aggressive",
            "preferredTargets": ["random"],
            "experienceValue": 700,
            "treasureType": "rich",
            "asciiArt": "  🦉\n /|||\\\n  /\\  "
        },
        
        // Boss Monsters
        "monster_orc_chief_001": {
            "id": "monster_orc_chief_001",
            "name": "Orc Chief",
            "type": "humanoid",
            "level": 6,
            "hitDie": 8,
            "strength": 18,
            "intelligence": 12,
            "agility": 12,
            "vitality": 18,
            "armorClass": 4,
            "attackBonus": 5,
            "damageBonus": 4,
            "attacks": [
                { "name": "Magic Axe +1", "damage": { "dice": 1, "sides": 8, "bonus": 5 }, "magical": true },
                { "name": "Spear", "damage": { "dice": 1, "sides": 6, "bonus": 4 }, "range": "thrown" }
            ],
            "abilities": ["leadership", "aggressive", "multiattack"],
            "aiType": "tactical",
            "preferredTargets": ["strongest"],
            "experienceValue": 1100,
            "treasureType": "rich",
            "asciiArt": "  👹\n /|||\\\n  /\\  "
        },
        "monster_young_dragon_001": {
            "id": "monster_young_dragon_001",
            "name": "Young Dragon",
            "type": "dragon",
            "level": 8,
            "hitDie": 12,
            "strength": 23,
            "intelligence": 14,
            "agility": 10,
            "vitality": 21,
            "armorClass": 2,
            "attackBonus": 7,
            "damageBonus": 6,
            "attacks": [
                { "name": "Bite", "damage": { "dice": 2, "sides": 10, "bonus": 6 } },
                { "name": "Claw", "damage": { "dice": 2, "sides": 6, "bonus": 6 } },
                { "name": "Fire Breath", "damage": { "dice": 8, "sides": 6 }, "range": "area", "special": ["fire"] }
            ],
            "abilities": ["multiattack", "breath_weapon", "frightful_presence", "magic_resistance"],
            "resistances": ["fire", "physical"],
            "immunities": ["fire", "sleep", "paralysis"],
            "aiType": "intelligent",
            "preferredTargets": ["spellcasters"],
            "experienceValue": 2300,
            "treasureType": "hoard",
            "asciiArt": "  🐉\n /|||\\\n  /\\  "
        }
    },
    
    /**
     * Validate monster data
     */
    validate: (monsterData) => {
        const required = ['id', 'name', 'type', 'level', 'hitDie'];
        return required.every(field => monsterData[field] !== undefined);
    },
    
    /**
     * Transform monster data if needed (future migrations)
     */
    transform: (monsterData) => {
        return monsterData;
    }
};