import { Storage } from '../utils/Storage.ts';
import { Random } from '../utils/Random.ts';
import { Helpers } from '../utils/Helpers.ts';

/**
 * Equipment System
 * Handles items, weapons, and armor with combat integration
 * Enhanced with cursed items and identification mechanics
 * Updated to use entity reference system with IndexedDB storage
 */
export class Equipment {
    items: Map<any, any>;
    entityCache: Map<any, any>;
    ITEM_STATES: Record<string, any>;
    entitiesLoaded: boolean;

    constructor() {
        this.items = new Map();
        this.entityCache = new Map(); // Cache for frequently accessed entities

        // Item states
        this.ITEM_STATES = {
            IDENTIFIED: 'identified',
            UNIDENTIFIED: 'unidentified',
            CURSED: 'cursed',
            BLESSED: 'blessed'
        };

        // Initialize entity loading on first use
        this.entitiesLoaded = false;
    }

    /**
     * Initialize entity loading from IndexedDB
     * @param {boolean} forceReload - Force reload entities from JSON
     * @returns {Promise<boolean>} Success status
     */
    async initializeEntities(forceReload = false) {
        if (this.entitiesLoaded && !forceReload) return true;

        try {
            // Entities are already loaded by Engine.js, just mark as initialized
            this.entitiesLoaded = true;

            // Clear cache when entities are reloaded
            if (forceReload) {
                this.entityCache.clear();
                console.log('Equipment entity cache cleared');
                // Force reload entities if requested
                await Storage.loadEntitiesFromJSON(forceReload);
            }

            console.log('Equipment entities initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize equipment entities:', error);
            return false;
        }
    }

    /**
     * DEPRECATED: Legacy equipment database (kept for compatibility)
     * Use getEntityFromStorage() instead
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
                    weight: 0,
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
                    allowedClasses: ['all'],
                    magical: true
                }
            },
            // NEW: Cursed Items
            cursedItems: {
                'Cursed Sword -1': {
                    name: 'Cursed Sword -1',
                    type: 'weapon',
                    subtype: 'sword',
                    damage: { dice: 1, sides: 8, bonus: -1 },
                    attackBonus: -1,
                    weight: 4,
                    value: 50,
                    allowedClasses: ['Fighter', 'Lord', 'Samurai'],
                    cursed: true,
                    curseName: 'Binding Curse',
                    curseEffect: 'Cannot be removed, -1 to all attack rolls',
                    disguisedAs: 'Magic Sword +1',
                    magical: true
                },
                'Armor of Vulnerability': {
                    name: 'Armor of Vulnerability',
                    type: 'armor',
                    subtype: 'medium',
                    acBonus: -2,
                    weight: 40,
                    value: 100,
                    allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
                    cursed: true,
                    curseName: 'Vulnerability Curse',
                    curseEffect: 'Makes wearer more vulnerable to attacks',
                    disguisedAs: 'Chain Mail +1',
                    magical: true
                },
                'Ring of Weakness': {
                    name: 'Ring of Weakness',
                    type: 'accessory',
                    subtype: 'ring',
                    strengthPenalty: -2,
                    weight: 0,
                    value: 50,
                    allowedClasses: ['all'],
                    cursed: true,
                    curseName: 'Strength Drain',
                    curseEffect: 'Permanently reduces strength by 2',
                    disguisedAs: 'Ring of Strength',
                    magical: true
                },
                'Cloak of Misfortune': {
                    name: 'Cloak of Misfortune',
                    type: 'accessory',
                    subtype: 'cloak',
                    luckPenalty: -3,
                    weight: 1,
                    value: 25,
                    allowedClasses: ['all'],
                    cursed: true,
                    curseName: 'Misfortune Curse',
                    curseEffect: 'Brings terrible luck to the wearer',
                    disguisedAs: 'Cloak of Luck',
                    magical: true
                },
                'Shield of Attraction': {
                    name: 'Shield of Attraction',
                    type: 'shield',
                    acBonus: -1,
                    weight: 10,
                    value: 50,
                    allowedClasses: ['Fighter', 'Priest', 'Lord', 'Samurai'],
                    cursed: true,
                    curseName: 'Monster Attraction',
                    curseEffect: 'Increases random encounter rate',
                    disguisedAs: 'Shield +1',
                    magical: true
                }
            },
            // NEW: Unknown/Unidentified Items
            unknownItems: {
                'Potion of Unknown Effect': {
                    name: 'Potion of Unknown Effect',
                    type: 'consumable',
                    subtype: 'potion',
                    weight: 0.5,
                    value: 100,
                    allowedClasses: ['all'],
                    unidentified: true,
                    possibleEffects: ['healing', 'poison', 'strength', 'intelligence'],
                    identificationDC: 15
                },
                'Scroll of Unknown Spell': {
                    name: 'Scroll of Unknown Spell',
                    type: 'consumable',
                    subtype: 'scroll',
                    weight: 0.1,
                    value: 200,
                    allowedClasses: ['Mage', 'Priest', 'Bishop'],
                    unidentified: true,
                    possibleSpells: ['Fireball', 'Heal', 'Teleport', 'Curse'],
                    identificationDC: 12
                },
                'Mysterious Amulet': {
                    name: 'Mysterious Amulet',
                    type: 'accessory',
                    subtype: 'amulet',
                    weight: 0,
                    value: 500,
                    allowedClasses: ['all'],
                    unidentified: true,
                    possibleEffects: ['protection', 'curse', 'health', 'magic resistance'],
                    identificationDC: 18
                }
            }
        };
    }

    /**
     * Get item data by name (async version using entity references)
     * @param {string} itemName - Name of the item
     * @returns {Promise<Object|null>} Item data or null
     */
    static async getItemData(itemName) {
        const equipment = new Equipment();
        return await equipment.getItemByName(itemName);
    }

