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
        
        // Character Creation Step 1 - Race Selection
        choose_race: "Choose Your Race",
        race_selection_description: "Each race has unique characteristics that will affect your character's abilities.",
        
        // Individual Races
        race_human: "Human",
        race_elf: "Elf", 
        race_dwarf: "Dwarf",
        race_hobbit: "Hobbit",
        race_gnome: "Gnome",
        
        // Race Descriptions
        race_human_desc: "Balanced and adaptable",
        race_elf_desc: "Graceful and intelligent",
        race_dwarf_desc: "Hardy and resilient",
        race_hobbit_desc: "Small but lucky",
        race_gnome_desc: "Intellectually gifted",
        
        // Character Creation Step 2 - Attribute Generation
        your_attributes: "Your Attributes",
        attributes_description: "These are your character's base attributes, modified by your race.",
        
        // Individual Attributes
        attr_strength: "Strength",
        attr_intelligence: "Intelligence",
        attr_piety: "Piety",
        attr_vitality: "Vitality",
        attr_agility: "Agility",
        attr_luck: "Luck",
        
        // Attribute Generation UI
        reroll_attributes: "Reroll Attributes",
        reroll_description: "You can reroll if you're not satisfied with these attributes.",
        total_label: "Total",
        
        // Character Creation Step 3 - Class Selection
        choose_class: "Choose Your Class",
        class_selection_description: "Your attributes determine which classes are available to you.",
        
        // Individual Classes
        class_fighter: "Fighter",
        class_mage: "Mage",
        class_priest: "Priest",
        class_thief: "Thief",
        class_bishop: "Bishop",
        class_samurai: "Samurai",
        class_lord: "Lord",
        class_ninja: "Ninja",
        
        // Class Descriptions
        class_fighter_desc: "Melee combat specialist",
        class_mage_desc: "Arcane spellcaster",
        class_priest_desc: "Divine spellcaster",
        class_thief_desc: "Stealth and utility specialist",
        class_bishop_desc: "Master of both arcane and divine magic",
        class_samurai_desc: "Elite warrior with limited magical ability",
        class_lord_desc: "Noble warrior with divine blessing",
        class_ninja_desc: "Master of stealth and shadow magic",
        
        // Class UI Elements
        class_requirements: "Requirements:",
        class_hit_die: "Hit Die:",
        class_spells: "Spells:",
        requirements_not_met: "Requirements not met",
        
        // Character Creation Step 4 - Character Details
        character_details: "Character Details",
        character_details_description: "Enter your character's name and review their information.",
        
        // Character Name Input
        character_name: "Character Name:",
        character_name_placeholder: "Enter character name",
        character_limit: "Maximum 15 characters",
        
        // Character Summary
        character_summary: "Character Summary",
        summary_race: "Race:",
        summary_class: "Class:",
        summary_attributes: "Attributes:",
        
        // Character Creation Step 5 - Confirmation
        confirm_agent_initialization: "Confirm Character Creation",
        confirm_description: "Review your character before adding them to your party.",
        
        // System Stats
        system_stats: "Character Stats",
        defense_rating: "Defense Rating:",
        system_integrity: "Hit Points:",
        
        // Final Button
        initialize_agent: "Create Character",
        
        // Party Setup Modal
        mode_toggle_label: "Game Mode:",
        mode_classic: "Fantasy",
        mode_cyber: "Cyber",
        party_name_label: "Party Name:",
        party_name_help: "Name your party - or use a generated default name",
        begin_adventure: "Begin Adventure",
        
        // Combat Interface
        combat_fight: "⚔️ Fight",
        combat_defend: "🛡️ Defend", 
        combat_spell: "🔮 Cast Spell",
        combat_item: "💊 Use Item",
        combat_run: "🏃 Flee",
        combat_disconnect: "🏃 Flee",
        disconnect_attempt: "Flee Attempt",
        disconnect_success: "Successfully fled",
        disconnect_failure: "Failed to flee",
        disconnect_description: "Attempt to escape combat and return to town",
        
        // Post-combat status text
        defeat_some_escaped: "Defeat - Some 🏃 Fled",
        escaped_status_location: "Confused (In Town)",
        escaped_safe_return: "These heroes have returned to Town safely, though they are confused from their hasty retreat.",
        
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
        exit_dungeon: "⚡ Exit to Town",
        open_treasure: "💎 Open Chest",
        
        // Dungeon Entrance Modal
        dungeon_entrance: "🏰 Dungeon Entrance",
        dungeon_entrance_flavor: "Your party is ready to brave the Mad Overlord's treacherous maze.",
        party_composition: "Party Composition",
        dungeon_warning: "⚠️ The dungeon is dangerous. Proceed with caution!",
        enter_dungeon: "🛡️ Enter Dungeon",
        dungeon_icon: "🛡️",
        
        // Combat States
        no_enemies: "No Enemies",
        combat_active: "Combat Active",
        loading_combat: "Loading Combat...",
        wave_clear: "Wave Clear",
        
        // Town Interface
        training_grounds: "Training Grounds",
        party_management: "Party Management",
        data_exchange: "Trading Post",
        restoration_center: "Temple",
        
        // Town Flavor Text
        training_grounds_flavor: "Create and manage your party of adventurers",
        party_management_flavor: "Manage and view multiple saved parties or lost Characters",
        data_exchange_flavor: "Trade upgrades and equipment with merchants",
        restoration_center_flavor: "Repair damage and restore fallen adventurers",
        grid_sector_flavor: "Enter the Mad Overlord's treacherous maze",
        
        // Training Grounds Modal
        create_new_character: "Create New Character",
        roll_adventurer: "Roll a new adventurer",
        view_roster: "View Roster",
        browse_characters: "Browse all characters",
        view_party_stats: "View Party Stats",
        review_character_details: "Review character details",
        delete_character: "Delete Character",
        remove_from_party: "Remove from party",
        current_party: "Current Party",
        back_to_town: "Back to Town",
        strike_team_ready: "Your party is ready for adventure!",
        strike_team_required: "Create at least one character to enter the dungeon.",
        
        // Party Management Modal
        manifest_title: "Party Management",
        manifest_subtitle: "Manage your saved parties and lost characters",
        camping_teams: "Camping Parties",
        camping_icon: "🏕️",
        in_town_teams: "In Town",
        lost_teams: "Lost Parties",
        camping_location: "Dungeon Camp",
        disconnected_teams: "Disconnected Strike Teams",
        disconnected_icon: "🔌",
        in_hub_teams: "In Hub", 
        lost_strike_teams: "Lost Strike Teams",
        members: "Members",
        
        // Delete Party Confirmation
        delete_party_title: "Delete Party",
        delete_party_confirm: "Are you sure you want to delete this party?",
        delete_party_warning: "Parties currently in the dungeon will be lost forever. This action cannot be undone.",
        delete_party_button: "Delete Party",
        
        // Character Roster Modal
        character_roster: "Character Roster",
        character_roster_subtitle: "All Created Characters",
        no_characters_created: "No Characters Created",
        visit_training_grounds: "Visit the Training Grounds to create your first adventurer!",
        back_to_training_grounds: "Back to Training Grounds",
        character_location_town: "Town",
        character_status_ok: "OK",
        character_status_unconscious: "Unconscious",
        character_status_dead: "Dead",
        character_status_ashes: "Ashes",
        character_status_lost: "Lost",
        character_status_confused: "Confused",
        
        // Lost Agents Modal
        lost_characters: "Fallen Heroes",
        lost_characters_subtitle: "Heroes Lost in the Dungeon",
        no_lost_characters: "No Fallen Heroes",
        no_lost_characters_message: "No heroes have been lost to the dungeon.",
        lost_in_dungeon: "Lost in Dungeon",
        view_details: "View Details",
        remove_from_memorial: "Forget",
        back_to_character_roster: "Back to Character Roster",
        character_last_seen: "Last Seen:",
        memorial_actions: "Memorial Actions:",
        
        // Delete Character Confirmation Modal
        delete_character_title: "Forget Hero",
        delete_character_confirm: "Are you sure you want to forget this fallen hero?",
        delete_character_warning: "This hero's memory will be lost forever. This action cannot be undone.",
        delete_character_button: "Forget Hero",
        forget_character_detail: "Forgetting {name} ({race} {class}) will remove all records permanently.",
        character_last_location: "Last seen in {location}",
        
        // Character Details Modal
        character_details: "Character Details",
        attributes: "Attributes",
        health_experience: "Health & Experience",
        equipment: "Equipment",
        
        // Attribute Names
        strength: "Strength",
        intelligence: "Intelligence",
        piety: "Piety",
        vitality: "Vitality",
        agility: "Agility",
        luck: "Luck",
        
        // Attribute Abbreviations
        attr_str: "STR",
        attr_int: "INT",
        attr_pie: "PIE",
        attr_vit: "VIT",
        attr_agi: "AGI",
        attr_luc: "LUC",
        
        // Equipment Slots
        weapon_slot: "Weapon",
        armor_slot: "Armor",
        shield_slot: "Shield",
        accessory_slot: "Accessory",
        
        // Equipment Status
        equipped: "Equipped",
        unequipped: "Unequipped",
        
        // Combat Statistics
        armor_class: "Armor Class",
        attack_bonus: "Attack Bonus",
        damage: "Damage",
        hit_points: "Hit Points",
        
        // Health Status
        healthy: "Healthy",
        wounded: "Wounded",
        critical: "Critical",
        
        // Character Sheet Section Headers
        vital_statistics: "Vital Statistics",
        combat_statistics: "Combat Statistics",
        character_information: "Character Information",
        recent_activity: "Recent Activity",
        
        // Character Information Labels
        created_date: "Created",
        adventure_count: "Adventures",
        threat_level: "Challenge Rating",
        
        // Experience and Currency
        experience: "Experience",
        gold: "Gold",
        age: "Age",
        
        // Additional Character Sheet Text Keys
        derived_statistics: "Derived Statistics",
        carrying_capacity: "Carrying Capacity",
        spell_points: "Spell Points",
        initiative: "Initiative",
        saving_throws: "Saving Throws",
        equipment_statistics: "Equipment Statistics",
        total_ac_bonus: "Total AC Bonus",
        total_attack_bonus: "Attack Bonus",
        total_weight: "Total Weight",
        equipment_condition: "Equipment Condition",
        empty_slot: "(Empty)",
        skills: "Skills",
        skills_not_implemented: "Skills system not yet implemented",
        no_spells: "No spells memorized",
        no_history: "No history recorded",
        no_recent_activity: "No recent activity"
    },
    
    cyber: {
        // Core Game Elements
        title: "Descent: Cyber Wizardry",
        party: "Strike Team",
        character: "Agent",
        town: "Terminal Hub",
        town_description: "The central access node of the grid, where Agents prepare for their infiltration into the hostile data maze.",
        training_description: "Create and manage your strike team of Agents",
        dungeon_description: "Enter the corrupted data maze",
        dungeon: "Corrupted Network",
        level: "Clearance Level",
        floor: "Grid Layer",
        
        // Character Creation
        create_character: "Initialize Agent",
        race: "Platform Type",
        class: "Specialization",
        attributes: "Core Parameters",
        
        // Character Creation Step 1 - Platform Type Selection
        choose_race: "Choose Your Platform Type",
        race_selection_description: "Each platform type has unique parameters that will affect your agent's core systems.",
        
        // Individual Platform Types  
        race_human: "Core Shell",
        race_elf: "Quantum Thread",
        race_dwarf: "Iron Kernel", 
        race_hobbit: "Embedded System",
        race_gnome: "Blockchain Node",
        
        // Platform Descriptions
        race_human_desc: "Stable core architecture with flexible configurations",
        race_elf_desc: "High-performance quantum processing with elegant algorithms",
        race_dwarf_desc: "Hardened security kernel with robust error handling",
        race_hobbit_desc: "Lightweight embedded system with optimized random generators",
        race_gnome_desc: "Advanced blockchain node with distributed intelligence protocols",
        
        // Character Creation Step 2 - Core Parameter Generation
        your_attributes: "Your Configuration",
        attributes_description: "These are your agent's base configuration, modified by platform.",
        
        // Individual Parameters
        attr_strength: "Protocols",
        attr_intelligence: "Algorithms",
        attr_piety: "Endpoints",
        attr_vitality: "Persistence",
        attr_agility: "Latency",
        attr_luck: "Temperature",
        
        // Parameter Generation UI
        reroll_attributes: "Reroll Parameters",
        reroll_description: "You can reroll if you're not satisfied with these parameters.",
        total_label: "System Total",
        
        // Character Creation Step 3 - Specialization Selection
        choose_class: "Choose Your Specialization",
        class_selection_description: "Your configurations determine which specializations are available to you.",
        
        // Individual Specializations
        class_fighter: "Hacker",
        class_mage: "Vibecoder",
        class_priest: "Infrastructure",
        class_thief: "Trojan",
        class_bishop: "Architect",
        class_samurai: "CircutBreaker",
        class_lord: "SysAdmin",
        class_ninja: "Backdoor",
        
        // Specialization Descriptions
        class_fighter_desc: "Brute force protocols",
        class_mage_desc: "Random protocols and programs - feeling the vibes",
        class_priest_desc: "Distributed support and maintenance protocols",
        class_thief_desc: "Network infiltration protocols",
        class_bishop_desc: "Adaptive protocols with reverse engineering capabilities",
        class_samurai_desc: "Purpose-built disruption protocols with limited program access",
        class_lord_desc: "Root-level protocols with administrative privileges",
        class_ninja_desc: "Experimental infiltration protocols with limited program access",
        
        // Specialization UI Elements
        class_requirements: "Prerequisites:",
        class_hit_die: "Core Stability:",
        class_spells: "Programs:",
        requirements_not_met: "Prerequisites not satisfied",
        
        // Character Creation Step 4 - Agent Details
        character_details: "Agent Details",
        character_details_description: "Enter your agent's name and review their configuration.",
        
        // Agent Name Input
        character_name: "Agent Name:",
        character_name_placeholder: "Enter agent name",
        character_limit: "Maximum 15 characters",
        
        // Agent Summary
        character_summary: "Agent Summary",
        summary_race: "Platform:",
        summary_class: "Specialization:",
        summary_attributes: "Configurations:",
        
        // Character Creation Step 5 - Agent Initialization Confirmation
        confirm_agent_initialization: "Confirm Agent Initialization",
        confirm_description: "Review your agent before adding them to your strike team.",
        
        // System Stats
        system_stats: "System Stats",
        defense_rating: "Firewalls:",
        system_integrity: "System Integrity:",
        
        // Final Button
        initialize_agent: "Initialize Agent",
        
        // Party Setup Modal
        mode_toggle_label: "Game Mode:",
        mode_classic: "Fantasy",
        mode_cyber: "Cyber",
        party_name_label: "Strike Team Name:",
        party_name_help: "Name your strike team - or use a generated default name",
        begin_adventure: "Begin Mission", 
        
        // Combat Interface
        combat_fight: "⚔️ Execute",
        combat_defend: "🛡️ Firewall", 
        combat_spell: "🔮 Run Program",
        combat_item: "💊 Use Data",
        combat_run: "🏃 Disconnect",
        combat_disconnect: "🏃 Disconnect",
        disconnect_attempt: "Disconnect Attempt",
        disconnect_success: "Successfully disconnected",
        disconnect_failure: "Failed to disconnect",
        disconnect_description: "Attempt to disconnect from combat and return to terminal hub",
        
        // Post-combat status text
        defeat_some_escaped: "Defeat - Some 🏃 Disconnected",
        escaped_status_location: "Scrambled (In Terminal Hub)",
        escaped_safe_return: "These agents have returned to Terminal Hub safely, though they are scrambled from their hasty disconnection.",
        
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
        exit_dungeon: "⚡ Jack Out",
        open_treasure: "🔶 Access Cache",
        
        // Dungeon Entrance Modal
        dungeon_entrance: "🌐 Corrupted Network Entrance",
        dungeon_entrance_flavor: "Your strike team is ready to infiltrate the diabolical data maze.",
        party_composition: "Strike Team Composition",
        dungeon_warning: "The corrupted network is dangerous. Failure is possible!",
        enter_dungeon: "⚡ Jack In",
        dungeon_icon: "🌐",
        
        // Combat States
        no_enemies: "Grid Clear",
        combat_active: "Engagement Active",
        loading_combat: "Connecting to Grid...",
        wave_clear: "Sector Secured",
        
        // Town Interface
        training_grounds: "AgentOps",
        party_management: "Strike Team Manifest",
        data_exchange: "Data Exchange",
        restoration_center: "Restoration Center",
        
        // Town Flavor Text
        training_grounds_flavor: "Create and manage your strike team of Agents",
        party_management_flavor: "Manage and view multiple saved strike teams or lost Agents",
        data_exchange_flavor: "Trade upgrades and system enhancements",
        restoration_center_flavor: "Repair system damage and restore corrupted Agents",
        grid_sector_flavor: "Enter the corrupted network's data grid maze",
        
        // Training Grounds Modal
        create_new_character: "Initialize New Agent",
        roll_adventurer: "Generate new Agent",
        view_roster: "Agent Database",
        browse_characters: "Browse all Agents",
        view_party_stats: "Strike Team Status",
        review_character_details: "Review Agent profiles",
        delete_character: "Decommission Agent",
        remove_from_party: "Remove from strike team",
        current_party: "Active Strike Team",
        back_to_town: "Return to Terminal Hub",
        strike_team_ready: "Your strike team is ready for engagement!",
        strike_team_required: "Initialize at least one agent to access the grid.",
        
        // Strike Team Manifest Modal
        manifest_title: "Strike Team Manifest",
        manifest_subtitle: "Manage your disconnected Strike Teams and lost Agents",
        camping_teams: "Disconnected Teams",
        camping_icon: "🔌",
        in_town_teams: "In Hub",
        lost_teams: "Lost Strike Teams",
        camping_location: "Grid Sector",
        disconnected_teams: "Disconnected Strike Teams",
        disconnected_icon: "🔌",
        in_hub_teams: "In Hub", 
        lost_strike_teams: "Lost Strike Teams",
        members: "Members",
        
        // Delete Strike Team Confirmation
        delete_party_title: "Delete Strike Team",
        delete_party_confirm: "Are you sure you want to delete this strike team?",
        delete_party_warning: "Strike teams currently in the corrupted network will be lost forever. This action cannot be undone.",
        delete_party_button: "Delete Strike Team",
        
        // Character Roster Modal
        character_roster: "Agent Database",
        character_roster_subtitle: "All Created Agents",
        no_characters_created: "No Agents Created",
        visit_training_grounds: "Visit AgentOps to initialize your first agent!",
        back_to_training_grounds: "Return to AgentOps",
        character_location_town: "Terminal Hub",
        character_status_ok: "Online",
        character_status_unconscious: "Crashed",
        character_status_dead: "Offline",
        character_status_ashes: "Fragmented",
        character_status_lost: "Uninstalled",
        character_status_confused: "Scrambled",
        
        // Lost Agents Modal
        lost_characters: "Lost Agents",
        lost_characters_subtitle: "Agents Lost in the Corrupted Network",
        no_lost_characters: "No Lost Agents",
        no_lost_characters_message: "No agents have been lost in the network.",
        lost_in_dungeon: "Lost in Corrupted Network",
        view_details: "View Agent Profile",
        remove_from_memorial: "Redact",
        back_to_character_roster: "Back to Agent Database",
        character_last_seen: "Last Connection:",
        memorial_actions: "Data Actions:",
        
        // Delete Character Confirmation Modal
        delete_character_title: "Redact Agent",
        delete_character_confirm: "This agent will be redacted",
        delete_character_warning: "This agent's data will be permanently deleted. This action cannot be undone.",
        delete_character_button: "Redact Agent",
        forget_character_detail: "Redacting {name} ({race} {class}) will purge all data permanently.",
        character_last_location: "{location}",
        
        // Character Details Modal
        character_details: "Agent Profile",
        attributes: "Parameters",
        health_experience: "Integrity & Experience",
        equipment: "System Modules",
        
        // Attribute Names
        strength: "Protocol Strength",
        intelligence: "Algorithm Power",
        piety: "Endpoint Stability",
        vitality: "Persistence Level",
        agility: "Latency Response",
        luck: "Temperature Variance",
        
        // Attribute Abbreviations
        attr_str: "PRT",
        attr_int: "ALG",
        attr_pie: "EPT",
        attr_vit: "PER",
        attr_agi: "LAT",
        attr_luc: "TMP",
        
        // Equipment Slots
        weapon_slot: "Attack Algorithm",
        armor_slot: "Defense Protocol",
        shield_slot: "Firewall Module",
        accessory_slot: "Enhancement Chip",
        
        // Equipment Status
        equipped: "Loaded",
        unequipped: "Uninstalled",
        
        // Combat Statistics
        armor_class: "Defense Rating",
        attack_bonus: "Attack Algorithm",
        damage: "Output Damage",
        hit_points: "System Integrity",
        
        // Health Status
        healthy: "Optimal",
        wounded: "Degraded",
        critical: "System Failure",
        
        // Character Sheet Section Headers
        vital_statistics: "System Metrics",
        combat_statistics: "Combat Protocols",
        character_information: "Agent Profile",
        recent_activity: "Recent System Activity",
        
        // Character Information Labels
        created_date: "Activation Date",
        adventure_count: "Mission Count",
        threat_level: "Threat Level",
        
        // Experience and Currency
        experience: "Data Points",
        gold: "Credits",
        age: "Age",
        
        // Additional Character Sheet Text Keys
        derived_statistics: "Calculated Metrics",
        carrying_capacity: "Carry Capacity",
        spell_points: "Program Slots",
        initiative: "Initiative Modifier",
        saving_throws: "Fortitude Save",
        equipment_statistics: "System Performance",
        total_ac_bonus: "Total Defense Rating",
        total_attack_bonus: "Attack Enhancement",
        total_weight: "System Load",
        equipment_condition: "Module Efficiency",
        empty_slot: "(Module Slot Empty)",
        skills: "Agent Capabilities",
        skills_not_implemented: "Capability matrix not yet implemented",
        no_spells: "No subroutines loaded",
        no_history: "No activity logs available",
        no_recent_activity: "No recent system activity"
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