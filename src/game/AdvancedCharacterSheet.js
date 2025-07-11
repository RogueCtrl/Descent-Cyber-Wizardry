/**
 * Advanced Character Sheet
 * Complete digital integration for the Wizardry-Tron Fusion transformation
 * Provides comprehensive character information with cyber terminology
 */

class AdvancedCharacterSheet {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.characterSheetModal = null;
        this.currentCharacter = null;
        this.activeTab = 'overview';
        
        // Tabs configuration
        this.tabs = [
            { id: 'overview', name: 'Overview', cyberName: 'System Status', icon: '📊' },
            { id: 'attributes', name: 'Attributes', cyberName: 'Core Parameters', icon: '⚙️' },
            { id: 'equipment', name: 'Equipment', cyberName: 'System Upgrades', icon: '🔧' },
            { id: 'skills', name: 'Skills', cyberName: 'Capabilities', icon: '🎯' },
            { id: 'spells', name: 'Spells', cyberName: 'Subroutines', icon: '🔮' },
            { id: 'history', name: 'History', cyberName: 'Activity Log', icon: '📜' }
        ];
    }
    
    /**
     * Show advanced character sheet
     * @param {Object} character - Character to display
     */
    showCharacterSheet(character) {
        if (!character) {
            console.error('No character provided to character sheet');
            return;
        }
        
        this.currentCharacter = character;
        this.createCharacterSheetModal();
        this.renderCharacterSheetContent();
        this.applyTextManagerToCharacterSheet();
    }
    
    /**
     * Create the character sheet modal structure
     */
    createCharacterSheetModal() {
        this.hideCharacterSheet(); // Remove any existing modal
        
        const modal = document.createElement('div');
        modal.className = 'modal character-sheet-modal cyber-interface';
        modal.innerHTML = `
            <div class="modal-content character-sheet-container">
                <div class="character-sheet-header">
                    <div class="character-title-section">
                        <div class="character-portrait">
                            <div class="portrait-frame cyber-enhanced">
                                ${this.renderCharacterPortrait()}
                            </div>
                        </div>
                        <div class="character-basic-info">
                            <h2 class="character-name">${this.currentCharacter.name || 'Unknown Agent'}</h2>
                            <div class="character-class-level">
                                <span class="character-class">${this.getContextualClassName()}</span>
                                <span class="character-level" data-text-key="level">Level ${this.currentCharacter.level || 1}</span>
                            </div>
                            <div class="character-status-indicators">
                                ${this.renderStatusIndicators()}
                            </div>
                        </div>
                    </div>
                    <button class="close-btn cyber-btn" id="close-character-sheet">&times;</button>
                </div>
                
                <div class="character-sheet-nav">
                    <div class="nav-tabs">
                        ${this.renderNavigationTabs()}
                    </div>
                </div>
                
                <div class="character-sheet-content">
                    <div id="character-sheet-tab-content" class="tab-content">
                        <!-- Tab content will be populated here -->
                    </div>
                </div>
                
                <div class="character-sheet-footer">
                    <div class="footer-stats">
                        ${this.renderFooterStats()}
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners
        this.setupCharacterSheetEventListeners(modal);
        
        document.body.appendChild(modal);
        this.characterSheetModal = modal;
    }
    
    /**
     * Setup event listeners for character sheet
     */
    setupCharacterSheetEventListeners(modal) {
        // Close button
        modal.querySelector('#close-character-sheet').addEventListener('click', () => {
            this.hideCharacterSheet();
        });
        
        // Tab navigation
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-tab')) {
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCharacterSheet();
            }
        });
    }
    
    /**
     * Apply TextManager to character sheet elements
     */
    applyTextManagerToCharacterSheet() {
        if (!this.characterSheetModal || typeof TextManager === 'undefined') return;
        
        // Apply TextManager to elements with data-text-key
        const textElements = this.characterSheetModal.querySelectorAll('[data-text-key]');
        textElements.forEach(element => {
            const textKey = element.getAttribute('data-text-key');
            if (textKey) {
                TextManager.applyToElement(element, textKey);
            }
        });
        
        // Update tab labels
        this.updateTabLabels();
    }
    
    /**
     * Update tab labels based on current mode
     */
    updateTabLabels() {
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        this.tabs.forEach(tab => {
            const tabElement = this.characterSheetModal.querySelector(`[data-tab="${tab.id}"]`);
            if (tabElement) {
                const tabName = isCyberMode ? tab.cyberName : tab.name;
                const iconSpan = tabElement.querySelector('.tab-icon');
                const textSpan = tabElement.querySelector('.tab-text');
                
                if (textSpan) {
                    textSpan.textContent = tabName;
                }
            }
        });
    }
    
    /**
     * Get contextual class name based on current mode
     */
    getContextualClassName() {
        const className = this.currentCharacter.class || 'Unknown';
        
        if (typeof TextManager !== 'undefined' && TextManager.isCyberMode()) {
            const classMap = {
                'Fighter': 'Combat Specialist',
                'Mage': 'Code Architect',
                'Priest': 'System Maintainer',
                'Thief': 'Data Infiltrator',
                'Bishop': 'Security Analyst',
                'Samurai': 'Honor Protocol',
                'Lord': 'Command Authority',
                'Ninja': 'Stealth Algorithm'
            };
            return classMap[className] || className;
        }
        
        return className;
    }
    
    /**
     * Render character portrait
     */
    renderCharacterPortrait() {
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        if (isCyberMode) {
            return `
                <div class="cyber-portrait">
                    <div class="portrait-grid">
                        <div class="grid-line horizontal"></div>
                        <div class="grid-line vertical"></div>
                    </div>
                    <div class="portrait-data">
                        <div class="data-stream"></div>
                        <div class="system-indicator active"></div>
                    </div>
                    <div class="portrait-avatar">👤</div>
                </div>
            `;
        } else {
            return `
                <div class="classic-portrait">
                    <div class="portrait-avatar">👤</div>
                </div>
            `;
        }
    }
    
    /**
     * Render status indicators
     */
    renderStatusIndicators() {
        const character = this.currentCharacter;
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        const healthLabel = isCyberMode ? 'System Integrity' : 'Health';
        const statusLabel = isCyberMode ? 'System Status' : 'Status';
        
        const healthPercentage = character.maxHP ? (character.currentHP / character.maxHP) * 100 : 100;
        const healthClass = healthPercentage > 75 ? 'good' : healthPercentage > 25 ? 'warning' : 'critical';
        
        return `
            <div class="status-indicator">
                <div class="status-label">${healthLabel}:</div>
                <div class="health-bar">
                    <div class="health-fill ${healthClass}" style="width: ${healthPercentage}%"></div>
                </div>
                <div class="health-text">${character.currentHP || 0}/${character.maxHP || 0}</div>
            </div>
            <div class="status-indicator">
                <div class="status-label">${statusLabel}:</div>
                <div class="status-value ${character.status || 'alive'}">${this.getContextualStatus()}</div>
            </div>
        `;
    }
    
    /**
     * Get contextual status text
     */
    getContextualStatus() {
        const status = this.currentCharacter.status || 'alive';
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        if (isCyberMode) {
            const statusMap = {
                'alive': 'Online',
                'dead': 'Disconnected',
                'unconscious': 'Standby Mode',
                'paralyzed': 'System Locked',
                'poisoned': 'Corrupted Data',
                'cursed': 'Malware Detected'
            };
            return statusMap[status] || status;
        }
        
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    /**
     * Render navigation tabs
     */
    renderNavigationTabs() {
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        return this.tabs.map(tab => {
            const tabName = isCyberMode ? tab.cyberName : tab.name;
            const isActive = tab.id === this.activeTab;
            
            return `
                <div class="nav-tab ${isActive ? 'active' : ''}" data-tab="${tab.id}">
                    <span class="tab-icon">${tab.icon}</span>
                    <span class="tab-text">${tabName}</span>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Render footer stats
     */
    renderFooterStats() {
        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const experienceLabel = isCyberMode ? 'Data Points' : 'Experience';\n        const goldLabel = isCyberMode ? 'Credits' : 'Gold';\n        \n        return `\n            <div class=\"footer-stat\">\n                <span class=\"stat-label\">${experienceLabel}:</span>\n                <span class=\"stat-value\">${character.experience || 0}</span>\n            </div>\n            <div class=\"footer-stat\">\n                <span class=\"stat-label\">${goldLabel}:</span>\n                <span class=\"stat-value\">${character.gold || 0}</span>\n            </div>\n            <div class=\"footer-stat\">\n                <span class=\"stat-label\">Age:</span>\n                <span class=\"stat-value\">${character.age || 'Unknown'}</span>\n            </div>\n        `;\n    }\n    \n    /**\n     * Switch to a different tab\n     */\n    switchTab(tabId) {\n        if (this.activeTab === tabId) return;\n        \n        this.activeTab = tabId;\n        \n        // Update tab navigation\n        const tabs = this.characterSheetModal.querySelectorAll('.nav-tab');\n        tabs.forEach(tab => {\n            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);\n        });\n        \n        // Render tab content\n        this.renderTabContent(tabId);\n    }\n    \n    /**\n     * Render content for the active tab\n     */\n    renderTabContent(tabId) {\n        const contentContainer = this.characterSheetModal.querySelector('#character-sheet-tab-content');\n        if (!contentContainer) return;\n        \n        switch (tabId) {\n            case 'overview':\n                contentContainer.innerHTML = this.renderOverviewTab();\n                break;\n            case 'attributes':\n                contentContainer.innerHTML = this.renderAttributesTab();\n                break;\n            case 'equipment':\n                contentContainer.innerHTML = this.renderEquipmentTab();\n                break;\n            case 'skills':\n                contentContainer.innerHTML = this.renderSkillsTab();\n                break;\n            case 'spells':\n                contentContainer.innerHTML = this.renderSpellsTab();\n                break;\n            case 'history':\n                contentContainer.innerHTML = this.renderHistoryTab();\n                break;\n            default:\n                contentContainer.innerHTML = '<div class=\"tab-placeholder\">Tab content not available</div>';\n        }\n    }\n    \n    /**\n     * Render overview tab content\n     */\n    renderOverviewTab() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        return `\n            <div class=\"overview-content\">\n                <div class=\"overview-grid\">\n                    <div class=\"overview-section vital-stats\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'System Metrics' : 'Vital Statistics'}</h3>\n                        <div class=\"stats-grid\">\n                            ${this.renderVitalStats()}\n                        </div>\n                    </div>\n                    \n                    <div class=\"overview-section combat-stats\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Combat Protocols' : 'Combat Statistics'}</h3>\n                        <div class=\"stats-grid\">\n                            ${this.renderCombatStats()}\n                        </div>\n                    </div>\n                    \n                    <div class=\"overview-section character-info\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Agent Profile' : 'Character Information'}</h3>\n                        <div class=\"info-grid\">\n                            ${this.renderCharacterInfo()}\n                        </div>\n                    </div>\n                    \n                    <div class=\"overview-section recent-activity\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Recent System Activity' : 'Recent Activity'}</h3>\n                        <div class=\"activity-log\">\n                            ${this.renderRecentActivity()}\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render vital statistics\n     */\n    renderVitalStats() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const levelLabel = isCyberMode ? 'Clearance Level' : 'Level';\n        const healthLabel = isCyberMode ? 'System Integrity' : 'Hit Points';\n        const expLabel = isCyberMode ? 'Data Points' : 'Experience';\n        \n        return `\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${levelLabel}</div>\n                <div class=\"stat-value\">${character.level || 1}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${healthLabel}</div>\n                <div class=\"stat-value\">${character.currentHP || 0}/${character.maxHP || 0}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${expLabel}</div>\n                <div class=\"stat-value\">${character.experience || 0}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">Age</div>\n                <div class=\"stat-value\">${character.age || 'Unknown'}</div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render combat statistics\n     */\n    renderCombatStats() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const acLabel = isCyberMode ? 'Defense Rating' : 'Armor Class';\n        const attackLabel = isCyberMode ? 'Attack Algorithm' : 'Attack Bonus';\n        \n        return `\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${acLabel}</div>\n                <div class=\"stat-value\">${character.armorClass || 10}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${attackLabel}</div>\n                <div class=\"stat-value\">+${character.attackBonus || 0}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${isCyberMode ? 'Damage Output' : 'Damage'}</div>\n                <div class=\"stat-value\">${this.calculateDamageRange()}</div>\n            </div>\n            <div class=\"stat-item\">\n                <div class=\"stat-label\">${isCyberMode ? 'Threat Level' : 'Challenge Rating'}</div>\n                <div class=\"stat-value\">${this.calculateThreatLevel()}</div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render character information\n     */\n    renderCharacterInfo() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const raceLabel = isCyberMode ? 'Platform Type' : 'Race';\n        const classLabel = isCyberMode ? 'Specialization' : 'Class';\n        \n        return `\n            <div class=\"info-item\">\n                <div class=\"info-label\">${raceLabel}</div>\n                <div class=\"info-value\">${character.race || 'Unknown'}</div>\n            </div>\n            <div class=\"info-item\">\n                <div class=\"info-label\">${classLabel}</div>\n                <div class=\"info-value\">${this.getContextualClassName()}</div>\n            </div>\n            <div class=\"info-item\">\n                <div class=\"info-label\">${isCyberMode ? 'Activation Date' : 'Created'}</div>\n                <div class=\"info-value\">${character.createdDate || 'Unknown'}</div>\n            </div>\n            <div class=\"info-item\">\n                <div class=\"info-label\">${isCyberMode ? 'Mission Count' : 'Adventures'}</div>\n                <div class=\"info-value\">${character.adventureCount || 0}</div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render recent activity\n     */\n    renderRecentActivity() {\n        const activities = this.currentCharacter.recentActivity || [];\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        if (activities.length === 0) {\n            const noActivityText = isCyberMode ? 'No recent system activity' : 'No recent activity';\n            return `<div class=\"no-activity\">${noActivityText}</div>`;\n        }\n        \n        return activities.slice(0, 5).map(activity => {\n            const timestamp = new Date(activity.timestamp || Date.now()).toLocaleString();\n            return `\n                <div class=\"activity-item\">\n                    <div class=\"activity-time\">${timestamp}</div>\n                    <div class=\"activity-description\">${activity.description || 'Unknown activity'}</div>\n                </div>\n            `;\n        }).join('');\n    }\n    \n    /**\n     * Render attributes tab\n     */\n    renderAttributesTab() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const attributes = character.attributes || {};\n        \n        const attributeMap = {\n            'strength': { name: 'Strength', cyberName: 'Processing Power' },\n            'intelligence': { name: 'Intelligence', cyberName: 'Logic Circuits' },\n            'piety': { name: 'Piety', cyberName: 'System Integrity' },\n            'vitality': { name: 'Vitality', cyberName: 'Core Stability' },\n            'agility': { name: 'Agility', cyberName: 'Response Time' },\n            'luck': { name: 'Luck', cyberName: 'Random Seed' }\n        };\n        \n        return `\n            <div class=\"attributes-content\">\n                <div class=\"attributes-grid\">\n                    <div class=\"attributes-section\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Core Parameters' : 'Primary Attributes'}</h3>\n                        <div class=\"attribute-list\">\n                            ${Object.entries(attributeMap).map(([key, attr]) => {\n                                const value = attributes[key] || 10;\n                                const modifier = Math.floor((value - 10) / 2);\n                                const displayName = isCyberMode ? attr.cyberName : attr.name;\n                                \n                                return `\n                                    <div class=\"attribute-item\">\n                                        <div class=\"attribute-name\">${displayName}</div>\n                                        <div class=\"attribute-value\">${value}</div>\n                                        <div class=\"attribute-modifier\">(${modifier >= 0 ? '+' : ''}${modifier})</div>\n                                        <div class=\"attribute-bar\">\n                                            <div class=\"attribute-fill\" style=\"width: ${Math.min(100, (value / 18) * 100)}%\"></div>\n                                        </div>\n                                    </div>\n                                `;\n                            }).join('')}\n                        </div>\n                    </div>\n                    \n                    <div class=\"derived-stats-section\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Calculated Metrics' : 'Derived Statistics'}</h3>\n                        <div class=\"derived-stats\">\n                            ${this.renderDerivedStats()}\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render derived statistics\n     */\n    renderDerivedStats() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const stats = [\n            {\n                name: isCyberMode ? 'Carry Capacity' : 'Carrying Capacity',\n                value: `${((character.attributes?.strength || 10) * 10)} lbs`\n            },\n            {\n                name: isCyberMode ? 'Spell Slots' : 'Spell Points',\n                value: this.calculateSpellSlots()\n            },\n            {\n                name: isCyberMode ? 'Initiative Modifier' : 'Initiative',\n                value: `+${Math.floor(((character.attributes?.agility || 10) - 10) / 2)}`\n            },\n            {\n                name: isCyberMode ? 'Fortitude Save' : 'Saving Throws',\n                value: `+${this.calculateSavingThrows()}`\n            }\n        ];\n        \n        return stats.map(stat => `\n            <div class=\"derived-stat-item\">\n                <div class=\"stat-name\">${stat.name}</div>\n                <div class=\"stat-value\">${stat.value}</div>\n            </div>\n        `).join('');\n    }\n    \n    /**\n     * Render equipment tab\n     */\n    renderEquipmentTab() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        return `\n            <div class=\"equipment-content\">\n                <div class=\"equipment-sections\">\n                    <div class=\"equipped-section\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'Active System Modules' : 'Equipped Items'}</h3>\n                        <div class=\"equipped-display\">\n                            ${this.renderDetailedEquipment()}\n                        </div>\n                    </div>\n                    \n                    <div class=\"equipment-stats-section\">\n                        <h3 class=\"section-title\">${isCyberMode ? 'System Performance' : 'Equipment Statistics'}</h3>\n                        <div class=\"equipment-stats\">\n                            ${this.renderEquipmentStats()}\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render detailed equipment information\n     */\n    renderDetailedEquipment() {\n        const equipment = this.currentCharacter.equipment || {};\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const slots = [\n            { key: 'weapon', name: 'Weapon', cyberName: 'Attack Algorithm', icon: '⚔️' },\n            { key: 'armor', name: 'Armor', cyberName: 'Defense Protocol', icon: '🛡️' },\n            { key: 'shield', name: 'Shield', cyberName: 'Firewall Module', icon: '🔰' },\n            { key: 'accessory', name: 'Accessory', cyberName: 'Enhancement Chip', icon: '💍' }\n        ];\n        \n        return slots.map(slot => {\n            const item = equipment[slot.key];\n            const slotName = isCyberMode ? slot.cyberName : slot.name;\n            \n            if (item) {\n                let itemName = typeof item === 'string' ? item : item.name;\n                if (typeof item === 'object' && item.cyberName && isCyberMode) {\n                    itemName = item.cyberName;\n                }\n                \n                return `\n                    <div class=\"equipment-slot-detail filled\">\n                        <div class=\"slot-header\">\n                            <span class=\"slot-icon\">${slot.icon}</span>\n                            <span class=\"slot-name\">${slotName}</span>\n                        </div>\n                        <div class=\"item-details\">\n                            <div class=\"item-name\">${itemName}</div>\n                            ${this.renderItemStats(item)}\n                        </div>\n                    </div>\n                `;\n            } else {\n                const emptyText = isCyberMode ? '(Module Slot Empty)' : '(Empty)';\n                return `\n                    <div class=\"equipment-slot-detail empty\">\n                        <div class=\"slot-header\">\n                            <span class=\"slot-icon\">${slot.icon}</span>\n                            <span class=\"slot-name\">${slotName}</span>\n                        </div>\n                        <div class=\"empty-slot\">${emptyText}</div>\n                    </div>\n                `;\n            }\n        }).join('');\n    }\n    \n    /**\n     * Render item statistics\n     */\n    renderItemStats(item) {\n        if (typeof item === 'string') return '';\n        \n        const stats = [];\n        if (item.damage) {\n            stats.push(`Damage: ${item.damage.dice}d${item.damage.sides}${item.damage.bonus ? `+${item.damage.bonus}` : ''}`);\n        }\n        if (item.acBonus) stats.push(`AC: +${item.acBonus}`);\n        if (item.attackBonus) stats.push(`Attack: +${item.attackBonus}`);\n        if (item.durability !== undefined) {\n            const condition = Math.floor((item.durability / item.maxDurability) * 100);\n            stats.push(`Condition: ${condition}%`);\n        }\n        \n        return stats.length > 0 ? `<div class=\"item-stats\">${stats.join(' • ')}</div>` : '';\n    }\n    \n    /**\n     * Render equipment statistics\n     */\n    renderEquipmentStats() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        // Calculate equipment bonuses (placeholder - implement actual calculation)\n        const stats = [\n            {\n                name: isCyberMode ? 'Total Defense Rating' : 'Total AC Bonus',\n                value: '+0' // Implement actual calculation\n            },\n            {\n                name: isCyberMode ? 'Attack Enhancement' : 'Attack Bonus',\n                value: '+0' // Implement actual calculation\n            },\n            {\n                name: isCyberMode ? 'System Load' : 'Total Weight',\n                value: '0 lbs' // Implement actual calculation\n            },\n            {\n                name: isCyberMode ? 'Module Efficiency' : 'Equipment Condition',\n                value: '100%' // Implement actual calculation\n            }\n        ];\n        \n        return stats.map(stat => `\n            <div class=\"equipment-stat-item\">\n                <div class=\"stat-name\">${stat.name}</div>\n                <div class=\"stat-value\">${stat.value}</div>\n            </div>\n        `).join('');\n    }\n    \n    /**\n     * Render skills tab\n     */\n    renderSkillsTab() {\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        return `\n            <div class=\"skills-content\">\n                <div class=\"skills-placeholder\">\n                    <h3>${isCyberMode ? 'Agent Capabilities' : 'Character Skills'}</h3>\n                    <p>${isCyberMode ? 'Capability matrix not yet implemented' : 'Skills system not yet implemented'}</p>\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render spells tab\n     */\n    renderSpellsTab() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const spells = character.memorizedSpells || {};\n        const hasSpells = Object.keys(spells).length > 0;\n        \n        if (!hasSpells) {\n            const noSpellsText = isCyberMode ? 'No subroutines loaded' : 'No spells memorized';\n            return `<div class=\"spells-placeholder\">${noSpellsText}</div>`;\n        }\n        \n        return `\n            <div class=\"spells-content\">\n                <div class=\"spells-sections\">\n                    ${Object.entries(spells).map(([level, levelSpells]) => {\n                        const levelLabel = isCyberMode ? 'Tier' : 'Level';\n                        return `\n                            <div class=\"spell-level-section\">\n                                <h3 class=\"section-title\">${levelLabel} ${level}</h3>\n                                <div class=\"spell-grid\">\n                                    ${levelSpells.map(spell => this.renderSpellDetail(spell)).join('')}\n                                </div>\n                            </div>\n                        `;\n                    }).join('')}\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render spell detail\n     */\n    renderSpellDetail(spell) {\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        let spellName = typeof spell === 'string' ? spell : spell.name;\n        \n        if (typeof spell === 'object' && spell.cyberName && isCyberMode) {\n            spellName = spell.cyberName;\n        }\n        \n        return `\n            <div class=\"spell-detail-item\">\n                <div class=\"spell-name\">${spellName}</div>\n                ${typeof spell === 'object' && spell.description ? `<div class=\"spell-description\">${spell.description}</div>` : ''}\n            </div>\n        `;\n    }\n    \n    /**\n     * Render history tab\n     */\n    renderHistoryTab() {\n        const character = this.currentCharacter;\n        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();\n        \n        const history = character.history || [];\n        \n        if (history.length === 0) {\n            const noHistoryText = isCyberMode ? 'No activity logs available' : 'No history recorded';\n            return `<div class=\"history-placeholder\">${noHistoryText}</div>`;\n        }\n        \n        return `\n            <div class=\"history-content\">\n                <div class=\"history-timeline\">\n                    ${history.map(event => this.renderHistoryEvent(event)).join('')}\n                </div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render history event\n     */\n    renderHistoryEvent(event) {\n        const timestamp = new Date(event.timestamp || Date.now()).toLocaleString();\n        \n        return `\n            <div class=\"history-event\">\n                <div class=\"event-time\">${timestamp}</div>\n                <div class=\"event-description\">${event.description || 'Unknown event'}</div>\n                <div class=\"event-type\">${event.type || 'general'}</div>\n            </div>\n        `;\n    }\n    \n    /**\n     * Render character sheet content\n     */\n    renderCharacterSheetContent() {\n        this.renderTabContent(this.activeTab);\n    }\n    \n    /**\n     * Helper method to calculate damage range\n     */\n    calculateDamageRange() {\n        // Placeholder - implement actual damage calculation\n        return '1-6';\n    }\n    \n    /**\n     * Helper method to calculate threat level\n     */\n    calculateThreatLevel() {\n        const level = this.currentCharacter.level || 1;\n        if (level <= 3) return 'Low';\n        if (level <= 6) return 'Medium';\n        if (level <= 9) return 'High';\n        return 'Critical';\n    }\n    \n    /**\n     * Helper method to calculate spell slots\n     */\n    calculateSpellSlots() {\n        // Placeholder - implement actual spell slot calculation\n        return '3/5';\n    }\n    \n    /**\n     * Helper method to calculate saving throws\n     */\n    calculateSavingThrows() {\n        const level = this.currentCharacter.level || 1;\n        return Math.floor(level / 2);\n    }\n    \n    /**\n     * Hide character sheet modal\n     */\n    hideCharacterSheet() {\n        if (this.characterSheetModal) {\n            this.characterSheetModal.remove();\n            this.characterSheetModal = null;\n        }\n        this.currentCharacter = null;\n        this.activeTab = 'overview';\n    }\n}"