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
            
            // Apply TextManager to existing UI elements
            this.applyGlobalTextManager();
            
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('UI initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize UI:', error);
        }
    }
    
    /**
     * Apply TextManager to global UI elements with data-text-key attributes
     */
    applyGlobalTextManager() {
        if (typeof TextManager === 'undefined') {
            console.warn('TextManager not available during UI initialization');
            return;
        }
        
        // Apply TextManager to all elements with data-text-key attributes
        const textElements = document.querySelectorAll('[data-text-key]');
        textElements.forEach(element => {
            const textKey = element.getAttribute('data-text-key');
            if (textKey) {
                TextManager.applyToElement(element, textKey);
            }
        });
        
        console.log(`Applied TextManager to ${textElements.length} elements`);
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
                    <h2 class="town-name" data-text-key="town">Terminal Hub</h2>
                    <p class="town-description" data-text-key="town_description">The central access node of the grid, where agents prepare for their infiltration into the hostile data maze.</p>
                    
                    <div class="town-locations-grid">
                        <div class="location-card ${hasActiveParty ? 'enabled' : 'primary'}">
                            <button id="training-grounds-btn" class="location-btn primary">
                                <div class="location-icon">⚔️</div>
                                <div class="location-info">
                                    <h3>Training Grounds</h3>
                                    <p data-text-key="training_description">Create and manage your strike team of agents</p>
                                    <span class="location-status">${hasActiveParty ? 'Manage Strike Team' : 'Initialize Strike Team'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card ${hasActiveParty ? 'enabled' : 'disabled'}">
                            <button id="dungeon-entrance-btn" class="location-btn ${hasActiveParty ? 'enabled' : 'disabled'}" ${hasActiveParty ? '' : 'disabled'}>
                                <div class="location-icon">🏰</div>
                                <div class="location-info">
                                    <h3 data-text-key="dungeon">Grid Access Point</h3>
                                    <p data-text-key="dungeon_description">Enter the corrupted data maze</p>
                                    <span class="location-status">${hasActiveParty ? 'Enter Grid' : 'Strike Team Required'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">🏪</div>
                                <div class="location-info">
                                    <h3>Data Exchange</h3>
                                    <p>Trade upgrades and system enhancements</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">⛪</div>
                                <div class="location-info">
                                    <h3>Restoration Center</h3>
                                    <p>Repair system damage and restore corrupted agents</p>
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
                        <span class="status-label" data-text-key="party">Strike Team</span><span class="status-label"> Status:</span>
                        <span class="status-value ${hasActiveParty ? 'active' : 'inactive'}">${partyInfo}</span>
                    </div>
                    <div class="status-section">
                        <span class="status-label">Last Save:</span>
                        <span class="status-value">${lastSave}</span>
                    </div>
                    <div class="status-section mode-toggle-section">
                        <span class="status-label">Interface Mode:</span>
                        <button id="terminology-mode-toggle" class="mode-toggle-btn">
                            <span id="current-mode-display">Cyber</span>
                            <span class="toggle-icon">⚡</span>
                        </button>
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
        
        // Apply TextManager to town modal elements
        this.applyGlobalTextManager();
        
        // Add event listeners
        this.setupTownCenterEventListeners(this.townModal.getBody());
    }
    
    /**
     * Set up event listeners for town center interface
     */
    setupTownCenterEventListeners(viewport) {
        const trainingBtn = viewport.querySelector('#training-grounds-btn');
        const dungeonBtn = viewport.querySelector('#dungeon-entrance-btn');
        const modeToggleBtn = viewport.querySelector('#terminology-mode-toggle');
        
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
        
        if (modeToggleBtn) {
            // Update initial display
            this.updateModeToggleDisplay(modeToggleBtn);
            
            modeToggleBtn.addEventListener('click', () => {
                this.toggleTerminologyMode();
            });
        }
    }
    
    /**
     * Toggle between Fantasy and Cyber terminology modes
     */
    toggleTerminologyMode() {
        if (typeof TextManager === 'undefined') {
            console.warn('TextManager not available for mode toggle');
            return;
        }
        
        // Toggle the mode
        TextManager.toggleMode();
        
        // Update the toggle button display
        const modeToggleBtn = document.querySelector('#terminology-mode-toggle');
        if (modeToggleBtn) {
            this.updateModeToggleDisplay(modeToggleBtn);
        }
        
        // Show feedback message
        const newMode = TextManager.getMode();
        const modeLabel = newMode === 'cyber' ? 'Cyber' : 'Fantasy';
        this.addMessage(`Interface mode switched to ${modeLabel}`, 'info');
        
        console.log(`Terminology mode switched to: ${newMode}`);
    }
    
    /**
     * Update mode toggle button display
     */
    updateModeToggleDisplay(toggleBtn) {
        if (!toggleBtn || typeof TextManager === 'undefined') return;
        
        const currentMode = TextManager.getMode();
        const modeDisplay = toggleBtn.querySelector('#current-mode-display');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (modeDisplay) {
            modeDisplay.textContent = currentMode === 'cyber' ? 'Cyber' : 'Fantasy';
        }
        
        if (toggleIcon) {
            toggleIcon.textContent = currentMode === 'cyber' ? '⚡' : '🏰';
        }
        
        // Update button styling based on mode
        toggleBtn.className = `mode-toggle-btn ${currentMode}-mode`;
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
            { 
                key: 'weapon', 
                name: 'Weapon', 
                cyberName: 'Attack Algorithm',
                icon: '⚔️',
                cyberIcon: '🔸'
            },
            { 
                key: 'armor', 
                name: 'Armor', 
                cyberName: 'Defense Protocol',
                icon: '🛡️',
                cyberIcon: '🔷'
            },
            { 
                key: 'shield', 
                name: 'Shield', 
                cyberName: 'Firewall Module',
                icon: '🔰',
                cyberIcon: '🔶'
            },
            { 
                key: 'accessory', 
                name: 'Accessory', 
                cyberName: 'Enhancement Chip',
                icon: '💍',
                cyberIcon: '🔹'
            }
        ];
        
        return slots.map(slot => {
            const item = equipment[slot.key];
            const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
            
            // Get contextual item name using TerminologyUtils if available
            let itemName = 'None';
            let digitalInfo = '';
            
            if (item) {
                if (typeof item === 'string') {
                    itemName = item;
                } else if (typeof TerminologyUtils !== 'undefined') {
                    itemName = TerminologyUtils.getContextualName(item);
                } else {
                    itemName = item.name || 'Unknown';
                }
                
                // Add digital classification in cyber mode
                if (isCyberMode && typeof item === 'object') {
                    if (item.digitalClassification) {
                        digitalInfo = `<span class="digital-classification">[${item.digitalClassification}]</span>`;
                    } else if (item.programClass) {
                        digitalInfo = `<span class="program-class">[${item.programClass}]</span>`;
                    } else if (item.encryptionLevel) {
                        digitalInfo = `<span class="encryption-level">[${item.encryptionLevel}]</span>`;
                    }
                }
            } else {
                itemName = isCyberMode ? '(Uninstalled)' : 'None';
            }
            
            // Get contextual slot name and icon
            const slotName = isCyberMode ? slot.cyberName : slot.name;
            const slotIcon = isCyberMode ? slot.cyberIcon : slot.icon;
            
            return `
                <div class="equipment-item cyber-enhanced">
                    <div class="equipment-slot">
                        <span class="equipment-icon">${slotIcon}</span>
                        ${slotName}:
                    </div>
                    <div class="equipment-details">
                        <div class="equipment-name" data-cyber-enhanced="${isCyberMode}">${itemName}</div>
                        ${digitalInfo}
                    </div>
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
        const isCyberMode = typeof TextManager !== 'undefined' && TextManager.isCyberMode();
        
        // Get contextual "no spells" message
        const noSpellsMessage = isCyberMode ? 'No subroutines loaded' : 'No spells memorized';
        
        if (!hasSpells) {
            return `<div class="no-spells cyber-enhanced">${noSpellsMessage}</div>`;
        }
        
        // Get contextual level label
        const levelLabel = isCyberMode ? 'Tier' : 'Level';
        
        return Object.entries(memorizedSpells).map(([level, spells]) => {
            if (!spells || spells.length === 0) return '';
            
            return `
                <div class="spell-level program-tier">
                    <h4 class="tier-header">
                        <span class="tier-icon">${isCyberMode ? '📊' : '🔮'}</span>
                        ${levelLabel} ${level}
                    </h4>
                    <div class="spell-list program-suite">
                        ${spells.map(spell => {
                            // Get contextual spell name
                            let spellName = 'Unknown';
                            let digitalInfo = '';
                            
                            if (typeof spell === 'string') {
                                spellName = spell;
                            } else if (typeof TerminologyUtils !== 'undefined') {
                                spellName = TerminologyUtils.getContextualName(spell);
                            } else {
                                spellName = spell.name || 'Unknown Spell';
                            }
                            
                            // Add program type information in cyber mode
                            if (isCyberMode && typeof spell === 'object') {
                                if (spell.programType) {
                                    digitalInfo = `<span class="program-type">[${spell.programType}]</span>`;
                                } else if (spell.executionMethod) {
                                    digitalInfo = `<span class="execution-method">[${spell.executionMethod}]</span>`;
                                } else if (spell.algorithmClass) {
                                    digitalInfo = `<span class="algorithm-class">[${spell.algorithmClass}]</span>`;
                                }
                            }
                            
                            return `
                                <div class="spell-item cyber-enhanced" data-cyber-enhanced="${isCyberMode}">
                                    <div class="spell-name">${spellName}</div>
                                    ${digitalInfo}
                                </div>
                            `;
                        }).join('')}
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
        
        // Clear viewport and create combat UI with cyber terminology
        viewport.innerHTML = `
            <div id="combat-interface" class="combat-interface">
                <div class="combat-header">
                    <h2>Grid Engagement</h2>
                    <div class="encounter-message" id="encounter-message"></div>
                </div>
                
                <!-- Wave Indicator Panel -->
                <div class="combat-wave-indicator" id="combat-wave-indicator">
                    <div class="wave-display" id="wave-display">Connecting...</div>
                </div>
                
                <div class="combat-body">
                    <div class="combat-main-area">
                        <!-- Monster Visual Panel -->
                        <div class="combat-monster-visual" id="combat-monster-visual">
                            <canvas id="monster-portrait-canvas" width="600" height="600" style="display: none;"></canvas>
                            <div class="monster-ascii-art" id="monster-ascii-art"></div>
                            <div class="monster-name" id="monster-name"></div>
                            <div class="monster-status" id="monster-status"></div>
                        </div>
                        
                        <!-- Context Action Box -->
                        <div class="combat-actions-context" id="combat-actions-context">
                            <div class="action-context-header" id="action-context-header">
                                <h3>Select Operation:</h3>
                            </div>
                            <div class="action-buttons" id="action-buttons">
                                <button id="combat-attack" class="combat-action-btn" data-action="attack">
                                    <span class="action-number">1</span>
                                    <span class="action-text" data-text-key="combat_fight">⚔️ Execute</span>
                                </button>
                                <button id="combat-defend" class="combat-action-btn" data-action="defend">
                                    <span class="action-number">2</span>
                                    <span class="action-text" data-text-key="combat_defend">🛡️ Firewall</span>
                                </button>
                                <button id="combat-cast-spell" class="combat-action-btn" data-action="cast-spell">
                                    <span class="action-number">3</span>
                                    <span class="action-text" data-text-key="combat_spell">🔮 Run Program</span>
                                </button>
                                <button id="combat-use-item" class="combat-action-btn" data-action="use-item">
                                    <span class="action-number">4</span>
                                    <span class="action-text" data-text-key="combat_item">💊 Use Data</span>
                                </button>
                                <button id="combat-run" class="combat-action-btn" data-action="run">
                                    <span class="action-number">5</span>
                                    <span class="action-text" data-text-key="combat_run">🏃 Disconnect</span>
                                </button>
                            </div>
                            <div class="action-enemy-turn" id="action-enemy-turn" style="display: none;">
                                <div class="enemy-turn-info" id="enemy-turn-info">
                                    <h3>Hostile Process Active</h3>
                                    <div id="enemy-action-result"></div>
                                    <button id="combat-continue" class="combat-action-btn continue-btn">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Apply TextManager to dynamic text elements
        this.applyCombatTextManager();
        
        // Add event listeners for combat actions
        this.setupCombatEventListeners();
        
        // Update combat status with current data
        this.updateCombatStatus();
    }
    
    /**
     * Apply TextManager to combat interface elements
     */
    applyCombatTextManager() {
        // Apply TextManager to elements with data-text-key attributes
        const textElements = document.querySelectorAll('[data-text-key]');
        textElements.forEach(element => {
            const textKey = element.getAttribute('data-text-key');
            if (textKey && typeof TextManager !== 'undefined') {
                TextManager.applyToElement(element, textKey);
            }
        });
    }
    
    /**
     * Setup combat event listeners
     */
    setupCombatEventListeners() {
        const actionButtons = document.querySelectorAll('.combat-action-btn');
        
        // Mouse click handlers for action buttons
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) {
                    this.handleCombatAction(action);
                } else if (e.currentTarget.id === 'combat-continue') {
                    this.handleContinueButton();
                }
            });
        });
        
        // Specific handler for continue button
        const continueButton = document.getElementById('combat-continue');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.handleContinueButton();
            });
        }
        
        // Keyboard handlers (1-5 keys and Enter for continue)
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
                    case 'Enter':
                        // Handle continue button with Enter key
                        const enemyTurnDiv = document.getElementById('action-enemy-turn');
                        if (enemyTurnDiv && enemyTurnDiv.style.display !== 'none') {
                            e.preventDefault();
                            this.handleContinueButton();
                            return;
                        }
                        break;
                }
                
                if (action) {
                    e.preventDefault();
                    this.handleCombatAction(action);
                }
            }
        });
    }
    
    /**
     * Handle continue button click during enemy turns
     */
    handleContinueButton() {
        console.log('Continue button clicked');
        
        // Play button click sound
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('buttonClick');
        }
        
        // Simply update combat status and check for next turn
        // The combat system automatically advances after enemy actions
        this.updateCombatStatus();
        this.checkForPlayerTurn();
    }
    
    /**
     * Update combat status display
     */
    updateCombatStatus() {
        console.log('Updating combat status...');
        
        // Update party status
        this.updatePartyStatus();
        
        // Update wave indicator and monster visual
        this.updateWaveIndicator();
        this.updateMonsterVisual();
        
        // Update action context
        this.updateActionContext();
    }
    
    /**
     * Update party status in new layout
     */
    updatePartyStatus() {
        const partyStatusDiv = document.getElementById('party-combat-status');
        
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
    }
    
    /**
     * Update wave indicator panel
     */
    updateWaveIndicator() {
        const waveDisplayDiv = document.getElementById('wave-display');
        
        if (waveDisplayDiv && window.engine && window.engine.combatInterface) {
            const combat = window.engine.combatInterface.combat;
            
            if (combat && combat.isActive) {
                try {
                    // Get wave information
                    const waveInfo = combat.getCurrentEnemyPartyInfo();
                    const allPartyMembers = window.engine.party.members || [];
                    const enemies = combat.combatants.filter(c => !allPartyMembers.includes(c));
                    
                    if (enemies.length > 0) {
                        const enemyCount = enemies.length;
                        const enemyType = enemyCount === 1 ? enemies[0].name : 'Enemies';
                        const waveText = waveInfo ? ` - Wave ${waveInfo.currentWave} of ${waveInfo.totalWaves}` : '';
                        
                        waveDisplayDiv.textContent = `${enemyCount} ${enemyType}${waveText}`;
                    } else {
                        waveDisplayDiv.textContent = typeof TextManager !== 'undefined' ? 
                            TextManager.getText('no_enemies', 'No Enemies') : 'No Enemies';
                    }
                } catch (error) {
                    console.log('Error updating wave indicator:', error);
                    waveDisplayDiv.textContent = typeof TextManager !== 'undefined' ? 
                        TextManager.getText('combat_active', 'Combat Active') : 'Combat Active';
                }
            } else {
                waveDisplayDiv.textContent = typeof TextManager !== 'undefined' ? 
                    TextManager.getText('loading_combat', 'Loading Combat...') : 'Loading Combat...';
                setTimeout(() => this.updateCombatStatus(), 500);
            }
        }
    }
    
    /**
     * Update monster visual panel
     */
    updateMonsterVisual() {
        const monsterCanvas = document.getElementById('monster-portrait-canvas');
        const monsterAsciiDiv = document.getElementById('monster-ascii-art');
        const monsterNameDiv = document.getElementById('monster-name');
        const monsterStatusDiv = document.getElementById('monster-status');
        
        if (monsterNameDiv && monsterStatusDiv && 
            window.engine && window.engine.combatInterface) {
            
            const combat = window.engine.combatInterface.combat;
            
            if (combat && combat.isActive) {
                try {
                    // Get current enemies
                    const allPartyMembers = window.engine.party.members || [];
                    const enemies = combat.combatants.filter(c => !allPartyMembers.includes(c));
                    
                    if (enemies.length > 0) {
                        const primaryEnemy = enemies[0]; // Show first enemy as primary
                        
                        // Try to use portrait rendering first
                        if (monsterCanvas && primaryEnemy.portraitModel) {
                            // Use 3D portrait rendering
                            monsterCanvas.style.display = 'block';
                            if (monsterAsciiDiv) monsterAsciiDiv.style.display = 'none';
                            
                            // Initialize portrait renderer if needed
                            if (!this.portraitRenderer) {
                                const ctx = monsterCanvas.getContext('2d');
                                this.portraitRenderer = new MonsterPortraitRenderer(monsterCanvas, ctx);
                            }
                            
                            // Render the portrait
                            this.portraitRenderer.renderMonsterPortrait(primaryEnemy, {
                                healthRatio: primaryEnemy.currentHP / primaryEnemy.maxHP,
                                status: primaryEnemy.status,
                                recentDamage: primaryEnemy.recentDamage || false
                            });
                        } else {
                            // Fallback to ASCII art
                            if (monsterCanvas) monsterCanvas.style.display = 'none';
                            if (monsterAsciiDiv) {
                                monsterAsciiDiv.style.display = 'block';
                                monsterAsciiDiv.textContent = primaryEnemy.asciiArt || '  👹\n /|||\\\n  /\\  ';
                            }
                        }
                        
                        // Display monster name with cyber terminology support
                        if (typeof TerminologyUtils !== 'undefined') {
                            // Clear existing content
                            monsterNameDiv.innerHTML = '';
                            
                            // Add primary name
                            const nameText = document.createTextNode(TerminologyUtils.getContextualName(primaryEnemy));
                            monsterNameDiv.appendChild(nameText);
                            
                            // Add classification info for cyber mode
                            if (typeof TextManager !== 'undefined' && TextManager.isCyberMode() && primaryEnemy.digitalClassification) {
                                const classificationSpan = document.createElement('span');
                                classificationSpan.className = 'monster-classification';
                                classificationSpan.textContent = ` [${primaryEnemy.digitalClassification}]`;
                                classificationSpan.style.fontSize = '0.8em';
                                classificationSpan.style.color = '#00ffff';
                                monsterNameDiv.appendChild(classificationSpan);
                            }
                        } else {
                            monsterNameDiv.textContent = primaryEnemy.name;
                        }
                        
                        // Display monster status
                        const status = primaryEnemy.isUnconscious ? 'Unconscious' : 
                                     primaryEnemy.isDead ? 'Dead' : 'Active';
                        const hpInfo = `HP: ${primaryEnemy.currentHP}/${primaryEnemy.maxHP}`;
                        monsterStatusDiv.innerHTML = `${status}<br>${hpInfo}`;
                    } else {
                        // No enemies - show clear state
                        if (monsterCanvas) monsterCanvas.style.display = 'none';
                        if (monsterAsciiDiv) {
                            monsterAsciiDiv.style.display = 'block';
                            monsterAsciiDiv.textContent = '💀\n /|||\\\n  /\\  ';
                        }
                        monsterNameDiv.textContent = typeof TextManager !== 'undefined' ? 
                            TextManager.getText('no_enemies', 'No Enemies') : 'No Enemies';
                        monsterStatusDiv.textContent = typeof TextManager !== 'undefined' ? 
                            TextManager.getText('wave_clear', 'Wave Clear') : 'Wave Clear';
                    }
                } catch (error) {
                    console.log('Error updating monster visual:', error);
                    // Error state - show ASCII fallback
                    if (monsterCanvas) monsterCanvas.style.display = 'none';
                    if (monsterAsciiDiv) {
                        monsterAsciiDiv.style.display = 'block';
                        monsterAsciiDiv.textContent = '⚔️\n /|||\\\n  /\\  ';
                    }
                    monsterNameDiv.textContent = 'Combat Error';
                    monsterStatusDiv.textContent = 'Loading...';
                }
            } else {
                // Combat not active - show loading state
                if (monsterCanvas) monsterCanvas.style.display = 'none';
                if (monsterAsciiDiv) {
                    monsterAsciiDiv.style.display = 'block';
                    monsterAsciiDiv.textContent = '⚔️\n /|||\\\n  /\\  ';
                }
                monsterNameDiv.textContent = 'Combat Loading';
                monsterStatusDiv.textContent = 'Preparing...';
            }
        }
    }
    
    /**
     * Update action context based on turn state
     */
    updateActionContext() {
        const actionButtons = document.getElementById('action-buttons');
        const enemyTurnDiv = document.getElementById('action-enemy-turn');
        const actionHeader = document.getElementById('action-context-header');
        
        if (!actionButtons || !enemyTurnDiv || !actionHeader) return;
        
        const combat = window.engine.combatInterface?.combat;
        if (!combat || !combat.isActive) {
            return;
        }
        
        try {
            const currentActor = combat.getCurrentActor();
            if (!currentActor) {
                return;
            }
            
            if (currentActor.isPlayer) {
                // Player turn - show action buttons
                actionButtons.style.display = 'flex';
                enemyTurnDiv.style.display = 'none';
                actionHeader.querySelector('h3').textContent = `${currentActor.combatant.name}'s Options`;
            } else {
                // Enemy turn - show enemy turn info
                actionButtons.style.display = 'none';
                enemyTurnDiv.style.display = 'block';
                actionHeader.querySelector('h3').textContent = 'Enemy Turn';
            }
        } catch (error) {
            console.log('Error updating action context:', error);
            // Default to showing player actions
            actionButtons.style.display = 'flex';
            enemyTurnDiv.style.display = 'none';
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
        
        // Show enemy turn interface immediately
        this.showEnemyTurnInterface(monster);
        
        // Process AI turn after a short delay
        setTimeout(() => {
            // Use the combat interface's AI processing
            const aiResult = window.engine.combatInterface.processAITurn(monster);
            
            if (aiResult && typeof aiResult === 'object') {
                // Check if combat ended from AI action
                if (aiResult.combatEnded) {
                    this.handleCombatEnd(aiResult.winner);
                    return;
                }
                
                // Show the result of the enemy action and enable continue
                this.showEnemyActionResult(monster, aiResult);
                
            } else {
                console.error('AI processing returned invalid result:', aiResult);
                this.addMessage('Monster AI failed to act!', 'error');
                this.showEnemyActionResult(monster, { action: 'failed', result: 'Monster AI failed to act!' });
            }
        }, 1000);
    }
    
    /**
     * Show enemy turn interface
     */
    showEnemyTurnInterface(monster) {
        const actionButtons = document.getElementById('action-buttons');
        const enemyTurnDiv = document.getElementById('action-enemy-turn');
        const actionHeader = document.getElementById('action-context-header');
        const enemyActionResult = document.getElementById('enemy-action-result');
        const continueButton = document.getElementById('combat-continue');
        
        if (actionButtons && enemyTurnDiv && actionHeader) {
            // Hide player actions, show enemy turn
            actionButtons.style.display = 'none';
            enemyTurnDiv.style.display = 'block';
            actionHeader.querySelector('h3').textContent = 'Enemy Turn';
            
            // Show "processing" message
            if (enemyActionResult) {
                enemyActionResult.innerHTML = `<div class="enemy-action-processing">${monster.name} is preparing to act...</div>`;
            }
            
            // Disable continue button until action is complete
            if (continueButton) {
                continueButton.disabled = true;
                continueButton.style.opacity = '0.5';
            }
        }
    }
    
    /**
     * Show enemy action result and enable continue
     */
    showEnemyActionResult(monster, aiResult) {
        const enemyActionResult = document.getElementById('enemy-action-result');
        const continueButton = document.getElementById('combat-continue');
        
        if (enemyActionResult) {
            let resultMessage = '';
            
            if (aiResult.action) {
                switch(aiResult.action) {
                    case 'attack':
                        const target = aiResult.target ? aiResult.target.name : 'party member';
                        const damage = aiResult.damage || 0;
                        resultMessage = `${monster.name} attacks ${target} for ${damage} damage!`;
                        break;
                    case 'defend':
                        resultMessage = `${monster.name} takes a defensive stance.`;
                        break;
                    case 'cast-spell':
                        resultMessage = `${monster.name} casts a spell!`;
                        break;
                    default:
                        resultMessage = `${monster.name} ${aiResult.action || 'acts'}.`;
                }
            } else {
                resultMessage = `${monster.name} takes an action.`;
            }
            
            enemyActionResult.innerHTML = `
                <div class="enemy-action-description">${resultMessage}</div>
                ${aiResult.result ? `<div class="enemy-action-details">${aiResult.result}</div>` : ''}
            `;
        }
        
        // Enable continue button
        if (continueButton) {
            continueButton.disabled = false;
            continueButton.style.opacity = '1';
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
            
            // Let combat system handle victory and rewards
            window.engine.combatInterface.combat.endCombat();
            
        } else {
            // Enemy victory - check if any party members survived
            const aliveMembers = window.engine.party.aliveMembers || [];
            const casualties = window.engine.party.members.filter(member => !member.isAlive);
            
            if (aliveMembers.length === 0) {
                // Total party kill - play death music and show death screen
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('death');
                }
                
                // Force end combat without rewards
                window.engine.combatInterface.combat.isActive = false;
                
                // Show total party kill screen
                this.showPartyDeathScreen(casualties);
            } else {
                // Some survived - treat as casualty retreat, should show victory screen with casualties
                console.log('Party has casualties but survivors - treating as victory with casualties');
                
                // Let combat system handle as victory with casualties
                window.engine.combatInterface.combat.endCombat();
            }
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
        
        // Ensure canvas is properly repositioned in viewport
        const canvas = document.getElementById('game-canvas');
        if (canvas && viewport) {
            viewport.appendChild(canvas);
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '1';
            canvas.style.display = 'block';
        }
        
        console.log('Dungeon viewport restored with canvas repositioned');
    }
    
    /**
     * Show post-combat results screen
     */
    showPostCombatResults(rewards) {
        console.log('Showing post-combat results:', rewards);
        
        // Hide combat interface first
        this.hideCombatInterface();
        
        // Check for casualties in victory
        const aliveMembers = window.engine?.party?.aliveMembers || [];
        const allMembers = window.engine?.party?.members || [];
        const casualties = allMembers.filter(member => !member.isAlive);
        
        console.log('Post-combat analysis:', {
            aliveMembers: aliveMembers.length,
            casualties: casualties.length,
            allMembers: allMembers.map(m => ({ 
                name: m.name, 
                isAlive: m.isAlive, 
                status: m.status, 
                currentHP: m.currentHP,
                maxHP: m.maxHP 
            })),
            casualtyDetails: casualties.map(c => ({ 
                name: c.name, 
                isAlive: c.isAlive, 
                status: c.status,
                currentHP: c.currentHP,
                isDead: c.isDead, 
                isUnconscious: c.isUnconscious 
            }))
        });
        
        // If there are casualties, show victory with casualties screen instead
        if (casualties.length > 0) {
            this.showVictoryWithCasualtiesScreen(casualties, aliveMembers, rewards);
            return;
        }
        
        // No casualties - show normal victory screen
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
            
            // Show actual defeat screen
            this.showTotalPartyKillScreen(casualties);
        } else {
            // Survivors exist - this should be a victory with casualties screen instead
            console.log('Party has survivors - showing victory with casualties instead of defeat');
            
            // Calculate rewards and show victory screen with casualties
            const rewards = window.engine.combatInterface.combat.getLastCombatRewards() || {
                experience: 0,
                loot: [],
                gold: 0
            };
            
            this.showVictoryWithCasualtiesScreen(casualties, aliveMembers, rewards);
        }
    }
    
    /**
     * Show total party kill screen (actual defeat)
     */
    showTotalPartyKillScreen(casualties) {
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
        const content = this.createTotalPartyKillContent(casualties) + 
            '<div class="death-actions">' +
            '<button id="return-to-town-btn" class="btn btn-primary">Return to Town</button>' +
            '<button id="view-status-btn" class="btn btn-secondary">View Character Status</button>' +
            '</div>';
        
        // Create and show modal
        this.deathModal.create(content, '💀 Total Party Kill');
        this.deathModal.show();
        
        // Add event listeners using getBody() method
        this.setupDeathScreenEventListeners(this.deathModal.getBody());
    }
    
    /**
     * Show victory with casualties screen
     */
    showVictoryWithCasualtiesScreen(casualties, survivors, rewards) {
        console.log('Showing victory with casualties:', { 
            casualties: casualties.map(c => ({ name: c.name, status: c.status, isAlive: c.isAlive, hp: c.currentHP })), 
            survivors: survivors.map(s => ({ name: s.name, status: s.status, isAlive: s.isAlive, hp: s.currentHP })), 
            rewards 
        });
        
        // Hide combat interface first
        this.hideCombatInterface();
        
        // Create victory modal following post-combat pattern
        this.postCombatModal = new Modal({
            className: 'modal post-combat-modal victory-with-casualties',
            closeOnEscape: false,
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.postCombatModal.setOnClose(() => {
            this.postCombatModal = null;
        });
        
        // Create the modal content with casualties and rewards
        const content = this.createVictoryWithCasualtiesContent(casualties, survivors, rewards) + 
            '<div class="post-combat-actions">' +
            '<button id="continue-btn" class="btn btn-primary">Continue to Dungeon</button>' +
            '<button id="view-status-btn" class="btn btn-secondary">View Character Status</button>' +
            '</div>';
        
        // Create and show modal
        this.postCombatModal.create(content, '⚔️ Victory with Casualties');
        this.postCombatModal.show();
        
        // Add event listeners using getBody() method
        this.setupVictoryWithCasualtiesEventListeners(this.postCombatModal.getBody(), rewards);
    }
    
    /**
     * Create victory with casualties content
     */
    createVictoryWithCasualtiesContent(casualties, survivors, rewards) {
        let content = '<div class="victory-with-casualties">';
        
        // Victory message
        content += '<h2>⚔️ Victory with Casualties</h2>';
        content += '<div class="victory-message">You have emerged victorious, but at a cost...</div>';
        
        // Casualties of War section (matching defeat screen layout)
        content += '<div class="casualties-of-war">';
        content += '<div class="casualties-grid">';
        
        // Survivors section (left side)
        if (survivors && survivors.length > 0) {
            content += '<div class="survivors-section">';
            content += '<h3>🛡️ Survivors</h3>';
            content += '<div class="survivor-list">';
            
            survivors.forEach(survivor => {
                content += '<div class="survivor-item">';
                content += `<span class="survivor-name">${survivor.name}</span>`;
                content += `<span class="survivor-status">Alive (${survivor.currentHP}/${survivor.maxHP} HP)</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Casualties section (right side)
        if (casualties && casualties.length > 0) {
            content += '<div class="casualties-section">';
            content += '<h3>💔 Fallen Companions</h3>';
            content += '<div class="casualty-list">';
            
            casualties.forEach(casualty => {
                const status = casualty.isDead ? 'Killed' : (casualty.isUnconscious ? 'Unconscious' : 'Injured');
                content += '<div class="casualty-item">';
                content += `<span class="casualty-name">${casualty.name}</span>`;
                content += `<span class="casualty-status">${status}</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        content += '</div>'; // Close casualties-grid
        content += '</div>'; // Close casualties-of-war
        
        // Rewards section (below casualties)
        if (rewards) {
            content += this.createRewardsSection(rewards);
        }
        
        content += '</div>';
        return content;
    }
    
    /**
     * Create total party kill content
     */
    createTotalPartyKillContent(casualties) {
        let content = '<div class="total-party-kill">';
        
        // Death message
        content += '<h2>💀 Total Party Kill</h2>';
        content += '<div class="death-message">Your entire party has been slain in the depths of the dungeon...</div>';
        
        // All casualties
        if (casualties && casualties.length > 0) {
            content += '<div class="death-details">';
            content += '<h3>💀 Fallen Heroes</h3>';
            content += '<div class="casualty-list">';
            
            casualties.forEach(casualty => {
                content += '<div class="casualty-item">';
                content += `<span class="casualty-name">${casualty.name}</span>`;
                content += `<span class="casualty-status">Killed</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        content += '<div class="death-message">The surviving party members retreat to town for healing and rest.</div>';
        content += '</div>';
        return content;
    }
    
    /**
     * Create rewards section content
     */
    createRewardsSection(rewards) {
        let content = '<div class="rewards-section">';
        content += '<h3>🎁 Battle Rewards</h3>';
        
        // Experience
        if (rewards.experience > 0) {
            content += `<div class="reward-item"><span class="reward-type">Experience:</span> <span class="reward-value">${rewards.experience} XP</span></div>`;
        }
        
        // Gold
        if (rewards.gold > 0) {
            content += `<div class="reward-item"><span class="reward-type">Gold:</span> <span class="reward-value">${rewards.gold} coins</span></div>`;
        }
        
        // Loot
        if (rewards.loot && rewards.loot.length > 0) {
            content += '<div class="loot-section">';
            content += '<h4>🎒 Items Found:</h4>';
            content += '<div class="loot-list">';
            
            rewards.loot.forEach(item => {
                content += '<div class="loot-item">';
                content += `<span class="loot-name">${item.name}</span>`;
                if (item.value) {
                    content += `<span class="loot-value">(${item.value} value)</span>`;
                }
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        content += '</div>';
        return content;
    }
    
    /**
     * Setup event listeners for victory with casualties screen
     */
    setupVictoryWithCasualtiesEventListeners(viewport, rewards) {
        const continueBtn = viewport.querySelector('#continue-btn');
        const viewStatusBtn = viewport.querySelector('#view-status-btn');
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                console.log('Continue to dungeon clicked');
                this.postCombatModal.hide();
                
                // Clear modal reference
                this.postCombatModal = null;
                
                // Return to dungeon exploration using the same method as normal victory
                if (window.engine) {
                    window.engine.returnToDungeon();
                }
                
                // Play dungeon music
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('dungeon');
                }
            });
        }
        
        if (viewStatusBtn) {
            viewStatusBtn.addEventListener('click', () => {
                console.log('View character status clicked');
                // Close post-combat modal and show character roster
                this.postCombatModal.hide();
                this.characterUI.showCharacterRoster();
            });
        }
    }
    
    /**
     * Show dungeon entrance confirmation modal
     */
    showDungeonEntranceConfirmation() {
        console.log('Showing dungeon entrance confirmation');
        
        const validation = window.engine.validateDungeonEntry();
        
        if (!validation.valid && validation.casualties) {
            // Show casualty modal instead
            this.showDungeonEntranceCasualtyModal(validation);
            return;
        }
        
        // Create confirmation modal
        this.dungeonEntranceModal = new Modal({
            className: 'modal dungeon-entrance-modal',
            closeOnEscape: true,
            closeOnBackdrop: true
        });
        
        // Set up close callback
        this.dungeonEntranceModal.setOnClose(() => {
            this.dungeonEntranceModal = null;
        });
        
        // Create content
        const content = this.createDungeonEntranceContent(validation) +
            '<div class="dungeon-entrance-actions">' +
            '<button id="confirm-enter-btn" class="btn btn-primary">Enter Dungeon</button>' +
            '<button id="cancel-enter-btn" class="btn btn-secondary">Return to Town</button>' +
            '</div>';
        
        // Create and show modal
        this.dungeonEntranceModal.create(content, '🏰 Dungeon Entrance');
        this.dungeonEntranceModal.show();
        
        // Add event listeners
        this.setupDungeonEntranceEventListeners(this.dungeonEntranceModal.getBody(), validation);
    }
    
    /**
     * Show dungeon entrance casualty modal (when party has casualties)
     */
    showDungeonEntranceCasualtyModal(validation) {
        console.log('Showing dungeon entrance casualty modal');
        
        // Create casualty modal
        this.dungeonCasualtyModal = new Modal({
            className: 'modal dungeon-casualty-modal',
            closeOnEscape: true,
            closeOnBackdrop: true
        });
        
        // Set up close callback
        this.dungeonCasualtyModal.setOnClose(() => {
            this.dungeonCasualtyModal = null;
        });
        
        // Create content
        const content = this.createDungeonCasualtyContent(validation) +
            '<div class="dungeon-casualty-actions">' +
            '<button id="clear-party-btn" class="btn btn-danger">Clear Party</button>' +
            '<button id="cancel-casualty-btn" class="btn btn-secondary">Cancel</button>' +
            '</div>';
        
        // Create and show modal
        this.dungeonCasualtyModal.create(content, '⚠️ Party Has Casualties');
        this.dungeonCasualtyModal.show();
        
        // Add event listeners
        this.setupDungeonCasualtyEventListeners(this.dungeonCasualtyModal.getBody(), validation);
    }
    
    /**
     * Create dungeon entrance confirmation content
     */
    createDungeonEntranceContent(validation) {
        let content = '<div class="dungeon-entrance-confirmation">';
        
        if (validation.valid) {
            content += '<h2>🏰 Enter the Dungeon</h2>';
            content += '<div class="entrance-message">Your party is ready to brave the Mad Overlord\'s treacherous maze.</div>';
            
            // Show party composition
            content += '<div class="party-composition">';
            content += '<h3>Party Composition</h3>';
            content += '<div class="party-cards-grid">';
            
            validation.party.forEach(member => {
                content += this.createDungeonPartyCard(member);
            });
            
            content += '</div>';
            content += '</div>';
            
            content += '<div class="entrance-warning">⚠️ The dungeon is dangerous. Proceed with caution!</div>';
        } else {
            content += '<h2>❌ Cannot Enter Dungeon</h2>';
            content += `<div class="entrance-error">${validation.reason}</div>`;
        }
        
        content += '</div>';
        return content;
    }
    
    /**
     * Create a character card for dungeon entrance party display
     */
    createDungeonPartyCard(character) {
        // Get class icon
        const classIcon = this.getClassIcon(character.class);
        
        // Calculate HP percentage for health indicator
        const hpPercentage = character.maxHP > 0 ? Math.round((character.currentHP / character.maxHP) * 100) : 100;
        const hpStatusClass = hpPercentage > 75 ? 'excellent' : hpPercentage > 50 ? 'good' : hpPercentage > 25 ? 'wounded' : 'critical';
        
        // Status is always "Ready" for dungeon entrance since we filter for alive members
        const status = character.isAlive ? 'Ready' : (character.isUnconscious ? 'Unconscious' : 'Dead');
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        
        return `
            <div class="character-roster-card dungeon-party-card" data-character-id="${character.id}">
                <div class="character-card-header">
                    <div class="class-icon">${classIcon}</div>
                    <div class="character-card-name">${character.name}</div>
                    <div class="character-card-level">Lvl ${character.level}</div>
                </div>
                
                <div class="character-card-info">
                    <div class="character-card-race-class">${character.race} ${character.class}</div>
                    <div class="character-card-location">
                        <span class="location-label">Location:</span>
                        <span class="location-value">Town</span>
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
     * Create dungeon casualty content
     */
    createDungeonCasualtyContent(validation) {
        let content = '<div class="dungeon-casualty-warning">';
        
        content += '<h2>⚠️ Party Has Casualties</h2>';
        content += '<div class="casualty-message">Your party has casualties and cannot enter the dungeon in this state.</div>';
        
        // Show casualties
        if (validation.casualties && validation.casualties.length > 0) {
            content += '<div class="casualties-list">';
            content += '<h3>💔 Casualties</h3>';
            
            validation.casualties.forEach(casualty => {
                const status = casualty.isDead ? 'Dead' : 'Unconscious';
                content += '<div class="casualty-member">';
                content += `<span class="casualty-name">${casualty.name}</span>`;
                content += `<span class="casualty-status">${status}</span>`;
                content += '</div>';
            });
            
            content += '</div>';
        }
        
        // Show survivors
        if (validation.survivors && validation.survivors.length > 0) {
            content += '<div class="survivors-list">';
            content += '<h3>🛡️ Survivors</h3>';
            
            validation.survivors.forEach(survivor => {
                content += '<div class="survivor-member">';
                content += `<span class="survivor-name">${survivor.name}</span>`;
                content += `<span class="survivor-hp">${survivor.currentHP}/${survivor.maxHP} HP</span>`;
                content += '</div>';
            });
            
            content += '</div>';
        }
        
        content += '<div class="casualty-options">';
        content += '<p><strong>Options:</strong></p>';
        content += '<ul>';
        content += '<li>Clear the party to return to town center</li>';
        content += '<li>Visit the Temple to resurrect dead members</li>';
        content += '<li>Use rest areas to heal unconscious members</li>';
        content += '</ul>';
        content += '</div>';
        
        content += '</div>';
        return content;
    }
    
    /**
     * Setup event listeners for dungeon entrance confirmation
     */
    setupDungeonEntranceEventListeners(viewport, validation) {
        console.log('Setting up dungeon entrance event listeners:', {
            viewport: !!viewport,
            validation: validation
        });
        
        const confirmBtn = viewport.querySelector('#confirm-enter-btn');
        const cancelBtn = viewport.querySelector('#cancel-enter-btn');
        
        console.log('Found buttons:', {
            confirmBtn: !!confirmBtn,
            cancelBtn: !!cancelBtn,
            validationValid: validation.valid
        });
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Confirmed dungeon entry');
                if (validation.valid) {
                    this.dungeonEntranceModal.hide();
                    window.engine.enterDungeon();
                } else {
                    console.log('Cannot enter dungeon - validation failed');
                    this.addMessage('Cannot enter dungeon - party validation failed', 'error');
                }
            });
            
            // Disable button if validation failed
            if (!validation.valid) {
                confirmBtn.disabled = true;
                confirmBtn.classList.add('disabled');
            }
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Cancelled dungeon entry');
                this.dungeonEntranceModal.hide();
            });
        }
    }
    
    /**
     * Setup event listeners for dungeon casualty modal
     */
    setupDungeonCasualtyEventListeners(viewport, validation) {
        const clearPartyBtn = viewport.querySelector('#clear-party-btn');
        const cancelBtn = viewport.querySelector('#cancel-casualty-btn');
        
        if (clearPartyBtn) {
            clearPartyBtn.addEventListener('click', () => {
                console.log('Clearing party due to casualties');
                this.dungeonCasualtyModal.hide();
                
                // Clear the party
                window.engine.party.clear();
                
                // Return to town center
                this.addMessage('Party cleared due to casualties. Returning to town center.', 'info');
                this.showTown();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('Cancelled casualty action');
                this.dungeonCasualtyModal.hide();
            });
        }
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
        
        // Casualties of War section (matching victory screen layout)
        content += '<div class="casualties-of-war">';
        content += '<div class="casualties-grid">';
        
        // Survivors section (left side) - show even in defeat to mirror victory
        const survivors = window.engine.party.aliveMembers;
        if (survivors.length > 0) {
            content += '<div class="survivors-section">';
            content += '<h3>🛡️ Survivors</h3>';
            content += '<div class="survivor-list">';
            
            survivors.forEach(survivor => {
                content += '<div class="survivor-item">';
                content += `<span class="survivor-name">${survivor.name}</span>`;
                content += `<span class="survivor-status">Alive (${survivor.currentHP}/${survivor.maxHP} HP)</span>`;
                content += '</div>';
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Casualties section (right side)
        if (casualties && casualties.length > 0) {
            content += '<div class="casualties-section">';
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
        
        content += '</div>'; // Close casualties-grid
        content += '</div>'; // Close casualties-of-war
        
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