    /**
     * Get item data by entity ID (preferred method)
     * @param {string} entityId - Entity ID of the item
     * @returns {Promise<Object|null>} Item data or null
     */
    static async getItemById(entityId) {
        const equipment = new Equipment();
        return await equipment.getItemFromStorage(entityId);
    }

    /**
     * Force reload all equipment entities from JSON files
     * @returns {Promise<boolean>} Success status
     */
    static async forceReloadEntities() {
        const equipment = new Equipment();
        return await equipment.initializeEntities(true);
    }

    /**
     * Get item from storage by entity ID
     * @param {string} entityId - Entity ID to retrieve
     * @returns {Promise<Object|null>} Item data or null
     */
    async getItemFromStorage(entityId) {
        if (!entityId) return null;

        // Check cache first
        if (this.entityCache.has(entityId)) {
            return { ...this.entityCache.get(entityId) };
        }

        await this.initializeEntities();

        // Try each entity store
        let item = await Storage.getWeapon(entityId);
        if (item) {
            this.entityCache.set(entityId, item);
            return { ...(item as any) };
        }

        item = await Storage.getArmor(entityId);
        if (item) {
            this.entityCache.set(entityId, item);
            return { ...(item as any) };
        }

        item = await Storage.getShield(entityId);
        if (item) {
            this.entityCache.set(entityId, item);
            return { ...(item as any) };
        }

        item = await Storage.getAccessory(entityId);
        if (item) {
            this.entityCache.set(entityId, item);
            return { ...(item as any) };
        }

        return null;
    }

    /**
     * Get item by name (searches all entities)
     * @param {string} itemName - Name of the item
     * @returns {Promise<Object|null>} Item data or null
     */
    async getItemByName(itemName) {
        await this.initializeEntities();

        // Search all entity stores for matching name
        const stores = ['weapons', 'armor', 'shields', 'accessories'];

        for (const store of (stores as any)) {
            const entities = await Storage.queryEntities(Storage[store.toUpperCase() + '_STORE'], { name: itemName });
            if ((entities as any).length > 0) {
                const item = entities[0];
                this.entityCache.set(item.id, item);
                return { ...item };
            }
        }

        return null;
    }

    /**
     * DEPRECATED: Legacy getItem method (kept for compatibility)
     * Use getItemByName() or getItemFromStorage() instead
     */
    getItem(itemName) {
        // For backward compatibility, use synchronous fallback
        const equipmentDatabase = this.initializeEquipmentDatabase();
        for (const category of Object.values(equipmentDatabase) as any[]) {
            if (category[itemName]) {
                return { ...category[itemName] };
            }
        }
        return null;
    }

    /**
     * Get items by category (async version using entity references)
     * @param {string} category - Category name (weapons, armor, shields, accessories)
     * @returns {Promise<Array>} Array of items in category
     */
    async getItemsByCategory(category) {
        await this.initializeEntities();

        const storeMap = {
            'weapons': Storage.WEAPON_STORE,
            'armor': Storage.ARMOR_STORE,
            'shields': Storage.SHIELD_STORE,
            'accessories': Storage.ACCESSORY_STORE
        };

        const storeName = storeMap[category];
        if (!storeName) return [];

        return await Storage.getAllEntities(storeName);
    }

