/**
 * Equipment System
 * Handles items, weapons, and armor with combat integration
 */
class Equipment {
    constructor() {
        this.items = new Map();
        this.equipmentDatabase = this.initializeEquipmentDatabase();
    }
    
    /**
     * Initialize equipment database
     */
    initializeEquipmentDatabase() {
        return {
            weapons: {
                // Basic Weapons
                'Dagger': {
                    name: 'Dagger',
                    type: 'weapon',
                    subtype: 'dagger',
                    damage: { dice: 1, sides: 4 },
                    attackBonus: 0,
                    weight: 1,
                    value: 20,
                    allowedClasses: ['all'],
                    special: ['throwable']
                },
                'Short Sword': {
                    name: 'Short Sword',
                    type: 'weapon',
                    subtype: 'sword',
                    damage: { dice: 1, sides: 6 },
                    attackBonus: 0,
                    weight: 3,
                    value: 100,
                    allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja']
                },
                'Long Sword': {
                    name: 'Long Sword',
                    type: 'weapon',
                    subtype: 'sword',
                    damage: { dice: 1, sides: 8 },
                    attackBonus: 0,
                    weight: 4,
                    value: 150,
                    allowedClasses: ['Fighter', 'Lord', 'Samurai']
                },
                'Mace': {
                    name: 'Mace',
                    type: 'weapon',
                    subtype: 'mace',
                    damage: { dice: 1, sides: 6 },
                    attackBonus: 1,
                    weight: 4,
                    value: 80,
                    allowedClasses: ['Fighter', 'Priest', 'Lord']
                },
                'Staff': {
                    name: 'Staff',
                    type: 'weapon',
                    subtype: 'staff',
                    damage: { dice: 1, sides: 6 },
                    attackBonus: 0,
                    spellBonus: 1,
                    weight: 4,
                    value: 50,
                    allowedClasses: ['Mage', 'Priest', 'Bishop']
                },
                'Spear': {
                    name: 'Spear',
                    type: 'weapon',
                    subtype: 'spear',
                    damage: { dice: 1, sides: 6 },
                    attackBonus: 0,
                    weight: 6,
                    value: 20,
                    allowedClasses: ['Fighter', 'Lord', 'Samurai'],
                    special: ['reach', 'throwable']
                },
                'Bow': {
                    name: 'Bow',
                    type: 'weapon',
                    subtype: 'bow',
                    damage: { dice: 1, sides: 6 },
                    attackBonus: 0,
                    range: 'long',
                    weight: 3,
                    value: 75,
                    allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja'],
                    ammunition: 'arrows'
                },
                // Magic Weapons
                'Magic Sword +1': {
                    name: 'Magic Sword +1',
                    type: 'weapon',
                    subtype: 'sword',
                    damage: { dice: 1, sides: 8, bonus: 1 },
                    attackBonus: 1,
                    weight: 4,
                    value: 1000,
                    allowedClasses: ['Fighter', 'Lord', 'Samurai'],
                    magical: true
                }
            },
            armor: {
                // Light Armor
                'Leather Armor': {
                    name: 'Leather Armor',
                    type: 'armor',
                    subtype: 'light',
                    acBonus: 2,
                    weight: 15,
                    value: 100,
                    allowedClasses: ['all']
                },
                'Studded Leather': {
                    name: 'Studded Leather',
                    type: 'armor',
                    subtype: 'light',
                    acBonus: 3,
                    weight: 20,
                    value: 250,
                    allowedClasses: ['Fighter', 'Thief', 'Lord', 'Samurai', 'Ninja']
                },
                // Medium Armor
                'Chain Mail': {
                    name: 'Chain Mail',
                    type: 'armor',
                    subtype: 'medium',
                    acBonus: 5,
                    weight: 40,
                    value: 750,
                    allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai']
                },
                // Heavy Armor
                'Plate Mail': {
                    name: 'Plate Mail',
                    type: 'armor',
                    subtype: 'heavy',
                    acBonus: 8,
                    weight: 50,
                    value: 1500,
                    allowedClasses: ['Fighter', 'Lord', 'Samurai']
                },
                // Magic Armor
                'Chain Mail +1': {
                    name: 'Chain Mail +1',
                    type: 'armor',
                    subtype: 'medium',
                    acBonus: 6,
                    weight: 40,
                    value: 2000,
                    allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
                    magical: true
                }
            },
            shields: {
                'Small Shield': {
                    name: 'Small Shield',
                    type: 'shield',
                    acBonus: 1,
                    weight: 5,
                    value: 30,
                    allowedClasses: ['Fighter', 'Priest', 'Thief', 'Lord', 'Samurai']
                },
                'Large Shield': {
                    name: 'Large Shield',
                    type: 'shield',
                    acBonus: 2,
                    weight: 10,
                    value: 70,
                    allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai']
                },
                'Shield +1': {
                    name: 'Shield +1',
                    type: 'shield',
                    acBonus: 3,
                    weight: 5,
                    value: 500,
                    allowedClasses: ['Fighter', 'Priest', 'Thief', 'Lord', 'Samurai'],
                    magical: true
                }
            },
            accessories: {
                'Ring of Protection': {
                    name: 'Ring of Protection',
                    type: 'accessory',
                    subtype: 'ring',
                    acBonus: 1,
                    weight: 0,
                    value: 2000,
                    allowedClasses: ['all'],
                    magical: true
                },
                'Amulet of Health': {
                    name: 'Amulet of Health',
                    type: 'accessory',
                    subtype: 'amulet',
                    hpBonus: 5,
                    weight: 1,
                    value: 1500,
                    allowedClasses: ['all'],
                    magical: true
                },
                'Cloak of Elvenkind': {
                    name: 'Cloak of Elvenkind',
                    type: 'accessory',
                    subtype: 'cloak',
                    stealthBonus: 2,
                    weight: 1,
                    value: 2500,
                    allowedClasses: ['Thief', 'Ninja'],
                    magical: true
                }
            }
        };
    }
    
