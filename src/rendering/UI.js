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
        
        // Treasure Modal
        this.treasureModal = null;
        
        // Strike Team Management Modal
        this.strikeTeamModal = null;
        
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
            this.showPostCombatResults(data.rewards, data.disconnectedCharacters || []);
        });
        
        // Party defeated event
        this.eventSystem.on('party-defeated', async (data) => {
            const hasDisconnectedCharacters = (data.disconnectedCharacters || []).length > 0;
            const hasCasualties = (data.casualties || []).length > 0;
            
            if (data.totalDefeat || (!hasDisconnectedCharacters && hasCasualties)) {
                // Total party kill - no one escaped
                await this.showTotalPartyKillScreen(data.casualties);
            } else if (hasDisconnectedCharacters) {
                // Some characters escaped - show defeat with disconnect info
                await this.showDefeatWithDisconnectScreen(data.casualties, data.disconnectedCharacters);
            } else {
                // Fallback to general death screen
                await this.showPartyDeathScreen(data.casualties, data.disconnectedCharacters || []);
            }
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
        
        // Update party name display in the status bar
        this.updatePartyNameDisplay(party);
    }
    
    /**
     * Update party name display in the Strike Team Manifest
     */
    updatePartyNameDisplay(party) {
        const partyNameDisplay = document.querySelector('.party-name-display');
        if (partyNameDisplay) {
            const partyName = party ? (party.name || 'Unnamed Party') : 'No Active Party';
            // Update the content with data-text-key for TextManager to handle
            partyNameDisplay.innerHTML = `<span data-text-key="party">Strike Team</span>: ${partyName}`;
            
            // Apply TextManager to update the terminology
            if (typeof TextManager !== 'undefined') {
                const textElement = partyNameDisplay.querySelector('[data-text-key="party"]');
                if (textElement) {
                    TextManager.applyToElement(textElement, 'party');
                }
            }
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
    async showTown(party = null) {
        console.log('UI.showTown() called with party:', party);
        
        // Hide any existing town modal
        this.hideTown();
        
        // Use passed party or fallback to engine
        const partyObj = party || (window.engine ? window.engine.party : null);
        const partyInfo = this.getPartyStatusInfo(partyObj);
        const hasActiveParty = partyObj && partyObj.size > 0;
        
        // Check if there are any meaningful parties to manage
        let hasCamps = false;
        try {
            const allParties = await Storage.loadAllParties();
            // Camps exist if there are:
            // 1. Multiple parties (more than just the current one), OR
            // 2. Parties with members (not empty), OR  
            // 3. Camping parties, OR
            // 4. Lost parties
            if (allParties && allParties.length > 0) {
                const partiesWithMembers = allParties.filter(p => p.members && p.members.length > 0);
                const campingParties = await Storage.getCampingParties();
                const lostParties = allParties.filter(p => p.isLost);
                
                hasCamps = allParties.length > 1 || 
                          partiesWithMembers.length > 0 || 
                          campingParties.length > 0 || 
                          lostParties.length > 0;
            }
        } catch (error) {
            console.error('Error checking for camps:', error);
            hasCamps = false;
        }
        
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
                                <div class="location-icon">👥</div>
                                <div class="location-info">
                                    <h3 data-text-key="training_grounds">Training Grounds</h3>
                                    <p data-text-key="training_grounds_flavor">Create and manage your party of adventurers</p>
                                    <span class="location-status">${hasActiveParty ? 'Manage Strike Team' : 'Initialize Strike Team'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card ${hasActiveParty ? 'enabled' : 'disabled'}">
                            <button id="dungeon-entrance-btn" class="location-btn ${hasActiveParty ? 'enabled' : 'disabled'}" ${hasActiveParty ? '' : 'disabled'}>
                                <div class="location-icon" data-text-key="dungeon_icon">${TextManager.getText('dungeon_icon')}</div>
                                <div class="location-info">
                                    <h3 data-text-key="dungeon">Dungeon</h3>
                                    <p data-text-key="grid_sector_flavor">Enter the Mad Overlord's treacherous maze</p>
                                    <span class="location-status">${hasActiveParty ? 'Enter Grid' : 'Strike Team Required'}</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">🏪</div>
                                <div class="location-info">
                                    <h3 data-text-key="data_exchange">Trading Post</h3>
                                    <p data-text-key="data_exchange_flavor">Trade upgrades and equipment with merchants</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card disabled">
                            <button class="location-btn disabled" disabled>
                                <div class="location-icon">⛪</div>
                                <div class="location-info">
                                    <h3 data-text-key="restoration_center">Temple</h3>
                                    <p data-text-key="restoration_center_flavor">Repair damage and restore fallen adventurers</p>
                                    <span class="location-status">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                        
                        <div class="location-card ${hasCamps ? 'enabled' : 'disabled'}">
                            <button id="strike-team-management-btn" class="location-btn ${hasCamps ? 'enabled' : 'disabled'}" ${hasCamps ? '' : 'disabled'}>
                                <div class="location-icon">📋</div>
                                <div class="location-info">
                                    <h3 data-text-key="party_management">Strike Team Management</h3>
                                    <p data-text-key="party_management_flavor">Manage multiple parties and character roster</p>
                                    <span class="location-status party-name-display">${hasCamps ? `<span data-text-key="party">Strike Team</span>: ${partyObj ? partyObj.name || 'Unnamed Party' : 'No Active Party'}` : 'No Strike Teams Available'}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="game-status-bar">
                    <div class="status-section party-status">
                        <div class="status-content">
                            <span class="status-label"><span data-text-key="party">Party</span> Status:</span>
                            <span class="status-value ${hasActiveParty ? 'active' : 'inactive'}">${partyInfo}</span>
                        </div>
                    </div>
                    <div class="status-section mode-toggle-section">
                        <div class="status-content">
                            <span class="status-label">Interface Mode:</span>
                            <button id="terminology-mode-toggle" class="mode-toggle-btn">
                                <span id="current-mode-display">Cyber</span>
                                <span class="toggle-icon">⚡</span>
                            </button>
                        </div>
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
        const strikeTeamBtn = viewport.querySelector('#strike-team-management-btn');
        const modeToggleBtn = viewport.querySelector('#terminology-mode-toggle');
        
        if (trainingBtn) {
            trainingBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('trainingGroundsClick');
                }
                this.eventSystem.emit('town-location-selected', 'training-grounds');
            });
        }
        
        if (dungeonBtn && !dungeonBtn.disabled) {
            dungeonBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('dungeonClick');
                }
                this.eventSystem.emit('town-location-selected', 'dungeon');
            });
        }
        
        if (strikeTeamBtn && !strikeTeamBtn.disabled) {
            strikeTeamBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('strikeTeamClick');
                }
                this.showStrikeTeamManagement();
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
     * Show Strike Team Management interface
     */
    async showStrikeTeamManagement() {
        console.log('Opening Strike Team Management...');
        
        try {
            // Get all parties from storage
            const allParties = await Storage.loadAllParties();
            const campingParties = await Storage.getCampingParties();
            const activePartyId = Storage.getActivePartyId();
            
            console.log('Loaded parties:', { allParties, campingParties, activePartyId });
            
            // Create the management interface
            const content = this.buildStrikeTeamManagementContent(allParties, campingParties, activePartyId);
            
            // Hide existing modal if present
            if (this.strikeTeamModal) {
                this.strikeTeamModal.hide();
            }
            
            // Create modal with roster styling
            this.strikeTeamModal = new Modal({
                title: TextManager ? TextManager.getText('manifest_title', 'Strike Team Manifest') : 'Strike Team Manifest',
                className: 'modal strike-team-management-modal roster-modal',
                width: '90vw',
                height: '80vh'
            });
            
            this.strikeTeamModal.setOnClose(() => {
                console.log('Strike Team Management modal closed');
                this.strikeTeamModal = null;
            });
            
            this.strikeTeamModal.create(content);
            this.strikeTeamModal.show();
            
            // Apply TextManager to modal content
            if (typeof TextManager !== 'undefined') {
                const modalBody = this.strikeTeamModal.getBody();
                const textElements = modalBody.querySelectorAll('[data-text-key]');
                textElements.forEach(element => {
                    const textKey = element.getAttribute('data-text-key');
                    if (textKey) {
                        TextManager.applyToElement(element, textKey);
                    }
                });
            }
            
            // Set up event listeners
            this.setupStrikeTeamEventListeners(this.strikeTeamModal.getBody());
            
        } catch (error) {
            console.error('Failed to show Strike Team Management:', error);
            this.addMessage('Failed to load Strike Team Management', 'error');
        }
    }
    
    /**
     * Build content for Strike Team Management
     */
    buildStrikeTeamManagementContent(allParties, campingParties, activePartyId) {
        // Filter parties into sections (excluding active party)
        const inactiveParties = allParties.filter(p => p.id !== activePartyId);
        const inTownParties = inactiveParties.filter(p => !p.campId && !p.isLost);
        const lostParties = allParties.filter(p => p.isLost);
        
        console.log('Party filtering:', {
            total: allParties.length,
            inactive: inactiveParties.length,
            camping: campingParties.length,
            inTown: inTownParties.length,
            lost: lostParties.length
        });
        
        return `
            <div class="strike-team-management">
                <div class="manifest-header">
                    <h1 class="manifest-title" data-text-key="manifest_title">Strike Team Manifest</h1>
                    <p class="manifest-subtitle" data-text-key="manifest_subtitle">Manage your disconnected Strike Teams and lost Agents</p>
                </div>
                
                <div class="teams-section">
                    <div class="camping-teams-section">
                        <h3>
                            <span class="section-icon" data-text-key="camping_icon">🔌</span>
                            <span data-text-key="camping_teams">Disconnected Teams</span> 
                            (${campingParties.length})
                        </h3>
                        <div class="camping-teams-grid">
                            ${campingParties.length > 0 ? 
                                campingParties.map(party => this.buildPartyCard(party, false, true)).join('') : 
                                '<p class="no-parties">No camping parties</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="in-town-teams-section">
                        <h3>
                            <span class="section-icon">🏛️</span>
                            <span data-text-key="in_town_teams">In Hub</span> 
                            (${inTownParties.length})
                        </h3>
                        <div class="in-town-teams-grid">
                            ${inTownParties.length > 0 ? 
                                inTownParties.map(party => this.buildPartyCard(party, false)).join('') : 
                                '<p class="no-parties">No inactive parties</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="lost-teams-section">
                        <h3>
                            <span class="section-icon">💀</span>
                            <span data-text-key="lost_teams">Lost Strike Teams</span> 
                            (${lostParties.length})
                        </h3>
                        <div class="lost-teams-grid">
                            ${lostParties.length > 0 ? 
                                lostParties.map(party => this.buildPartyCard(party, false, false, true)).join('') : 
                                '<p class="no-parties">No lost parties</p>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="manifest-actions">
                    <button id="close-management-btn" class="action-btn secondary">Close</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Build party card HTML
     */
    buildPartyCard(party, isActive = false, isCamping = false, isLost = false) {
        let status, statusClass, statusIcon;
        
        if (isLost) {
            status = 'Lost';
            statusClass = 'lost';
            statusIcon = '💀';
        } else if (isCamping) {
            status = TextManager ? TextManager.getText('camping_teams', 'Camping') : 'Camping';
            statusClass = 'camping';
            statusIcon = TextManager ? TextManager.getText('camping_icon', '🔌') : '🔌';
        } else {
            status = TextManager ? TextManager.getText('in_town_teams', 'In Town') : 'In Town';
            statusClass = 'inactive';
            statusIcon = '🏛️';
        }
        
        // Dynamic location display
        let locationDisplay = '';
        if (isCamping && party.campId) {
            const dungeonName = party.dungeonName || (TextManager ? TextManager.getText('dungeon', 'Corrupted Network') : 'Dungeon');
            const levelLabel = TextManager ? TextManager.getText('level', 'Level') : 'Level';
            locationDisplay = `${dungeonName} - ${levelLabel} ${party.dungeonLevel || 1}`;
        } else if (!isCamping && !isLost) {
            locationDisplay = TextManager ? TextManager.getText('town', 'Terminal Hub') : 'Town';
        } else if (isLost) {
            // Display lost location info if available
            if (party.lastKnownLocation) {
                const dungeonName = party.lastKnownLocation.dungeon || 'Unknown Dungeon';
                const levelLabel = TextManager ? TextManager.getText('level', 'Level') : 'Level';
                const level = party.lastKnownLocation.level || '?';
                locationDisplay = `Lost in ${dungeonName} - ${levelLabel} ${level}`;
            } else {
                locationDisplay = 'Lost in unknown location';
            }
        }
        
        return `
            <div class="party-card ${statusClass}" data-party-id="${party.id}">
                <div class="party-header">
                    <div class="party-status-icon">${statusIcon}</div>
                    <h4>${party.name || 'Unnamed Team'}</h4>
                    <span class="party-status ${statusClass}">${status}</span>
                </div>
                <div class="party-info">
                    <p><strong data-text-key="members">Members:</strong> ${party.aliveCount}/${party.memberCount}</p>
                    <p><strong>Gold:</strong> ${party.gold || 0}</p>
                    <p><strong>Created:</strong> ${new Date(party.dateCreated).toLocaleDateString()}</p>
                    ${locationDisplay ? `
                        <div class="party-location">
                            <span class="location-label">Location:</span>
                            <span class="location-value">${locationDisplay}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="party-actions">
                    ${!isActive && !isLost ? `<button class="action-btn small resume-party-btn" data-party-id="${party.id}">Resume</button>` : ''}
                    ${!isActive ? `<button class="action-btn small delete-party-btn" data-party-id="${party.id}">Delete</button>` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for Strike Team Management
     */
    setupStrikeTeamEventListeners(modalBody) {
        const closeBtn = modalBody.querySelector('#close-management-btn');
        const resumeButtons = modalBody.querySelectorAll('.resume-party-btn');
        const deleteButtons = modalBody.querySelectorAll('.delete-party-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                if (this.strikeTeamModal) {
                    this.strikeTeamModal.hide();
                    this.strikeTeamModal = null;
                }
            });
        }
        
        resumeButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                const partyId = btn.dataset.partyId;
                await this.resumeParty(partyId);
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                const partyId = btn.dataset.partyId;
                await this.deleteParty(partyId);
            });
        });
    }
    
    
    /**
     * Resume a party
     */
    async resumeParty(partyId) {
        console.log('Resuming party:', partyId);
        
        try {
            if (window.engine && window.engine.resumeCampedParty) {
                console.log('Calling engine.resumeCampedParty...');
                await window.engine.resumeCampedParty(partyId);
                console.log('Party resumed, hiding modals...');
                
                // Hide Strike Team Management modal
                if (this.strikeTeamModal) {
                    this.strikeTeamModal.hide();
                    this.strikeTeamModal = null;
                }
                
                // Only hide town if the game state is not 'town' (i.e., party went to dungeon)
                if (window.engine.gameState.currentState !== 'town') {
                    this.hideTown();
                    console.log('Party went to dungeon, hiding town...');
                } else {
                    console.log('Party staying in town, keeping town visible...');
                }
                
                console.log('Modals hidden, showing success message...');
                this.addMessage('Party resumed successfully!', 'success');
            } else {
                console.error('Engine or resumeCampedParty not available:', { 
                    engine: !!window.engine, 
                    resumeMethod: !!(window.engine && window.engine.resumeCampedParty) 
                });
                this.addMessage('Failed to resume party - engine not available', 'error');
            }
        } catch (error) {
            console.error('Failed to resume party:', error);
            this.addMessage('Failed to resume party', 'error');
        }
    }
    
    /**
     * Show delete party confirmation modal
     */
    async showDeletePartyConfirmation(partyId) {
        try {
            // Load party data to get name
            const allParties = await Storage.loadAllParties();
            const party = allParties.find(p => p.id === partyId);
            const partyName = party ? party.name || 'Unnamed Team' : 'Unknown Party';
            
            const deleteContent = `
                <div class="delete-confirmation-content">
                    <div class="warning-header">
                        <div class="warning-icon">⚠️</div>
                        <h3 data-text-key="delete_party_title">Delete Strike Team</h3>
                    </div>
                    
                    <div class="warning-content">
                        <p data-text-key="delete_party_confirm">Are you sure you want to delete this strike team?</p>
                        <p class="party-name"><strong>${partyName}</strong></p>
                        <div class="danger-warning">
                            <div class="danger-icon">🚨</div>
                            <p data-text-key="delete_party_warning">Strike teams currently in the corrupted network will be lost forever. This action cannot be undone.</p>
                        </div>
                    </div>
                    
                    <div class="confirmation-actions">
                        <button id="cancel-delete-btn" class="action-btn secondary">Cancel</button>
                        <button id="confirm-delete-btn" class="action-btn danger">
                            <span data-text-key="delete_party_button">Delete Strike Team</span>
                        </button>
                    </div>
                </div>
            `;
            
            this.deleteConfirmModal = new Modal({
                className: 'modal delete-confirmation-modal',
                closeOnEscape: true,
                closeOnBackdrop: false
            });
            
            this.deleteConfirmModal.create(deleteContent);
            this.deleteConfirmModal.show();
            
            // Play warning sound effect
            if (window.engine && window.engine.audioManager) {
                window.engine.audioManager.playSoundEffect('deletePartyWarning');
            }
            
            // Apply TextManager to modal content
            if (typeof TextManager !== 'undefined') {
                const modalBody = this.deleteConfirmModal.getBody();
                const textElements = modalBody.querySelectorAll('[data-text-key]');
                textElements.forEach(element => {
                    const textKey = element.getAttribute('data-text-key');
                    if (textKey) {
                        TextManager.applyToElement(element, textKey);
                    }
                });
            }
            
            // Event listeners
            const modalBody = this.deleteConfirmModal.getBody();
            const cancelBtn = modalBody.querySelector('#cancel-delete-btn');
            const confirmBtn = modalBody.querySelector('#confirm-delete-btn');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (window.engine && window.engine.audioManager) {
                        window.engine.audioManager.playSoundEffect('buttonClick');
                    }
                    this.deleteConfirmModal.hide();
                    this.deleteConfirmModal = null;
                });
            }
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {
                    if (window.engine && window.engine.audioManager) {
                        window.engine.audioManager.playSoundEffect('partyWipe');
                    }
                    await this.executePartyDeletion(partyId);
                    this.deleteConfirmModal.hide();
                    this.deleteConfirmModal = null;
                });
            }
            
        } catch (error) {
            console.error('Error showing delete confirmation:', error);
            this.addMessage('Failed to show delete confirmation', 'error');
        }
    }

    /**
     * Execute party deletion with proper state management
     */
    async executePartyDeletion(partyId) {
        try {
            // Load party data before deletion
            const allParties = await Storage.loadAllParties();
            const basicPartyInfo = allParties.find(p => p.id === partyId);
            if (!basicPartyInfo) {
                console.error('Party not found for deletion:', partyId);
                return;
            }
            
            // Load the full party with character objects (not just references)
            let party;
            try {
                party = await Storage.loadParty(partyId);
            } catch (error) {
                console.error('Failed to load full party, using basic info:', error);
                party = basicPartyInfo;
            }
            
            console.log(`Deleting party: ${party.name} (${partyId})`);
            
            // Use memberIds if members is undefined
            const memberList = party.members || party.memberIds || [];
            
            // Load the actual character objects
            let actualMembers = [];
            if (memberList && memberList.length > 0) {
                for (const member of memberList) {
                    // Check if this is just an ID string or a full character object
                    if (typeof member === 'string') {
                        const fullCharacter = await Storage.loadCharacter(member);
                        if (fullCharacter) {
                            actualMembers.push(fullCharacter);
                        } else {
                            console.error(`Failed to load character: ${member}`);
                        }
                    } else if (member && member.id) {
                        // Already a full character object
                        actualMembers.push(member);
                    }
                }
            }
            
            // 1. Delete associated camp if it exists
            if (party.campId) {
                console.log(`Deleting camp: ${party.campId}`);
                await Storage.deleteCamp(party.campId);
            }
            
            // 2. Handle party members based on party location
            if (actualMembers.length > 0) {
                // Check if party is in town (not in dungeon)
                const isInTown = !party.campId && !party.dungeonName && !party.isInDungeon;
                
                for (const member of actualMembers) {
                    if (isInTown) {
                        // Party is in town - preserve character state, just remove party association
                        console.log(`Removing party association for character in town: ${member.name} (${member.id})`);
                        member.partyId = null; // Remove party association only
                    } else {
                        // Party is in dungeon - transition to "Lost" state
                        console.log(`Transitioning character to Lost state: ${member.name} (${member.id})`);
                        
                        // Update character status with multiple indicators
                        member.status = 'Lost';
                        member.isLost = true;
                        member.isAlive = false;  // Ensure alive flags are updated
                        member.partyId = null; // Remove party association
                        member.lostDate = new Date().toISOString();
                        member.lostReason = 'Strike Team Deleted';
                        member.lastKnownLocation = party.dungeonName || 'Corrupted Network';
                    }
                    
                    // Save updated character state
                    try {
                        await Storage.saveCharacter(member);
                        
                        // Verify it was saved by immediately reloading
                        const reloadedChar = await Storage.loadCharacter(member.id);
                        if (isInTown) {
                            if (reloadedChar && reloadedChar.partyId !== null) {
                                console.error(`Failed to remove party association for ${member.name}!`);
                            }
                        } else {
                            if (!reloadedChar || reloadedChar.status !== 'Lost') {
                                console.error(`Failed to save character state for ${member.name}!`);
                            }
                        }
                    } catch (error) {
                        console.error(`Error saving character ${member.name}:`, error);
                    }
                }
            }
            
            // 3. Delete the party itself
            await Storage.deleteParty(partyId);
            
            // 4. Update game state and active party
            const activePartyId = Storage.getActivePartyId();
            if (activePartyId === partyId) {
                Storage.setActivePartyId(null);
            }
            
            // Always ensure we're in a proper state after party deletion
            if (window.engine && window.engine.gameState) {
                const currentState = window.engine.gameState.getState();
                if (currentState === 'playing' || currentState === 'town') {
                    window.engine.gameState.setState('town');
                    console.log('Game state set to town after party deletion');
                }
            }
            
            // 5. Force refresh of all character displays
            if (window.engine && window.engine.party) {
                try {
                    await window.engine.party.refreshFromStorage();
                    console.log('Engine party refreshed from storage');
                } catch (error) {
                    console.log('Engine party refresh not available:', error.message);
                }
            }
            
            // 6. Emit events for UI updates
            if (this.eventSystem) {
                this.eventSystem.emit('party-deleted', { partyId, partyName: party.name });
                this.eventSystem.emit('party-roster-changed');
                this.eventSystem.emit('character-state-changed'); // Additional event for character updates
            }
            
            // 7. Refresh the Strike Team Management interface
            await this.refreshStrikeTeamManagement();
            
            console.log(`Successfully deleted party: ${party.name}`);
            this.addMessage('Party deleted successfully', 'info');
            
        } catch (error) {
            console.error('Error deleting party:', error);
            this.addMessage('Failed to delete party', 'error');
        }
    }

    /**
     * Delete a party (legacy method - now calls confirmation modal)
     */
    async deleteParty(partyId) {
        await this.showDeletePartyConfirmation(partyId);
    }

    /**
     * Refresh the Strike Team Management modal after changes
     */
    async refreshStrikeTeamManagement() {
        if (this.strikeTeamModal && this.strikeTeamModal.isOpen && this.strikeTeamModal.isOpen()) {
            try {
                // Reload data and rebuild content
                const allParties = await Storage.loadAllParties();
                const campingParties = await Storage.getCampingParties();
                const activePartyId = Storage.getActivePartyId();
                
                const content = this.buildStrikeTeamManagementContent(allParties, campingParties, activePartyId);
                
                // Update content if modal has updateContent method, otherwise recreate
                if (this.strikeTeamModal.updateContent) {
                    this.strikeTeamModal.updateContent(content);
                } else {
                    // Fallback: recreate modal content
                    const modalBody = this.strikeTeamModal.getBody();
                    if (modalBody) {
                        modalBody.innerHTML = content;
                    }
                }
                
                // Reapply event listeners
                this.setupStrikeTeamEventListeners(this.strikeTeamModal.getBody());
                
                // Apply TextManager
                if (typeof TextManager !== 'undefined') {
                    const modalBody = this.strikeTeamModal.getBody();
                    const textElements = modalBody.querySelectorAll('[data-text-key]');
                    textElements.forEach(element => {
                        const textKey = element.getAttribute('data-text-key');
                        if (textKey) {
                            TextManager.applyToElement(element, textKey);
                        }
                    });
                }
                
            } catch (error) {
                console.error('Error refreshing Strike Team Management:', error);
            }
        }
    }
    
    /**
     * Get party status information for display
     */
    getPartyStatusInfo(party) {
        if (!party || party.size === 0) {
            // Check if this is a temporary party
            if (party && party._isTemporary) {
                return 'Temporary Party';
            }
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
                    <h1 class="training-title" data-text-key="training_grounds">Training Grounds</h1>
                    <p class="training-subtitle" data-text-key="training_grounds_flavor">Create and manage your party of adventurers</p>
                </div>
                
                <div class="training-content">
                    <div class="training-actions">
                        <button id="create-character-btn" class="action-btn primary large">
                            <div class="btn-icon">⚔️</div>
                            <div class="btn-text">
                                <span class="btn-title" data-text-key="create_new_character">Create New Character</span>
                                <span class="btn-desc" data-text-key="roll_adventurer">Roll a new adventurer</span>
                            </div>
                        </button>
                        
                        <button id="view-roster-btn" class="action-btn secondary large">
                            <div class="btn-icon">📋</div>
                            <div class="btn-text">
                                <span class="btn-title" data-text-key="view_roster">View Roster</span>
                                <span class="btn-desc" data-text-key="browse_characters">Browse all characters</span>
                            </div>
                        </button>
                        
                    </div>
                    
                    <div class="party-status-section">
                        <h3><span data-text-key="current_party">Current Party</span> (${party ? party.size : 0}/6)</h3>
                        <div class="party-status-info">
                            ${hasActiveParty ? `
                                <p class="status-ready">✅ <span data-text-key="strike_team_ready">Your party is ready for adventure!</span></p>
                                <button id="strike-team-status-btn" class="action-btn compact enabled">
                                    <span data-text-key="view_party_stats">View Party Stats</span>
                                </button>
                            ` : 
                                '<p class="status-empty">⚠️ <span data-text-key="strike_team_required">Create at least one character to enter the dungeon.</span></p>'}
                        </div>
                    </div>
                </div>
                
                <div class="training-footer">
                    <button id="back-to-town-btn" class="action-btn secondary">
                        <span>← <span data-text-key="back_to_town">Back to Town</span></span>
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
        
        // Apply TextManager to training grounds modal elements
        this.applyGlobalTextManager();
        
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
        const strikeTeamStatusBtn = container.querySelector('#strike-team-status-btn');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                this.eventSystem.emit('training-action', 'create-character');
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                this.eventSystem.emit('training-action', 'back-to-town');
            });
        }
        
        if (viewRosterBtn) {
            viewRosterBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('characterRosterClick');
                }
                this.showCharacterRoster();
            });
        }
        
        if (strikeTeamStatusBtn && !strikeTeamStatusBtn.disabled) {
            strikeTeamStatusBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('dungeonClick');
                }
                // Hide AgentOps modal and show dungeon entrance directly
                this.hideTrainingGrounds();
                this.showDungeonEntranceConfirmation(true); // true indicates came from AgentOps
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
            
            // Get dynamic title from TextManager
            const modalTitle = typeof TextManager !== 'undefined' ? 
                TextManager.getText('character_roster') : 'Character Roster';
            
            this.rosterModal.create(rosterContent, modalTitle);
            this.rosterModal.show();
            
            // Apply TextManager to modal content
            this.applyGlobalTextManager();
            
            // Register callback for dynamic roster updates when mode changes
            this.rosterModeChangeCallback = () => {
                if (this.rosterModal && this.rosterModal.isVisible) {
                    this.refreshCharacterRosterContent(allCharacters);
                }
            };
            
            if (typeof TextManager !== 'undefined') {
                TextManager.onModeChange(this.rosterModeChangeCallback);
            }
            
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
        
        // Clean up TextManager callback
        if (this.rosterModeChangeCallback && typeof TextManager !== 'undefined') {
            TextManager.offModeChange(this.rosterModeChangeCallback);
            this.rosterModeChangeCallback = null;
        }
    }
    
    /**
     * Refresh character roster content for mode changes
     */
    async refreshCharacterRosterContent(characters) {
        if (!this.rosterModal) return;
        
        try {
            // Regenerate content with current mode
            const rosterContent = await this.createCharacterRosterContent(characters);
            
            // Update modal title
            const modalTitle = typeof TextManager !== 'undefined' ? 
                TextManager.getText('character_roster') : 'Character Roster';
            
            // Update modal content
            const modalBody = this.rosterModal.getBody();
            if (modalBody) {
                modalBody.innerHTML = rosterContent;
            }
            
            // Update modal title if header exists
            const modalHeader = this.rosterModal.element?.querySelector('.modal-header h2');
            if (modalHeader) {
                modalHeader.textContent = modalTitle;
            }
            
            // Reapply TextManager to new content
            this.applyGlobalTextManager();
            
            // Reattach event listeners
            this.setupRosterEventListeners();
            
        } catch (error) {
            console.error('Failed to refresh character roster content:', error);
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
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
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
        
        // Lost Agents button
        const lostCharactersBtn = modalBody.querySelector('#view-lost-characters-btn');
        if (lostCharactersBtn) {
            lostCharactersBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                this.showLostAgentsModal();
            });
        }
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
                className: 'modal character-sheet-modal',
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
        // Filter active characters (exclude Uninstalled/Lost agents from main database)
        const activeCharacters = characters.filter(character => 
            !this.isCharacterPermanentlyLost(character)
        );
        
        // Filter lost characters for memorial section
        const lostCharacters = characters.filter(character => 
            this.isCharacterPermanentlyLost(character)
        );
        
        // Create character cards for active characters only
        const characterCards = await Promise.all(
            activeCharacters.map(character => this.createCharacterCard(character))
        );
        
        const hasActiveCharacters = activeCharacters.length > 0;
        const hasLostCharacters = lostCharacters.length > 0;
        
        return `
            <div class="roster-interface">
                <div class="roster-header">
                    <p class="roster-subtitle">
                        <span data-text-key="character_roster_subtitle">All Created Characters</span>
                        <span class="character-count">(${activeCharacters.length})</span>
                    </p>
                </div>
                
                <div class="roster-content">
                    ${hasActiveCharacters ? `
                        <div class="character-grid">
                            ${characterCards.join('')}
                        </div>
                    ` : `
                        <div class="no-characters">
                            <div class="no-characters-icon">⚔️</div>
                            <h3 data-text-key="no_characters_created">No Characters Created</h3>
                            <p data-text-key="visit_training_grounds">Visit the Training Grounds to create your first adventurer!</p>
                        </div>
                    `}
                </div>
                
                ${hasLostCharacters ? `
                    <div class="roster-memorial-section">
                        <button id="view-lost-characters-btn" class="action-btn memorial">
                            <div class="btn-icon">💀</div>
                            <div class="btn-text">
                                <span class="btn-title">
                                    <span data-text-key="lost_characters">Fallen Heroes</span>
                                    <span class="btn-count">(${lostCharacters.length})</span>
                                </span>
                            </div>
                        </button>
                    </div>
                ` : ''}
                
                <div class="roster-footer">
                    <button id="close-roster-btn" class="action-btn secondary">
                        <span data-text-key="back_to_training_grounds">← Back to Training Grounds</span>
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
        
        // Determine character status with proper styling and terminology
        const rawStatus = character.status || 'Alive';
        let displayStatus = rawStatus;
        
        // Map status to contextual terminology
        if (typeof TextManager !== 'undefined') {
            switch (rawStatus.toLowerCase()) {
                case 'ok':
                case 'alive':
                    displayStatus = TextManager.getText('character_status_ok');
                    break;
                case 'unconscious':
                    displayStatus = TextManager.getText('character_status_unconscious');
                    break;
                case 'dead':
                    displayStatus = TextManager.getText('character_status_dead');
                    break;
                case 'ashes':
                    displayStatus = TextManager.getText('character_status_ashes');
                    break;
                case 'lost':
                    displayStatus = TextManager.getText('character_status_lost');
                    break;
                default:
                    displayStatus = rawStatus;
            }
        }
        
        const statusClass = rawStatus.toLowerCase().replace(/\s+/g, '-');
        
        // Get class icon (implement later if icons are available)
        const classIcon = this.getClassIcon(character.class);
        
        // Get contextual race and class names
        const raceName = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`race_${character.race.toLowerCase()}`) : character.race;
        const className = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`class_${character.class.toLowerCase()}`) : character.class;
        
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
                    <div class="character-card-race-class">${raceName} ${className}</div>
                    <div class="character-card-location">
                        <span class="location-label">Location:</span>
                        <span class="location-value">${location}</span>
                    </div>
                    <div class="character-card-status">
                        <span class="status-label">Status:</span>
                        <span class="status-value status-${statusClass}">${displayStatus}</span>
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
                const dungeonName = typeof TextManager !== 'undefined' ? 
                    TextManager.getText('dungeon') : 'Dungeon';
                const levelLabel = typeof TextManager !== 'undefined' ? 
                    TextManager.getText('level') : 'Lvl';
                return `${dungeonName} (${levelLabel}.${floor} ${x},${y})`;
            }
            return character.location.area || (typeof TextManager !== 'undefined' ? 
                TextManager.getText('character_location_town') : 'Town');
        }
        return typeof TextManager !== 'undefined' ? 
            TextManager.getText('character_location_town') : 'Town';
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
     * Show lost agents memorial modal
     */
    async showLostAgentsModal() {
        try {
            // Get all characters from storage and filter for lost ones
            const allCharacters = await Storage.loadAllCharacters();
            const lostCharacters = allCharacters.filter(character => 
                this.isCharacterPermanentlyLost(character)
            );
            
            console.log(`Loading lost agents memorial: ${lostCharacters.length} lost characters found`);
            
            // Create modal content
            const lostAgentsContent = await this.createLostAgentsContent(lostCharacters);
            console.log('Lost agents content created successfully');
            
            // Create and show modal with consistent sizing
            this.lostAgentsModal = new Modal({
                className: 'modal lost-agents-modal memorial-modal character-roster-modal',
                closeOnEscape: true,
                closeOnBackdrop: true
            });
            
            // Set up close callback
            this.lostAgentsModal.setOnClose(() => {
                this.hideLostAgentsModal();
            });
            
            // Get dynamic title from TextManager
            const modalTitle = typeof TextManager !== 'undefined' ? 
                TextManager.getText('lost_characters') : 'Fallen Heroes';
            
            this.lostAgentsModal.create(lostAgentsContent, modalTitle);
            this.lostAgentsModal.show();
            
            // Apply TextManager to modal content
            this.applyGlobalTextManager();
            
            // Register callback for dynamic updates when mode changes
            this.lostAgentsModeChangeCallback = () => {
                if (this.lostAgentsModal && this.lostAgentsModal.isVisible) {
                    this.refreshLostAgentsContent(lostCharacters);
                }
            };
            
            if (typeof TextManager !== 'undefined') {
                TextManager.onModeChange(this.lostAgentsModeChangeCallback);
            }
            
            // Add event listeners after modal is created
            this.setupLostAgentsEventListeners();
            
        } catch (error) {
            console.error('Failed to show lost agents modal:', error);
            this.addMessage('Failed to load lost agents memorial', 'error');
        }
    }
    
    /**
     * Hide lost agents modal
     */
    hideLostAgentsModal() {
        if (this.lostAgentsModal) {
            this.lostAgentsModal.hide();
            this.lostAgentsModal = null;
        }
        
        // Clean up TextManager callback
        if (this.lostAgentsModeChangeCallback && typeof TextManager !== 'undefined') {
            TextManager.offModeChange(this.lostAgentsModeChangeCallback);
            this.lostAgentsModeChangeCallback = null;
        }
    }
    
    /**
     * Create lost agents modal content
     */
    async createLostAgentsContent(lostCharacters) {
        console.log('Creating lost character cards for', lostCharacters.length, 'characters');
        const lostCharacterCards = await Promise.all(
            lostCharacters.map(character => this.createLostCharacterCard(character))
        );
        console.log('Lost character cards created successfully');
        
        const hasLostCharacters = lostCharacters.length > 0;
        
        return `
            <div class="roster-interface memorial-interface">
                <div class="roster-header memorial-header">
                    <p class="roster-subtitle memorial-subtitle">
                        <span data-text-key="lost_characters_subtitle">Agents Lost in the Corrupted Network</span>
                        <span class="character-count memorial-count">(${lostCharacters.length})</span>
                    </p>
                </div>
                
                <div class="roster-content memorial-content">
                    ${hasLostCharacters ? `
                        <div class="character-grid memorial-character-grid">
                            ${lostCharacterCards.join('')}
                        </div>
                    ` : `
                        <div class="no-characters no-lost-characters">
                            <div class="no-characters-icon">🕊️</div>
                            <h3 data-text-key="no_lost_characters">No Fallen Heroes</h3>
                            <p data-text-key="no_lost_characters_message">No heroes have been lost to the dungeon.</p>
                        </div>
                    `}
                </div>
                
                <div class="roster-footer memorial-footer">
                    <button id="close-lost-agents-btn" class="action-btn secondary">
                        <span data-text-key="back_to_character_roster">← Back to Character Roster</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Create a lost character card for the memorial
     */
    async createLostCharacterCard(character) {
        // Determine character location with memorial context
        const lastSeenLocation = this.getLostCharacterLocation(character);
        
        // Get contextual race and class names
        const raceName = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`race_${character.race.toLowerCase()}`) : character.race;
        const className = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`class_${character.class.toLowerCase()}`) : character.class;
        
        // Get class icon
        const classIcon = this.getClassIcon(character.class);
        
        return `
            <div class="character-roster-card memorial-character-card clickable-card" data-character-id="${character.id}">
                <div class="character-card-header">
                    <div class="class-icon">${classIcon}</div>
                    <div class="character-card-name">${character.name}</div>
                    <div class="character-card-level">Lvl ${character.level}</div>
                </div>
                
                <div class="character-card-info">
                    <div class="character-card-race-class">${raceName} ${className}</div>
                    <div class="character-card-location">
                        <span class="location-label" data-text-key="character_last_seen">Last Seen:</span>
                        <span class="location-value">${lastSeenLocation}</span>
                    </div>
                    <div class="character-card-status">
                        <span class="status-label">Status:</span>
                        <span class="status-value status-lost" data-text-key="character_status_lost">Lost</span>
                    </div>
                </div>
                
                <div class="character-card-health memorial-card-status">
                    <div class="memorial-status-indicator">
                        <div class="memorial-icon">💀</div>
                        <div class="memorial-text" data-text-key="lost_in_dungeon">Lost in Dungeon</div>
                    </div>
                </div>
                
                <button class="memorial-redact-btn action-btn danger small" data-character-id="${character.id}" title="Remove from Memorial">
                    <span data-text-key="remove_from_memorial">Redact</span>
                </button>
            </div>
        `;
    }
    
    /**
     * Get lost character location with memorial context
     */
    getLostCharacterLocation(character) {
        // For memorial display, show where they were lost
        if (character.location) {
            if (character.location.dungeon) {
                const { floor, x, y } = character.location;
                const dungeonName = typeof TextManager !== 'undefined' ? 
                    TextManager.getText('lost_in_dungeon') : 'Lost in Dungeon';
                const levelLabel = typeof TextManager !== 'undefined' ? 
                    TextManager.getText('level') : 'Level';
                return `${dungeonName} - ${levelLabel} ${floor}`;
            }
            return character.location.area || (typeof TextManager !== 'undefined' ? 
                TextManager.getText('character_location_town') : 'Town');
        }
        return typeof TextManager !== 'undefined' ? 
            TextManager.getText('lost_in_dungeon') : 'Lost in Dungeon';
    }
    
    /**
     * Set up event listeners for lost agents modal
     */
    setupLostAgentsEventListeners() {
        const modalBody = this.lostAgentsModal.getBody();
        
        // Close button
        const closeBtn = modalBody.querySelector('#close-lost-agents-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                this.hideLostAgentsModal();
            });
        }
        
        // Card click handlers for viewing character details
        const characterCards = modalBody.querySelectorAll('.memorial-character-card.clickable-card');
        characterCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Check if the click target is the redact button or its child elements
                if (e.target.closest('.memorial-redact-btn')) {
                    return; // Don't open details if clicking redact button
                }
                
                const characterId = card.dataset.characterId;
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                this.showCharacterDetails(characterId);
            });
        });
        
        // Integrated Redact buttons
        const redactButtons = modalBody.querySelectorAll('.memorial-redact-btn');
        redactButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent card click event
                const characterId = button.dataset.characterId;
                if (window.engine && window.engine.audioManager) {
                    window.engine.audioManager.playSoundEffect('buttonClick');
                }
                await this.forgetLostCharacter(characterId);
            });
        });
    }
    
    /**
     * Permanently delete a lost character from memory
     */
    async forgetLostCharacter(characterId) {
        try {
            // Load character to confirm they are lost
            const character = await Storage.loadCharacter(characterId);
            if (!character) {
                this.addMessage('Character not found', 'error');
                return;
            }
            
            if (!this.isCharacterPermanentlyLost(character)) {
                this.addMessage('Can only forget permanently lost characters', 'error');
                return;
            }
            
            // Show delete character confirmation modal
            this.showDeleteCharacterConfirmation(characterId);
            
        } catch (error) {
            console.error('Failed to forget lost character:', error);
            this.addMessage('Failed to remove character from memorial', 'error');
        }
    }
    
    /**
     * Refresh lost agents content for mode changes
     */
    async refreshLostAgentsContent(lostCharacters) {
        if (!this.lostAgentsModal) return;
        
        try {
            // Regenerate content with current mode
            const lostAgentsContent = await this.createLostAgentsContent(lostCharacters);
            
            // Update modal title
            const modalTitle = typeof TextManager !== 'undefined' ? 
                TextManager.getText('lost_characters') : 'Fallen Heroes';
            
            // Update modal content
            const modalBody = this.lostAgentsModal.getBody();
            if (modalBody) {
                modalBody.innerHTML = lostAgentsContent;
            }
            
            // Update modal title if header exists
            const modalHeader = this.lostAgentsModal.element?.querySelector('.modal-header h2');
            if (modalHeader) {
                modalHeader.textContent = modalTitle;
            }
            
            // Reapply TextManager to new content
            this.applyGlobalTextManager();
            
            // Reattach event listeners
            this.setupLostAgentsEventListeners();
            
        } catch (error) {
            console.error('Failed to refresh lost agents content:', error);
        }
    }
    
    /**
     * Show delete character confirmation modal
     */
    async showDeleteCharacterConfirmation(characterId) {
        try {
            // Load character data
            const character = await Storage.loadCharacter(characterId);
            if (!character) {
                this.addMessage('Character not found', 'error');
                return;
            }
            
            // Get contextual race and class names
            const raceName = typeof TextManager !== 'undefined' ? 
                TextManager.getText(`race_${character.race.toLowerCase()}`) : character.race;
            const className = typeof TextManager !== 'undefined' ? 
                TextManager.getText(`class_${character.class.toLowerCase()}`) : character.class;
            
            // Get last known location
            const lastLocation = this.getLostCharacterLocation(character);
            
            // Create template strings for dynamic content
            const characterDetail = typeof TextManager !== 'undefined' ? 
                TextManager.getText('forget_character_detail')
                    .replace('{name}', character.name)
                    .replace('{race}', raceName)
                    .replace('{class}', className) :
                `Forgetting ${character.name} (${raceName} ${className}) will remove all records permanently.`;
            
            const locationDetail = typeof TextManager !== 'undefined' ? 
                TextManager.getText('character_last_location')
                    .replace('{location}', lastLocation) :
                `Last seen in ${lastLocation}`;
            
            const deleteContent = `
                <div class="delete-confirmation-content">
                    <div class="warning-header">
                        <div class="warning-icon">💀</div>
                        <h3 data-text-key="delete_character_title">Forget Hero</h3>
                    </div>
                    
                    <div class="warning-content">
                        <p data-text-key="delete_character_confirm">Are you sure you want to forget this fallen hero?</p>
                        <p class="character-name"><strong>${character.name}</strong></p>
                        <p class="character-details">${characterDetail}</p>
                        <p class="character-location">${locationDetail}</p>
                        <div class="danger-warning">
                            <div class="danger-icon">🚨</div>
                            <p data-text-key="delete_character_warning">This hero's memory will be lost forever. This action cannot be undone.</p>
                        </div>
                    </div>
                    
                    <div class="confirmation-actions">
                        <button id="cancel-delete-character-btn" class="action-btn secondary">Cancel</button>
                        <button id="confirm-delete-character-btn" class="action-btn danger">
                            <span data-text-key="delete_character_button">Forget Hero</span>
                        </button>
                    </div>
                </div>
            `;
            
            this.deleteCharacterModal = new Modal({
                className: 'modal delete-confirmation-modal character-delete-modal',
                closeOnEscape: true,
                closeOnBackdrop: false
            });
            
            this.deleteCharacterModal.create(deleteContent);
            this.deleteCharacterModal.show();
            
            // Play warning sound effect
            if (window.engine && window.engine.audioManager) {
                window.engine.audioManager.playSoundEffect('deletePartyWarning');
            }
            
            // Apply TextManager to modal content
            if (typeof TextManager !== 'undefined') {
                const modalBody = this.deleteCharacterModal.getBody();
                const textElements = modalBody.querySelectorAll('[data-text-key]');
                textElements.forEach(element => {
                    const textKey = element.getAttribute('data-text-key');
                    if (textKey) {
                        TextManager.applyToElement(element, textKey);
                    }
                });
            }
            
            // Event listeners
            const modalBody = this.deleteCharacterModal.getBody();
            const cancelBtn = modalBody.querySelector('#cancel-delete-character-btn');
            const confirmBtn = modalBody.querySelector('#confirm-delete-character-btn');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (window.engine && window.engine.audioManager) {
                        window.engine.audioManager.playSoundEffect('buttonClick');
                    }
                    this.deleteCharacterModal.hide();
                    this.deleteCharacterModal = null;
                });
            }
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {
                    if (window.engine && window.engine.audioManager) {
                        window.engine.audioManager.playSoundEffect('partyWipe');
                    }
                    await this.executeCharacterDeletion(characterId);
                    this.deleteCharacterModal.hide();
                    this.deleteCharacterModal = null;
                });
            }
            
        } catch (error) {
            console.error('Error showing delete character confirmation:', error);
            this.addMessage('Failed to show delete confirmation', 'error');
        }
    }
    
    /**
     * Execute character deletion with proper state management
     */
    async executeCharacterDeletion(characterId) {
        try {
            // Load character for final message
            const character = await Storage.loadCharacter(characterId);
            const characterName = character ? character.name : 'Unknown Character';
            
            // Permanently delete the character
            await Storage.deleteCharacter(characterId);
            
            const memorialText = typeof TextManager !== 'undefined' && TextManager.isCyberMode() ? 
                'Agent data redacted from memory banks' : 
                'Hero forgotten from the memorial';
            
            this.addMessage(`${characterName}: ${memorialText}`, 'warning');
            
            // Refresh the lost agents modal
            const allCharacters = await Storage.loadAllCharacters();
            const lostCharacters = allCharacters.filter(char => 
                this.isCharacterPermanentlyLost(char)
            );
            
            await this.refreshLostAgentsContent(lostCharacters);
            
            // If no lost characters remain, close the modal
            if (lostCharacters.length === 0) {
                this.hideLostAgentsModal();
                // Also refresh the character roster if it's open
                if (this.rosterModal && this.rosterModal.isVisible) {
                    await this.refreshCharacterRosterContent(allCharacters);
                }
            }
            
        } catch (error) {
            console.error('Failed to delete character:', error);
            this.addMessage('Failed to delete character', 'error');
        }
    }
    
    /**
     * Check if character is permanently lost (memorial eligible)
     */
    isCharacterPermanentlyLost(character) {
        return character.status && character.status.toLowerCase() === 'lost';
    }
    
    /**
     * Check if character is dead (any death state)
     */
    isCharacterDead(character) {
        const status = character.status ? character.status.toLowerCase() : 'ok';
        return ['unconscious', 'dead', 'ashes', 'lost'].includes(status);
    }
    
    /**
     * Check if character is alive and functional
     */
    isCharacterAlive(character) {
        const status = character.status ? character.status.toLowerCase() : 'ok';
        return ['ok', 'alive'].includes(status);
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
        
        // IMPORTANT: Move canvas to hidden storage before clearing viewport
        const canvas = document.getElementById('game-canvas');
        const canvasStorage = document.getElementById('canvas-storage');
        if (canvas && canvasStorage) {
            canvasStorage.appendChild(canvas);
        }
        
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
            button.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) {
                    await this.handleCombatAction(action);
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
        document.addEventListener('keydown', async (e) => {
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
                    await this.handleCombatAction(action);
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
    async handleCombatAction(action) {
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
            await this.processCombatAction(action);
        }
    }
    
    /**
     * Process combat action
     */
    async processCombatAction(action) {
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
            case 'flee':
                // Unified escape system - both use disconnect logic
                actionData.type = 'disconnect';
                actionData.character = currentActor.combatant;
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
            await this.handleCombatEnd(result.winner);
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
        setTimeout(async () => {
            // Use the combat interface's AI processing
            const aiResult = window.engine.combatInterface.processAITurn(monster);
            
            if (aiResult && typeof aiResult === 'object') {
                // Check if combat ended from AI action
                if (aiResult.combatEnded) {
                    await this.handleCombatEnd(aiResult.winner);
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
    async handleCombatEnd(winner) {
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
            // Enemy victory - check if any party members survived or escaped
            const aliveMembers = window.engine.party.aliveMembers || [];
            const casualties = window.engine.party.members.filter(member => !member.isAlive);
            const disconnectedCharacters = window.engine.combatInterface?.combat?.disconnectedCharacters || [];
            
            console.log('Combat defeat analysis:', {
                aliveMembers: aliveMembers.length,
                casualties: casualties.length,
                disconnectedCharacters: disconnectedCharacters.length
            });
            
            // Check if there are any survivors (alive members OR successfully disconnected characters)
            const totalSurvivors = aliveMembers.length + disconnectedCharacters.length;
            
            if (totalSurvivors === 0) {
                // True total party kill - play death music and show death screen
                console.log('True total party kill - no survivors or escapees');
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('death');
                }
                
                // Force end combat without rewards
                window.engine.combatInterface.combat.isActive = false;
                
                // Show total party kill screen
                await this.showPartyDeathScreen(casualties);
            } else {
                // Some survived or escaped - handle as defeat with disconnects
                console.log('Some characters survived/escaped - showing defeat with disconnect screen');
                
                // Force end combat without rewards
                window.engine.combatInterface.combat.isActive = false;
                
                // Show defeat screen with escaped characters
                await this.showDefeatWithDisconnectScreen(casualties, disconnectedCharacters);
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
        
        // CRITICAL: Force cleanup all modals first to prevent z-index blocking
        this.clearAllModals();
        
        // Clear combat interface and restore 3D view
        viewport.innerHTML = '';
        
        // Retrieve canvas from hidden storage
        const canvas = document.getElementById('game-canvas');
        const canvasStorage = document.getElementById('canvas-storage');
        
        if (canvas && viewport) {
            // Move canvas from storage back to viewport
            viewport.appendChild(canvas);
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '500'; // Match CSS z-index value
            canvas.style.display = 'block';
        }
        
    }
    
    /**
     * Show post-combat results screen
     */
    showPostCombatResults(rewards, disconnectedCharacters = []) {
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
        
        // If there are casualties or disconnected characters, show victory with casualties screen instead
        if (casualties.length > 0 || disconnectedCharacters.length > 0) {
            this.showVictoryWithCasualtiesScreen(casualties, aliveMembers, rewards, disconnectedCharacters);
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
            '<button id="continue-btn" class="btn btn-primary">Return to Grid</button>' +
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
            continueBtn.addEventListener('click', async () => {
                this.postCombatModal.hide();
                this.postCombatModal = null;
                
                // Apply rewards to party
                this.applyRewardsToParty(rewards);
                
                // Stop victory music and play dungeon music
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('dungeon');
                }
                
                // Return directly to dungeon - no confirmation modal needed
                await window.engine.enterDungeon(false, true); // fromAgentOps=false, postCombatReturn=true
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
    async processTotalPartyKill() {
        console.log('Processing total party kill - converting unconscious to dead');
        
        if (!window.engine?.party?.members) return;
        
        for (const member of window.engine.party.members) {
            if (member.status === 'unconscious') {
                member.status = 'dead';
                member.currentHP = -10; // Ensure they're truly dead
                member.isAlive = false;
                
                // Save the updated character state
                try {
                    await Storage.saveCharacter(member);
                } catch (error) {
                    console.error(`Failed to save character ${member.name}:`, error);
                }
                
                this.addMessage(`${member.name} has died from their injuries...`, 'death');
            }
        }
    }
    
    /**
     * Show party death screen
     */
    async showPartyDeathScreen(casualties, disconnectedCharacters = []) {
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
            await this.processTotalPartyKill();
            
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
            
            this.showVictoryWithCasualtiesScreen(casualties, aliveMembers, rewards, disconnectedCharacters);
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
        
        // Get proper terminology for return button
        const returnButtonText = TextManager.getText('town', 'Town');
        
        // Create the modal content with buttons
        const content = this.createTotalPartyKillContent(casualties) + 
            '<div class="death-actions">' +
            `<button id="return-to-town-btn" class="btn btn-primary">Return to ${returnButtonText}</button>` +
            '</div>';
        
        // Create and show modal
        this.deathModal.create(content, '💀 Total Party Kill');
        this.deathModal.show();
        
        // Add event listeners using getBody() method
        this.setupDeathScreenEventListeners(this.deathModal.getBody());
    }
    
    /**
     * Show defeat screen when some characters disconnected but others fell
     */
    async showDefeatWithDisconnectScreen(casualties, disconnectedCharacters) {
        console.log('Showing defeat with disconnect screen:', { casualties, disconnectedCharacters });
        
        // Hide combat interface first
        this.hideCombatInterface();
        
        // Create defeat modal following post-combat pattern (like town modals)
        this.deathModal = new Modal({
            className: 'modal party-defeat-modal',
            closeOnEscape: false,
            closeOnBackdrop: false
        });
        
        // Set up close callback
        this.deathModal.setOnClose(() => {
            this.deathModal = null;
        });
        
        // Get proper terminology
        const returnButtonText = TextManager.getText('town', 'Town');
        const defeatTitle = TextManager.getText('defeat_some_escaped', 'Defeat - Some 🏃 Fled');
        
        // Create the modal content with buttons
        const content = this.createDefeatWithDisconnectContent(casualties, disconnectedCharacters) + 
            '<div class="defeat-actions">' +
            `<button id="return-to-town-btn" class="btn btn-primary">Return to ${returnButtonText}</button>` +
            '</div>';
        
        // Create and show modal
        this.deathModal.create(content, `💔 ${defeatTitle}`);
        this.deathModal.show();
        
        // Add event listeners using getBody() method
        this.setupDeathScreenEventListeners(this.deathModal.getBody());
    }
    
    /**
     * Create a summary character card for post-combat modals
     */
    createSummaryCharacterCard(character, cardType = 'survivor') {
        const race = character.race || 'Unknown';
        const characterClass = character.class || 'Unknown';
        const currentHP = character.currentHP || 0;
        const maxHP = character.maxHP || 1;
        const isAlive = character.isAlive || false;
        
        // Get contextual race and class names using terminology system
        const raceName = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`race_${race.toLowerCase()}`, race) : race;
        const className = typeof TextManager !== 'undefined' ? 
            TextManager.getText(`class_${characterClass.toLowerCase()}`, characterClass) : characterClass;
        
        // Calculate health percentage and determine health class
        const healthPercent = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
        let healthClass = 'dead';
        if (isAlive) {
            if (healthPercent > 75) healthClass = 'healthy';
            else if (healthPercent > 25) healthClass = 'wounded';
            else healthClass = 'critical';
        }
        
        // Get appropriate icon for class
        const classIcon = this.getClassIcon(characterClass);
        
        // Determine status badge text based on card type
        let statusBadgeText = '';
        if (cardType === 'escaped') {
            // Show condition status: "Scrambled" for cyber mode, "Confused" for fantasy mode
            statusBadgeText = TextManager.isCyberMode() ? 'Scrambled' : 'Confused';
        } else if (cardType === 'casualty') {
            statusBadgeText = character.status === 'dead' ? 
                TextManager.getText('character_status_dead', 'Dead') : 
                TextManager.getText('character_status_unconscious', 'Unconscious');
        } else if (cardType === 'survivor') {
            statusBadgeText = TextManager.getText('character_status_alive', 'Alive');
        }
        
        return `
            <div class="summary-character-card ${cardType}">
                <div class="summary-card-icon">${classIcon}</div>
                <div class="summary-card-content">
                    <div class="summary-card-header">
                        <div class="summary-card-name">${character.name}</div>
                    </div>
                    <div class="summary-card-details">
                        ${raceName} ${className}
                    </div>
                    <div class="summary-card-health">
                        <div class="summary-health-bar">
                            <div class="summary-health-fill ${healthClass}" style="width: ${healthPercent}%"></div>
                        </div>
                        <span class="summary-health-text">${currentHP}/${maxHP}</span>
                    </div>
                    <div class="summary-card-status">
                        <span class="summary-status-badge ${cardType}">${statusBadgeText}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create content for defeat with disconnect screen
     */
    createDefeatWithDisconnectContent(casualties, disconnectedCharacters) {
        let content = '<div class="defeat-with-disconnect">';
        
        // Defeat message
        content += '<h2>💔 Defeat</h2>';
        content += '<div class="defeat-message">The battle is lost, but not all is lost...</div>';
        
        // Two-column layout for casualties and escaped
        content += '<div class="defeat-grid">';
        
        // Escaped characters section (left side - positive news first)
        if (disconnectedCharacters && disconnectedCharacters.length > 0) {
            // Use "Fled" for classic mode, "Disconnected" for cyber mode
            const disconnectTerm = TextManager.isCyberMode() ? 'Disconnected' : 'Fled';
            
            content += '<div class="escaped-section">';
            content += `<h3>🏃 ${disconnectTerm}</h3>`;
            content += '<div class="escaped-list">';
            
            disconnectedCharacters.forEach(disconnected => {
                const character = disconnected.character;
                content += this.createSummaryCharacterCard(character, 'escaped');
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Casualties section (right side)
        if (casualties && casualties.length > 0) {
            content += '<div class="casualties-section">';
            content += '<h3>💀 Fallen in Battle</h3>';
            content += '<div class="casualty-list">';
            
            casualties.forEach(casualty => {
                content += this.createSummaryCharacterCard(casualty, 'casualty');
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        content += '</div>'; // End defeat-grid
        
        content += '</div>'; // End defeat-with-disconnect
        
        return content;
    }
    

    
    /**
     * Show victory with casualties screen
     */
    showVictoryWithCasualtiesScreen(casualties, survivors, rewards, disconnectedCharacters = []) {
        console.log('Showing victory with casualties:', { 
            casualties: casualties.map(c => ({ name: c.name, status: c.status, isAlive: c.isAlive, hp: c.currentHP })), 
            survivors: survivors.map(s => ({ name: s.name, status: s.status, isAlive: s.isAlive, hp: s.currentHP })), 
            disconnectedCharacters: disconnectedCharacters.map(d => ({ name: d.character.name, status: d.character.status })),
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
        
        // Create the modal content with casualties, survivors, disconnected characters, and rewards
        let actionButtons = '<div class="post-combat-actions">';
        
        // Determine available actions based on survivors
        if (survivors && survivors.length > 0) {
            // Have survivors - can return to grid with casualties in tow
            actionButtons += '<button id="continue-btn" class="btn btn-primary">Return to Grid</button>';
        } else {
            // No survivors - only option is to return to town
            actionButtons += '<button id="return-town-btn" class="btn btn-primary">Return to Town</button>';
        }
        
        actionButtons += '</div>';
        
        const content = this.createVictoryWithCasualtiesContent(casualties, survivors, rewards, disconnectedCharacters) + actionButtons;
        
        // Create and show modal
        this.postCombatModal.create(content, '⚔️ Victory with Casualties');
        this.postCombatModal.show();
        
        // Add event listeners using getBody() method
        this.setupVictoryWithCasualtiesEventListeners(this.postCombatModal.getBody(), rewards);
    }
    
    /**
     * Create victory with casualties content
     */
    createVictoryWithCasualtiesContent(casualties, survivors, rewards, disconnectedCharacters = []) {
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
                content += this.createSummaryCharacterCard(survivor, 'survivor');
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
                content += this.createSummaryCharacterCard(casualty, 'casualty');
            });
            
            content += '</div>';
            content += '</div>';
        }
        
        // Disconnected characters section (center)
        if (disconnectedCharacters && disconnectedCharacters.length > 0) {
            content += '<div class="disconnected-section">';
            content += `<h3>🏃 ${TextManager.getText('combat_disconnect', 'Fled')}</h3>`;
            content += '<div class="disconnected-list">';
            
            disconnectedCharacters.forEach(disconnected => {
                const character = disconnected.character;
                content += this.createSummaryCharacterCard(character, 'escaped');
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
        const returnTownBtn = viewport.querySelector('#return-town-btn');
        
        if (continueBtn) {
            continueBtn.addEventListener('click', async () => {
                console.log('Continue to dungeon clicked');
                this.postCombatModal.hide();
                
                // Clear modal reference
                this.postCombatModal = null;
                
                // Stop victory music and play dungeon music
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('dungeon');
                }
                
                // Return directly to dungeon - no confirmation modal needed
                await window.engine.enterDungeon(false, true); // fromAgentOps=false, postCombatReturn=true
            });
        }
        
        if (returnTownBtn) {
            returnTownBtn.addEventListener('click', async () => {
                console.log('Return to town clicked');
                this.postCombatModal.hide();
                
                // Clear modal reference
                this.postCombatModal = null;
                
                // Stop combat music and play town music
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('town');
                }
                
                // Return to town
                await window.engine.returnToTown();
            });
        }
    }
    
    /**
     * Show dungeon entrance confirmation modal
     */
    showDungeonEntranceConfirmation(fromAgentOps = false, postCombatReturn = false) {
        console.log('Showing dungeon entrance confirmation', { fromAgentOps, postCombatReturn });
        
        // Store where we came from for the cancel button and modal context
        this.dungeonEntranceOrigin = fromAgentOps ? 'agentops' : (postCombatReturn ? 'post-combat' : 'town');
        this.postCombatReturn = postCombatReturn;
        
        const validation = window.engine.validateDungeonEntry(fromAgentOps, postCombatReturn);
        
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
        
        // Create content with appropriate button text based on context
        let enterText, returnText;
        if (postCombatReturn) {
            enterText = 'Return to Grid';
            returnText = 'Exit to Town';
        } else {
            enterText = TextManager.getText('enter_dungeon');
            returnText = this.dungeonEntranceOrigin === 'agentops' ? 'Return to AgentOps' : 'Return to Town';
        }
        
        const content = this.createDungeonEntranceContent(validation) +
            '<div class="dungeon-entrance-actions">' +
            `<button id="confirm-enter-btn" class="btn btn-primary">${enterText}</button>` +
            `<button id="cancel-enter-btn" class="btn btn-secondary">${returnText}</button>` +
            '</div>';
        
        // Create and show modal
        this.dungeonEntranceModal.create(content, `${TextManager.getText('dungeon_entrance')}`);
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
            content += `<div class="entrance-message" data-text-key="dungeon_entrance_flavor">${TextManager.getText('dungeon_entrance_flavor')}</div>`;
            
            // Show party composition
            content += '<div class="party-composition">';
            content += `<h3 data-text-key="party_composition">${TextManager.getText('party_composition')}</h3>`;
            content += '<div class="party-cards-grid">';
            
            validation.party.forEach(member => {
                content += this.createDungeonPartyCard(member);
            });
            
            content += '</div>';
            content += '</div>';
            
            content += `<div class="entrance-warning" data-text-key="dungeon_warning">${TextManager.getText('dungeon_warning')}</div>`;
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
                    <div class="character-card-race-class">${TextManager.getText(`race_${character.race.toLowerCase()}`)} ${TextManager.getText(`class_${character.class.toLowerCase()}`)}</div>
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
            confirmBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Confirmed dungeon entry');
                if (validation.valid) {
                    this.dungeonEntranceModal.hide();
                    const fromAgentOps = this.dungeonEntranceOrigin === 'agentops';
                    const postCombatReturn = this.postCombatReturn || false;
                    
                    // Play dungeon music when entering/returning to dungeon
                    if (window.engine?.audioManager) {
                        window.engine.audioManager.fadeToTrack('dungeon');
                    }
                    
                    await window.engine.enterDungeon(fromAgentOps, postCombatReturn);
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
                
                // Return to the appropriate location
                if (this.dungeonEntranceOrigin === 'agentops') {
                    this.showTrainingGrounds();
                } else if (this.dungeonEntranceOrigin === 'post-combat') {
                    // Remove casualties from party before returning to town
                    if (window.engine.party) {
                        const { casualties, survivors } = Helpers.removeCasualtiesFromParty(window.engine.party);
                        
                        // Show messages for each casualty
                        casualties.forEach(casualty => {
                            const status = casualty.status || 'dead';
                            this.addMessage(`${casualty.name} (${status}) has been left behind...`, 'warning');
                        });
                    }
                    
                    // Return to town after post-combat cancellation
                    const success = window.engine.gameState.setState('town');
                    console.log('Combat to town transition:', success);
                    
                    if (success) {
                        // Play town music when exiting to town
                        if (window.engine?.audioManager) {
                            window.engine.audioManager.fadeToTrack('town');
                        }
                        
                        this.showTown();
                        
                        // Check if party is wiped and handle accordingly
                        if (window.engine.party.members.length === 0) {
                            this.addMessage('No one survived to return to town.', 'error');
                            
                            // Handle party wipe - create new party
                            setTimeout(async () => {
                                await window.engine.handlePartyWipe();
                                this.updatePartyDisplay(window.engine.party);
                            }, 1000); // Brief delay for dramatic effect
                        } else {
                            this.addMessage('The survivors return to town...', 'success');
                            this.updatePartyDisplay(window.engine.party);
                        }
                    }
                }
                // If origin is 'town', we don't need to do anything as the modal just closes
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
            returnBtn.addEventListener('click', async () => {
                this.deathModal.hide();
                this.deathModal = null;
                await this.returnToTownAfterDeath();
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
    async returnToTownAfterDeath() {
        console.log('Returning to town after death...');
        
        if (window.engine) {
            // Save dungeon state and characters before exiting
            if (window.engine.dungeon && window.engine.party && window.engine.party.id) {
                try {
                    await window.engine.dungeon.saveToDatabase(window.engine.party.id);
                    console.log('Dungeon saved before exiting to town');
                } catch (error) {
                    console.error('Failed to save dungeon before town exit:', error);
                }
                
                // Save all party members
                if (window.engine.party.members) {
                    for (const member of window.engine.party.members) {
                        try {
                            await Storage.saveCharacter(member);
                        } catch (error) {
                            console.error(`Failed to save character ${member.name}:`, error);
                        }
                    }
                    console.log('Party members saved before exiting to town');
                }
            }
            
            // First exit combat (combat → playing)
            const success1 = window.engine.gameState.setState('playing');
            console.log('Combat to playing transition:', success1);
            
            // Add small delay to ensure state change is processed
            setTimeout(async () => {
                // Handle party status before returning to town
                if (window.engine.party) {
                    // Check if entire party is wiped BEFORE removing casualties
                    const aliveMembers = window.engine.party.aliveMembers || [];
                    const totalMembers = window.engine.party.members.length;
                    const isCompleteWipe = aliveMembers.length === 0 && totalMembers > 0;
                    
                    console.log('Party wipe check:', {
                        aliveMembers: aliveMembers.length,
                        totalMembers: totalMembers,
                        isCompleteWipe: isCompleteWipe
                    });
                    
                    if (isCompleteWipe) {
                        // Mark party as LOST IN DUNGEON, not returned to town
                        const wipedPartyId = window.engine.party.id;
                        window.engine.party.isLost = true;
                        window.engine.party.lostDate = new Date().toISOString();
                        window.engine.party.lostReason = 'Total Party Kill';
                        window.engine.party.lastKnownLocation = {
                            dungeon: window.engine.dungeon?.name || 'Corrupted Network',
                            level: window.engine.dungeon?.currentLevel || 1,
                            position: window.engine.party.position
                        };
                        
                        console.log('Party marked as lost in dungeon - complete wipe');
                        
                        // DO NOT remove casualties for wiped parties - they stay with the lost party
                        // DO NOT call returnToTown() - no survivors exist
                        
                        // Show wipe message
                        window.engine.party.members.forEach(member => {
                            const status = member.status || 'dead';
                            this.addMessage(`${member.name} was lost with the expedition...`, 'death');
                        });
                        
                        // Save the lost party state
                        await window.engine.party.save();
                        
                        // Remove as active party - this party is now lost
                        Storage.setActiveParty(null);
                        console.log(`Wiped party ${wipedPartyId} removed as active party`);
                        
                        // Clear the current party from engine to force new party creation
                        window.engine.party = null;
                        
                    } else {
                        // Party has survivors but was forced to return after death
                        // DO NOT remove casualties - they can be revived/resurrected if party continues
                        // Only mark party as returned to town
                        
                        // Count casualties for messaging
                        const casualties = window.engine.party.members.filter(m => m.status === 'dead' || m.status === 'unconscious');
                        const survivors = window.engine.party.members.filter(m => m.status !== 'dead' && m.status !== 'unconscious');
                        
                        console.log(`Party forced to return with ${survivors.length} survivors and ${casualties.length} casualties`);
                        
                        // Show status messages
                        casualties.forEach(casualty => {
                            const status = casualty.status || 'dead';
                            this.addMessage(`${casualty.name} (${status}) needs healing...`, 'warning');
                        });
                        
                        if (survivors.length > 0) {
                            this.addMessage(`The party retreats to town with their wounded...`, 'system');
                        }
                        
                        window.engine.party.returnToTown();
                        console.log('Party returned to town after defeat');
                    }
                    
                    // Save party state only if party still exists (not wiped)
                    if (window.engine.party) {
                        try {
                            await window.engine.party.save();
                            console.log('Party status updated after death handling');
                        } catch (error) {
                            console.error('Failed to save party status after death:', error);
                        }
                    }
                }
                
                // Then exit dungeon and return to town (playing → town)
                const success2 = window.engine.gameState.setState('town');
                console.log('Playing to town transition:', success2);
                
                if (success2) {
                    // Check if party was wiped (no active party)
                    const activePartyId = Storage.getActivePartyId();
                    
                    if (!activePartyId || !window.engine.party) {
                        // Party was wiped - show town with no party
                        this.showTown(null);
                        this.addMessage('Word reaches the town of a failed expedition. No survivors returned...', 'death');
                        
                        // Handle party wipe - create new party
                        setTimeout(async () => {
                            await window.engine.handlePartyWipe();
                            this.updatePartyDisplay(window.engine.party);
                        }, 1000); // Brief delay for dramatic effect
                    } else {
                        // Show town interface with surviving party
                        this.showTown(window.engine.party);
                        
                        if (window.engine.party.members.length === 0) {
                            this.addMessage('Word reaches the town of a failed expedition. No survivors returned...', 'death');
                            
                            // Handle party wipe - create new party
                            setTimeout(async () => {
                                await window.engine.handlePartyWipe();
                                this.updatePartyDisplay(window.engine.party);
                            }, 1000); // Brief delay for dramatic effect
                        } else {
                            this.addMessage('The survivors return to town, bearing news of their fallen comrades...', 'system');
                            this.updatePartyDisplay(window.engine.party);
                        }
                    }
                    
                    // Save all remaining character states (if party exists)
                    if (window.engine.party && window.engine.party.members) {
                        window.engine.party.members.forEach(member => {
                            if (member.saveToStorage) {
                                member.saveToStorage();
                            }
                        });
                    }
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
    
    /**
     * Force cleanup of all modals to prevent z-index layering issues
     * This is necessary when transitioning back to dungeon view after combat
     */
    clearAllModals() {
        // List of all possible modal properties
        const modalProperties = [
            'postCombatModal',
            'dungeonEntranceModal', 
            'dungeonCasualtyModal',
            'townModal',
            'trainingModal',
            'rosterModal',
            'characterDetailModal',
            'deathModal'
        ];
        
        // Destroy modal objects if they exist
        modalProperties.forEach(modalName => {
            if (this[modalName]) {
                this[modalName].destroy();
                this[modalName] = null;
            }
        });
        
        // Also clear any orphaned modal elements from the DOM
        const orphanedModals = document.querySelectorAll('.modal');
        orphanedModals.forEach((modal) => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
    }
    
    /**
     * Show exit button when player is on exit tile
     */
    showExitButton(data) {
        // Check if button already exists
        const existingButton = document.getElementById('exit-dungeon-btn');
        if (existingButton) {
            return; // Button already shown
        }
        
        // Play sound effect when exit becomes available
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('exitAvailable');
        }
        
        // Find the control panel to add the exit button
        const controlPanel = document.getElementById('control-panel');
        const actionControls = document.getElementById('action-controls');
        
        if (actionControls) {
            // Create exit button
            const exitButton = document.createElement('button');
            exitButton.id = 'exit-dungeon-btn';
            exitButton.className = 'btn btn-warning exit-btn';
            exitButton.innerHTML = '<span data-text-key="exit_dungeon">⚡ Exit to Town</span>';
            exitButton.title = 'Save progress and return to town';
            
            // Apply TextManager if available
            if (typeof TextManager !== 'undefined') {
                TextManager.applyToElement(exitButton.querySelector('[data-text-key]'), 'exit_dungeon');
            }
            
            // Add click handler
            exitButton.addEventListener('click', async () => {
                await this.handleDungeonExit();
            });
            
            // Insert the button at the end of action controls
            actionControls.appendChild(exitButton);
            
            // Add message about the exit
            this.addMessage('You found the dungeon exit! Use the Exit button to return to town.', 'system');
        }
    }
    
    /**
     * Hide exit button when player leaves exit tile
     */
    hideExitButton() {
        const exitButton = document.getElementById('exit-dungeon-btn');
        if (exitButton) {
            exitButton.remove();
        }
    }
    
    /**
     * Show treasure button when player is on treasure tile
     */
    showTreasureButton(data) {
        // Check if button already exists
        const existingButton = document.getElementById('treasure-btn');
        if (existingButton) {
            return; // Button already shown
        }
        
        // Play sound effect when treasure becomes available
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('treasureAvailable');
        }
        
        // Find the control panel to add the treasure button
        const controlPanel = document.getElementById('control-panel');
        const actionControls = document.getElementById('action-controls');
        
        if (actionControls) {
            // Create treasure button
            const treasureButton = document.createElement('button');
            treasureButton.id = 'treasure-btn';
            treasureButton.className = 'btn btn-success treasure-btn treasure-glow';
            treasureButton.innerHTML = '<span data-text-key="open_treasure">💎 Open Chest</span>';
            treasureButton.title = 'Open the treasure chest';
            
            // Apply TextManager if available
            if (typeof TextManager !== 'undefined') {
                const span = treasureButton.querySelector('[data-text-key]');
                if (span) {
                    TextManager.applyToElement(span, 'open_treasure');
                }
            }
            
            // Add click handler
            treasureButton.addEventListener('click', () => {
                this.handleTreasureOpen(data);
            });
            
            // Add to action controls
            actionControls.appendChild(treasureButton);
        }
    }
    
    /**
     * Hide treasure button when player leaves treasure tile
     */
    hideTreasureButton() {
        const treasureButton = document.getElementById('treasure-btn');
        if (treasureButton) {
            treasureButton.remove();
        }
    }
    
    /**
     * Handle treasure chest opening - generate loot and show rewards
     */
    async handleTreasureOpen(data) {
        console.log('Opening treasure chest at', data);
        
        // Play treasure opening sound effect
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('treasureOpen');
        }
        
        // Hide the treasure button immediately
        this.hideTreasureButton();
        
        // Mark treasure as looted in dungeon
        if (window.engine && window.engine.dungeon) {
            window.engine.dungeon.usedSpecials.add(data.treasureKey);
        }
        
        // Generate loot from migration files
        const loot = this.generateTreasureLoot();
        
        // Show loot modal
        this.showTreasureLootModal(loot);
        
        // Add to party inventory if inventory system exists
        if (loot.length > 0 && window.engine && window.engine.party) {
            // Add message about finding treasure
            this.addMessage(`You open the treasure chest and find valuable items!`, 'success');
            
            // TODO: Add items to party inventory when inventory system is integrated
            loot.forEach(item => {
                this.addMessage(`Found: ${item.name}`, 'treasure');
            });
        } else {
            this.addMessage('The treasure chest is empty...', 'info');
        }
    }
    
    /**
     * Generate random loot from migration files
     */
    generateTreasureLoot() {
        const loot = [];
        const lootCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
        
        // Define loot pools from migration files
        const weaponIds = [
            'weapon_dagger_001', 'weapon_short_sword_001', 'weapon_long_sword_001',
            'weapon_staff_001', 'weapon_mace_001', 'weapon_bow_001', 'weapon_crossbow_001',
            'weapon_war_hammer_001', 'weapon_katana_001', 'weapon_ninja_blade_001'
        ];
        
        const armorIds = [
            'armor_leather_001', 'armor_studded_leather_001', 'armor_chain_mail_001',
            'armor_plate_mail_001', 'armor_chain_mail_plus_1_001', 'armor_cloth_001',
            'armor_banded_mail_001'
        ];
        
        const shieldIds = [
            'shield_small_001', 'shield_large_001', 'shield_plus_1_001', 'shield_attraction_001'
        ];
        
        const accessoryIds = [
            'accessory_ring_protection_001', 'accessory_amulet_health_001', 
            'accessory_cloak_elvenkind_001', 'accessory_ring_weakness_001',
            'accessory_cloak_misfortune_001', 'accessory_amulet_mysterious_001'
        ];
        
        // All item pools combined
        const allItemIds = [...weaponIds, ...armorIds, ...shieldIds, ...accessoryIds];
        
        // Generate random loot
        for (let i = 0; i < lootCount; i++) {
            const randomIndex = Math.floor(Math.random() * allItemIds.length);
            const itemId = allItemIds[randomIndex];
            
            // Create basic item info (would normally come from migration data)
            const item = {
                id: itemId,
                name: this.getItemDisplayName(itemId),
                type: this.getItemType(itemId)
            };
            
            loot.push(item);
        }
        
        return loot;
    }
    
    /**
     * Get display name for item ID
     */
    getItemDisplayName(itemId) {
        // Simple name extraction from ID
        const parts = itemId.split('_');
        let name = parts.slice(1, -1).join(' ');
        
        // Capitalize words
        name = name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return name;
    }
    
    /**
     * Get item type from ID
     */
    getItemType(itemId) {
        if (itemId.startsWith('weapon_')) return 'weapon';
        if (itemId.startsWith('armor_')) return 'armor';
        if (itemId.startsWith('shield_')) return 'shield';
        if (itemId.startsWith('accessory_')) return 'accessory';
        return 'unknown';
    }
    
    /**
     * Show treasure loot modal with found items
     */
    showTreasureLootModal(loot) {
        // Create modal content
        let content = '<div class="treasure-modal-content">';
        content += '<h3>🏆 Treasure Found!</h3>';
        
        if (loot.length > 0) {
            content += '<div class="loot-list">';
            loot.forEach(item => {
                const typeIcon = this.getItemTypeIcon(item.type);
                content += `<div class="loot-item">`;
                content += `<span class="loot-icon">${typeIcon}</span>`;
                content += `<span class="loot-name">${item.name}</span>`;
                content += `<span class="loot-type">(${item.type})</span>`;
                content += `</div>`;
            });
            content += '</div>';
        } else {
            content += '<p class="no-loot">The chest is empty...</p>';
        }
        
        content += '<div class="modal-actions">';
        content += '<button id="treasure-continue-btn" class="btn btn-primary">Continue</button>';
        content += '</div>';
        content += '</div>';
        
        // Create treasure modal if it doesn't exist
        if (!this.treasureModal) {
            this.treasureModal = new Modal({
                id: 'treasure-modal',
                classes: ['treasure-modal'],
                onClose: () => {
                    // Modal closed
                }
            });
        }
        
        // Create and show modal
        this.treasureModal.create(content, '💎 Treasure Chest');
        this.treasureModal.show();
        
        // Add continue button handler
        const modalBody = this.treasureModal.getBody();
        const continueBtn = modalBody.querySelector('#treasure-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.treasureModal.hide();
            });
        }
    }
    
    /**
     * Get icon for item type
     */
    getItemTypeIcon(type) {
        switch(type) {
            case 'weapon': return '⚔️';
            case 'armor': return '🛡️';
            case 'shield': return '🔰';
            case 'accessory': return '💍';
            default: return '❓';
        }
    }
    
    /**
     * Handle dungeon exit - save state and return to town
     */
    async handleDungeonExit() {
        console.log('Handling dungeon exit...');
        console.log('Engine exists:', !!window.engine);
        console.log('Dungeon exists:', !!window.engine?.dungeon);
        console.log('Party exists:', !!window.engine?.party);
        console.log('Party ID:', window.engine?.party?.id);
        
        // Play exit sound effect
        if (window.engine?.audioManager) {
            window.engine.audioManager.playSoundEffect('exitDungeon');
        }
        
        if (window.engine) {
            // Save dungeon state and characters before exiting
            if (window.engine.dungeon && window.engine.party && window.engine.party.id) {
                try {
                    await window.engine.dungeon.saveToDatabase(window.engine.party.id);
                    console.log('Dungeon saved before exiting to town');
                    this.addMessage('Dungeon progress saved.', 'system');
                } catch (error) {
                    console.error('Failed to save dungeon before town exit:', error);
                    this.addMessage('Warning: Failed to save dungeon progress.', 'error');
                }
                
                // Save all party members
                if (window.engine.party.members) {
                    for (const member of window.engine.party.members) {
                        try {
                            await Storage.saveCharacter(member);
                        } catch (error) {
                            console.error(`Failed to save character ${member.name}:`, error);
                        }
                    }
                    console.log('Party members saved before exiting to town');
                    this.addMessage('Party members saved.', 'system');
                }
            }
            
            // Hide the exit button
            this.hideExitButton();
            
            // Remove casualties from party before returning to town
            if (window.engine.party) {
                const { casualties, survivors } = Helpers.removeCasualtiesFromParty(window.engine.party);
                
                // Show messages for each casualty
                casualties.forEach(casualty => {
                    const status = casualty.status || 'dead';
                    this.addMessage(`${casualty.name} (${status}) was brought to town for medical attention...`, 'warning');
                });
                
                // Mark party as returning to town
                window.engine.party.returnToTown();
                
                // Save party state
                try {
                    await window.engine.party.save();
                    console.log('Party status updated to in town');
                } catch (error) {
                    console.error('Failed to save party town status:', error);
                }
            }
            
            // Transition to town
            const success = window.engine.gameState.setState('town');
            
            if (success) {
                // Play town music when exiting to town
                if (window.engine?.audioManager) {
                    window.engine.audioManager.fadeToTrack('town');
                }
                
                // Show town interface
                this.showTown(window.engine.party);
                
                // Check if party is wiped and handle accordingly
                if (window.engine.party.members.length === 0) {
                    this.addMessage('No one survived to return to town.', 'error');
                    
                    // Handle party wipe - create new party
                    setTimeout(async () => {
                        await window.engine.handlePartyWipe();
                        this.updatePartyDisplay(window.engine.party);
                    }, 1000); // Brief delay for dramatic effect
                } else {
                    this.addMessage('The survivors return to town...', 'success');
                    this.updatePartyDisplay(window.engine.party);
                }
            } else {
                console.error('Failed to transition to town state');
                this.addMessage('Failed to return to town.', 'error');
            }
        }
    }
}