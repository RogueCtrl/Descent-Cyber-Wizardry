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
        // Movement controls
        if (this.controlButtons.moveForward) {
            this.controlButtons.moveForward.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'move-forward');
            });
        }
        
        if (this.controlButtons.moveBackward) {
            this.controlButtons.moveBackward.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'move-backward');
            });
        }
        
        if (this.controlButtons.turnLeft) {
            this.controlButtons.turnLeft.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'turn-left');
            });
        }
        
        if (this.controlButtons.turnRight) {
            this.controlButtons.turnRight.addEventListener('click', () => {
                this.eventSystem.emit('player-action', 'turn-right');
            });
        }
        
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
    }
    
    /**
     * Handle keyboard input
     */
    handleKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.eventSystem.emit('player-action', 'move-forward');
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.eventSystem.emit('player-action', 'move-backward');
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.eventSystem.emit('player-action', 'turn-left');
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                this.eventSystem.emit('player-action', 'turn-right');
                break;
                
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
        headerElement.innerHTML = `
            <h4>Party (${party.size}/6)</h4>
            ${party.size < 6 ? '<button id="add-character-btn" class="btn-small">+</button>' : ''}
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
        
        // Add party actions
        const actionsElement = document.createElement('div');
        actionsElement.className = 'party-actions';
        actionsElement.innerHTML = `
            <button class="btn-small" onclick="engine.ui.showPartyManagement()">Manage Party</button>
            <button class="btn-small" onclick="engine.ui.showCharacterCreation()">Add Member</button>
        `;
        this.partyDisplay.appendChild(actionsElement);
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
     * Show town center launch screen
     */
    showTown(party = null) {
        console.log('UI.showTown() called with party:', party);
        
        // Create town center interface in the game panel viewport
        const viewport = document.getElementById('viewport');
        if (viewport) {
            console.log('Viewport found, creating town center interface');
            
            // Use passed party or fallback to engine
            const partyObj = party || (window.engine ? window.engine.party : null);
            const partyInfo = this.getPartyStatusInfo(partyObj);
            const hasActiveParty = partyObj && partyObj.size > 0;
            const lastSave = this.getLastSaveInfo();
            
            console.log('Party info:', { partyObj, partyInfo, hasActiveParty });
            
            viewport.innerHTML = `
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
                            
                            <div class="location-card disabled full-width">
                                <button class="location-btn disabled" disabled>
                                    <div class="location-icon">🏕️</div>
                                    <div class="location-info">
                                        <h3>Camp</h3>
                                        <p>Rest and save your party's progress</p>
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
            
            // Add event listeners
            this.setupTownCenterEventListeners(viewport);
        } else {
            console.error('Viewport element not found!');
        }
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
     * Hide town interface
     */
    hideTown() {
        const viewport = document.getElementById('viewport');
        if (viewport) {
            viewport.innerHTML = '';
        }
    }
    
    /**
     * Show training grounds interface
     */
    showTrainingGrounds() {
        // Create training grounds interface in the game panel viewport
        const viewport = document.getElementById('viewport');
        if (viewport) {
            viewport.innerHTML = `
                <div class="training-grounds-interface">
                    <h2>Training Grounds</h2>
                    <p>Here you can create new characters and manage your party.</p>
                    <div class="training-actions">
                        <button id="create-character-btn" class="action-btn primary">Create New Character</button>
                        <button id="view-party-btn" class="action-btn" ${this.party && this.party.size > 0 ? '' : 'disabled'}>View Party Stats</button>
                        <button id="delete-character-btn" class="action-btn danger" ${this.party && this.party.size > 0 ? '' : 'disabled'}>Delete Character</button>
                        <button id="back-to-town-btn" class="action-btn secondary">Back to Town</button>
                    </div>
                    <div class="party-status">
                        <h3>Current Party (${this.party ? this.party.size : 0}/6)</h3>
                        ${this.party && this.party.size > 0 ? 
                            '<p>You have characters ready for adventure!</p>' : 
                            '<p>You need to create at least one character to enter the dungeon.</p>'}
                    </div>
                </div>
            `;
            
            // Add event listeners
            const createBtn = viewport.querySelector('#create-character-btn');
            const backBtn = viewport.querySelector('#back-to-town-btn');
            const viewPartyBtn = viewport.querySelector('#view-party-btn');
            
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
            
            if (viewPartyBtn && !viewPartyBtn.disabled) {
                viewPartyBtn.addEventListener('click', () => {
                    this.eventSystem.emit('training-action', 'view-party');
                });
            }
        }
    }
    
    /**
     * Hide training grounds interface
     */
    hideTrainingGrounds() {
        const viewport = document.getElementById('viewport');
        if (viewport) {
            viewport.innerHTML = '';
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
            if (confirm('Start a new game? This will lose your current progress.')) {
                this.hideGameMenu();
                this.eventSystem.emit('game-state-change', 'character-creation');
            }
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
}