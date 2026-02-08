import { Equipment } from './Equipment.ts';
import { TextManager } from '../utils/TextManager.ts';

/**
 * Inventory System
 * Enhanced inventory management with cyber terminology and digital integration
 * for the Wizardry-Tron Fusion transformation
 */

export class InventorySystem {
    eventSystem: any;
    equipment: Equipment;
    inventoryModal: any;
    currentCharacter: any;
    selectedItem: any;
    viewMode: string;
    filterType: string;
    sortBy: string;

    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.equipment = new Equipment();
        this.inventoryModal = null;
        this.currentCharacter = null;
        
        // Inventory state
        this.selectedItem = null;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.filterType = 'all'; // 'all', 'weapons', 'armor', 'consumables', etc.
        this.sortBy = 'name'; // 'name', 'type', 'value', 'condition'
    }
    
    /**
     * Show inventory interface for a character
     * @param {Object} character - Character to show inventory for
     */
    showInventory(character) {
        if (!character) {
            console.error('No character provided to inventory system');
            return;
        }
        
        this.currentCharacter = character;
        this.createInventoryModal();
        this.renderInventoryContent();
        
        // Apply TextManager updates
        this.applyTextManagerToInventory();
    }
    
    /**
     * Create the inventory modal structure
     */
    createInventoryModal() {
        this.hideInventory(); // Remove any existing modal
        
        const modal = document.createElement('div');
        modal.className = 'modal inventory-modal';
        modal.innerHTML = `
            <div class="modal-content inventory-container">
                <div class="modal-header inventory-header">
                    <div class="inventory-title-section">
                        <h2 class="inventory-title" data-text-key="equipment">System Upgrades</h2>
                        <div class="character-name">${this.currentCharacter.name || 'Unknown Agent'}</div>
                    </div>
                    <div class="inventory-stats">
                        <div class="stat-item">
                            <span class="stat-label" data-text-key="weight">Weight:</span>
                            <span class="stat-value" id="current-weight">0</span>/<span id="max-weight">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Items:</span>
                            <span class="stat-value" id="item-count">0</span>
                        </div>
                    </div>
                    <button class="close-btn" id="close-inventory">&times;</button>
                </div>
                
                <div class="inventory-controls">
                    <div class="filter-controls">
                        <label class="filter-label">Filter:</label>
                        <select id="item-filter" class="filter-select">
                            <option value="all">All Items</option>
                            <option value="weapons">Attack Algorithms</option>
                            <option value="armor">Defense Protocols</option>
                            <option value="shields">Firewall Modules</option>
                            <option value="accessories">Enhancement Chips</option>
                            <option value="consumables">Data Packages</option>
                        </select>
                    </div>
                    
                    <div class="sort-controls">
                        <label class="sort-label">Sort by:</label>
                        <select id="item-sort" class="sort-select">
                            <option value="name">Name</option>
                            <option value="type">Type</option>
                            <option value="value">Value</option>
                            <option value="condition">Condition</option>
                        </select>
                    </div>
                    
                    <div class="view-controls">
                        <button id="grid-view" class="view-btn active">Grid</button>
                        <button id="list-view" class="view-btn">List</button>
                    </div>
                </div>
                
                <div class="inventory-content">
                    <div class="equipped-items-section">
                        <h3 class="section-title">Currently Equipped</h3>
                        <div id="equipped-items" class="equipped-items-grid"></div>
                    </div>
                    
                    <div class="inventory-items-section">
                        <h3 class="section-title">Available Items</h3>
                        <div id="inventory-items" class="inventory-grid"></div>
                    </div>
                </div>
                
                <div class="inventory-footer">
                    <div class="selected-item-info" id="selected-item-info">
                        <div class="item-details">
                            <div class="item-preview">Select an item to view details</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupInventoryEventListeners(modal);
        
        document.body.appendChild(modal);
        this.inventoryModal = modal;
    }
    
    /**
     * Setup event listeners for inventory modal
     */
    setupInventoryEventListeners(modal) {
        // Close button
        modal.querySelector('#close-inventory').addEventListener('click', () => {
            this.hideInventory();
        });
        
        // Filter and sort controls
        modal.querySelector('#item-filter').addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.renderInventoryItems();
        });
        
        modal.querySelector('#item-sort').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderInventoryItems();
        });
        
        // View mode controls
        modal.querySelector('#grid-view').addEventListener('click', () => {
            this.setViewMode('grid');
        });
        
        modal.querySelector('#list-view').addEventListener('click', () => {
            this.setViewMode('list');
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideInventory();
            }
        });
    }
    
    /**
     * Apply TextManager terminology to inventory elements
     */
    applyTextManagerToInventory() {
        if (!this.inventoryModal || typeof TextManager === 'undefined') return;
        
        // Update filter options based on current mode
        const filterSelect = this.inventoryModal.querySelector('#item-filter');
        const isCyberMode = TextManager.isCyberMode();
        
        if (isCyberMode) {
            filterSelect.innerHTML = `
                <option value="all">All System Upgrades</option>
                <option value="weapons">Attack Algorithms</option>
                <option value="armor">Defense Protocols</option>
                <option value="shields">Firewall Modules</option>
                <option value="accessories">Enhancement Chips</option>
                <option value="consumables">Data Packages</option>
            `;
        } else {
            filterSelect.innerHTML = `
                <option value="all">All Items</option>
                <option value="weapons">Weapons</option>
                <option value="armor">Armor</option>
                <option value="shields">Shields</option>
                <option value="accessories">Accessories</option>
                <option value="consumables">Consumables</option>
            `;
        }
        
        // Apply TextManager to elements with data-text-key
        const textElements = this.inventoryModal.querySelectorAll('[data-text-key]');
        textElements.forEach(element => {
            const textKey = element.getAttribute('data-text-key');
            if (textKey) {
                TextManager.applyToElement(element, textKey);
            }
        });
    }
    
    /**
     * Render inventory content
     */
    async renderInventoryContent() {
        if (!this.inventoryModal || !this.currentCharacter) return;
        
        // Render equipped items
        await this.renderEquippedItems();
        
        // Render inventory items
        await this.renderInventoryItems();
        
        // Update statistics
        await this.updateInventoryStats();
    }
    
    /**
     * Render equipped items section
     */
    async renderEquippedItems() {
        const equippedContainer = this.inventoryModal.querySelector('#equipped-items');
        if (!equippedContainer) return;
        
        const equipment = this.currentCharacter.equipment || {};
        const slots = [
            { key: 'weapon', name: 'Weapon', cyberName: 'Attack Algorithm', icon: '⚔️', cyberIcon: '🔸' },
            { key: 'armor', name: 'Armor', cyberName: 'Defense Protocol', icon: '🛡️', cyberIcon: '🔷' },
            { key: 'shield', name: 'Shield', cyberName: 'Firewall Module', icon: '🔰', cyberIcon: '🔶' },
            { key: 'accessory', name: 'Accessory', cyberName: 'Enhancement Chip', icon: '💍', cyberIcon: '🔹' }
        ];
        
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        equippedContainer.innerHTML = slots.map(slot => {
            const item = equipment[slot.key];
            const slotName = isCyberMode ? slot.cyberName : slot.name;
            const slotIcon = isCyberMode ? slot.cyberIcon : slot.icon;
            
            if (item) {
                return this.renderEquippedItem(item, slot, slotName, slotIcon);
            } else {
                const emptyText = isCyberMode ? '(Uninstalled)' : '(Empty)';
                return `
                    <div class="equipped-slot empty" data-slot="${slot.key}">
                        <div class="slot-header">
                            <span class="slot-icon">${slotIcon}</span>
                            <span class="slot-name">${slotName}</span>
                        </div>
                        <div class="empty-slot">${emptyText}</div>
                    </div>
                `;
            }
        }).join('');
    }
    
    /**
     * Render an equipped item
     */
    renderEquippedItem(item, slot, slotName, slotIcon) {
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        let itemName = typeof item === 'string' ? item : item.name;
        let digitalInfo = '';
        
        // Use cyber name if available and in cyber mode
        if (typeof item === 'object' && item.cyberName && isCyberMode) {
            itemName = item.cyberName;
        }
        
        // Add digital classification
        if (isCyberMode && typeof item === 'object') {
            if (item.digitalClassification) {
                digitalInfo = `<div class="digital-classification">[${item.digitalClassification}]</div>`;
            } else if (item.programClass) {
                digitalInfo = `<div class="program-class">[${item.programClass}]</div>`;
            }
        }
        
        // Durability indicator
        let durabilityInfo = '';
        if (typeof item === 'object' && item.durability !== undefined) {
            const condition = this.getItemCondition(item);
            durabilityInfo = `
                <div class="item-condition ${condition.class}">
                    <div class="condition-bar">
                        <div class="condition-fill ${condition.class}" style="width: ${condition.percentage}%"></div>
                    </div>
                    <div class="condition-text">${condition.text}</div>
                </div>
            `;
        }
        
        return `
            <div class="equipped-slot filled cyber-enhanced" data-slot="${slot.key}" data-item-id="${typeof item === 'object' ? item.id : item}">
                <div class="slot-header">
                    <span class="slot-icon">${slotIcon}</span>
                    <span class="slot-name">${slotName}</span>
                </div>
                <div class="equipped-item-info">
                    <div class="item-name">${itemName}</div>
                    ${digitalInfo}
                    ${durabilityInfo}
                    <div class="equipped-actions">
                        <button class="action-btn unequip-btn" data-slot="${slot.key}">
                            ${isCyberMode ? 'Uninstall' : 'Unequip'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render inventory items section
     */
    async renderInventoryItems() {
        const inventoryContainer = this.inventoryModal.querySelector('#inventory-items');
        if (!inventoryContainer) return;
        
        // Get character inventory (placeholder - implement based on actual inventory structure)
        const inventory = this.currentCharacter.inventory || [];
        
        // Filter and sort items
        let filteredItems = this.filterItems(inventory);
        filteredItems = this.sortItems(filteredItems);
        
        if (filteredItems.length === 0) {
            const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
            const emptyMessage = isCyberMode ? 'No system upgrades in storage' : 'No items in inventory';
            inventoryContainer.innerHTML = `<div class="empty-inventory">${emptyMessage}</div>`;
            return;
        }
        
        // Set container class based on view mode
        inventoryContainer.className = this.viewMode === 'grid' ? 'inventory-grid' : 'inventory-list';
        
        // Render items
        const itemsHtml = filteredItems.map(item => this.renderInventoryItem(item)).join('');
        inventoryContainer.innerHTML = itemsHtml;
        
        // Add click handlers for items
        this.setupInventoryItemListeners(inventoryContainer);
    }
    
    /**
     * Render a single inventory item
     */
    renderInventoryItem(item) {
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        let itemName = typeof item === 'string' ? item : item.name;
        let itemType = typeof item === 'object' ? item.type : 'item';
        
        // Use cyber terminology
        if (typeof item === 'object' && item.cyberName && isCyberMode) {
            itemName = item.cyberName;
        }
        
        // Get cyber type name
        const typeMap = {
            'weapon': isCyberMode ? 'Attack Algorithm' : 'Weapon',
            'armor': isCyberMode ? 'Defense Protocol' : 'Armor',
            'shield': isCyberMode ? 'Firewall Module' : 'Shield',
            'accessory': isCyberMode ? 'Enhancement Chip' : 'Accessory',
            'consumable': isCyberMode ? 'Data Package' : 'Consumable'
        };
        const displayType = typeMap[itemType] || itemType;
        
        // Digital information
        let digitalInfo = '';
        if (isCyberMode && typeof item === 'object') {
            const infoFields: string[] = [];
            if (item.digitalClassification) infoFields.push(`Class: ${item.digitalClassification}`);
            if (item.encryptionLevel) infoFields.push(`Encryption: ${item.encryptionLevel}`);
            if (item.algorithmClass) infoFields.push(`Algorithm: ${item.algorithmClass}`);
            if (infoFields.length > 0) {
                digitalInfo = `<div class="digital-info">${infoFields.join(' • ')}</div>`;
            }
        }
        
        // Item stats
        let statsInfo = '';
        if (typeof item === 'object') {
            const stats: string[] = [];
            if (item.damage) stats.push(`Damage: ${item.damage.dice}d${item.damage.sides}${item.damage.bonus ? `+${item.damage.bonus}` : ''}`);
            if (item.acBonus) stats.push(`AC: +${item.acBonus}`);
            if (item.attackBonus) stats.push(`Attack: +${item.attackBonus}`);
            if (item.value) stats.push(`Value: ${item.value}g`);
            
            if (stats.length > 0) {
                statsInfo = `<div class="item-stats">${stats.map(stat => `<span class="item-stat">${stat}</span>`).join('')}</div>`;
            }
        }
        
        // Condition/durability
        let conditionInfo = '';
        if (typeof item === 'object' && item.durability !== undefined) {
            const condition = this.getItemCondition(item);
            conditionInfo = `
                <div class="item-durability">
                    <div class="durability-bar">
                        <div class="durability-fill ${condition.class}" style="width: ${condition.percentage}%"></div>
                    </div>
                    <div class="durability-text">${condition.text}</div>
                </div>
            `;
        }
        
        return `
            <div class="inventory-item ${isCyberMode ? 'cyber-enhanced' : ''}" data-item-id="${typeof item === 'object' ? item.id : item}">
                <div class="item-header">
                    <div class="item-name">${itemName}</div>
                    <div class="item-type">${displayType}</div>
                </div>
                ${digitalInfo}
                ${statsInfo}
                ${typeof item === 'object' && item.description ? `<div class="item-description">${item.description}</div>` : ''}
                ${conditionInfo}
                <div class="item-actions">
                    ${this.canEquipItem(item) ? `<button class="item-action-btn equip-btn" data-item-id="${typeof item === 'object' ? item.id : item}">
                        ${isCyberMode ? 'Install' : 'Equip'}
                    </button>` : ''}
                    ${this.canUseItem(item) ? `<button class="item-action-btn use-btn" data-item-id="${typeof item === 'object' ? item.id : item}">
                        ${isCyberMode ? 'Execute' : 'Use'}
                    </button>` : ''}
                    <button class="item-action-btn drop-btn" data-item-id="${typeof item === 'object' ? item.id : item}">
                        ${isCyberMode ? 'Delete' : 'Drop'}
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get item condition information
     */
    getItemCondition(item) {
        if (!item.durability || !item.maxDurability) {
            return { class: 'unknown', percentage: 100, text: 'Unknown' };
        }
        
        const ratio = item.durability / item.maxDurability;
        
        if (item.broken || item.durability === 0) {
            return { class: 'broken', percentage: 0, text: 'Broken' };
        } else if (ratio < 0.25) {
            return { class: 'damaged', percentage: ratio * 100, text: 'Nearly Broken' };
        } else if (ratio < 0.5) {
            return { class: 'damaged', percentage: ratio * 100, text: 'Damaged' };
        } else if (ratio < 0.8) {
            return { class: 'worn', percentage: ratio * 100, text: 'Worn' };
        } else {
            return { class: 'good', percentage: ratio * 100, text: 'Good' };
        }
    }
    
    /**
     * Filter items based on current filter
     */
    filterItems(items) {
        if (this.filterType === 'all') return items;
        
        return items.filter(item => {
            const itemType = typeof item === 'object' ? item.type : 'unknown';
            
            switch (this.filterType) {
                case 'weapons':
                    return itemType === 'weapon';
                case 'armor':
                    return itemType === 'armor';
                case 'shields':
                    return itemType === 'shield';
                case 'accessories':
                    return itemType === 'accessory';
                case 'consumables':
                    return itemType === 'consumable' || itemType === 'potion' || itemType === 'scroll';
                default:
                    return true;
            }
        });
    }
    
    /**
     * Sort items based on current sort setting
     */
    sortItems(items) {
        return items.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    const nameA = typeof a === 'string' ? a : a.name || 'Unknown';
                    const nameB = typeof b === 'string' ? b : b.name || 'Unknown';
                    return nameA.localeCompare(nameB);
                    
                case 'type':
                    const typeA = typeof a === 'object' ? a.type : 'unknown';
                    const typeB = typeof b === 'object' ? b.type : 'unknown';
                    return typeA.localeCompare(typeB);
                    
                case 'value':
                    const valueA = typeof a === 'object' ? a.value || 0 : 0;
                    const valueB = typeof b === 'object' ? b.value || 0 : 0;
                    return valueB - valueA;
                    
                case 'condition':
                    const conditionA = typeof a === 'object' && a.durability ? a.durability / a.maxDurability : 1;
                    const conditionB = typeof b === 'object' && b.durability ? b.durability / b.maxDurability : 1;
                    return conditionB - conditionA;
                    
                default:
                    return 0;
            }
        });
    }
    
    /**
     * Setup event listeners for inventory items
     */
    setupInventoryItemListeners(container) {
        // Item selection
        container.addEventListener('click', (e) => {
            if (e.target.closest('.inventory-item')) {
                const item = e.target.closest('.inventory-item');
                this.selectItem(item);
            }
        });
        
        // Action buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('equip-btn')) {
                const itemId = e.target.getAttribute('data-item-id');
                this.equipItem(itemId);
            } else if (e.target.classList.contains('use-btn')) {
                const itemId = e.target.getAttribute('data-item-id');
                this.useItem(itemId);
            } else if (e.target.classList.contains('drop-btn')) {
                const itemId = e.target.getAttribute('data-item-id');
                this.dropItem(itemId);
            }
        });
        
        // Unequip buttons in equipped section
        const equippedContainer = this.inventoryModal.querySelector('#equipped-items');
        if (equippedContainer) {
            equippedContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('unequip-btn')) {
                    const slot = e.target.getAttribute('data-slot');
                    this.unequipItem(slot);
                }
            });
        }
    }
    
    /**
     * Set view mode (grid or list)
     */
    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update button states
        const gridBtn = this.inventoryModal.querySelector('#grid-view');
        const listBtn = this.inventoryModal.querySelector('#list-view');
        
        gridBtn.classList.toggle('active', mode === 'grid');
        listBtn.classList.toggle('active', mode === 'list');
        
        // Re-render items with new view mode
        this.renderInventoryItems();
    }
    
    /**
     * Check if item can be equipped
     */
    canEquipItem(item) {
        if (typeof item === 'string') return false;
        if (!item.type) return false;
        
        const equipableTypes = ['weapon', 'armor', 'shield', 'accessory'];
        return equipableTypes.includes(item.type);
    }
    
    /**
     * Check if item can be used
     */
    canUseItem(item) {
        if (typeof item === 'string') return false;
        if (!item.type) return false;
        
        const usableTypes = ['consumable', 'potion', 'scroll'];
        return usableTypes.includes(item.type);
    }
    
    /**
     * Update inventory statistics
     */
    async updateInventoryStats() {
        if (!this.inventoryModal || !this.currentCharacter) return;
        
        const currentWeight = await this.equipment.calculateEncumbrance(this.currentCharacter);
        const maxWeight = (this.currentCharacter.attributes?.strength || 10) * 10;
        const itemCount = (this.currentCharacter.inventory || []).length;
        
        const currentWeightEl = this.inventoryModal.querySelector('#current-weight');
        const maxWeightEl = this.inventoryModal.querySelector('#max-weight');
        const itemCountEl = this.inventoryModal.querySelector('#item-count');
        
        if (currentWeightEl) currentWeightEl.textContent = currentWeight.toFixed(1);
        if (maxWeightEl) maxWeightEl.textContent = maxWeight;
        if (itemCountEl) itemCountEl.textContent = itemCount;
    }
    
    /**
     * Hide inventory modal
     */
    hideInventory() {
        if (this.inventoryModal) {
            this.inventoryModal.remove();
            this.inventoryModal = null;
        }
        this.currentCharacter = null;
        this.selectedItem = null;
    }
    
    /**
     * Placeholder methods for item actions (implement based on actual game logic)
     */
    selectItem(itemElement) {
        // Remove previous selection
        const previousSelected = this.inventoryModal.querySelector('.inventory-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Select new item
        itemElement.classList.add('selected');
        this.selectedItem = itemElement.getAttribute('data-item-id');
    }
    
    equipItem(itemId) {
        console.log('Equip item:', itemId);
        // Implement equipment logic
    }
    
    unequipItem(slot) {
        console.log('Unequip item from slot:', slot);
        // Implement unequip logic
    }
    
    useItem(itemId) {
        console.log('Use item:', itemId);
        // Implement use item logic
    }
    
    dropItem(itemId) {
        console.log('Drop item:', itemId);
        // Implement drop item logic
    }
}