/**
 * Spells Entity Migration - Version 1.1.0
 * Adds cyber terminology and digital flavor to existing spells
 * Maintains backward compatibility with classic names
 */

// Global assignment for browser compatibility
window.spellsMigrationV110 = {
    version: '1.1.0',
    entity: 'spells',
    store: 'spells',
    description: 'Spells cyber terminology enhancement',
    
    data: {
        // Arcane School Spells
        "spell_magic_missile_001": {
            "name": "Magic Missile",
            "cyberName": "Projectile Subroutine",
            "displayName": "Magic Missile",
            "digitalFlavor": "Targeted data burst algorithm with guaranteed impact protocol",
            "school": "arcane",
            "cyberSchool": "combat_algorithms",
            "level": 1,
            "type": "offensive",
            "programType": "targeted_attack",
            "executionMethod": "data_burst",
            "damage": { "dice": 1, "sides": 4, "bonus": 1 },
            "range": 120,
            "duration": "instantaneous",
            "components": ["verbal", "somatic"],
            "cyberComponents": ["voice_command", "gesture_input"],
            "description": "A glowing dart of magical force springs from your finger.",
            "cyberDescription": "Execute a precision data packet targeting hostile entities with automatic hit confirmation."
        },
        "spell_shield_001": {
            "name": "Shield",
            "cyberName": "Defensive Protocol",
            "displayName": "Shield",
            "digitalFlavor": "Personal firewall with kinetic barrier generation",
            "school": "arcane",
            "cyberSchool": "defense_systems",
            "level": 1,
            "type": "defensive",
            "programType": "personal_defense",
            "executionMethod": "barrier_generation",
            "armorBonus": 4,
            "duration": "5 minutes per level",
            "components": ["verbal", "somatic"],
            "cyberComponents": ["voice_command", "gesture_input"],
            "description": "An invisible barrier of magical force appears and protects you.",
            "cyberDescription": "Activate personal defense grid creating an energy barrier around the user."
        },
        "spell_fireball_001": {
            "name": "Fireball",
            "cyberName": "Thermal Burst Algorithm",
            "displayName": "Fireball",
            "digitalFlavor": "Area-effect thermal damage protocol with explosive data expansion",
            "school": "arcane",
            "cyberSchool": "destruction_algorithms",
            "level": 3,
            "type": "offensive",
            "programType": "area_attack",
            "executionMethod": "thermal_explosion",
            "damage": { "dice": 6, "sides": 6 },
            "range": 150,
            "area": "20-foot radius",
            "duration": "instantaneous",
            "components": ["verbal", "somatic", "material"],
            "cyberComponents": ["voice_command", "gesture_input", "thermal_catalyst"],
            "description": "A bright streak flashes from your pointing finger to a point within range.",
            "cyberDescription": "Launch thermal payload with area-effect detonation at target coordinates."
        },
        "spell_lightning_bolt_001": {
            "name": "Lightning Bolt",
            "cyberName": "Electrical Discharge Protocol",
            "displayName": "Lightning Bolt",
            "digitalFlavor": "High-voltage data stream with linear propagation algorithm",
            "school": "arcane",
            "cyberSchool": "energy_systems",
            "level": 3,
            "type": "offensive",
            "programType": "line_attack",
            "executionMethod": "electrical_discharge",
            "damage": { "dice": 6, "sides": 6 },
            "range": 120,
            "area": "5-foot wide, 100-foot line",
            "duration": "instantaneous",
            "components": ["verbal", "somatic", "material"],
            "cyberComponents": ["voice_command", "gesture_input", "conductor_matrix"],
            "description": "A stroke of lightning forming a line 100 feet long and 5 feet wide.",
            "cyberDescription": "Execute electrical discharge along designated vector path."
        },
        "spell_teleport_001": {
            "name": "Teleport",
            "cyberName": "Spatial Relocation Protocol",
            "displayName": "Teleport",
            "digitalFlavor": "Matter-stream transportation with quantum coordinate mapping",
            "school": "arcane",
            "cyberSchool": "transportation_systems",
            "level": 5,
            "type": "utility",
            "programType": "spatial_manipulation",
            "executionMethod": "quantum_tunneling",
            "range": "100 miles per level",
            "duration": "instantaneous",
            "components": ["verbal"],
            "cyberComponents": ["coordinate_input"],
            "description": "This spell instantly transports you and up to eight willing creatures.",
            "cyberDescription": "Initiate matter stream transport to designated spatial coordinates."
        },
        
        // Divine School Spells
        "spell_cure_light_wounds_001": {
            "name": "Cure Light Wounds",
            "cyberName": "Basic Repair Protocol",
            "displayName": "Cure Light Wounds",
            "digitalFlavor": "System integrity restoration with cellular regeneration algorithms",
            "school": "divine",
            "cyberSchool": "restoration_systems",
            "level": 1,
            "type": "healing",
            "programType": "system_repair",
            "executionMethod": "cellular_restoration",
            "healing": { "dice": 1, "sides": 8, "bonus": 1 },
            "range": "touch",
            "duration": "instantaneous",
            "components": ["verbal", "somatic"],
            "cyberComponents": ["diagnostic_scan", "repair_command"],
            "description": "Your touch can heal wounds and restore hit points.",
            "cyberDescription": "Execute system diagnostics and repair damaged data structures."
        },
        "spell_bless_001": {
            "name": "Bless",
            "cyberName": "Enhancement Protocol",
            "displayName": "Bless",
            "digitalFlavor": "Performance optimization subroutine with morale enhancement",
            "school": "divine",
            "cyberSchool": "enhancement_systems",
            "level": 1,
            "type": "enhancement",
            "programType": "performance_boost",
            "executionMethod": "stat_optimization",
            "bonus": { "attack": 1, "damage": 1 },
            "duration": "6 rounds",
            "area": "50-foot radius",
            "components": ["verbal", "somatic", "divine focus"],
            "cyberComponents": ["blessing_algorithm", "performance_matrix"],
            "description": "Your allies fight with enhanced vigor and accuracy.",
            "cyberDescription": "Broadcast performance enhancement protocols to allied agents."
        },
        "spell_hold_person_001": {
            "name": "Hold Person",
            "cyberName": "Paralysis Virus",
            "displayName": "Hold Person",
            "digitalFlavor": "Motor control override with movement system lockdown",
            "school": "divine",
            "cyberSchool": "control_systems",
            "level": 2,
            "type": "control",
            "programType": "system_override",
            "executionMethod": "motor_lockdown",
            "duration": "2 rounds per level",
            "range": 120,
            "savingThrow": "will negates",
            "components": ["verbal", "somatic", "divine focus"],
            "cyberComponents": ["control_algorithm", "override_protocol"],
            "description": "The subject becomes paralyzed and freezes in place.",
            "cyberDescription": "Inject paralysis code to override target's movement systems."
        },
        "spell_resurrection_001": {
            "name": "Resurrection",
            "cyberName": "System Restoration Protocol",
            "displayName": "Resurrection",
            "digitalFlavor": "Complete agent reconstruction from backup data archives",
            "school": "divine",
            "cyberSchool": "restoration_systems",
            "level": 7,
            "type": "restoration",
            "programType": "full_restoration",
            "executionMethod": "backup_recovery",
            "range": "touch",
            "duration": "instantaneous",
            "components": ["verbal", "somatic", "material", "divine focus"],
            "cyberComponents": ["reconstruction_matrix", "backup_access", "divine_authorization"],
            "description": "You restore life to a deceased creature.",
            "cyberDescription": "Execute full agent reconstruction from archived backup data."
        },
        "spell_flame_strike_001": {
            "name": "Flame Strike",
            "cyberName": "Divine Incinerator Protocol",
            "displayName": "Flame Strike",
            "digitalFlavor": "Orbital thermal strike with divine authorization codes",
            "school": "divine",
            "cyberSchool": "divine_weapons",
            "level": 5,
            "type": "offensive",
            "programType": "orbital_strike",
            "executionMethod": "divine_thermal",
            "damage": { "dice": 6, "sides": 6 },
            "range": 60,
            "area": "10-foot radius, 40-foot high cylinder",
            "duration": "instantaneous",
            "components": ["verbal", "somatic", "divine focus"],
            "cyberComponents": ["targeting_protocol", "divine_authorization"],
            "description": "A vertical column of divine fire roars down from the heavens.",
            "cyberDescription": "Request orbital thermal strike at designated coordinates."
        }
    }
};