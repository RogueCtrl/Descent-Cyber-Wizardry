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
        town_description: "The bustling hub of Llylgamyn, where adventurers prepare for their descent into the Mad Overlord's maze.",
        training_description: "Create and manage your party of adventurers",
        dungeon_description: "Enter the Mad Overlord's treacherous maze",
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
        rest: "Rest",
        
        // Combat States
        no_enemies: "No Enemies",
        combat_active: "Combat Active",
        loading_combat: "Loading Combat...",
        wave_clear: "Wave Clear"
    },
    
    cyber: {
        // Core Game Elements
        title: "Descent: Cyber Wizardry",
        party: "Strike Team",
        character: "Agent",
        town: "Terminal Hub",
        town_description: "The central access node of the grid, where agents prepare for their infiltration into the hostile data maze.",
        training_description: "Create and manage your strike team of agents",
        dungeon_description: "Enter the corrupted data maze",
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
        rest: "System Repair",
        
        // Combat States
        no_enemies: "Grid Clear",
        combat_active: "Engagement Active",
        loading_combat: "Connecting to Grid...",
        wave_clear: "Sector Secured"
    }
};

// Dual-display utility functions
const TerminologyUtils = {
    /**
     * Get both classic and cyber names for an entity
     * @param {Object} entity - Entity with name and cyberName properties
     * @returns {Object} Object with classic and cyber display names
     */
    getDualNames(entity) {
        return {
            classic: entity.name || entity.displayName || 'Unknown',
            cyber: entity.cyberName || entity.name || 'Unknown'
        };
    },
    
    /**
     * Format dual display text
     * @param {Object} entity - Entity with name and cyberName properties
     * @param {string} separator - Separator between names (default: ' / ')
     * @returns {string} Formatted dual display string
     */
    formatDualDisplay(entity, separator = ' / ') {
        const names = this.getDualNames(entity);
        if (names.classic === names.cyber) {
            return names.classic; // Don't show duplicate names
        }
        return `${names.classic}${separator}${names.cyber}`;
    },
    
    /**
     * Get appropriate name based on current TextManager mode
     * @param {Object} entity - Entity with name and cyberName properties
     * @returns {string} Name appropriate for current mode
     */
    getContextualName(entity) {
        if (typeof TextManager !== 'undefined' && TextManager.isCyberMode()) {
            return entity.cyberName || entity.name || 'Unknown';
        }
        return entity.name || entity.displayName || 'Unknown';
    },
    
    /**
     * Get digital classification display
     * @param {Object} entity - Entity with classification properties
     * @returns {string} Formatted classification string
     */
    getClassificationDisplay(entity) {
        if (entity.digitalClassification && entity.programClass) {
            return `${entity.programClass} (${entity.digitalClassification})`;
        }
        return entity.digitalClassification || entity.programClass || entity.type || 'Unknown';
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TERMINOLOGY, TerminologyUtils };
} else if (typeof window !== 'undefined') {
    window.TERMINOLOGY = TERMINOLOGY;
    window.TerminologyUtils = TerminologyUtils;
}