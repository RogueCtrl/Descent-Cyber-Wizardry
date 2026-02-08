/**
 * Armor Entity Migration - Version 1.1.0
 * Adds cyber terminology and digital flavor to existing armor
 * Maintains backward compatibility with classic names
 */

// Global assignment for browser compatibility
export const armorMigrationV110 = {
    version: '1.1.0',
    entity: 'armor',
    store: 'armor',
    description: 'Armor cyber terminology enhancement',
    
    data: {
        "armor_cloth_001": {
            "name": "Cloth Armor",
            "cyberName": "Basic Data Shroud",
            "displayName": "Cloth Armor",
            "digitalFlavor": "Minimal protection layer against minor data corruption",
            "type": "armor",
            "subtype": "data_shroud",
            "cyberSubtype": "basic_protection",
            "armorClass": 8,
            "weight": 5,
            "value": 50,
            "allowedClasses": ["all"],
            "special": [],
            "protectionClass": "minimal",
            "encryptionLevel": "basic"
        },
        "armor_leather_001": {
            "name": "Leather Armor",
            "cyberName": "Flexible Defense Layer",
            "displayName": "Leather Armor",
            "digitalFlavor": "Adaptive protection matrix with mobility optimization",
            "type": "armor",
            "subtype": "flexible_defense",
            "cyberSubtype": "adaptive_layer",
            "armorClass": 7,
            "weight": 15,
            "value": 150,
            "allowedClasses": ["thief", "fighter", "samurai", "lord", "ninja"],
            "special": ["flexible"],
            "protectionClass": "light",
            "encryptionLevel": "standard"
        },
        "armor_studded_leather_001": {
            "name": "Studded Leather",
            "cyberName": "Reinforced Defense Matrix",
            "displayName": "Studded Leather",
            "digitalFlavor": "Enhanced protection layer with hardened data nodes",
            "type": "armor",
            "subtype": "reinforced_matrix",
            "cyberSubtype": "hardened_layer",
            "armorClass": 6,
            "weight": 20,
            "value": 250,
            "allowedClasses": ["thief", "fighter", "samurai", "lord"],
            "special": ["reinforced"],
            "protectionClass": "light_plus",
            "encryptionLevel": "enhanced"
        },
        "armor_chain_mail_001": {
            "name": "Chain Mail",
            "cyberName": "Defense Protocol Suite",
            "displayName": "Chain Mail",
            "digitalFlavor": "Interlocked security algorithms providing comprehensive protection",
            "type": "armor",
            "subtype": "protocol_suite",
            "cyberSubtype": "interlocked_defense",
            "armorClass": 5,
            "weight": 40,
            "value": 500,
            "allowedClasses": ["fighter", "samurai", "lord"],
            "special": ["mail"],
            "protectionClass": "medium",
            "encryptionLevel": "military"
        },
        "armor_banded_mail_001": {
            "name": "Banded Mail",
            "cyberName": "Segmented Security System",
            "displayName": "Banded Mail",
            "digitalFlavor": "Layered protection protocols with redundant failsafes",
            "type": "armor",
            "subtype": "segmented_security",
            "cyberSubtype": "layered_protocol",
            "armorClass": 4,
            "weight": 50,
            "value": 750,
            "allowedClasses": ["fighter", "samurai", "lord"],
            "special": ["banded", "heavy"],
            "protectionClass": "medium_plus",
            "encryptionLevel": "advanced"
        },
        "armor_plate_mail_001": {
            "name": "Plate Mail",
            "cyberName": "Fortress Defense Grid",
            "displayName": "Plate Mail",
            "digitalFlavor": "Maximum protection architecture with full-spectrum shielding",
            "type": "armor",
            "subtype": "fortress_grid",
            "cyberSubtype": "maximum_defense",
            "armorClass": 3,
            "weight": 70,
            "value": 1200,
            "allowedClasses": ["fighter", "lord"],
            "special": ["plate", "heavy", "cumbersome"],
            "protectionClass": "heavy",
            "encryptionLevel": "maximum"
        },
        "armor_robe_001": {
            "name": "Mage Robe",
            "cyberName": "Spell Amplification Matrix",
            "displayName": "Mage Robe",
            "digitalFlavor": "Specialized fabric woven with data enhancement threads",
            "type": "armor",
            "subtype": "amplification_matrix",
            "cyberSubtype": "spell_enhanced",
            "armorClass": 8,
            "weight": 3,
            "value": 200,
            "allowedClasses": ["mage", "bishop"],
            "special": ["spell_focus", "lightweight"],
            "protectionClass": "magical",
            "encryptionLevel": "arcane"
        },
        "armor_priest_vestments_001": {
            "name": "Priest Vestments",
            "cyberName": "Divine Interface Garb",
            "displayName": "Priest Vestments",
            "digitalFlavor": "Sacred data conduits for divine algorithm access",
            "type": "armor",
            "subtype": "divine_interface",
            "cyberSubtype": "sacred_conduit",
            "armorClass": 8,
            "weight": 4,
            "value": 180,
            "allowedClasses": ["priest", "bishop"],
            "special": ["divine_focus", "blessed"],
            "protectionClass": "divine",
            "encryptionLevel": "sacred"
        },
        "armor_ninja_garb_001": {
            "name": "Ninja Garb",
            "cyberName": "Stealth Protocol Suit",
            "displayName": "Ninja Garb",
            "digitalFlavor": "Covert operations armor with noise dampening and concealment",
            "type": "armor",
            "subtype": "stealth_protocol",
            "cyberSubtype": "covert_suit",
            "armorClass": 7,
            "weight": 8,
            "value": 400,
            "allowedClasses": ["ninja"],
            "special": ["stealth", "silent", "concealment"],
            "protectionClass": "stealth",
            "encryptionLevel": "covert"
        },
        "armor_samurai_do_001": {
            "name": "Samurai Do",
            "cyberName": "Honor Guard Protocol",
            "displayName": "Samurai Do",
            "digitalFlavor": "Elite protection system with integrated combat enhancement",
            "type": "armor",
            "subtype": "honor_protocol",
            "cyberSubtype": "elite_defense",
            "armorClass": 4,
            "weight": 45,
            "value": 800,
            "allowedClasses": ["samurai"],
            "special": ["masterwork", "honor_bonus"],
            "protectionClass": "elite",
            "encryptionLevel": "honor_code"
        }
    }
};
// Backwards compat
if (typeof window !== 'undefined') { window.armorMigrationV110 = armorMigrationV110; }
