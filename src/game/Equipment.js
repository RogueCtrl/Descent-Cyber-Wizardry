/**
 * Equipment System
 * Handles items, weapons, and armor
 */
class Equipment {
    constructor() {
        this.items = new Map();
    }
    
    /**
     * Get item data
     */
    static getItemData(itemName) {
        // Placeholder for item definitions
        return {
            name: itemName,
            type: 'weapon',
            damage: '1d6',
            weight: 1
        };
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