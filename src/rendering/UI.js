/**
 * User Interface Manager
 * Handles all UI interactions and display updates
 */
class UI {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.isInitialized = false;
        
        // UI Elements
        this.partyDisplay = null;
        this.messageLog = null;
        this.controlButtons = {};
        this.modals = {};
        
        this.messages = [];
        this.maxMessages = 50;
        
        // Character UI
        this.characterUI = new CharacterUI(eventSystem);
        
        // Town Modal
        this.townModal = null;
        
        // Training Grounds Modal
        this.trainingModal = null;
        
        // Post-Combat Results Modal
        this.postCombatModal = null;
        
        this.initialize();
    }
    
    /**
     * Initialize UI elements and event listeners
     */
    initialize() {
        try {
            // Get UI elements
            this.partyDisplay = document.getElementById('party-display');
            this.messageLog = document.getElementById('message-log');
            
            // Get control buttons
            this.controlButtons = {
                moveForward: document.getElementById('move-forward'),
                moveBackward: document.getElementById('move-backward'),
                turnLeft: document.getElementById('turn-left'),
                turnRight: document.getElementById('turn-right'),
                castSpell: document.getElementById('cast-spell'),
                useItem: document.getElementById('use-item'),
                rest: document.getElementById('rest'),
                camp: document.getElementById('camp')
            };
            
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('UI initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize UI:', error);
        }
    }
    
    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Movement controls are handled by Engine.js to prevent duplicate event listeners
        
        // Action controls
        if (this.controlButtons.castSpell) {
            this.controlButtons.castSpell.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'cast-spell');
            });
        }
        
        if (this.controlButtons.useItem) {
            this.controlButtons.useItem.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'use-item');
            });
        }
        
        if (this.controlButtons.rest) {
            this.controlButtons.rest.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'rest');
            });
        }
        
        if (this.controlButtons.camp) {
            this.controlButtons.camp.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'camp');
            });
        }
        
        // Audio controls
        const audioToggle = document.getElementById('toggle-audio');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
            });
        }
        
        // Keyboard controls
        this.eventSystem.on('keydown', (event) => {
            this.handleKeydown(event);
        });
        
        // Message system
        this.eventSystem.on('show-message', (data) => {
            this.addMessage(data.text, data.type);
        });
        
        // Combat ended event
        this.eventSystem.on('combat-ended', (data) => {
            this.showPostCombatResults(data.rewards);
        });
        
        // Party defeated event
        this.eventSystem.on('party-defeated', (data) => {
            this.showPartyDeathScreen(data.casualties);
        });
        
        // Character updated event (for real-time HP updates)
        this.eventSystem.on('character-updated', (data) => {
            this.refreshCombatDisplay();
        });
    }
    
    /**
     * Handle keyboard input
     */
    handleKeydown(event) {
        switch (event.key) {
            // Movement keys are handled by Engine.js to prevent duplicate handling
            
            case ' ':
                event.preventDefault();
                this.eventSystem.emit('player-action', 'action');
                break;
                
            case 'Escape':
                event.preventDefault();
                this.eventSystem.emit('game-menu-toggle');
                break;
        }
    }
    
    /**
     * Update party display
     */
    updatePartyDisplay(party) {
        if (!this.partyDisplay) return;
        
        this.partyDisplay.innerHTML = '';
        
        if (!party || party.size === 0) {
            this.partyDisplay.innerHTML = `
                <div class="no-party">
                    <p>No party members</p>
                    <button id="create-character-btn" class="btn-primary">Create Character</button>
                </div>
            `;
            
            // Add event listener for create character button
            const createBtn = this.partyDisplay.querySelector('#create-character-btn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    this.showCharacterCreation();
                });
            }
            return;
        }
        
        // Create party header
        const headerElement = document.createElement('div');
        headerElement.className = 'party-header';
        const gameState = window.engine ? window.engine.gameState : null;
        const currentState = gameState ? gameState.currentState : null;
        const showAddButton = (currentState !== 'playing' && currentState !== 'dungeon' && party.size < 6);
        
        headerElement.innerHTML = `
            <h4>Party (${party.size}/6)</h4>
            ${showAddButton ? '<button id="add-character-btn" class="btn-small">+</button>' : ''}
        `;
        this.partyDisplay.appendChild(headerElement);
        
        // Add event listener for add character button
        const addBtn = headerElement.querySelector('#add-character-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showCharacterCreation();
            });
        }
        
        // Create character list
        party.members.forEach((character, index) => {
            const characterElement = document.createElement('div');
            characterElement.className = `character-summary ${party.currentLeader === character ? 'leader' : ''}`;
            characterElement.dataset.characterId = character.id;
            
            // Calculate HP percentage for health bar
            const hpPercentage = Math.max(0, Math.round((character.currentHP / character.maxHP) * 100));
            const hpBarClass = hpPercentage > 50 ? 'healthy' : hpPercentage > 25 ? 'wounded' : 'critical';
            
            characterElement.innerHTML = `
                <div class="character-header">
                    <div class="character-name">${character.name}</div>
                    <div class="character-level">Lvl ${character.level}</div>
                </div>
                <div class="character-info">
                    <div class="character-race-class">${character.race} ${character.class}</div>
                    <div class="character-hp">
                        <div class="hp-bar-container">
                            <div class="hp-bar ${hpBarClass}" style="width: ${hpPercentage}%"></div>
                        </div>
                        <div class="hp-text">${character.currentHP}/${character.maxHP}</div>
                    </div>
                    <div class="character-status ${character.status?.toLowerCase() || 'ok'}">${character.status || 'OK'}</div>
                </div>
                <div class="character-actions">
                    <button class="btn-tiny" onclick="engine.ui.selectCharacter('${character.id}')">Select</button>
                    <button class="btn-tiny" onclick="engine.ui.viewCharacter('${character.id}')">View</button>
                </div>
            `;
            
            // Add click handler for character selection
            characterElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-tiny')) {
                    this.selectCharacter(character.id);
                }
            });
            
            this.partyDisplay.appendChild(characterElement);
        });
        
        // Add party actions only if not in dungeon mode  
        // Reuse gameState and currentState from above
        
        if (currentState !== 'playing' && currentState !== 'dungeon') {
            const actionsElement = document.createElement('div');
            actionsElement.className = 'party-actions';
            actionsElement.innerHTML = `
                <button class="btn-small" onclick="engine.ui.showPartyManagement()">Manage Party</button>
                <button class="btn-small" onclick="engine.ui.showCharacterCreation()">Add Member</button>
            `;
            this.partyDisplay.appendChild(actionsElement);
        }
    }
    
    /**
     * Select a character as the current leader
     */
    selectCharacter(characterId) {
        // Remove previous selection
        this.partyDisplay.querySelectorAll('.character-summary').forEach(el => {
            el.classList.remove('leader');
        });
        
        // Add selection to clicked character
        const characterElement = this.partyDisplay.querySelector(`[data-character-id="${characterId}"]`);
        if (characterElement) {
            characterElement.classList.add('leader');
        }
        
        // Emit event for party leader change
        this.eventSystem.emit('party-leader-change', characterId);
        this.addMessage(`Selected ${characterElement?.querySelector('.character-name')?.textContent || 'character'} as party leader.`);
    }
    
    /**
     * View character details
     */
    viewCharacter(characterId) {
        this.addMessage(`Character sheet for ${characterId} would open here.`);
        // TODO: Implement character sheet modal
    }
    
    /**
     * Show party management interface
     */
    showPartyManagement() {
        this.addMessage('Party management interface will be implemented in the next update.');
        // TODO: Implement party management modal
    }
    
    /**
     * Show town center as modal overlay
     */
    showTown(party = null) {
        console.log('UI.showTown() called with party:', party);
        
        // Hide any existing town modal
        this.hideTown();
        
        // Use passed party or fallback to engine
        const partyObj = party || (window.engine ? window.engine.party : null);
        const partyInfo = this.getPartyStatusInfo(partyObj);
        const hasActiveParty = partyObj && partyObj.size > 0;
        const lastSave = this.getLastSaveInfo();
        
        console.log('Party info:', { partyObj, partyInfo, hasActiveParty });
        
        // Create modal content
        const townContent = `
            <div class="town-center-interface">
                <div class="game-header">
                    <h1 class="game-title">DESCENT: CYBER WIZARDRY</h1>
                    <p class="game-subtitle">Welcome to the Mad Overlord's Domain</p>
                </div>
                
                <div class="town-center-content">
                    <h2 class="town-name">Town Center</h2>
                    <p class="town-description">The bustling hub of Llylgamyn, where adventurers prepare for their descent into the Mad Overlord's maze.</p>
                    
                    <div class="town-locations-grid">
                        <div class="location-card ${hasActiveParty ? 'enabled' : 'primary'}">
                            <button id="training-grounds-btn" class="location-btn primary">
                                <div class="location-icon">⚔️</div>
                                <div class="location-info">
                                    <h3>Training Grounds</h3>
                                    <p>Create and manage your party of adventurers</p>
                                    <span class="location-status">${hasActiveParty ? 'Manage Party' : 'Create Party'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card ${hasActiveParty ? 'enabled' : 'disabled'}">
                            <button id="dungeon-entrance-btn" class="location-btn ${hasActiveParty ? 'enabled' : 'disabled'}" ${hasActiveParty ? '' : 'disabled'}>
                                <div class="location-icon">🏰</div>
                                <div class="location-info">
                                    <h3>Dungeon Entrance</h3>
                                    <p>Enter the Mad Overlord's treacherous maze</p>
                                    <span class="location-status">${hasActiveParty ? 'Enter Dungeon' : 'Party Required'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">🏪</div>
                                <div class="location-info">
                                    <h3>Trading Post</h3>
                                    <p>Buy and sell equipment and supplies</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">⛪</div>
                                <div class="location-info">
                                    <h3>Temple</h3>
                                    <p>Heal wounds and resurrect fallen heroes</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">👥</div>
                                <div class="location-info">
                                    <h3>Party Management</h3>
                                    <p>Manage multiple parties and character roster</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="game-status-bar">
                    <div class="status-section">
                        <span class="status-label">Party Status:</span>
                        <span class="status-value ${hasActiveParty ? 'active' : 'inactive'}">${partyInfo}</span>
                    </div>
                    <div class="status-section">
                        <span class="status-label">Last Save:</span>
                        <span class="status-value">${lastSave}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Create and show modal
        this.townModal = new Modal({
            className: 'modal town-modal',
            closeOnEscape: false, // Town menu should not be dismissible with ESC
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.townModal.setOnClose(() => {
            this.hideTown();
        });
        
        // Create and show modal
        this.townModal.create(townContent);
        this.townModal.show();
        
        // Add event listeners
        this.setupTownCenterEventListeners(this.townModal.getBody());
    }
    
    /**
     * Set up event listeners for town center interface
     */
    setupTownCenterEventListeners(viewport) {
        const trainingBtn = viewport.querySelector('#training-grounds-btn');
        const dungeonBtn = viewport.querySelector('#dungeon-entrance-btn');
        
        if (trainingBtn) {
            trainingBtn.addEventListener('click', () => {
                this.eventSystem.emit('town-location-selected', 'training-grounds');
            });
        }
        
        if (dungeonBtn && !dungeonBtn.disabled) {
            dungeonBtn.addEventListener('click', () => {
                this.eventSystem.emit('town-location-selected', 'dungeon');
            });
        }
    }
    
    /**
     * Get party status information for display
     */
    getPartyStatusInfo(party) {
        if (!party || party.size === 0) {
            return 'No Active Party';
        }
        
        const livingMembers = party.members.filter(member => 
            member.status !== 'dead' && member.status !== 'lost'
        ).length;
        
        if (livingMembers === 0) {
            return 'Party Defeated';
        } else if (livingMembers < party.size) {
            return `${livingMembers}/${party.size} Members Active`;
        } else {
            return `${party.size} Members Ready`;
        }
    }
    
    /**
     * Get last save information
     */
    getLastSaveInfo() {
        // TODO: Integrate with actual save system
        // For now, return placeholder
        return 'Never';
    }
    
    /**
     * Hide town modal
     */
    hideTown() {
        if (this.townModal) {
            this.townModal.hide();
            this.townModal = null;
        }
    }
    
    /**
     * Show training grounds as modal overlay
     */
    showTrainingGrounds() {
        console.log('UI.showTrainingGrounds() called');
        
        // Hide any existing training modal
        this.hideTrainingGrounds();
        
        // Get party info from the engine
        const party = window.engine ? window.engine.party : null;
        const hasActiveParty = party && party.size > 0;
        
        // Create modal content
        const trainingContent = `
            <div class="training-grounds-interface">
                <div class="training-header">
                    <h1 class="training-title">Training Grounds</h1>
                    <p class="training-subtitle">Create and manage your party of adventurers</p>
                </div>
                
                <div class="training-content">
                    <div class="training-actions">
                        <button id="create-character-btn" class="action-btn primary large">
                            <div class="btn-icon">⚔️</div>
                            <div class="btn-text">
                                <span class="btn-title">Create New Character</span>
                                <span class="btn-desc">Roll a new adventurer</span>
                            </div>
                        </button>
                        
                        <button id="view-roster-btn" class="action-btn secondary large">
                            <div class="btn-icon">📋</div>
                            <div class="btn-text">
                                <span class="btn-title">View Roster</span>
                                <span class="btn-desc">Browse all characters</span>
                            </div>
                        </button>
                        
                        <button id="view-party-btn" class="action-btn ${hasActiveParty ? 'enabled' : 'disabled'}" ${hasActiveParty ? '' : 'disabled'}>
                            <div class="btn-icon">👥</div>
                            <div class="btn-text">
                                <span class="btn-title">View Party Stats</span>
                                <span class="btn-desc">Review character details</span>
                            </div>
                        </button>
                        
                        <button id="delete-character-btn" class="action-btn danger ${hasActiveParty ? 'enabled' : 'disabled'}" ${hasActiveParty ? '' : 'disabled'}>
                            <div class="btn-icon">🗑️</div>
                            <div class="btn-text">
                                <span class="btn-title">Delete Character</span>
                                <span class="btn-desc">Remove from party</span>
                            </div>
                        </button>
                    </div>
                    
                    <div class="party-status-section">
                        <h3>Current Party (${party ? party.size : 0}/6)</h3>
                        <div class="party-status-info">
                            ${hasActiveParty ? 
                                '<p class="status-ready">✅ Your party is ready for adventure!</p>' : 
                                '<p class="status-empty">⚠️ Create at least one character to enter the dungeon.</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="training-footer">
                    <button id="back-to-town-btn" class="action-btn secondary">
                        <span>← Back to Town</span>
                    </button>
                </div>
            </div>
        `;
        
        // Create and show modal
        this.trainingModal = new Modal({
            className: 'modal training-modal',
            closeOnEscape: false, // Consistent with town menu
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.trainingModal.setOnClose(() => {
            this.hideTrainingGrounds();
        });
        
        // Create and show modal
        this.trainingModal.create(trainingContent);
        this.trainingModal.show();
        
        // Add event listeners
        this.setupTrainingGroundsEventListeners(this.trainingModal.getBody());
    }
    
    /**
     * Set up event listeners for training grounds interface
     */
    setupTrainingGroundsEventListeners(container) {
        const createBtn = container.querySelector('#create-character-btn');
        const backBtn = container.querySelector('#back-to-town-btn');
        const viewRosterBtn = container.querySelector('#view-roster-btn');
        const viewPartyBtn = container.querySelector('#view-party-btn');
        const deleteBtn = container.querySelector('#delete-character-btn');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.eventSystem.emit('training-action', 'create-character');
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.eventSystem.emit('training-action', 'back-to-town');
            });
        }
        
        if (viewRosterBtn) {
            viewRosterBtn.addEventListener('click', () => {
                this.showCharacterRoster();
            });
        }
        
        if (viewPartyBtn && !viewPartyBtn.disabled) {
            viewPartyBtn.addEventListener('click', () => {
                this.eventSystem.emit('training-action', 'view-party');
            });
        }
        
        if (deleteBtn && !deleteBtn.disabled) {
            deleteBtn.addEventListener('click', () => {
                this.eventSystem.emit('training-action', 'delete-character');
            });
        }
    }
    
    /**
     * Hide training grounds modal
     */
    hideTrainingGrounds() {
        if (this.trainingModal) {
            this.trainingModal.hide();
            this.trainingModal = null;
        }
    }
    
    /**
     * Add a message to the message log
     */
    addMessage(text, type = 'info') {
        const message = {
            text: text,
            type: type
        };
        
        this.messages.push(message);
        
        // Keep message count under limit
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        this.updateMessageLog();
    }
    
    /**
     * Update the message log display
     */
    updateMessageLog() {
        if (!this.messageLog) return;
        
        this.messageLog.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message message-${message.type}`;
            messageElement.innerHTML = message.text;
            
            this.messageLog.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.messageLog.scrollTop = this.messageLog.scrollHeight;
    }
    
    /**
     * Show character creation interface
     */
    showCharacterCreation() {
        this.characterUI.showCharacterCreation();
    }
    
    /**
     * Hide character creation interface
     */
    hideCharacterCreation() {
        this.characterUI.hideCharacterCreation();
    }
    
    /**
     * Show character roster interface
     */
    async showCharacterRoster() {
        try {
            // Get all characters from storage
            const allCharacters = await Storage.loadAllCharacters();
            
            console.log(`Loading character roster: ${allCharacters.length} characters found`);
            
            // Create roster modal content
            const rosterContent = await this.createCharacterRosterContent(allCharacters);
            
            // Create and show modal
            this.rosterModal = new Modal({
                className: 'modal roster-modal',
                closeOnEscape: true,
                closeOnBackdrop: true
            });
            
            // Set up close callback
            this.rosterModal.setOnClose(() => {
                this.hideCharacterRoster();
            });
            
            this.rosterModal.create(rosterContent);
            this.rosterModal.show();
            
            // Add event listeners after modal is created
            this.setupRosterEventListeners();
            
        } catch (error) {
            console.error('Failed to show character roster:', error);
            this.addMessage('Failed to load character roster', 'error');
        }
    }
    
    /**
     * Hide character roster interface
     */
    hideCharacterRoster() {
        if (this.rosterModal) {
            this.rosterModal.hide();
            this.rosterModal = null;
        }
    }
    
    /**
     * Set up event listeners for roster modal
     */
    setupRosterEventListeners() {
        const modalBody = this.rosterModal.getBody();
        
        // Close button
        const closeBtn = modalBody.querySelector('#close-roster-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideCharacterRoster();
            });
        }
        
        // Character card click handlers
        const characterCards = modalBody.querySelectorAll('.character-roster-card');
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.characterId;
                this.showCharacterDetails(characterId);
            });
        });
    }
    
    /**
     * Show detailed character sheet
     */
    async showCharacterDetails(characterId) {
        try {
            // Load character data
            const character = await Storage.loadCharacter(characterId);
            if (!character) {
                this.addMessage('Character not found', 'error');
                return;
            }
            
            console.log(`Loading character details for: ${character.name}`);
            
            // Create character sheet content
            const detailContent = await this.createCharacterDetailContent(character);
            
            // Create and show character detail modal
            this.characterDetailModal = new Modal({
                className: 'modal character-detail-modal',
                closeOnEscape: true,
                closeOnBackdrop: true
            });
            
            this.characterDetailModal.setOnClose(() => {
                this.hideCharacterDetails();
            });
            
            this.characterDetailModal.create(detailContent);
            this.characterDetailModal.show();
            
            // Add event listeners for character detail modal
            this.setupCharacterDetailEventListeners();
            
        } catch (error) {
            console.error('Failed to show character details:', error);
            this.addMessage('Failed to load character details', 'error');
        }
    }
    
    /**
     * Hide character details modal
     */
    hideCharacterDetails() {
        if (this.characterDetailModal) {
            this.characterDetailModal.hide();
            this.characterDetailModal = null;
        }
    }
    
    /**
     * Create character detail modal content
     */
    async createCharacterDetailContent(character) {
        // Calculate derived stats
        const hpPercentage = character.maxHP > 0 ? Math.round((character.currentHP / character.maxHP) * 100) : 100;
        const hpStatusClass = hpPercentage > 75 ? 'excellent' : hpPercentage > 50 ? 'good' : hpPercentage > 25 ? 'wounded' : 'critical';
        
        // Get status and location
        const status = character.status || 'Alive';
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        const location = this.getCharacterLocation(character);
        const classIcon = this.getClassIcon(character.class);
        
        // Format attributes (check both direct properties and nested attributes object)
        const attrs = character.attributes || character;
        const attributes = [
            { name: 'Strength', value: attrs.strength || character.strength || 0, abbr: 'STR' },
            { name: 'Intelligence', value: attrs.intelligence || character.intelligence || 0, abbr: 'INT' },
            { name: 'Piety', value: attrs.piety || character.piety || 0, abbr: 'PIE' },
            { name: 'Vitality', value: attrs.vitality || character.vitality || 0, abbr: 'VIT' },
            { name: 'Agility', value: attrs.agility || character.agility || 0, abbr: 'AGI' },
            { name: 'Luck', value: attrs.luck || character.luck || 0, abbr: 'LUC' }
        ];
        
        // Format equipment (simplified for now)
        const equipment = this.formatCharacterEquipment(character);
        
        // Format spells (simplified for now)
        const spells = this.formatCharacterSpells(character);
        
        return `
            <div class="character-detail-interface">
                <div class="character-detail-header">
                    <div class="character-detail-title">
                        <div class="character-detail-icon">${classIcon}</div>
                        <div class="character-detail-name-block">
                            <h1 class="character-detail-name">${character.name}</h1>
                            <p class="character-detail-subtitle">Level ${character.level} ${character.race} ${character.class}</p>
                        </div>
                    </div>
                    <div class="character-detail-status">
                        <div class="status-badge status-${statusClass}">${status}</div>
                        <div class="location-badge">${location}</div>
                    </div>
                </div>
                
                <div class="character-detail-content">
                    <div class="character-detail-section">
                        <h3>Attributes</h3>
                        <div class="attributes-grid">
                            ${attributes.map(attr => `
                                <div class="attribute-item">
                                    <div class="attribute-name">${attr.abbr}</div>
                                    <div class="attribute-value">${attr.value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="character-detail-section">
                        <h3>Health & Experience</h3>
                        <div class="health-exp-grid">
                            <div class="health-section">
                                <div class="health-label">Hit Points</div>
                                <div class="health-bar-section">
                                    <div class="hp-indicator ${hpStatusClass}">
                                        <div class="hp-bar" style="width: ${hpPercentage}%"></div>
                                    </div>
                                    <div class="hp-text">${character.currentHP}/${character.maxHP}</div>
                                </div>
                            </div>
                            <div class="exp-section">
                                <div class="exp-label">Experience</div>
                                <div class="exp-value">${character.experience || 0}</div>
                            </div>
                            ${character.spellPoints !== undefined ? `
                                <div class="sp-section">
                                    <div class="sp-label">Spell Points</div>
                                    <div class="sp-value">${character.currentSP || 0}/${character.spellPoints || 0}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="character-detail-section">
                        <h3>Equipment</h3>
                        <div class="equipment-grid">
                            ${equipment}
                        </div>
                    </div>
                    
                    ${spells ? `
                        <div class="character-detail-section">
                            <h3>Memorized Spells</h3>
                            <div class="spells-section">
                                ${spells}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="character-detail-footer">
                    <button id="close-character-detail-btn" class="action-btn secondary">
                        <span>← Back to Roster</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Format character equipment for display
     */
    formatCharacterEquipment(character) {
        const equipment = character.equipment || {};
        const slots = [
            { key: 'weapon', name: 'Weapon' },
            { key: 'armor', name: 'Armor' },
            { key: 'shield', name: 'Shield' },
            { key: 'accessory', name: 'Accessory' }
        ];
        
        return slots.map(slot => {
            const item = equipment[slot.key];
            const itemName = item ? (typeof item === 'string' ? item : item.name || 'Unknown') : 'None';
            
            return `
                <div class="equipment-item">
                    <div class="equipment-slot">${slot.name}:</div>
                    <div class="equipment-name">${itemName}</div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Format character spells for display
     */
    formatCharacterSpells(character) {
        const memorizedSpells = character.memorizedSpells || {};
        const hasSpells = Object.keys(memorizedSpells).length > 0;
        
        if (!hasSpells) {
            return '<div class="no-spells">No spells memorized</div>';
        }
        
        return Object.entries(memorizedSpells).map(([level, spells]) => {
            if (!spells || spells.length === 0) return '';
            
            return `
                <div class="spell-level">
                    <h4>Level ${level}</h4>
                    <div class="spell-list">
                        ${spells.map(spell => `
                            <div class="spell-item">${typeof spell === 'string' ? spell : spell.name || 'Unknown Spell'}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Set up event listeners for character detail modal
     */
    setupCharacterDetailEventListeners() {
        const modalBody = this.characterDetailModal.getBody();
        
        // Close button
        const closeBtn = modalBody.querySelector('#close-character-detail-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideCharacterDetails();
            });
        }
    }
    
    /**
     * Create character roster modal content
     */
    async createCharacterRosterContent(characters) {
        const characterCards = await Promise.all(
            characters.map(character => this.createCharacterCard(character))
        );
        
        const hasCharacters = characters.length > 0;
        
        return `
            <div class="roster-interface">
                <div class="roster-header">
                    <h1 class="roster-title">Character Roster</h1>
                    <p class="roster-subtitle">All Created Characters (${characters.length})</p>
                </div>
                
                <div class="roster-content">
                    ${hasCharacters ? `
                        <div class="character-grid">
                            ${characterCards.join('')}
                        </div>
                    ` : `
                        <div class="no-characters">
                            <div class="no-characters-icon">⚔️</div>
                            <h3>No Characters Created</h3>
                            <p>Visit the Training Grounds to create your first adventurer!</p>
                        </div>
                    `}
                </div>
                
                <div class="roster-footer">
                    <button id="close-roster-btn" class="action-btn secondary">
                        <span>← Back to Training Grounds</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Create a character card for the roster
     */
    async createCharacterCard(character) {
        // Determine character location
        const location = this.getCharacterLocation(character);
        
        // Determine character status with proper styling
        const status = character.status || 'Alive';
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        
        // Get class icon (implement later if icons are available)
        const classIcon = this.getClassIcon(character.class);
        
        // Calculate HP percentage for health indicator
        const hpPercentage = character.maxHP > 0 ? Math.round((character.currentHP / character.maxHP) * 100) : 100;
        const hpStatusClass = hpPercentage > 75 ? 'excellent' : hpPercentage > 50 ? 'good' : hpPercentage > 25 ? 'wounded' : 'critical';
        
        return `
            <div class="character-roster-card" data-character-id="${character.id}">
                <div class="character-card-header">
                    <div class="class-icon">${classIcon}</div>
                    <div class="character-card-name">${character.name}</div>
                    <div class="character-card-level">Lvl ${character.level}</div>
                </div>
                
                <div class="character-card-info">
                    <div class="character-card-race-class">${character.race} ${character.class}</div>
                    <div class="character-card-location">
                        <span class="location-label">Location:</span>
                        <span class="location-value">${location}</span>
                    </div>
                    <div class="character-card-status">
                        <span class="status-label">Status:</span>
                        <span class="status-value status-${statusClass}">${status}</span>
                    </div>
                </div>
                
                <div class="character-card-health">
                    <div class="hp-indicator ${hpStatusClass}">
                        <div class="hp-bar" style="width: ${hpPercentage}%"></div>
                    </div>
                    <div class="hp-text">${character.currentHP}/${character.maxHP} HP</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get character location string
     */
    getCharacterLocation(character) {
        // For now, simple location logic - can be enhanced later
        if (character.location) {
            if (character.location.dungeon) {
                const { floor, x, y } = character.location;
                return `Dungeon (Lvl.${floor} ${x},${y})`;
            }
            return character.location.area || 'Town';
        }
        return 'Town';
    }
    
    /**
     * Get class icon for character
     */
    getClassIcon(characterClass) {
        const classIcons = {
            'Fighter': '⚔️',
            'Mage': '🔮',
            'Priest': '✨',
            'Thief': '🗡️',
            'Bishop': '🔯',
            'Samurai': '🗾',
            'Lord': '👑',
            'Ninja': '🥷'
        };
        
        return classIcons[characterClass] || '⚔️';
    }
    
    /**
     * Show combat interface
     */
    showCombatInterface() {
        this.addMessage('Combat started!', 'combat');
        
        // Disable movement controls during combat
        Object.values(this.controlButtons).forEach(button => {
            if (button && button.id.includes('move') || button.id.includes('turn')) {
                button.disabled = true;
            }
        });
        
        // Create combat interface in viewport
        this.createCombatInterface();
        
        // Check if it's a player turn after interface is ready
        setTimeout(() => this.checkForPlayerTurn(), 100);
    }
    
    /**
     * Create combat interface in viewport
     */
    createCombatInterface() {
        const viewport = document.getElementById('viewport');
        if (!viewport) return;
        
        // Clear viewport and create combat UI
        viewport.innerHTML = `
            <div id="combat-interface" class="combat-interface">
                <div class="combat-header">
                    <h2>Combat</h2>
                    <div class="encounter-message" id="encounter-message"></div>
                </div>
                
                <div class="combat-body">
                    <div class="combat-status">
                        <div class="party-status">
                            <h3>Your Party</h3>
                            <div id="party-combat-status"></div>
                        </div>
                        <div class="enemy-status">
                            <h3 id="enemy-status-header">Enemies</h3>
                            <div id="wave-info" class="wave-info"></div>
                            <div id="enemy-combat-status"></div>
                        </div>
                    </div>
                    
                    <div class="combat-actions">
                        <h3>Choose Action:</h3>
                        <div class="action-buttons">
                            <button id="combat-attack" class="combat-action-btn" data-action="attack">
                                <span class="action-number">1</span>
                                <span class="action-text">Attack</span>
                            </button>
                            <button id="combat-defend" class="combat-action-btn" data-action="defend">
                                <span class="action-number">2</span>
                                <span class="action-text">Defend</span>
                            </button>
                            <button id="combat-cast-spell" class="combat-action-btn" data-action="cast-spell">
                                <span class="action-number">3</span>
                                <span class="action-text">Cast Spell</span>
                            </button>
                            <button id="combat-use-item" class="combat-action-btn" data-action="use-item">
                                <span class="action-number">4</span>
                                <span class="action-text">Use Item</span>
                            </button>
                            <button id="combat-run" class="combat-action-btn" data-action="run">
                                <span class="action-number">5</span>
                                <span class="action-text">Run</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for combat actions
        this.setupCombatEventListeners();
        
        // Update combat status with current data
        this.updateCombatStatus();
    }
    
    /**
     * Setup combat event listeners
     */
    setupCombatEventListeners() {
        const actionButtons = document.querySelectorAll('.combat-action-btn');
        
        // Mouse click handlers
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleCombatAction(action);
            });
        });
        
        // Keyboard handlers (1-5 keys)
        document.addEventListener('keydown', (e) => {
            if (this.gameState && this.gameState.currentState === 'combat') {
                const key = e.key;
                let action = null;
                
                switch(key) {
                    case '1': action = 'attack'; break;
                    case '2': action = 'defend'; break;
                    case '3': action = 'cast-spell'; break;
                    case '4': action = 'use-item'; break;
                    case '5': action = 'run'; break;
                }
                
                if (action) {
                    e.preventDefault();
                    this.handleCombatAction(action);
                }
            }
        });
    }
    
    /**
     * Update combat status display
     */
    updateCombatStatus() {
        console.log('Updating combat status...');
        // Get party status
        const partyStatusDiv = document.getElementById('party-combat-status');
        const enemyStatusDiv = document.getElementById('enemy-combat-status');
        
        if (partyStatusDiv && window.engine && window.engine.party) {
            const party = window.engine.party;
            console.log('Party data:', party, 'Alive members:', party.aliveMembers);
            partyStatusDiv.innerHTML = party.aliveMembers.map(member => `
                <div class="combatant-status">
                    <div class="combatant-name">${member.name} (${member.class})</div>
                    <div class="combatant-hp">HP: ${member.currentHP}/${member.maxHP}</div>
                    <div class="combatant-weapon">${member.getCurrentWeapon().name}</div>
                </div>
            `).join('');
        } else {
            console.log('Party status div or party not found:', {
                partyStatusDiv: !!partyStatusDiv,
                engine: !!window.engine,
                party: !!window.engine?.party
            });
        }
        
        if (enemyStatusDiv && window.engine && window.engine.combatInterface) {
            // Try to get current combat data
            const combat = window.engine.combatInterface.combat;
            console.log('Combat interface data:', {
                combat: !!combat,
                isActive: combat?.isActive,
                combatants: combat?.combatants
            });
            
            if (combat && combat.isActive) {
                // Update wave information
                const waveInfo = combat.getCurrentEnemyPartyInfo();
                const waveInfoDiv = document.getElementById('wave-info');
                if (waveInfoDiv) {
                    waveInfoDiv.innerHTML = `
                        <div class="wave-counter">Wave ${waveInfo.currentWave} of ${waveInfo.totalWaves}</div>
                    `;
                }
                
                // Get current enemies (not party members - both alive and dead)
                const allPartyMembers = window.engine.party.members || [];
                const enemies = combat.combatants.filter(c => !allPartyMembers.includes(c));
                console.log('Enemies found:', enemies);
                
                enemyStatusDiv.innerHTML = enemies.map(enemy => `
                    <div class="combatant-status">
                        <div class="combatant-name">${enemy.name}</div>
                        <div class="combatant-hp">HP: ${enemy.currentHP}/${enemy.maxHP}</div>
                        <div class="combatant-threat">Threat Level: High</div>
                    </div>
                `).join('');
            } else {
                // Show placeholder if combat not fully initialized yet
                console.log('Combat not active, showing loading message');
                enemyStatusDiv.innerHTML = `
                    <div class="combatant-status">
                        <div class="combatant-name">Loading enemies...</div>
                    </div>
                `;
                
                // Try again in a moment
                setTimeout(() => this.updateCombatStatus(), 500);
            }
        } else {
            console.log('Enemy status div or combat interface not found:', {
                enemyStatusDiv: !!enemyStatusDiv,
                engine: !!window.engine,
                combatInterface: !!window.engine?.combatInterface
            });
        }
    }
    
    /**
     * Handle combat action selection
     */
    handleCombatAction(action) {
        console.log('Combat action selected:', action);
        this.addMessage(`You selected: ${action}`, 'combat');
        
        // Play button click sound
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('buttonClick');
        }
        
        // Disable buttons immediately to prevent double-clicking
        this.disableCombatButtons();
        
        // Emit combat action event for the combat system to process
        if (this.eventSystem) {
            this.eventSystem.emit('combat-action-selected', {
                action: action,
                timestamp: Date.now()
            });
        }
        
        // Also try to process the action directly if combat system is available
        if (window.engine && window.engine.combatInterface) {
            this.processCombatAction(action);
        }
    }
    
    /**
     * Process combat action
     */
    processCombatAction(action) {
        const combat = window.engine.combatInterface.combat;
        if (!combat || !combat.isActive) {
            this.addMessage('Combat system not ready!', 'error');
            return;
        }
        
        const currentActor = combat.getCurrentActor();
        if (!currentActor) {
            this.addMessage('No current actor!', 'error');
            return;
        }
        
        // Check if it's actually a player turn
        if (!currentActor.isPlayer) {
            this.addMessage('It is not your turn!', 'error');
            // Process monster AI turn instead
            this.processMonsterTurn(currentActor.combatant);
            return;
        }
        
        // Create action object based on selected action
        let actionData = {
            type: action,
            attacker: currentActor.combatant // Use correct property name for attack actions
        };
        
        switch(action) {
            case 'attack':
                // For attack, we need a target - target the first alive enemy
                const enemies = combat.combatants.filter(c => 
                    !window.engine.party.aliveMembers.includes(c) && 
                    c.isAlive
                );
                if (enemies.length > 0) {
                    actionData.target = enemies[0];
                    actionData.type = 'attack';
                } else {
                    this.addMessage('No enemies to attack!', 'error');
                    return;
                }
                break;
                
            case 'defend':
                actionData.type = 'defend';
                actionData.defender = currentActor.combatant;
                break;
                
            case 'run':
                actionData.type = 'flee';
                break;
                
            default:
                this.addMessage(`${action} not implemented yet!`, 'warning');
                return;
        }
        
        // Process the action
        const result = combat.processAction(actionData);
        
        // Always log the result message (hit or miss)
        if (result.message) {
            const messageType = result.success ? 'combat' : 'combat'; // Both hits and misses are combat messages
            this.addMessage(result.message, messageType);
        }
        
        // Check if combat ended
        if (result.combatEnded) {
            this.handleCombatEnd(result.winner);
            return;
        }
        
        // Always advance to next turn regardless of hit/miss
        // (Both hits and misses are valid turns)
        setTimeout(() => {
            this.updateCombatStatus();
            this.checkForPlayerTurn();
        }, 100);
    }
    
    /**
     * Process monster AI turn
     */
    processMonsterTurn(monster) {
        console.log('Processing monster turn for:', monster.name);
        
        if (!window.engine.combatInterface) {
            this.addMessage('Combat system not ready!', 'error');
            return;
        }
        
        // Disable action buttons during monster turn
        this.disableCombatButtons();
        
        // Use the combat interface's AI processing
        const aiResult = window.engine.combatInterface.processAITurn(monster);
        
        if (aiResult && typeof aiResult === 'object') {
            // Check if combat ended from AI action
            if (aiResult.combatEnded) {
                this.handleCombatEnd(aiResult.winner);
                return;
            }
            
            // Move to next turn after AI action, regardless of success
            // (Even a failed attack is still a valid turn)
            setTimeout(() => {
                this.updateCombatStatus();
                this.enableCombatButtons(); // Re-enable buttons after AI turn
                this.checkForPlayerTurn();
            }, 1000); // Small delay for dramatic effect
        } else {
            console.error('AI processing returned invalid result:', aiResult);
            this.addMessage('Monster AI failed to act!', 'error');
            
            // Still try to continue combat after a delay
            setTimeout(() => {
                this.updateCombatStatus();
                this.enableCombatButtons(); // Re-enable buttons even on error
                this.checkForPlayerTurn();
            }, 1000);
        }
    }
    
    /**
     * Disable combat action buttons
     */
    disableCombatButtons() {
        const actionButtons = document.querySelectorAll('.combat-action-btn');
        actionButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
    }
    
    /**
     * Enable combat action buttons
     */
    enableCombatButtons() {
        const actionButtons = document.querySelectorAll('.combat-action-btn');
        actionButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
    }
    
    /**
     * Handle combat end based on winner
     */
    handleCombatEnd(winner) {
        console.log('Combat ended, winner:', winner);
        
        if (winner === 'party') {
            // Player victory - play victory sound and music
            if (window.engine?.audioManager) {
                window.engine.audioManager.playSoundEffect('victory');
                window.engine.audioManager.fadeToTrack('victory');
                
                // Return to dungeon music after victory fanfare
                setTimeout(() => {
                    if (window.engine?.gameState?.getState() === 'playing') {
                        window.engine.audioManager.fadeToTrack('dungeon');
                    }
                }, 5000);
            }
            
            window.engine.combatInterface.combat.endCombat();
        } else {
            // Enemy victory - play death music and trigger death screen
            if (window.engine?.audioManager) {
                window.engine.audioManager.fadeToTrack('death');
            }
            
            const casualties = window.engine.party.members.filter(member => !member.isAlive);
            
            // Force end combat without normal rewards
            window.engine.combatInterface.combat.isActive = false;
            
            // Show death screen
            this.showPartyDeathScreen(casualties);
        }
    }
    
    /**
     * Refresh combat display (for real-time HP updates during combat)
     */
    refreshCombatDisplay() {
        // Only update combat status if we're actually in combat
        if (window.engine?.gameState?.current === 'combat' && window.engine?.combatInterface?.combat?.isActive) {
            this.updateCombatStatus();
        }
        
        // Don't emit events to avoid recursion
    }
    
    /**
     * Check if it's a player turn and enable/disable actions accordingly
     */
    checkForPlayerTurn() {
        const combat = window.engine.combatInterface?.combat;
        if (!combat || !combat.isActive) {
            return;
        }
        
        const currentActor = combat.getCurrentActor();
        if (!currentActor) {
            return;
        }
        
        if (currentActor.isPlayer) {
            // Enable action buttons for player
            this.enableCombatButtons();
        } else {
            // Disable action buttons and process monster turn
            this.disableCombatButtons();
            
            // Process monster turn after a short delay
            setTimeout(() => {
                this.processMonsterTurn(currentActor.combatant);
            }, 500);
        }
    }
    
    /**
     * Hide combat interface
     */
    hideCombatInterface() {
        this.addMessage('Combat ended.', 'info');
        
        // Re-enable movement controls
        Object.values(this.controlButtons).forEach(button => {
            if (button) {
                button.disabled = false;
            }
        });
        
        // Restore 3D viewport
        this.restoreDungeonViewport();
    }
    
    /**
     * Restore 3D dungeon viewport
     */
    restoreDungeonViewport() {
        const viewport = document.getElementById('viewport');
        if (!viewport) return;
        
        // Clear combat interface and restore 3D view
        viewport.innerHTML = '';
        
        // The 3D rendering will be restored automatically by the engine's render loop
    }
    
    /**
     * Show post-combat results screen
     */
    showPostCombatResults(rewards) {
        console.log('Showing post-combat results:', rewards);
        
        // Hide combat interface first
        this.hideCombatInterface();
        
        // Create post-combat modal following town modal pattern
        this.postCombatModal = new Modal({
            className: 'modal post-combat-modal',
            closeOnEscape: false,
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.postCombatModal.setOnClose(() => {
            this.postCombatModal = null;
        });
        
        // Create the modal content with buttons
        const content = this.createPostCombatContent(rewards) + 
            '<div class="post-combat-actions">' +
            '<button id="continue-btn" class="btn btn-primary">Continue</button>' +
            '</div>';
        
        // Create and show modal
        this.postCombatModal.create(content, '🎉 Victory!');
        this.postCombatModal.show();
        
        // Add event listeners using getBody() method
        this.setupPostCombatEventListeners(this.postCombatModal.getBody(), rewards);
    }
    
    /**
     * Create post-combat results content
     */
    createPostCombatContent(rewards) {
        let content = '<div class="post-combat-results">';
        
        // Experience section
        content += '<div class="reward-section">';
        content += '<h3>💫 Experience Gained</h3>';
        content += `<p class="experience-reward">${rewards.experience} XP</p>`;
        content += '</div>';
        
        // Gold section
        if (rewards.gold > 0) {
            content += '<div class="reward-section">';
            content += '<h3>💰 Gold Found</h3>';
            content += `<p class="gold-reward">${rewards.gold} gold pieces</p>`;
            content += '</div>';
        }
        
        // Loot section
        if (rewards.loot && rewards.loot.length > 0) {
            content += '<div class="reward-section">';
            content += '<h3>🎁 Treasure Found</h3>';
            content += '<div class="loot-list">';
            
            rewards.loot.forEach(item => {
                const rarity = item.magical ? 'magical' : 'normal';
                content += `<div class="loot-item ${rarity}">`;
                content += `<span class="item-name">${item.name}</span>`;
                if (item.type) {
                    content += `<span class="item-type">${item.type}</span>`;
                }
                if (item.value) {
                    content += `<span class="item-value">${item.value} gp</span>`;
                }
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        } else {
            content += '<div class="reward-section">';
            content += '<h3>🔍 Search Results</h3>';
            content += '<p class="no-loot">No treasure found...</p>';
            content += '</div>';
        }
        
        content += '</div>';
        return content;
    }
    
    /**
     * Set up event listeners for post-combat interface
     */
    setupPostCombatEventListeners(viewport, rewards) {
        const continueBtn = viewport.querySelector('#continue-btn');
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.postCombatModal.hide();
                this.postCombatModal = null;
                
                // Apply rewards to party
                this.applyRewardsToParty(rewards);
                
                // Return to dungeon exploration
                if (window.engine) {
                    window.engine.returnToDungeon();
                }
            });
        }
    }
    
    /**
     * Apply rewards to party members
     */
    applyRewardsToParty(rewards) {
        if (!window.engine || !window.engine.party) return;
        
        const party = window.engine.party;
        const aliveMembers = party.aliveMembers;
        
        if (aliveMembers.length === 0) return;
        
        // Distribute experience among alive party members
        const expPerMember = Math.floor(rewards.experience / aliveMembers.length);
        
        aliveMembers.forEach(member => {
            member.experience = (member.experience || 0) + expPerMember;
            
            // Check for level up
            const newLevel = this.calculateLevel(member.experience);
            if (newLevel > member.level) {
                member.level = newLevel;
                this.addMessage(`${member.name} gained a level! Now level ${newLevel}`, 'level-up');
                
                // Increase HP for level up
                const hpIncrease = Random.die(member.class === 'Fighter' ? 10 : 6);
                member.maxHP += hpIncrease;
                member.currentHP += hpIncrease;
            }
            
            // Save character
            member.saveToStorage();
        });
        
        // Add gold to party
        party.gold = (party.gold || 0) + rewards.gold;
        
        // Add loot to party inventory (if inventory system exists)
        if (rewards.loot && rewards.loot.length > 0) {
            rewards.loot.forEach(item => {
                this.addMessage(`Found: ${item.name}`, 'loot');
                // TODO: Add to party inventory when inventory system is implemented
            });
        }
    }
    
    /**
     * Calculate character level based on experience
     */
    calculateLevel(experience) {
        // Simple level calculation - every 1000 XP = 1 level
        return Math.floor(experience / 1000) + 1;
    }
    
    /**
     * Process total party kill - convert unconscious to dead
     */
    processTotalPartyKill() {
        console.log('Processing total party kill - converting unconscious to dead');
        
        if (!window.engine?.party?.members) return;
        
        window.engine.party.members.forEach(member => {
            if (member.status === 'unconscious') {
                member.status = 'dead';
                member.currentHP = -10; // Ensure they're truly dead
                member.isAlive = false;
                
                // Save the updated character state
                member.saveToStorage();
                
                this.addMessage(`${member.name} has died from their injuries...`, 'death');
            }
        });
    }
    
    /**
     * Show party death screen
     */
    showPartyDeathScreen(casualties) {
        console.log('Showing party death screen:', casualties);
        
        // Check if entire party is defeated (no alive members)
        const aliveMembers = window.engine?.party?.aliveMembers || [];
        const isTotalPartyKill = aliveMembers.length === 0;
        
        if (isTotalPartyKill) {
            // Play party wipe sound effect
            if (window.engine?.audioManager) {
                window.engine.audioManager.playSoundEffect('partyWipe');
            }
            
            // In a total party kill, all unconscious characters die
            this.processTotalPartyKill();
        }
        
        // Hide combat interface first
        this.hideCombatInterface();
        
        // Create death modal following town modal pattern
        this.deathModal = new Modal({
            className: 'modal party-death-modal',
            closeOnEscape: false,
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.deathModal.setOnClose(() => {
            this.deathModal = null;
        });
        
        // Create the modal content with buttons
        const content = this.createDeathScreenContent(casualties) + 
            '<div class="death-actions">' +
            '<button id="return-to-town-btn" class="btn btn-primary">Return to Town</button>' +
            '<button id="view-status-btn" class="btn btn-secondary">View Character Status</button>' +
            '</div>';
        
        // Create and show modal
        this.deathModal.create(content, '💀 Defeat');
        this.deathModal.show();
        
        // Add event listeners using getBody() method
        this.setupDeathScreenEventListeners(this.deathModal.getBody());
    }
    
    /**
     * Set up event listeners for death screen interface
     */
    setupDeathScreenEventListeners(viewport) {
        const returnBtn = viewport.querySelector('#return-to-town-btn');
        const statusBtn = viewport.querySelector('#view-status-btn');
        
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                this.deathModal.hide();
                this.deathModal = null;
                this.returnToTownAfterDeath();
            });
        }
        
        if (statusBtn) {
            statusBtn.addEventListener('click', () => {
                this.characterUI.showCharacterRoster();
            });
        }
    }
    
    /**
     * Create death screen content
     */
    createDeathScreenContent(casualties) {
        let content = '<div class="death-screen">';
        
        // Death message
        if (casualties.length === window.engine.party.members.length) {
            content += '<h2>💀 Total Party Kill</h2>';
            content += '<div class="death-message">Your entire party has been slain in the depths of the dungeon...</div>';
        } else {
            content += '<h2>⚰️ Casualties of War</h2>';
            content += '<div class="death-message">Some of your companions have fallen in battle...</div>';
        }
        
        // Casualties section
        if (casualties && casualties.length > 0) {
            content += '<div class="death-details">';
            content += '<h3>💀 Fallen Heroes</h3>';
            content += '<div class="casualty-list">';
            
            casualties.forEach(casualty => {
                content += '<div class="casualty-item">';
                content += `<span class="casualty-name">${casualty.name}</span>`;
                content += `<span class="casualty-status">${casualty.status === 'dead' ? 'Killed' : 'Unconscious'}</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Survivors section
        const survivors = window.engine.party.aliveMembers;
        if (survivors.length > 0) {
            content += '<div class="death-details">';
            content += '<h3>🛡️ Survivors</h3>';
            content += '<div class="casualty-list">';
            
            survivors.forEach(survivor => {
                content += '<div class="casualty-item" style="border-left-color: #10b981;">';
                content += `<span class="casualty-name">${survivor.name}</span>`;
                content += `<span class="casualty-status" style="color: #10b981;">Alive (${survivor.currentHP}/${survivor.maxHP} HP)</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Instructions
        content += '<div class="death-message">';
        if (survivors.length > 0) {
            content += 'The surviving party members retreat to town for healing and rest.';
        } else {
            content += 'The adventure ends here. Create new characters to continue exploring.';
        }
        content += '</div>';
        
        content += '</div>';
        return content;
    }
    
    /**
     * Return to town after party death
     */
    returnToTownAfterDeath() {
        console.log('Returning to town after death...');
        
        if (window.engine) {
            // First exit combat (combat → playing)
            const success1 = window.engine.gameState.setState('playing');
            console.log('Combat to playing transition:', success1);
            
            // Add small delay to ensure state change is processed
            setTimeout(() => {
                // Then exit dungeon and return to town (playing → town)
                const success2 = window.engine.gameState.setState('town');
                console.log('Playing to town transition:', success2);
                
                if (success2) {
                    // Show town interface
                    this.showTown(window.engine.party);
                    
                    // Add dramatic message about the failed expedition
                    const aliveMembers = window.engine.party.aliveMembers;
                    if (aliveMembers.length === 0) {
                        this.addMessage('Word reaches the town of a failed expedition. No survivors returned...', 'death');
                    } else {
                        this.addMessage('The survivors return to town, bearing news of their fallen comrades...', 'system');
                    }
                    
                    // Save all character states
                    window.engine.party.members.forEach(member => {
                        member.saveToStorage();
                    });
                } else {
                    console.error('Failed to transition to town state');
                }
            }, 50);
        }
    }
    
    /**
     * Show game menu
     */
    showGameMenu() {
        // Create a simple menu modal
        const modal = document.createElement('div');
        modal.className = 'modal game-menu-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Game Menu</h2>
                <button id="resume-game">Resume Game</button>
                <button id="save-game">Save Game</button>
                <button id="load-game">Load Game</button>
                <button id="settings">Settings</button>
                <button id="new-game">New Game</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#resume-game').addEventListener('click', () => {
            this.hideGameMenu();
            this.eventSystem.emit('game-state-change', 'playing');
        });
        
        modal.querySelector('#save-game').addEventListener('click', () => {
            this.eventSystem.emit('save-game');
            this.addMessage('Game saved!');
        });
        
        modal.querySelector('#new-game').addEventListener('click', () => {
            // Use the game's modal system instead of browser confirm
            this.showNewGameConfirmation();
        });
        
        this.modals.gameMenu = modal;
    }
    
    /**
     * Hide game menu
     */
    hideGameMenu() {
        if (this.modals.gameMenu) {
            this.modals.gameMenu.remove();
            delete this.modals.gameMenu;
        }
    }
    
    /**
     * Show new game confirmation modal
     */
    showNewGameConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>New Game</h3>
                <p>Start a new game? This will lose your current progress.</p>
                <div class="modal-buttons">
                    <button id="cancel-new-game" class="btn-secondary">Cancel</button>
                    <button id="confirm-new-game" class="btn-primary">New Game</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#cancel-new-game').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#confirm-new-game').addEventListener('click', () => {
            modal.remove();
            this.hideGameMenu();
            this.eventSystem.emit('game-state-change', 'character-creation');
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * Update UI (called each frame)
     */
    update(deltaTime) {
        // Update any animated UI elements here
        // For now, this is a placeholder
    }
    
    /**
     * Enable or disable controls
     */
    setControlsEnabled(enabled) {
        Object.values(this.controlButtons).forEach(button => {
            if (button) {
                button.disabled = !enabled;
            }
        });
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen(message = 'Loading...') {
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-title">DESCENT: CYBER WIZARDRY</div>
            <div class="loading-subtitle">${message}</div>
            <div class="loading-progress">
                <div class="loading-bar"></div>
            </div>
        `;
        
        document.body.appendChild(loadingScreen);
        return loadingScreen;
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.remove();
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            z-index: 1000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }
    
    /**
     * Show dungeon exploration interface
     */
    showDungeonInterface() {
        console.log('UI.showDungeonInterface() called');
        
        // Ensure game panels are visible
        const gameContainer = document.getElementById('game-container');
        const uiOverlay = document.getElementById('ui-overlay');
        
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        if (uiOverlay) {
            uiOverlay.style.display = 'grid';
        }
        
        // Make sure viewport is visible
        const viewport = document.getElementById('viewport');
        if (viewport) {
            viewport.style.display = 'block';
        }
        
        // Position canvas inside viewport
        const canvas = document.getElementById('game-canvas');
        if (canvas && viewport) {
            viewport.appendChild(canvas);
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '1';
        }
        
        // Show movement controls
        const movementControls = document.getElementById('movement-controls');
        if (movementControls) {
            movementControls.style.display = 'block';
        }
        
        // Show action controls
        const actionControls = document.getElementById('action-controls');
        if (actionControls) {
            actionControls.style.display = 'block';
        }
        
        console.log('Dungeon interface elements made visible');
    }
    
    /**
     * Enable movement controls
     */
    enableMovementControls() {
        console.log('UI.enableMovementControls() called');
        
        // Enable all movement buttons
        const movementButtons = document.querySelectorAll('#movement-controls button');
        movementButtons.forEach(button => {
            button.disabled = false;
        });
        
        // Enable action buttons
        const actionButtons = document.querySelectorAll('#action-controls button');
        actionButtons.forEach(button => {
            button.disabled = false;
        });
        
        console.log('Movement and action controls enabled');
    }
    
    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        if (window.engine && window.engine.audioManager) {
            const isEnabled = window.engine.audioManager.toggle();
            const button = document.getElementById('toggle-audio');
            
            if (button) {
                button.textContent = isEnabled ? '🎵' : '🔇';
                button.title = isEnabled ? 'Turn Music Off' : 'Turn Music On';
            }
            
            const status = isEnabled ? 'enabled' : 'disabled';
            this.addMessage(`Music ${status}`, 'system');
            
            // Also refresh tracks when toggling to ensure new compositions are loaded
            if (isEnabled) {
                window.engine.audioManager.refreshTracks();
            }
        }
    }
}