    /**
     * Get item data
     */
    static getItemData(itemName) {
        const equipment = new Equipment();
        return equipment.getItem(itemName);
    }
    
    /**
     * Get item from database
     */
    getItem(itemName) {
        // Search all categories
        for (const category of Object.values(this.equipmentDatabase)) {
            if (category[itemName]) {
                return { ...category[itemName] }; // Return copy to avoid mutation
            }
        }
        return null;
    }
    
    /**
     * Get items by category
     */
    getItemsByCategory(category) {
        if (!this.equipmentDatabase[category]) return [];
        return Object.values(this.equipmentDatabase[category]);
    }
    
    /**
     * Get items available to character class
     */
    getAvailableItems(characterClass, category = null) {
        const availableItems = [];
        
        const categories = category ? [category] : Object.keys(this.equipmentDatabase);
        
        categories.forEach(cat => {
            if (!this.equipmentDatabase[cat]) return;
            
            Object.values(this.equipmentDatabase[cat]).forEach(item => {
                if (this.canUseItem(characterClass, item)) {
                    availableItems.push(item);
                }
            });
        });
        
        return availableItems;
    }
    
    /**
     * Check if character can use item
     */
    canUseItem(characterClass, item) {
        if (!item.allowedClasses) return true;
        if (item.allowedClasses.includes('all')) return true;
        return item.allowedClasses.includes(characterClass);
    }
    
    /**
     * Calculate weapon damage
     */
    calculateWeaponDamage(weapon, attacker) {
        if (!weapon || !weapon.damage) return 1;
        
        let damage = Random.dice(weapon.damage.dice, weapon.damage.sides);
        
        // Add weapon bonus
        if (weapon.damage.bonus) {
            damage += weapon.damage.bonus;
        }
        
        // Add strength bonus for melee weapons
        if (weapon.subtype !== 'bow' && attacker.attributes) {
            const strBonus = Math.floor((attacker.attributes.strength - 10) / 2);
            damage += strBonus;
        }
        
        return Math.max(1, damage);
    }
    
    /**
     * Calculate armor class bonus
     */
    calculateACBonus(character) {
        let totalACBonus = 0;
        
        if (character.equipment) {
            // Armor bonus
            if (character.equipment.armor) {
                const armor = this.getItem(character.equipment.armor.name || character.equipment.armor);
                if (armor && armor.acBonus) {
                    totalACBonus += armor.acBonus;
                }
            }
            
            // Shield bonus
            if (character.equipment.shield) {
                const shield = this.getItem(character.equipment.shield.name || character.equipment.shield);
                if (shield && shield.acBonus) {
                    totalACBonus += shield.acBonus;
                }
            }
            
            // Accessory bonus
            if (character.equipment.accessory) {
                const accessory = this.getItem(character.equipment.accessory.name || character.equipment.accessory);
                if (accessory && accessory.acBonus) {
                    totalACBonus += accessory.acBonus;
                }
            }
        }
        
        return totalACBonus;
    }
    
    /**
     * Calculate attack bonus
     */
    calculateAttackBonus(character) {
        let totalAttackBonus = 0;
        
        // Strength bonus
        if (character.attributes) {
            totalAttackBonus += Math.floor((character.attributes.strength - 10) / 2);
        }
        
        // Level bonus
        totalAttackBonus += character.level || 1;
        
        // Weapon bonus
        if (character.equipment && character.equipment.weapon) {
            const weapon = this.getItem(character.equipment.weapon.name || character.equipment.weapon);
            if (weapon && weapon.attackBonus) {
                totalAttackBonus += weapon.attackBonus;
            }
        }
        
        return totalAttackBonus;
    }
    
