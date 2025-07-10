/**
 * Monsters Entity Migration - Version 1.0.0
 * Contains all monster data for the game
 */

// Global assignment for browser compatibility
window.monstersMigration = {
    version: '1.2.0',
    entity: 'monsters',
    store: 'monsters',
    description: 'Enhanced monsters data migration with 5 cyberpunk vector portraits',
    
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
            "asciiArt": "  👺\n /||\ \n  /\\  ",
            "portraitModel": {
                "type": "wireframe",
                "vertices": [
                    // Scout Program - angular, quick surveillance construct
                    [0, 0.7, 0],      // Top sensor
                    [-0.3, 0.5, 0],   // Left antenna
                    [0.3, 0.5, 0],    // Right antenna
                    [-0.4, 0.3, 0],   // Left visual sensor
                    [0.4, 0.3, 0],    // Right visual sensor
                    [0, 0.2, 0],      // Central processor
                    [-0.2, 0.0, 0],   // Left data port
                    [0.2, 0.0, 0],    // Right data port
                    [0, -0.2, 0],     // Core unit
                    [-0.3, -0.4, 0],  // Left leg joint
                    [0.3, -0.4, 0],   // Right leg joint
                    [-0.2, -0.7, 0],  // Left foot
                    [0.2, -0.7, 0]    // Right foot
                ],
                "edges": [
                    // Head/sensor array
                    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5],
                    // Face sensors
                    [3, 6], [4, 7], [6, 8], [7, 8],
                    // Body frame
                    [5, 8], [8, 9], [8, 10], [9, 11], [10, 12],
                    // Cross connections for agility
                    [6, 9], [7, 10], [1, 4], [2, 3]
                ],
                "scale": 0.9,
                "rotation": [0, 15, 0]
            }
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
            "asciiArt": "  🐀\n /||\\\n  /\\  ",
            "portraitModel": {
                "type": "wireframe",
                "vertices": [
                    // Virus Cluster - chaotic, self-replicating swarm pattern
                    [0, 0.4, 0],      // Central core
                    [-0.3, 0.6, 0],   // Left cluster node
                    [0.3, 0.6, 0],    // Right cluster node
                    [-0.5, 0.3, 0],   // Left extension
                    [0.5, 0.3, 0],    // Right extension
                    [-0.2, 0.1, 0],   // Left replication point
                    [0.2, 0.1, 0],    // Right replication point
                    [0, -0.1, 0],     // Core junction
                    [-0.4, -0.3, 0],  // Left viral spread
                    [0.4, -0.3, 0],   // Right viral spread
                    [0, -0.5, 0],     // Lower cluster
                    [-0.6, 0.0, 0],   // Far left infection
                    [0.6, 0.0, 0],    // Far right infection
                    [0, 0.8, 0],      // Top infection spike
                    [0, -0.7, 0]      // Bottom infection spike
                ],
                "edges": [
                    // Central cluster connections
                    [0, 1], [0, 2], [0, 7], [1, 3], [2, 4],
                    // Viral replication patterns
                    [7, 5], [7, 6], [5, 8], [6, 9], [7, 10],
                    // Chaotic spread patterns
                    [3, 11], [4, 12], [1, 13], [2, 13], [10, 14],
                    // Cross-contamination lines
                    [1, 5], [2, 6], [8, 11], [9, 12], [5, 6],
                    // Random viral connections for chaos
                    [3, 8], [4, 9], [11, 8], [12, 9]
                ],
                "scale": 0.8,
                "rotation": [0, -10, 0]
            }
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
            "asciiArt": "  💀\n /|||\\\n  /\\  ",
            "portraitModel": {
                "type": "wireframe",
                "vertices": [
                    // Archive Ghost - fragmented, corrupted data remnant
                    [0, 0.8, 0],      // Top data fragment
                    [-0.4, 0.6, 0],   // Left memory bank (corrupted)
                    [0.4, 0.6, 0],    // Right memory bank (corrupted)
                    [-0.3, 0.4, 0],   // Left eye socket (empty)
                    [0.3, 0.4, 0],    // Right eye socket (empty)
                    [0, 0.3, 0],      // Central void
                    [-0.5, 0.2, 0],   // Left skull fragment
                    [0.5, 0.2, 0],    // Right skull fragment
                    [0, 0.0, 0],      // Jaw fragment
                    [-0.2, -0.2, 0],  // Left neck data
                    [0.2, -0.2, 0],   // Right neck data
                    [-0.4, -0.5, 0],  // Left shoulder ghost
                    [0.4, -0.5, 0],   // Right shoulder ghost
                    [0, -0.7, 0],     // Lower data remnant
                    // Floating fragments (ghostly)
                    [-0.7, 0.7, 0],   // Left floating fragment
                    [0.7, 0.1, 0]     // Right floating fragment
                ],
                "edges": [
                    // Skull outline (fragmented)
                    [0, 1], [0, 2], [1, 6], [2, 7], [6, 3], [7, 4],
                    // Eye sockets (empty voids)
                    [3, 5], [4, 5],
                    // Jaw connection (partial)
                    [5, 8], [6, 8], [7, 8],
                    // Neck/shoulder structure (ghostly)
                    [8, 9], [8, 10], [9, 11], [10, 12], [11, 13], [12, 13],
                    // Floating data fragments
                    [1, 14], [2, 15],
                    // Corruption lines (data decay)
                    [3, 9], [4, 10], [6, 11], [7, 12]
                ],
                "scale": 1.1,
                "rotation": [0, 0, 5]
            }
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
            "asciiArt": "  🗡️\n /|||\\\n  /\\  ",
            "portraitModel": {
                "type": "wireframe",
                "vertices": [
                    // Enforcer Program - bulky, aggressive security routine
                    [0, 0.9, 0],      // Top security node
                    [-0.5, 0.7, 0],   // Left heavy processor
                    [0.5, 0.7, 0],    // Right heavy processor
                    [-0.6, 0.4, 0],   // Left armor plating
                    [0.6, 0.4, 0],    // Right armor plating
                    [-0.3, 0.5, 0],   // Left security scanner
                    [0.3, 0.5, 0],    // Right security scanner
                    [0, 0.2, 0],      // Central targeting system
                    [-0.4, 0.0, 0],   // Left weapon mount
                    [0.4, 0.0, 0],    // Right weapon mount
                    [0, -0.2, 0],     // Core enforcement unit
                    [-0.7, -0.4, 0],  // Left heavy shoulder
                    [0.7, -0.4, 0],   // Right heavy shoulder
                    [-0.3, -0.6, 0],  // Left support strut
                    [0.3, -0.6, 0],   // Right support strut
                    [0, -0.8, 0]      // Base platform
                ],
                "edges": [
                    // Heavy head/processor assembly
                    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6],
                    // Security scanner array
                    [5, 7], [6, 7], [1, 5], [2, 6],
                    // Weapon systems
                    [7, 8], [7, 9], [8, 10], [9, 10],
                    // Heavy frame structure
                    [10, 11], [10, 12], [11, 13], [12, 14], [13, 15], [14, 15],
                    // Armor plating connections
                    [3, 8], [4, 9], [8, 11], [9, 12],
                    // Structural reinforcements
                    [1, 8], [2, 9], [5, 10], [6, 10]
                ],
                "scale": 1.2,
                "rotation": [0, 0, 0]
            }
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
            "asciiArt": "  👹\n /|||\\\n  /\\  ",
            "portraitModel": {
                "type": "wireframe",
                "vertices": [
                    // Ogre head (large and brutish)
                    [0, 0.8, 0],      // Top of head
                    [-0.6, 0.6, 0],   // Left temple
                    [0.6, 0.6, 0],    // Right temple  
                    [-0.7, 0.3, 0],   // Left jaw
                    [0.7, 0.3, 0],    // Right jaw
                    [-0.4, 0.4, 0],   // Left eye
                    [0.4, 0.4, 0],    // Right eye
                    [0, 0.2, 0],      // Nose bridge
                    [0, 0.0, 0],      // Nose tip
                    [0, -0.2, 0],     // Mouth
                    [0, -0.5, 0],     // Chin
                    // Shoulders/neck
                    [-0.5, -0.7, 0],  // Left shoulder
                    [0.5, -0.7, 0],   // Right shoulder
                    [0, -0.6, 0]      // Neck
                ],
                "edges": [
                    // Head outline
                    [0, 1], [1, 3], [3, 10], [10, 4], [4, 2], [2, 0],
                    // Facial features
                    [5, 6], [5, 7], [6, 7], [7, 8], [8, 9], [9, 10],
                    // Neck and shoulders
                    [10, 13], [13, 11], [13, 12], [11, 12],
                    // Additional detail lines
                    [1, 5], [2, 6], [3, 9], [4, 9]
                ],
                "scale": 1.3,
                "rotation": [0, 20, 0]
            }
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