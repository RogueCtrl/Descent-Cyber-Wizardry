import { TextManager } from '../utils/TextManager.ts';

/**
 * Advanced Character Sheet
 * Complete digital integration for the Wizardry-Tron Fusion transformation
 * Provides comprehensive character information with cyber terminology
 */

export class AdvancedCharacterSheet {
  eventSystem: any;
  characterSheetModal: HTMLElement | null;
  currentCharacter: any;
  activeTab: string;
  tabs: { id: string; name: string; cyberName: string; icon: string }[];

  constructor(eventSystem: any) {
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
      { id: 'history', name: 'History', cyberName: 'Activity Log', icon: '📜' },
    ];
  }

  /**
   * Show advanced character sheet
   * @param {Object} character - Character to display
   */
  showCharacterSheet(character: any) {
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
                            <div class="character-race-class">
                                <span class="character-race">${this.getContextualRaceName()}</span>
                                <span class="character-class">${this.getContextualClassName()}</span>
                            </div>
                            <div class="character-level">
                                <span data-text-key="level">Level</span> ${this.currentCharacter.level || 1}
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
  setupCharacterSheetEventListeners(modal: HTMLElement) {
    // Close button
    modal.querySelector('#close-character-sheet')!.addEventListener('click', () => {
      this.hideCharacterSheet();
    });

    // Tab navigation
    modal.addEventListener('click', (e: Event) => {
      if ((e.target as HTMLElement).classList.contains('nav-tab')) {
        const tabId = (e.target as HTMLElement).getAttribute('data-tab');
        this.switchTab(tabId);
      }
    });

    // Close on outside click
    modal.addEventListener('click', (e: Event) => {
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
    textElements.forEach((element: Element) => {
      const textKey = element.getAttribute('data-text-key');
      if (textKey) {
        TextManager.applyToElement(element as HTMLElement, textKey);
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

    this.tabs.forEach((tab) => {
      const tabElement = this.characterSheetModal!.querySelector(`[data-tab="${tab.id}"]`);
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

    if (typeof TextManager !== 'undefined') {
      return TextManager.getText(`class_${className.toLowerCase()}`) || className;
    }

    return className;
  }

  /**
   * Get contextual race name based on current mode
   */
  getContextualRaceName() {
    const raceName = this.currentCharacter.race || 'Unknown';

    if (typeof TextManager !== 'undefined') {
      return TextManager.getText(`race_${raceName.toLowerCase()}`) || raceName;
    }

    return raceName;
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

    const healthPercentage = character.maxHP ? (character.currentHP / character.maxHP) * 100 : 100;
    const healthClass =
      healthPercentage > 75 ? 'good' : healthPercentage > 25 ? 'warning' : 'critical';

    return `
            <div class="status-indicator">
                <div class="status-label" data-text-key="hit_points">Hit Points:</div>
                <div class="health-bar">
                    <div class="health-fill ${healthClass}" style="width: ${healthPercentage}%"></div>
                </div>
                <div class="health-text">${character.currentHP || 0}/${character.maxHP || 0}</div>
            </div>
            <div class="status-indicator">
                <div class="status-label">Status:</div>
                <div class="status-value ${character.status || 'ok'}">${this.getContextualStatus()}</div>
            </div>
        `;
  }

  /**
   * Get contextual status text using TextManager
   */
  getContextualStatus() {
    const rawStatus = this.currentCharacter.status || 'ok';

    if (typeof TextManager !== 'undefined') {
      // Map different status values to our death system terminology
      switch (rawStatus.toLowerCase()) {
        case 'ok':
        case 'alive':
          return TextManager.getText('character_status_ok');
        case 'unconscious':
          return TextManager.getText('character_status_unconscious');
        case 'dead':
          return TextManager.getText('character_status_dead');
        case 'ashes':
          return TextManager.getText('character_status_ashes');
        case 'lost':
          return TextManager.getText('character_status_lost');
        default:
          return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
      }
    }

    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  }

  /**
   * Render navigation tabs
   */
  renderNavigationTabs() {
    const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();

    return this.tabs
      .map((tab) => {
        const tabName = isCyberMode ? tab.cyberName : tab.name;
        const isActive = tab.id === this.activeTab;

        return `
                <div class="nav-tab ${isActive ? 'active' : ''}" data-tab="${tab.id}">
                    <span class="tab-icon">${tab.icon}</span>
                    <span class="tab-text">${tabName}</span>
                </div>
            `;
      })
      .join('');
  }

  /**
   * Render footer stats
   */
  renderFooterStats() {
    const character = this.currentCharacter;

    return `
            <div class="footer-stat">
                <span class="stat-label" data-text-key="experience">Experience:</span>
                <span class="stat-value">${character.experience || 0}</span>
            </div>
            <div class="footer-stat">
                <span class="stat-label" data-text-key="gold">Gold:</span>
                <span class="stat-value">${character.gold || 0}</span>
            </div>
            <div class="footer-stat">
                <span class="stat-label" data-text-key="age">Age:</span>
                <span class="stat-value">${character.age || 'Unknown'}</span>
            </div>
        `;
  }

  /**
   * Switch to a different tab
   */
  switchTab(tabId: string | null) {
    if (this.activeTab === tabId) return;

    this.activeTab = tabId || 'overview';

    // Update tab navigation
    const tabs = this.characterSheetModal!.querySelectorAll('.nav-tab');
    tabs.forEach((tab: Element) => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });

    // Render tab content
    this.renderTabContent(tabId);

    // Reapply TextManager after content update
    this.applyTextManagerToCharacterSheet();
  }

  /**
   * Render content for the active tab
   */
  renderTabContent(tabId: string | null) {
    const contentContainer = this.characterSheetModal?.querySelector('#character-sheet-tab-content');
    if (!contentContainer) return;

    switch (tabId) {
      case 'overview':
        contentContainer.innerHTML = this.renderOverviewTab();
        break;
      case 'attributes':
        contentContainer.innerHTML = this.renderAttributesTab();
        break;
      case 'equipment':
        contentContainer.innerHTML = this.renderEquipmentTab();
        break;
      case 'skills':
        contentContainer.innerHTML = this.renderSkillsTab();
        break;
      case 'spells':
        contentContainer.innerHTML = this.renderSpellsTab();
        break;
      case 'history':
        contentContainer.innerHTML = this.renderHistoryTab();
        break;
      default:
        contentContainer.innerHTML = '<div class="tab-placeholder">Tab content not available</div>';
    }
  }

  /**
   * Render overview tab content
   */
  renderOverviewTab() {
    const character = this.currentCharacter;

    return `
            <div class="overview-content">
                <div class="overview-grid">
                    <div class="overview-section vital-stats">
                        <h3 class="section-title" data-text-key="vital_statistics">Vital Statistics</h3>
                        <div class="stats-grid">
                            ${this.renderVitalStats()}
                        </div>
                    </div>
                    
                    <div class="overview-section combat-stats">
                        <h3 class="section-title" data-text-key="combat_statistics">Combat Statistics</h3>
                        <div class="stats-grid">
                            ${this.renderCombatStats()}
                        </div>
                    </div>
                    
                    <div class="overview-section character-info">
                        <h3 class="section-title" data-text-key="character_information">Character Information</h3>
                        <div class="info-grid">
                            ${this.renderCharacterInfo()}
                        </div>
                    </div>
                    
                    <div class="overview-section recent-activity">
                        <h3 class="section-title" data-text-key="recent_activity">Recent Activity</h3>
                        <div class="activity-log">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Render vital statistics
   */
  renderVitalStats() {
    const character = this.currentCharacter;

    return `
            <div class="stat-item">
                <div class="stat-label" data-text-key="level">Level</div>
                <div class="stat-value">${character.level || 1}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="hit_points">Hit Points</div>
                <div class="stat-value">${character.currentHP || 0}/${character.maxHP || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="experience">Experience</div>
                <div class="stat-value">${character.experience || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="age">Age</div>
                <div class="stat-value">${character.age || 'Unknown'}</div>
            </div>
        `;
  }

  /**
   * Render combat statistics
   */
  renderCombatStats() {
    const character = this.currentCharacter;

    return `
            <div class="stat-item">
                <div class="stat-label" data-text-key="armor_class">Armor Class</div>
                <div class="stat-value">${character.armorClass || 10}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="attack_bonus">Attack Bonus</div>
                <div class="stat-value">+${character.attackBonus || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="damage">Damage</div>
                <div class="stat-value">${this.calculateDamageRange()}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label" data-text-key="threat_level">Challenge Rating</div>
                <div class="stat-value">${this.calculateThreatLevel()}</div>
            </div>
        `;
  }

  /**
   * Render character information
   */
  renderCharacterInfo() {
    const character = this.currentCharacter;

    return `
            <div class="info-item">
                <div class="info-label" data-text-key="race">Race</div>
                <div class="info-value">${this.getContextualRaceName()}</div>
            </div>
            <div class="info-item">
                <div class="info-label" data-text-key="class">Class</div>
                <div class="info-value">${this.getContextualClassName()}</div>
            </div>
            <div class="info-item">
                <div class="info-label" data-text-key="created_date">Created</div>
                <div class="info-value">${character.createdDate || 'Unknown'}</div>
            </div>
            <div class="info-item">
                <div class="info-label" data-text-key="adventure_count">Adventures</div>
                <div class="info-value">${character.adventureCount || 0}</div>
            </div>
        `;
  }

  /**
   * Render recent activity
   */
  renderRecentActivity() {
    const activities = this.currentCharacter.recentActivity || [];

    if (activities.length === 0) {
      return `<div class="no-activity" data-text-key="no_recent_activity">No recent activity</div>`;
    }

    return activities
      .slice(0, 5)
      .map((activity: any) => {
        const timestamp = new Date(activity.timestamp || Date.now()).toLocaleString();
        return `
                <div class="activity-item">
                    <div class="activity-time">${timestamp}</div>
                    <div class="activity-description">${activity.description || 'Unknown activity'}</div>
                </div>
            `;
      })
      .join('');
  }

  /**
   * Render attributes tab
   */
  renderAttributesTab() {
    const character = this.currentCharacter;
    const attributes = character.attributes || {};

    return `
            <div class="attributes-content">
                <div class="attributes-grid">
                    <div class="attributes-section">
                        <h3 class="section-title" data-text-key="attributes">Attributes</h3>
                        <div class="attribute-list">
                            ${this.renderAttributeList(attributes)}
                        </div>
                    </div>
                    
                    <div class="derived-stats-section">
                        <h3 class="section-title" data-text-key="derived_statistics">Derived Statistics</h3>
                        <div class="derived-stats">
                            ${this.renderDerivedStats()}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Render attribute list with proper TextManager integration
   */
  renderAttributeList(attributes: Record<string, number>) {
    const attributeKeys = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];
    const abbreviationKeys = [
      'attr_str',
      'attr_int',
      'attr_pie',
      'attr_vit',
      'attr_agi',
      'attr_luc',
    ];

    return attributeKeys
      .map((key, index) => {
        const value = attributes[key] || 10;
        const modifier = Math.floor((value - 10) / 2);
        const abbreviationKey = abbreviationKeys[index];

        return `
                <div class="attribute-item">
                    <div class="attribute-header">
                        <div class="attribute-name" data-text-key="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        <div class="attribute-abbreviation" data-text-key="${abbreviationKey}">STR</div>
                    </div>
                    <div class="attribute-value">${value}</div>
                    <div class="attribute-modifier">(${modifier >= 0 ? '+' : ''}${modifier})</div>
                    <div class="attribute-bar">
                        <div class="attribute-fill" style="width: ${Math.min(100, (value / 18) * 100)}%"></div>
                    </div>
                </div>
            `;
      })
      .join('');
  }

  /**
   * Render derived statistics
   */
  renderDerivedStats() {
    const character = this.currentCharacter;

    const stats = [
      {
        key: 'carrying_capacity',
        value: `${(character.attributes?.strength || 10) * 10} lbs`,
      },
      {
        key: 'spell_points',
        value: this.calculateSpellSlots(),
      },
      {
        key: 'initiative',
        value: `+${Math.floor(((character.attributes?.agility || 10) - 10) / 2)}`,
      },
      {
        key: 'saving_throws',
        value: `+${this.calculateSavingThrows()}`,
      },
    ];

    return stats
      .map(
        (stat) => `
            <div class="derived-stat-item">
                <div class="stat-name" data-text-key="${stat.key}">Stat</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `
      )
      .join('');
  }

  /**
   * Render equipment tab
   */
  renderEquipmentTab() {
    const character = this.currentCharacter;

    return `
            <div class="equipment-content">
                <div class="equipment-sections">
                    <div class="equipped-section">
                        <h3 class="section-title" data-text-key="equipment">Equipment</h3>
                        <div class="equipped-display">
                            ${this.renderDetailedEquipment()}
                        </div>
                    </div>
                    
                    <div class="equipment-stats-section">
                        <h3 class="section-title" data-text-key="equipment_statistics">Equipment Statistics</h3>
                        <div class="equipment-stats">
                            ${this.renderEquipmentStats()}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Render detailed equipment information
   */
  renderDetailedEquipment() {
    const equipment = this.currentCharacter.equipment || {};

    const slots = [
      { key: 'weapon', nameKey: 'weapon_slot', icon: '⚔️' },
      { key: 'armor', nameKey: 'armor_slot', icon: '🛡️' },
      { key: 'shield', nameKey: 'shield_slot', icon: '🔰' },
      { key: 'accessory', nameKey: 'accessory_slot', icon: '💍' },
    ];

    return slots
      .map((slot) => {
        const item = equipment[slot.key];

        if (item) {
          let itemName = typeof item === 'string' ? item : item.name;

          return `
                    <div class="equipment-slot-detail filled">
                        <div class="slot-header">
                            <span class="slot-icon">${slot.icon}</span>
                            <span class="slot-name" data-text-key="${slot.nameKey}">Slot</span>
                        </div>
                        <div class="item-details">
                            <div class="item-name">${itemName}</div>
                            ${this.renderItemStats(item)}
                        </div>
                    </div>
                `;
        } else {
          return `
                    <div class="equipment-slot-detail empty">
                        <div class="slot-header">
                            <span class="slot-icon">${slot.icon}</span>
                            <span class="slot-name" data-text-key="${slot.nameKey}">Slot</span>
                        </div>
                        <div class="empty-slot" data-text-key="empty_slot">(Empty)</div>
                    </div>
                `;
        }
      })
      .join('');
  }

  /**
   * Render item statistics
   */
  renderItemStats(item: Record<string, any>) {
    if (typeof item === 'string') return '';

    const stats: any[] = [];
    if (item.damage) {
      stats.push(
        `Damage: ${item.damage.dice}d${item.damage.sides}${item.damage.bonus ? `+${item.damage.bonus}` : ''}`
      );
    }
    if (item.acBonus) stats.push(`AC: +${item.acBonus}`);
    if (item.attackBonus) stats.push(`Attack: +${item.attackBonus}`);
    if (item.durability !== undefined) {
      const condition = Math.floor((item.durability / item.maxDurability) * 100);
      stats.push(`Condition: ${condition}%`);
    }

    return stats.length > 0 ? `<div class="item-stats">${stats.join(' • ')}</div>` : '';
  }

  /**
   * Render equipment statistics
   */
  renderEquipmentStats() {
    const character = this.currentCharacter;

    // Calculate equipment bonuses (placeholder - implement actual calculation)
    const stats = [
      {
        key: 'total_ac_bonus',
        value: '+0', // Implement actual calculation
      },
      {
        key: 'total_attack_bonus',
        value: '+0', // Implement actual calculation
      },
      {
        key: 'total_weight',
        value: '0 lbs', // Implement actual calculation
      },
      {
        key: 'equipment_condition',
        value: '100%', // Implement actual calculation
      },
    ];

    return stats
      .map(
        (stat) => `
            <div class="equipment-stat-item">
                <div class="stat-name" data-text-key="${stat.key}">Stat</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `
      )
      .join('');
  }

  /**
   * Render skills tab
   */
  renderSkillsTab() {
    return `
            <div class="skills-content">
                <div class="skills-placeholder">
                    <h3 data-text-key="skills">Skills</h3>
                    <p data-text-key="skills_not_implemented">Skills system not yet implemented</p>
                </div>
            </div>
        `;
  }

  /**
   * Render spells tab
   */
  renderSpellsTab() {
    const character = this.currentCharacter;
    const spells = character.memorizedSpells || {};
    const hasSpells = Object.keys(spells).length > 0;

    if (!hasSpells) {
      return `<div class="spells-placeholder" data-text-key="no_spells">No spells memorized</div>`;
    }

    return `
            <div class="spells-content">
                <div class="spells-sections">
                    ${Object.entries(spells)
                      .map(([level, levelSpells]) => {
                        return `
                            <div class="spell-level-section">
                                <h3 class="section-title"><span data-text-key="level">Level</span> ${level}</h3>
                                <div class="spell-grid">
                                    ${(levelSpells as any).map((spell: any) => this.renderSpellDetail(spell)).join('')}
                                </div>
                            </div>
                        `;
                      })
                      .join('')}
                </div>
            </div>
        `;
  }

  /**
   * Render spell detail
   */
  renderSpellDetail(spell: string | Record<string, any>) {
    let spellName = typeof spell === 'string' ? spell : spell.name;

    return `
            <div class="spell-detail-item">
                <div class="spell-name">${spellName}</div>
                ${typeof spell === 'object' && spell.description ? `<div class="spell-description">${spell.description}</div>` : ''}
            </div>
        `;
  }

  /**
   * Render history tab
   */
  renderHistoryTab() {
    const character = this.currentCharacter;
    const history = character.history || [];

    if (history.length === 0) {
      return `<div class="history-placeholder" data-text-key="no_history">No history recorded</div>`;
    }

    return `
            <div class="history-content">
                <div class="history-timeline">
                    ${history.map((event: any) => this.renderHistoryEvent(event)).join('')}
                </div>
            </div>
        `;
  }

  /**
   * Render history event
   */
  renderHistoryEvent(event: { timestamp?: number; description?: string; type?: string }) {
    const timestamp = new Date(event.timestamp || Date.now()).toLocaleString();

    return `
            <div class="history-event">
                <div class="event-time">${timestamp}</div>
                <div class="event-description">${event.description || 'Unknown event'}</div>
                <div class="event-type">${event.type || 'general'}</div>
            </div>
        `;
  }

  /**
   * Render character sheet content
   */
  renderCharacterSheetContent() {
    this.renderTabContent(this.activeTab);
  }

  /**
   * Helper method to calculate damage range
   */
  calculateDamageRange() {
    // Placeholder - implement actual damage calculation
    return '1-6';
  }

  /**
   * Helper method to calculate threat level
   */
  calculateThreatLevel() {
    const level = this.currentCharacter.level || 1;
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Medium';
    if (level <= 9) return 'High';
    return 'Critical';
  }

  /**
   * Helper method to calculate spell slots
   */
  calculateSpellSlots() {
    // Placeholder - implement actual spell slot calculation
    return '3/5';
  }

  /**
   * Helper method to calculate saving throws
   */
  calculateSavingThrows() {
    const level = this.currentCharacter.level || 1;
    return Math.floor(level / 2);
  }

  /**
   * Hide character sheet modal
   */
  hideCharacterSheet() {
    if (this.characterSheetModal) {
      this.characterSheetModal.remove();
      this.characterSheetModal = null;
    }
    this.currentCharacter = null;
    this.activeTab = 'overview';
  }
}
