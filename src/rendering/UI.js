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
        
        // Keyboard controls
        this.eventSystem.on('keydown', (event) => {
            this.handleKeydown(event);
        });
        
        // Message system
        this.eventSystem.on('show-message', (data) => {
            this.addMessage(data.text, data.type);
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
        const timestamp = new Date().toLocaleTimeString();
        const message = {
            text: text,
            type: type,
            timestamp: timestamp
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
            messageElement.innerHTML = `<span class="timestamp">${message.timestamp}</span> ${message.text}`;
            
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
}