    /**
     * Get items available to character class (async version using entity references)
     * @param {string} characterClass - Character class name
     * @param {string} category - Optional category filter
     * @returns {Promise<Array>} Array of available items
     */
    async getAvailableItems(characterClass, category = null) {
        await this.initializeEntities();

        const availableItems = [];
        const categories = category ? [category] : ['weapons', 'armor', 'shields', 'accessories'];

        for (const cat of (categories as any)) {
            const items = await this.getItemsByCategory(cat);
            (items as any).forEach(item => {
                if (this.canUseItem(characterClass, item)) {
                    availableItems.push(item);
                }
            });
        }

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
    /**
     * Calculate weapon damage (supports both entity references and direct objects)
     * @param {Object|string} weapon - Weapon object or entity ID
     * @param {Object} attacker - Attacking character
     * @returns {Promise<number>} Calculated damage
     */
    async calculateWeaponDamage(weapon, attacker) {
        let weaponData = weapon;

        // If weapon is an entity reference, resolve it
        if (typeof weapon === 'string') {
            weaponData = await this.getItemFromStorage(weapon) || await this.getItemByName(weapon);
        }

        if (!weaponData || !weaponData.damage) return 1;

        let damage = Random.dice(weaponData.damage.dice, weaponData.damage.sides);

        // Add weapon bonus
        if (weaponData.damage.bonus) {
            damage += weaponData.damage.bonus;
        }

        // Add strength bonus for melee weapons
        if (weaponData.subtype !== 'bow' && attacker.attributes) {
            const strBonus = Math.floor((attacker.attributes.strength - 10) / 2);
            damage += strBonus;
        }

        return Math.max(1, damage);
    }

    /**
     * Calculate armor class bonus
     */
    /**
     * Calculate AC bonus (async version using entity references)
     * @param {Object} character - Character to calculate AC for
     * @returns {Promise<number>} Total AC bonus
     */
    async calculateACBonus(character) {
        let totalACBonus = 0;

        if (character.equipment) {
            // Armor bonus
            if (character.equipment.armor) {
                const armorId = typeof character.equipment.armor === 'string' ? character.equipment.armor : character.equipment.armor.name;
                const armor = await this.getItemFromStorage(armorId) || await this.getItemByName(armorId);
                if (armor && armor.acBonus) {
                    totalACBonus += armor.acBonus;
                }
            }

            // Shield bonus
            if (character.equipment.shield) {
                const shieldId = typeof character.equipment.shield === 'string' ? character.equipment.shield : character.equipment.shield.name;
                const shield = await this.getItemFromStorage(shieldId) || await this.getItemByName(shieldId);
                if (shield && shield.acBonus) {
                    totalACBonus += shield.acBonus;
                }
            }

            // Accessory bonus
            if (character.equipment.accessory) {
                const accessoryId = typeof character.equipment.accessory === 'string' ? character.equipment.accessory : character.equipment.accessory.name;
                const accessory = await this.getItemFromStorage(accessoryId) || await this.getItemByName(accessoryId);
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
    /**
     * Calculate attack bonus (async version using entity references)
     * @param {Object} character - Character to calculate attack bonus for
     * @returns {Promise<number>} Total attack bonus
     */
    async calculateAttackBonus(character) {
        let totalAttackBonus = 0;

        // Strength bonus
        if (character.attributes) {
            totalAttackBonus += Math.floor((character.attributes.strength - 10) / 2);
        }

        // Level bonus
        totalAttackBonus += character.level || 1;

        // Weapon bonus
        if (character.equipment && character.equipment.weapon) {
            const weaponId = typeof character.equipment.weapon === 'string' ? character.equipment.weapon : character.equipment.weapon.name;
            const weapon = await this.getItemFromStorage(weaponId) || await this.getItemByName(weaponId);
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
    /**
     * Calculate encumbrance (async version using entity references)
     * @param {Object} character - Character to calculate encumbrance for
     * @returns {Promise<number>} Total weight
     */
    async calculateEncumbrance(character) {
        let totalWeight = 0;

        if (character.equipment) {
            for (const item of (await Object.values(character.equipment) as any[])) {
                if (item) {
                    const itemId = typeof item === 'string' ? item : (item as any).name;
                    const itemData = await this.getItemFromStorage(itemId) || await this.getItemByName(itemId);
                    if (itemData && itemData.weight) {
                        totalWeight += itemData.weight;
                    }
                }
            }
        }

        // Add inventory weight (if implemented)
        if (character.inventory) {
            for (const item of character.inventory) {
                const itemId = typeof item === 'string' ? item : item.name;
                const itemData = await this.getItemFromStorage(itemId) || await this.getItemByName(itemId);
                if (itemData && itemData.weight) {
                    totalWeight += itemData.weight;
                }
            }
        }

        return totalWeight;
    }

    /**
     * Check if character is encumbered
     */
    /**
     * Check if character is encumbered (async version)
     * @param {Object} character - Character to check
     * @returns {Promise<boolean>} Whether character is encumbered
     */
    async isEncumbered(character) {
        const totalWeight = await this.calculateEncumbrance(character);
        const maxWeight = (character.attributes?.strength || 10) * 10; // 10 lbs per strength point

        return totalWeight > maxWeight;
    }

    /**
     * Generate random loot
     */
    /**
     * Generate random loot (async version using entity references)
     * @param {number} level - Level for filtering items
     * @param {number} quantity - Number of items to generate
     * @returns {Promise<Array>} Array of loot items
     */
    async generateRandomLoot(level = 1, quantity = 1) {
        const loot = [];
        const allItems = [];

        await this.initializeEntities();

        // Collect all items from entity stores
        const weapons = await Storage.getAllWeapons();
        const armor = await Storage.getAllArmor();
        const shields = await Storage.getAllShields();
        const accessories = await Storage.getAllAccessories();

        [...(weapons as any), ...(armor as any), ...(shields as any), ...(accessories as any)].forEach(item => {
            // Simple level-based filtering
            const itemLevel = item.magical ? 3 : 1;
            if (itemLevel <= level + 2) {
                allItems.push(item);
            }
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
    /**
     * Get equipment summary (async version using entity references)
     * @param {Object} character - Character to get summary for
     * @returns {Promise<Object>} Equipment summary
     */
    async getEquipmentSummary(character) {
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
            for (const [slot, item] of Object.entries(character.equipment)) {
                if (item) {
                    const itemId = typeof item === 'string' ? item : (item as any).name;
                    const itemData = await this.getItemFromStorage(itemId) || await this.getItemByName(itemId);
                    summary[slot] = itemData;
                }
            }
        }

        summary.totalACBonus = await this.calculateACBonus(character);
        summary.totalAttackBonus = await this.calculateAttackBonus(character);
        summary.totalWeight = await this.calculateEncumbrance(character);
        summary.isEncumbered = await this.isEncumbered(character);

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

    /**
     * Create an item instance with state information
     * @param {string} itemName - Name of the item from database
     * @param {Object} options - Additional options for item creation
     * @returns {Object} Item instance with state
     */
    /**
     * Create an item instance with state information (async version)
     * @param {string} itemNameOrId - Name or ID of the item
     * @param {Object} options - Additional options for item creation
     * @returns {Promise<Object>} Item instance with state
     */
    async createItemInstance(itemNameOrId, options = {}) {
        let itemData = await this.getItemFromStorage(itemNameOrId);
        if (!itemData) {
            itemData = await this.getItemByName(itemNameOrId);
        }
        if (!itemData) {
            throw new Error(`Item not found: ${itemNameOrId}`);
        }

        const instance = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...itemData,
            state: (options as any).state || (itemData.cursed ? this.ITEM_STATES.CURSED :
                itemData.unidentified ? this.ITEM_STATES.UNIDENTIFIED :
                    this.ITEM_STATES.IDENTIFIED),
            identified: (options as any).identified !== undefined ? (options as any).identified : !itemData.unidentified && !itemData.cursed,
            cursed: itemData.cursed || false,
            blessed: (options as any).blessed || false,
            durability: (options as any).durability || 100,
            maxDurability: 100,
            charges: itemData.charges || null,
            maxCharges: itemData.maxCharges || null
        };

        // If item is cursed and unidentified, show disguised appearance
        if (instance.cursed && !instance.identified && itemData.disguisedAs) {
            const disguiseData = await this.getItemByName(itemData.disguisedAs);
            if (disguiseData) {
                instance.apparentName = disguiseData.name;
                instance.apparentDescription = disguiseData.description || disguiseData.name;
            }
        }

        return instance;
    }

    /**
     * Attempt to identify an unknown item
     * @param {Object} item - Item to identify
     * @param {Object} identifier - Character attempting identification
     * @param {Object} options - Additional options
     * @returns {Object} Identification result
     */
    identifyItem(item, identifier, options = {}) {
        if (item.identified) {
            return {
                success: true,
                message: `${item.name} is already identified.`,
                item: item
            };
        }

        const identificationChance = this.calculateIdentificationChance(identifier, item, options);
        const success = Random.percent(identificationChance);

        const result = {
            identifier: identifier.name,
            item: item.name,
            identificationChance,
            success,
            cursed: false,
            message: ''
        };

        if (success) {
            // Successful identification
            item.identified = true;
            item.state = this.ITEM_STATES.IDENTIFIED;

            // Remove disguise if it was cursed
            if (item.apparentName) {
                delete item.apparentName;
                delete item.apparentDescription;
            }

            result.message = `${identifier.name} successfully identified the ${item.name}!`;

            // Reveal curse if present
            if (item.cursed) {
                result.message += ` WARNING: This item is cursed (${item.curseName})!`;
                result.cursed = true;
            }

        } else {
            // Failed identification
            result.message = `${identifier.name} failed to identify the item.`;

            // Chance of curse on failure
            if (Random.percent(10)) {
                const curseResult = this.applyCurseToCharacter(identifier);
                result.cursed = true;
                (result as any).curseEffect = curseResult;
                result.message += ` ${curseResult.message}`;
            }
        }

        return result;
    }

    /**
     * Calculate identification success chance
     * @param {Object} identifier - Character attempting identification
     * @param {Object} item - Item being identified
     * @param {Object} options - Additional modifiers
     * @returns {number} Success percentage
     */
    calculateIdentificationChance(identifier, item, options = {}) {
        let baseChance = 50;

        // Intelligence bonus (primary factor)
        const intelligence = identifier.intelligence || 10;
        const intBonus = (intelligence - 10) * 3;

        // Class bonuses
        const classBonus = this.getClassIdentificationBonus(identifier.class);

        // Level bonus
        const levelBonus = identifier.level * 2;

        // Item difficulty
        const itemDC = item.identificationDC || 10;
        const difficultyPenalty = Math.max(0, itemDC - 10) * 5;

        // Bishop special ability
        const bishopBonus = identifier.class === 'Bishop' ? 20 : 0;

        // Spell assistance bonus
        const spellBonus = (options as any).identifySpell ? 25 : 0;

        const finalChance = Math.max(5, Math.min(95,
            baseChance + intBonus + classBonus + levelBonus + bishopBonus + spellBonus - difficultyPenalty
        ));

        return finalChance;
    }

    /**
     * Get class-specific identification bonuses
     * @param {string} characterClass - Character's class
     * @returns {number} Bonus percentage
     */
    getClassIdentificationBonus(characterClass) {
        const classBonuses = {
            'Mage': 15,
            'Bishop': 20,
            'Priest': 5,
            'Thief': 10,
            'Fighter': 0,
            'Lord': 5,
            'Samurai': 5,
            'Ninja': 10
        };

        return classBonuses[characterClass] || 0;
    }

    /**
     * Apply curse to character on failed identification
     * @param {Object} character - Character to curse
     * @returns {Object} Curse effect result
     */
    applyCurseToCharacter(character) {
        const curses = [
            {
                type: 'stat_drain',
                stat: Random.choice(['strength', 'intelligence', 'agility']),
                amount: 1,
                duration: 'permanent',
                message: `${character.name} feels weakened by the failed identification attempt!`
            },
            {
                type: 'temporary_paralysis',
                duration: Random.integer(1, 6),
                message: `${character.name} is paralyzed by magical feedback!`
            },
            {
                type: 'silence',
                duration: Random.integer(1, 6),
                message: `${character.name} is silenced by the item's protective magic!`
            },
            {
                type: 'confusion',
                duration: Random.integer(1, 3),
                message: `${character.name} is confused by the magical energies!`
            }
        ];

        const curse = Random.choice(curses);

        // Apply the curse effect
        if (curse.type === 'stat_drain') {
            character[curse.stat] = Math.max(3, character[curse.stat] - curse.amount);
        } else {
            // Add temporary effect
            if (!character.temporaryEffects) {
                character.temporaryEffects = [];
            }
            character.temporaryEffects.push({
                type: curse.type,
                duration: curse.duration,
                source: 'failed_identification',
                timestamp: Date.now()
            });
        }

        return curse;
    }

    /**
     * Attempt to remove a cursed item
     * @param {Object} character - Character wearing the cursed item
     * @param {Object} item - Cursed item to remove
     * @param {Object} options - Removal options (spell assistance, etc.)
     * @returns {Object} Removal result
     */
    removeCursedItem(character, item, options = {}) {
        if (!item.cursed) {
            return {
                success: true,
                message: `${item.name} is not cursed and can be removed normally.`
            };
        }

        let baseChance = 0; // Cursed items normally cannot be removed

        // Special methods for curse removal
        if ((options as any).removeCurseSpell) {
            baseChance = 80;
        } else if ((options as any).templeService) {
            baseChance = 90;
        } else if ((options as any).wishSpell) {
            baseChance = 100;
        }

        const success = Random.percent(baseChance);

        if (success) {
            // Remove curse and unequip item
            item.cursed = false;
            item.state = this.ITEM_STATES.IDENTIFIED;
            this.unequipItem(character, this.getEquippedSlot(character, item));

            return {
                success: true,
                message: `The curse on ${item.name} has been lifted! The item has been removed.`
            };
        } else {
            return {
                success: false,
                message: `The curse on ${item.name} resists removal.`
            };
        }
    }

    /**
     * Get the slot where an item is equipped
     * @param {Object} character - Character to check
     * @param {Object} item - Item to find
     * @returns {string|null} Slot name or null if not equipped
     */
    getEquippedSlot(character, item) {
        if (!character.equipment) return null;

        for (const [slot, equippedItem] of Object.entries(character.equipment)) {
            if (equippedItem && (equippedItem as any).id === item.id) {
                return slot;
            }
        }
        return null;
    }

    /**
     * Check if an item can be unequipped (not cursed)
     * @param {Object} item - Item to check
     * @returns {boolean} Whether item can be unequipped
     */
    canUnequipItem(item) {
        return !item.cursed;
    }

    /**
     * Get cursed items from database
     * @returns {Object} Cursed items database
     */
    getCursedItems() {
        return (this as any).equipmentDatabase.cursedItems;
    }

    /**
     * Get unknown items from database
     * @returns {Object} Unknown items database
     */
    getUnknownItems() {
        return (this as any).equipmentDatabase.unknownItems;
    }

    /**
     * Generate random magical item (may be cursed)
     * @param {number} level - Dungeon level for difficulty
     * @param {Object} options - Generation options
     * @returns {Object} Generated item instance
     */
    /**
     * Generate magical item (async version using entity references)
     * @param {number} level - Dungeon level for difficulty
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated item instance
     */
    async generateMagicalItem(level = 1, options = {}) {
        const cursedChance = Math.min(20, level * 2); // 2% per level, max 20%
        const unknownChance = Math.min(30, level * 3); // 3% per level, max 30%

        await this.initializeEntities();

        let itemPool = [];

        // Add normal magical items
        const weapons = await Storage.getAllWeapons();
        const armor = await Storage.getAllArmor();
        const shields = await Storage.getAllShields();
        const accessories = await Storage.getAllAccessories();

        [...(weapons as any), ...(armor as any), ...(shields as any), ...(accessories as any)].forEach(item => {
            if (item.magical) itemPool.push(item.id);
        });

        // Add cursed items based on chance
        if (Random.percent(cursedChance)) {
            const cursedItems = [...(weapons as any), ...(armor as any), ...(shields as any), ...(accessories as any)].filter(item => item.cursed);
            itemPool = [...itemPool, ...cursedItems.map(item => item.id)];
        }

        // Add unknown items based on chance
        if (Random.percent(unknownChance)) {
            const unknownItems = [...(weapons as any), ...(armor as any), ...(shields as any), ...(accessories as any)].filter(item => item.unidentified);
            itemPool = [...itemPool, ...unknownItems.map(item => item.id)];
        }

        const selectedItemId = Random.choice(itemPool);
        return await this.createItemInstance(selectedItemId, {
            identified: !Random.percent(unknownChance)
        });
    }

    // NEW: Durability System Methods

    /**
     * Apply wear to item from combat use
     * @param {Object} item - Item to apply wear to
     * @param {string} useType - Type of use ('attack', 'defend', 'spell')
     * @param {Object} context - Additional context for wear calculation
     * @returns {Object} Wear result
     */
    applyItemWear(item, useType = 'normal', context = {}) {
        if (!item.durability || item.durability <= 0) {
            return { alreadyBroken: true, message: `${item.name} is already broken.` };
        }

        let wearAmount = this.calculateWearAmount(item, useType, context);

        // Magical items are more durable
        if (item.magical && !item.cursed) {
            wearAmount = Math.floor(wearAmount / 2);
        }

        // Cursed items wear faster
        if (item.cursed) {
            wearAmount = Math.floor(wearAmount * 1.5);
        }

        const oldDurability = item.durability;
        item.durability = Math.max(0, item.durability - wearAmount);

        const result = {
            item: item.name,
            wearAmount,
            oldDurability,
            newDurability: item.durability,
            broken: item.durability === 0,
            warning: item.durability <= 20,
            message: ''
        };

        if (result.broken) {
            result.message = `${item.name} has broken from overuse!`;
            this.breakItem(item);
        } else if (result.warning) {
            result.message = `${item.name} is showing signs of wear and may break soon.`;
        } else if (wearAmount > 0) {
            result.message = `${item.name} shows slight wear from use.`;
        }

        return result;
    }

    /**
     * Calculate wear amount based on use type and item
     * @param {Object} item - Item being used
     * @param {string} useType - How the item is being used
     * @param {Object} context - Additional context
     * @returns {number} Amount of durability to remove
     */
    calculateWearAmount(item, useType, context) {
        let baseWear = 0;

        switch (useType) {
            case 'attack':
                baseWear = Random.integer(1, 3);
                // Critical hits cause more wear
                if (context.critical) {
                    baseWear += Random.integer(1, 2);
                }
                break;
            case 'defend':
                baseWear = Random.integer(1, 2);
                // Blocking powerful attacks causes more wear
                if (context.damage > 10) {
                    baseWear += 1;
                }
                break;
            case 'spell':
                // Spell focus items wear from casting
                baseWear = Random.integer(0, 1);
                if (context.spellLevel > 5) {
                    baseWear += 1;
                }
                break;
            case 'environmental':
                // Acid, fire, etc.
                baseWear = Random.integer(2, 5);
                break;
            case 'normal':
            default:
                baseWear = Random.integer(0, 1);
                break;
        }

        // Item quality affects wear rate
        const qualityMultiplier = this.getItemQualityMultiplier(item);
        return Math.floor(baseWear * qualityMultiplier);
    }

    /**
     * Get quality multiplier for wear calculations
     * @param {Object} item - Item to check
     * @returns {number} Quality multiplier
     */
    getItemQualityMultiplier(item) {
        if (item.quality) {
            const qualityMultipliers = {
                'poor': 1.5,
                'common': 1.0,
                'uncommon': 0.8,
                'rare': 0.6,
                'epic': 0.4,
                'legendary': 0.2
            };
            return qualityMultipliers[item.quality] || 1.0;
        }

        // Estimate quality from value
        if (item.value > 2000) return 0.4; // Epic/Legendary
        if (item.value > 1000) return 0.6; // Rare
        if (item.value > 500) return 0.8; // Uncommon
        return 1.0; // Common
    }

    /**
     * Break an item (set durability to 0 and disable effects)
     * @param {Object} item - Item to break
     * @returns {Object} Break result
     */
    breakItem(item) {
        item.durability = 0;
        item.broken = true;

        // Store original bonuses before removing them
        if (!item.brokenState) {
            item.brokenState = {
                originalAttackBonus: item.attackBonus || 0,
                originalACBonus: item.acBonus || 0,
                originalDamageBonus: item.damage?.bonus || 0,
                originalSpecial: item.special ? [...item.special] : []
            };
        }

        // Remove all bonuses from broken item
        item.attackBonus = 0;
        item.acBonus = 0;
        if (item.damage && item.damage.bonus) {
            item.damage.bonus = 0;
        }
        item.special = ['broken'];

        return {
            item: item.name,
            message: `${item.name} is now broken and provides no benefits.`
        };
    }

    /**
     * Repair an item
     * @param {Object} item - Item to repair
     * @param {Object} options - Repair options
     * @returns {Object} Repair result
     */
    repairItem(item, options = {}) {
        if (!item.broken && item.durability === item.maxDurability) {
            return {
                success: false,
                message: `${item.name} is already in perfect condition.`
            };
        }

        const repairCost = this.calculateRepairCost(item, options);
        const repairAmount = (options as any).fullRepair ?
            item.maxDurability - item.durability :
            Math.min(50, item.maxDurability - item.durability);

        // Restore durability
        item.durability = Math.min(item.maxDurability, item.durability + repairAmount);

        // If fully repaired and was broken, restore functionality
        if (item.broken && item.durability === item.maxDurability) {
            this.restoreBrokenItem(item);
        }

        return {
            success: true,
            item: item.name,
            repairAmount,
            newDurability: item.durability,
            maxDurability: item.maxDurability,
            cost: repairCost,
            fullyRepaired: item.durability === item.maxDurability,
            message: `${item.name} has been repaired ${(options as any).fullRepair ? 'completely' : 'partially'}.`
        };
    }

    /**
     * Restore a broken item to working condition
     * @param {Object} item - Item to restore
     */
    restoreBrokenItem(item) {
        if (!item.brokenState) return;

        // Restore original stats
        item.attackBonus = item.brokenState.originalAttackBonus;
        item.acBonus = item.brokenState.originalACBonus;
        if (item.damage) {
            item.damage.bonus = item.brokenState.originalDamageBonus;
        }
        item.special = item.brokenState.originalSpecial;

        // Clear broken state
        item.broken = false;
        delete item.brokenState;
    }

    /**
     * Calculate repair cost for an item
     * @param {Object} item - Item to repair
     * @param {Object} options - Repair options
     * @returns {number} Repair cost in gold
     */
    calculateRepairCost(item, options = {}) {
        const baseCost = Math.floor(item.value * 0.1); // 10% of item value
        const damageRatio = (item.maxDurability - item.durability) / item.maxDurability;

        let cost = Math.floor(baseCost * damageRatio);

        // Full repair costs more
        if ((options as any).fullRepair) {
            cost = Math.floor(cost * 1.5);
        }

        // Magical items cost more to repair
        if (item.magical) {
            cost = Math.floor(cost * 2);
        }

        // Broken items cost extra to restore
        if (item.broken) {
            cost = Math.floor(cost * 1.5);
        }

        // Quality affects cost
        const qualityMultiplier = {
            'poor': 0.5,
            'common': 1.0,
            'uncommon': 1.5,
            'rare': 2.0,
            'epic': 3.0,
            'legendary': 5.0
        };

        if (item.quality) {
            cost = Math.floor(cost * (qualityMultiplier[item.quality] || 1.0));
        }

        return Math.max(1, cost);
    }

    /**
     * Check if item needs repair
     * @param {Object} item - Item to check
     * @returns {Object} Repair status
     */
    getRepairStatus(item) {
        if (!item.durability) {
            return { needsRepair: false, condition: 'N/A' };
        }

        const durabilityRatio = item.durability / item.maxDurability;
        let condition, needsRepair;

        if (item.broken || item.durability === 0) {
            condition = 'Broken';
            needsRepair = true;
        } else if (durabilityRatio < 0.2) {
            condition = 'Nearly Broken';
            needsRepair = true;
        } else if (durabilityRatio < 0.5) {
            condition = 'Damaged';
            needsRepair = true;
        } else if (durabilityRatio < 0.8) {
            condition = 'Worn';
            needsRepair = false;
        } else {
            condition = 'Good';
            needsRepair = false;
        }

        return {
            needsRepair,
            condition,
            durability: item.durability,
            maxDurability: item.maxDurability,
            durabilityRatio,
            repairCost: needsRepair ? this.calculateRepairCost(item) : 0
        };
    }

    /**
     * Get all items that need repair for a character
     * @param {Object} character - Character to check
     * @returns {Array} Items needing repair
     */
    getItemsNeedingRepair(character) {
        const itemsNeedingRepair = [];

        if (character.equipment) {
            Object.values(character.equipment).forEach(item => {
                if (item && (item as any).durability !== undefined) {
                    const status = this.getRepairStatus(item);
                    if (status.needsRepair) {
                        itemsNeedingRepair.push({
                            item,
                            status,
                            slot: this.getEquippedSlot(character, item)
                        });
                    }
                }
            });
        }

        return itemsNeedingRepair;
    }

    /**
     * Process environmental damage to all equipped items
     * @param {Object} character - Character whose items to damage
     * @param {string} damageType - Type of environmental damage
     * @param {number} severity - Damage severity (1-5)
     * @returns {Array} Results for each damaged item
     */
    processEnvironmentalDamage(character, damageType, severity = 2) {
        const results = [];

        if (!character.equipment) return results;

        Object.values(character.equipment).forEach(item => {
            if (item && (item as any).durability > 0) {
                // Different damage types affect different items differently
                let affectsItem = false;

                switch (damageType) {
                    case 'acid':
                        affectsItem = (item as any).type === 'armor' || (item as any).type === 'weapon';
                        break;
                    case 'fire':
                        affectsItem = (item as any).subtype !== 'magical'; // Magic items resist fire
                        break;
                    case 'water':
                        affectsItem = (item as any).type === 'weapon' && (item as any).subtype !== 'magical';
                        break;
                    case 'wear':
                    default:
                        affectsItem = true;
                        break;
                }

                if (affectsItem) {
                    const wearResult = this.applyItemWear(item, 'environmental', {
                        damageType,
                        severity
                    });
                    if ((wearResult as any).wearAmount > 0) {
                        results.push(wearResult);
                    }
                }
            }
        });

        return results;
    }
}
