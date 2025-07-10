/**
 * Terminology System
 * Manages classic fantasy vs cyberpunk terminology mappings
 * for the Wizardry-Tron Fusion transformation
 */

const TERMINOLOGY = {
    classic: {
        // Core Game Elements
        title: "Descent: Cyber Wizardry",
        party: "Party",
        character: "Character",
        town: "Town",
        dungeon: "Dungeon",
        level: "Level",
        floor: "Floor",
        
        // Character Creation
        create_character: "Create Character",
        race: "Race",
        class: "Class",
        attributes: "Attributes",
        
        // Combat Interface
        combat_fight: "⚔️ Fight",
        combat_defend: "🛡️ Defend", 
        combat_spell: "🔮 Cast Spell",
        combat_item: "💊 Use Item",
        combat_run: "🏃 Run",
        
        // Character Stats
        hp: "HP",
        health: "Health",
        status: "Status",
        alive: "Alive",
        dead: "Dead",
        
        // Monsters
        monster: "Monster",
        creature: "Creature",
        enemy: "Enemy",
        
        // Magic
        spell: "Spell",
        magic: "Magic",
        cast: "Cast",
        memorize: "Memorize",
        
        // Equipment
        weapon: "Weapon",
        armor: "Armor",
        shield: "Shield",
        equipment: "Equipment",
        item: "Item",
        
        // Actions
        attack: "Attack",
        defend: "Defend",
        move: "Move",
        use: "Use",
        rest: "Rest"
    },
    
    cyber: {
        // Core Game Elements
        title: "Descent: Cyber Wizardry",
        party: "Strike Team",
        character: "Agent",
        town: "Terminal Hub",
        dungeon: "Grid Sector",
        level: "Clearance Level",
        floor: "Grid Layer",
        
        // Character Creation
        create_character: "Initialize Agent",
        race: "Platform Type",
        class: "Specialization",
        attributes: "Core Parameters",
        
        // Combat Interface
        combat_fight: "⚔️ Execute",
        combat_defend: "🛡️ Firewall", 
        combat_spell: "🔮 Run Program",
        combat_item: "💊 Use Data",
        combat_run: "🏃 Disconnect",
        
        // Character Stats
        hp: "System Integrity",
        health: "Data Integrity",
        status: "System Status",
        alive: "Online",
        dead: "Disconnected",
        
        // Monsters
        monster: "Program",
        creature: "Entity",
        enemy: "Hostile Process",
        
        // Magic
        spell: "Subroutine",
        magic: "Code Execution",
        cast: "Execute",
        memorize: "Load Program",
        
        // Equipment
        weapon: "Attack Algorithm",
        armor: "Defense Protocol",
        shield: "Firewall Module",
        equipment: "System Upgrades",
        item: "Data Package",
        
        // Actions
        attack: "Execute Attack",
        defend: "Raise Defenses",
        move: "Navigate",
        use: "Access",
        rest: "System Repair"
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TERMINOLOGY;
} else if (typeof window !== 'undefined') {
    window.TERMINOLOGY = TERMINOLOGY;
}