    /**
     * Get weapon attack type
     */
    getWeaponAttackType(weapon) {
        if (!weapon) return 'melee';
        
        if (weapon.subtype === 'bow') return 'ranged';
        if (weapon.special && weapon.special.includes('reach')) return 'reach';
        if (weapon.special && weapon.special.includes('throwable')) return 'throwable';
        
        return 'melee';
    }
    
    /**
     * Check if weapon is magical
     */
    isWeaponMagical(weapon) {
        return weapon && weapon.magical === true;
    }
    
    /**
     * Equip item to character
     */
    equipItem(character, item) {
        if (!this.canUseItem(character.class, item)) {
            return { success: false, reason: `${character.class} cannot use ${item.name}` };
        }
        
        if (!character.equipment) {
            character.equipment = { weapon: null, armor: null, shield: null, accessory: null };
        }
        
        // Determine equipment slot
        let slot;
        switch (item.type) {
            case 'weapon':
                slot = 'weapon';
                break;
            case 'armor':
                slot = 'armor';
                break;
            case 'shield':
                slot = 'shield';
                break;
            case 'accessory':
                slot = 'accessory';
                break;
            default:
                return { success: false, reason: 'Invalid item type' };
        }
        
        // Store previous item
        const previousItem = character.equipment[slot];
        
        // Equip new item
        character.equipment[slot] = item;
        
        // Recalculate character stats if needed
        if (character.recalculateStats) {
            character.recalculateStats();
        }
        
        return {
            success: true,
            equipped: item,
            previous: previousItem,
            slot: slot
        };
    }
    
    /**
     * Unequip item from character
     */
    unequipItem(character, slot) {
        if (!character.equipment || !character.equipment[slot]) {
            return { success: false, reason: 'No item equipped in that slot' };
        }
        
        const unequippedItem = character.equipment[slot];
        character.equipment[slot] = null;
        
        // Recalculate character stats if needed
        if (character.recalculateStats) {
            character.recalculateStats();
        }
        
        return {
            success: true,
            unequipped: unequippedItem,
            slot: slot
        };
    }
    
    /**
     * Get character's total encumbrance
     */
    calculateEncumbrance(character) {
        let totalWeight = 0;
        
        if (character.equipment) {
            Object.values(character.equipment).forEach(item => {
                if (item) {
                    const itemData = this.getItem(item.name || item);
                    if (itemData && itemData.weight) {
                        totalWeight += itemData.weight;
                    }
                }
            });
        }
        
        // Add inventory weight (if implemented)
        if (character.inventory) {
            character.inventory.forEach(item => {
                const itemData = this.getItem(item.name || item);
                if (itemData && itemData.weight) {
                    totalWeight += itemData.weight;
                }
            });
        }
        
        return totalWeight;
    }
    
    /**
     * Check if character is encumbered
     */
    isEncumbered(character) {
        const totalWeight = this.calculateEncumbrance(character);
        const maxWeight = (character.attributes?.strength || 10) * 10; // 10 lbs per strength point
        
        return totalWeight > maxWeight;
    }
    
    /**
     * Generate random loot
     */
    generateRandomLoot(level = 1, quantity = 1) {
        const loot = [];
        const allItems = [];
        
        // Collect all items
        Object.values(this.equipmentDatabase).forEach(category => {
            Object.values(category).forEach(item => {
                // Simple level-based filtering
                const itemLevel = item.magical ? 3 : 1;
                if (itemLevel <= level + 2) {
                    allItems.push(item);
                }
            });
        });
        
        // Select random items
        for (let i = 0; i < quantity; i++) {
            if (allItems.length > 0) {
                const randomItem = Random.choice(allItems);
                loot.push({ ...randomItem }); // Copy to avoid mutation
            }
        }
        
        return loot;
    }
    
    /**
     * Get equipment summary for character
     */
    getEquipmentSummary(character) {
        const summary = {
            weapon: null,
            armor: null,
            shield: null,
            accessory: null,
            totalACBonus: 0,
            totalAttackBonus: 0,
            totalWeight: 0,
            isEncumbered: false
        };
        
        if (character.equipment) {
            Object.entries(character.equipment).forEach(([slot, item]) => {
                if (item) {
                    const itemData = this.getItem(item.name || item);
                    summary[slot] = itemData;
                }
            });
        }
        
        summary.totalACBonus = this.calculateACBonus(character);
        summary.totalAttackBonus = this.calculateAttackBonus(character);
        summary.totalWeight = this.calculateEncumbrance(character);
        summary.isEncumbered = this.isEncumbered(character);
        
        return summary;
    }
    
    /**
     * Add item to inventory
     */
    addItem(item) {
        const id = Helpers.generateId('item');
        this.items.set(id, item);
        return id;
    }
    
    /**
     * Remove item from inventory
     */
    removeItem(itemId) {
        return this.items.delete(itemId);
    }
}