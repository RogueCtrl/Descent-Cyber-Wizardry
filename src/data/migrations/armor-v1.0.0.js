/**
 * Armor Entity Migration - Version 1.0.0
 * Contains all armor data for the game
 */

// Global assignment for browser compatibility
window.armorMigration = {
    version: '1.0.0',
    entity: 'armor',
    store: 'armor',
    description: 'Initial armor data migration',
    
    data: {
        "armor_leather_001": {
            "name": "Leather Armor",
            "type": "armor",
            "subtype": "light",
            "acBonus": 2,
            "weight": 15,
            "value": 100,
            "allowedClasses": ["all"]
        },
        "armor_studded_leather_001": {
            "name": "Studded Leather",
            "type": "armor",
            "subtype": "light",
            "acBonus": 3,
            "weight": 20,
            "value": 250,
            "allowedClasses": ["Fighter", "Thief", "Lord", "Samurai", "Ninja"]
        },
        "armor_chain_mail_001": {
            "name": "Chain Mail",
            "type": "armor",
            "subtype": "medium",
            "acBonus": 5,
            "weight": 40,
            "value": 750,
            "allowedClasses": ["Fighter", "Priest", "Lord", "Samurai"]
        },
        "armor_plate_mail_001": {
            "name": "Plate Mail",
            "type": "armor",
            "subtype": "heavy",
            "acBonus": 8,
            "weight": 50,
            "value": 1500,
            "allowedClasses": ["Fighter", "Lord", "Samurai"]
        },
        "armor_chain_mail_plus_1_001": {
            "name": "Chain Mail +1",
            "type": "armor",
            "subtype": "medium",
            "acBonus": 6,
            "weight": 40,
            "value": 2000,
            "allowedClasses": ["Fighter", "Priest", "Lord", "Samurai"],
            "magical": true
        },
        "armor_vulnerability_001": {
            "name": "Armor of Vulnerability",
            "type": "armor",
            "subtype": "medium",
            "acBonus": -2,
            "weight": 40,
            "value": 100,
            "allowedClasses": ["Fighter", "Priest", "Lord", "Samurai"],
            "cursed": true,
            "curseName": "Vulnerability Curse",
            "curseEffect": "Makes wearer more vulnerable to attacks",
            "disguisedAs": "Chain Mail +1",
            "magical": true
        }
    },
    
    /**
     * Validate armor data
     */
    validate: (armorData) => {
        const required = ['name', 'type', 'subtype', 'acBonus'];
        return required.every(field => armorData[field] !== undefined);
    },
    
    /**
     * Transform armor data if needed (future migrations)
     */
    transform: (armorData) => {
        return armorData;
    }
};