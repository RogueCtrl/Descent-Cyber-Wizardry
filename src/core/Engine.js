/**
 * Main Game Engine
 * Manages the game loop, state transitions, and module coordination
 */
class Engine {
    constructor() {
        this.gameState = null;
        this.eventSystem = null;
        this.renderer = null;
        this.ui = null;
        this.party = null;
        this.dungeon = null;
        this.player = null;
        
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        this.canvas = null;
        this.context = null;
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    /**
     * Initialize the game engine and all subsystems
     */
    async initialize() {
        console.log('Initializing Descent: Cyber Wizardry...');
        
        try {
            // Initialize canvas
            this.canvas = document.getElementById('game-canvas');
            this.context = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.context) {
                throw new Error('Failed to get canvas context');
            }
            
            // Initialize core systems
            this.eventSystem = new EventSystem();
            this.gameState = new GameState(this.eventSystem);
            this.renderer = new Renderer(this.canvas, this.context);
            this.ui = new UI(this.eventSystem);
            
                    // Initialize game objects
        this.party = new Party();
        this.dungeon = new Dungeon();
        this.combatInterface = new CombatInterface(this.eventSystem);
        
        // Initialize player position object
        this.player = {
            position: { x: 10, y: 10, facing: 'north' },
            currentFloor: 1
        };
        
        // Set up event listeners
        this.setupEventListeners();
            
            // Load initial game state
            await this.loadInitialState();
            
            // Initialize party display
            this.ui.updatePartyDisplay(this.party);
            
            // Start game loop
            this.start();
            
            // Make engine available globally for UI callbacks
            window.engine = this;
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showErrorMessage('Failed to initialize game: ' + error.message);
        }
    }
    
    /**
     * Set up event listeners for user input
     */
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            this.eventSystem.emit('keydown', event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.eventSystem.emit('keyup', event);
        });
        
        // Mouse input
        this.canvas.addEventListener('click', (event) => {
            this.eventSystem.emit('canvas-click', event);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.eventSystem.emit('window-resize');
        });
        
        // Game state events
        this.eventSystem.on('game-state-change', (newState) => {
            this.handleStateChange(newState);
        });
        
        this.eventSystem.on('party-update', () => {
            this.ui.updatePartyDisplay(this.party);
        });
        
        this.eventSystem.on('message', (message) => {
            this.ui.addMessage(message);
        });
        
        // Player action events
        this.eventSystem.on('player-action', (action) => {
            this.handlePlayerAction(action);
        });
        
        // Character creation events
        this.eventSystem.on('character-created', (character) => {
            this.handleCharacterCreated(character);
        });
        
        this.eventSystem.on('character-creation-cancelled', () => {
            this.handleCharacterCreationCancelled();
        });
        
        // Party management events
        this.eventSystem.on('party-leader-change', (characterId) => {
            this.handlePartyLeaderChange(characterId);
        });
        
        // Town and training grounds events
        this.eventSystem.on('town-location-selected', (location) => {
            this.handleTownLocationSelection(location);
        });
        
        this.eventSystem.on('training-action', (action) => {
            this.handleTrainingAction(action);
        });
        
        // Dungeon exploration events
        this.eventSystem.on('encounter-triggered', (data) => {
            this.handleEncounterTriggered(data);
        });
        
        this.eventSystem.on('trap-triggered', (data) => {
            this.handleTrapTriggered(data);
        });
        
        this.eventSystem.on('special-square-found', (data) => {
            this.handleSpecialSquareFound(data);
        });
        
        // Combat events
        this.eventSystem.on('combat-start', (data) => {
            this.handleCombatStart(data);
        });
        
        this.eventSystem.on('combat-end', (data) => {
            this.handleCombatEnd(data);
        });
        
        this.eventSystem.on('combat-flee-success', () => {
            this.handleCombatFleeSuccess();
        });
    }
    
    /**
     * Load initial game state
     */
    async loadInitialState() {
        // Check if there's a saved game
        const savedGame = Storage.loadGame();
        
        if (savedGame) {
            // Load saved game
            this.gameState.loadFromSave(savedGame);
            this.party.loadFromSave(savedGame.party);
            this.dungeon.loadFromSave(savedGame.dungeon);
            
            this.gameState.setState('playing');
            this.ui.addMessage('Game loaded successfully.');
        } else {
            // Start new game - begin in town
            this.gameState.setState('town');
            this.ui.addMessage('Welcome to Descent: Cyber Wizardry!');
            this.ui.addMessage('You arrive at the town near the Mad Overlord\'s castle.');
            this.ui.addMessage('Visit the Training Grounds to create your party of adventurers.');
        }
    }
    
    /**
     * Handle game state changes
     */
    handleStateChange(newState) {
        console.log('Game state changed to:', newState);
        console.log('Party size:', this.party ? this.party.size : 'no party');
        
        // Update body class for state-specific styling
        document.body.className = `game-state-${newState}`;
        
        switch (newState) {
            case 'town':
                this.ui.showTown(this.party);
                this.ui.updatePartyDisplay(this.party);
                break;
                
            case 'training-grounds':
                this.ui.hideTown(); // Hide town modal if open
                this.ui.showTrainingGrounds();
                this.ui.updatePartyDisplay(this.party);
                break;
                
            case 'character-creation':
                this.ui.showCharacterCreation();
                break;
                
            case 'dungeon':
            case 'playing':
                console.log('Entering playing/dungeon state - initializing dungeon interface');
                this.ui.hideCharacterCreation();
                this.ui.hideTown();
                this.ui.hideTrainingGrounds();
                this.ui.updatePartyDisplay(this.party);
                
                // Initialize dungeon exploration interface
                this.initializeDungeonInterface();
                break;
                
            case 'combat':
                this.ui.showCombatInterface();
                break;
                
            case 'menu':
                this.ui.showGameMenu();
                break;
                
            case 'paused':
                this.pause();
                break;
                
            default:
                console.warn('Unknown game state:', newState);
        }
    }
    
    /**
     * Initialize dungeon exploration interface
     */
    initializeDungeonInterface() {
        console.log('Initializing dungeon exploration interface...');
        
        // Ensure UI panels are visible
        this.ui.showDungeonInterface();
        
        // Initialize player position if not already set
        if (!this.player || !this.player.position) {
            this.player = {
                position: { x: 10, y: 10, facing: 'north' },
                currentFloor: 1
            };
        }
        
        // Sync player direction with dungeon direction system
        this.syncPlayerDirectionWithDungeon();
        
        // Resize canvas to fit the viewport
        this.resizeCanvasToViewport();
        
        // Update viewport with current dungeon view - use renderer directly for now
        this.updateDungeonView();
        
        // Enable movement controls
        this.enableMovementControls();
        
        console.log('Dungeon interface initialized');
    }
    
    /**
     * Resize canvas to fit the viewport
     */
    resizeCanvasToViewport() {
        const viewport = document.getElementById('viewport');
        if (viewport && this.canvas) {
            const rect = viewport.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            
            // Update renderer with new size
            if (this.renderer) {
                this.renderer.setSize(rect.width, rect.height);
            }
            
            console.log('Canvas resized to viewport:', rect.width, 'x', rect.height);
        }
    }
    
    /**
     * Update the dungeon 3D view
     */
    updateDungeonView() {
        if (this.dungeon && this.player && this.player.position) {
            // Use the renderer's dungeon rendering method
            this.renderer.renderDungeon(this.dungeon, this.party);
        } else {
            // Fallback to basic dungeon rendering
            this.renderer.renderBasicDungeon();
        }
    }
    
    /**
     * Enable movement controls for dungeon exploration
     */
    enableMovementControls() {
        // Set up keyboard listeners for movement
        this.setupMovementEventListeners();
        
        // Enable movement buttons
        this.ui.enableMovementControls();
    }
    
    /**
     * Setup movement event listeners for dungeon exploration
     */
    setupMovementEventListeners() {
        console.log('Setting up movement event listeners...');
        
        // Button event listeners
        const forwardBtn = document.getElementById('move-forward');
        const backwardBtn = document.getElementById('move-backward');
        const leftBtn = document.getElementById('turn-left');
        const rightBtn = document.getElementById('turn-right');
        
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                this.eventSystem.emit('player-action', { type: 'move', direction: 'forward' });
            });
        }
        
        if (backwardBtn) {
            backwardBtn.addEventListener('click', () => {
                this.eventSystem.emit('player-action', { type: 'move', direction: 'backward' });
            });
        }
        
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                this.eventSystem.emit('player-action', { type: 'turn', direction: 'left' });
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                this.eventSystem.emit('player-action', { type: 'turn', direction: 'right' });
            });
        }
        
        // Keyboard event listeners
        document.addEventListener('keydown', (event) => {
            if (this.gameState.isState('playing')) {
                switch (event.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        this.eventSystem.emit('player-action', { type: 'move', direction: 'forward' });
                        event.preventDefault();
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        this.eventSystem.emit('player-action', { type: 'move', direction: 'backward' });
                        event.preventDefault();
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.eventSystem.emit('player-action', { type: 'turn', direction: 'left' });
                        event.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.eventSystem.emit('player-action', { type: 'turn', direction: 'right' });
                        event.preventDefault();
                        break;
                }
            }
        });
        
        console.log('Movement event listeners set up');
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        
        console.log('Game loop started');
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.isRunning = false;
        console.log('Game paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        
        console.log('Game resumed');
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Only update if enough time has passed (frame limiting)
        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.render();
            
            this.lastFrameTime = currentTime;
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update game logic
     */
    update(deltaTime) {
        // Update game state
        this.gameState.update(deltaTime);
        
        // Update party
        if (this.party) {
            this.party.update(deltaTime);
        }
        
        // Update dungeon
        if (this.dungeon) {
            this.dungeon.update(deltaTime);
        }
        
        // Update UI
        if (this.ui) {
            this.ui.update(deltaTime);
        }
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render based on current state
        switch (this.gameState.currentState) {
            case 'playing':
                this.renderer.renderDungeon(this.dungeon, this.party);
                break;
                
            case 'combat':
                this.renderer.renderCombat();
                break;
                
            case 'character-creation':
                this.renderer.renderCharacterCreation();
                break;
                
            default:
                this.renderer.renderDefaultScreen();
        }
    }
    
    /**
     * Save the current game state
     */
    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState.getSaveData(),
                party: this.party.getSaveData(),
                dungeon: this.dungeon.getSaveData(),
                timestamp: Date.now()
            };
            
            Storage.saveGame(saveData);
            this.ui.addMessage('Game saved successfully.');
            
        } catch (error) {
            console.error('Failed to save game:', error);
            this.ui.addMessage('Failed to save game: ' + error.message);
        }
    }
    
    /**
     * Display error message to user
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: red;
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }
    
    /**
     * Handle player actions
     */
    handlePlayerAction(action) {
        if (!this.gameState.isState('playing')) {
            return;
        }
        
        // Handle action object format from new movement system
        if (typeof action === 'object' && action.type) {
            const actionType = action.type;
            const direction = action.direction;
            
            if (actionType === 'move') {
                this.handleMovementAction(direction);
            } else if (actionType === 'turn') {
                this.handleTurnAction(direction);
            }
            return;
        }
        
        // Handle legacy string format actions
        switch (action) {
            case 'move-forward':
                if (this.dungeon.movePlayer('forward')) {
                    this.ui.addMessage('You move forward.');
                } else {
                    this.ui.addMessage('You cannot move forward - there is a wall in the way.');
                }
                break;
                
            case 'move-backward':
                if (this.dungeon.movePlayer('backward')) {
                    this.ui.addMessage('You move backward.');
                } else {
                    this.ui.addMessage('You cannot move backward - there is a wall in the way.');
                }
                break;
                
            case 'turn-left':
                this.dungeon.turnPlayer('left');
                this.ui.addMessage(`You turn left. Now facing ${this.dungeon.getDirectionName()}.`);
                break;
                
            case 'turn-right':
                this.dungeon.turnPlayer('right');
                this.ui.addMessage(`You turn right. Now facing ${this.dungeon.getDirectionName()}.`);
                break;
                
            case 'search':
                this.handleSearchAction();
                break;
                
            case 'action':
            case 'interact':
                this.handleInteractAction();
                break;
                
            case 'stairs-up':
                this.handleStairsAction('up');
                break;
                
            case 'stairs-down':
                this.handleStairsAction('down');
                break;
                
            case 'cast-spell':
                this.ui.addMessage('Spell casting will be implemented in Phase 5.');
                break;
                
            case 'use-item':
                this.ui.addMessage('Item usage will be implemented in Phase 4.');
                break;
                
            case 'rest':
                this.ui.addMessage('Resting will be implemented in Phase 6.');
                break;
                
            case 'camp':
                this.ui.addMessage('Camping will be implemented in Phase 6.');
                break;
                
            default:
                console.warn('Unknown player action:', action);
        }
    }
    
    /**
     * Handle movement actions (forward, backward)
     */
    handleMovementAction(direction) {
        console.log('Handling movement action:', direction);
        
        if (direction === 'forward') {
            if (this.dungeon.movePlayer && this.dungeon.movePlayer('forward')) {
                this.ui.addMessage('You move forward.');
            } else {
                this.ui.addMessage('You cannot move forward - there is a wall in the way.');
            }
        } else if (direction === 'backward') {
            if (this.dungeon.movePlayer && this.dungeon.movePlayer('backward')) {
                this.ui.addMessage('You move backward.');
            } else {
                this.ui.addMessage('You cannot move backward - there is a wall in the way.');
            }
        }
        
        // Update the dungeon view after movement
        this.updateDungeonView();
    }
    
    /**
     * Handle turn actions (left, right)
     */
    handleTurnAction(direction) {
        console.log('Handling turn action:', direction);
        
        if (direction === 'left') {
            if (this.dungeon.turnPlayer) {
                console.log('Calling dungeon.turnPlayer(left), before:', this.dungeon.playerDirection);
                this.dungeon.turnPlayer('left');
                console.log('After dungeon.turnPlayer(left):', this.dungeon.playerDirection);
                // Sync the player object with dungeon direction
                this.syncPlayerDirectionWithDungeon();
                this.ui.addMessage(`You turn left. Now facing ${this.dungeon.getDirectionName()}.`);
            } else {
                console.log('Dungeon.turnPlayer not available, using fallback');
                // Fallback: update player facing directly
                this.updatePlayerFacing('left');
                this.ui.addMessage('You turn left.');
            }
        } else if (direction === 'right') {
            if (this.dungeon.turnPlayer) {
                console.log('Calling dungeon.turnPlayer(right), before:', this.dungeon.playerDirection);
                this.dungeon.turnPlayer('right');
                console.log('After dungeon.turnPlayer(right):', this.dungeon.playerDirection);
                // Sync the player object with dungeon direction
                this.syncPlayerDirectionWithDungeon();
                this.ui.addMessage(`You turn right. Now facing ${this.dungeon.getDirectionName()}.`);
            } else {
                console.log('Dungeon.turnPlayer not available, using fallback');
                // Fallback: update player facing directly
                this.updatePlayerFacing('right');
                this.ui.addMessage('You turn right.');
            }
        }
        
        // Update the dungeon view after turning
        this.updateDungeonView();
    }
    
    /**
     * Sync player object direction with dungeon direction
     */
    syncPlayerDirectionWithDungeon() {
        if (!this.player || !this.player.position || !this.dungeon) return;
        
        const directions = ['north', 'east', 'south', 'west'];
        this.player.position.facing = directions[this.dungeon.playerDirection];
        
        console.log('Synced player direction:', this.player.position.facing, 'from dungeon direction:', this.dungeon.playerDirection);
    }
    
    /**
     * Update player facing direction
     */
    updatePlayerFacing(turn) {
        if (!this.player || !this.player.position) return;
        
        const directions = ['north', 'east', 'south', 'west'];
        const currentIndex = directions.indexOf(this.player.position.facing);
        
        if (turn === 'left') {
            this.player.position.facing = directions[(currentIndex - 1 + 4) % 4];
        } else if (turn === 'right') {
            this.player.position.facing = directions[(currentIndex + 1) % 4];
        }
    }
    
    /**
     * Handle search action in dungeon
     */
    handleSearchAction() {
        if (!this.gameState.isState('playing')) {
            return;
        }
        
        this.ui.addMessage('You search the area carefully...');
        
        const discoveries = this.dungeon.searchArea();
        
        if (discoveries.length > 0) {
            discoveries.forEach(discovery => {
                this.ui.addMessage(discovery.message);
            });
        } else {
            this.ui.addMessage('You find nothing of interest.');
        }
    }
    
    /**
     * Handle interaction with special squares
     */
    handleInteractAction() {
        if (!this.gameState.isState('playing')) {
            return;
        }
        
        // Check for special square at current position
        const special = this.dungeon.currentFloorData.specialSquares.find(spec =>
            spec.x === this.dungeon.playerX && spec.y === this.dungeon.playerY
        );
        
        if (!special) {
            this.ui.addMessage('There is nothing to interact with here.');
            return;
        }
        
        if (special.used) {
            this.ui.addMessage('This has already been used.');
            return;
        }
        
        // Handle special square interaction
        switch (special.type) {
            case 'healing_fountain':
                this.handleHealingFountain(special);
                break;
                
            case 'stamina_fountain':
                this.handleStaminaFountain(special);
                break;
                
            case 'poison_fountain':
                this.handlePoisonFountain(special);
                break;
                
            case 'teleporter':
                this.handleTeleporter(special);
                break;
                
            case 'treasure_chest':
                this.handleTreasureChest(special);
                break;
                
            default:
                this.ui.addMessage('You cannot interact with this.');
        }
    }
    
    /**
     * Handle stairs movement
     */
    handleStairsAction(direction) {
        if (!this.gameState.isState('playing')) {
            return;
        }
        
        if (this.dungeon.changeFloor(direction)) {
            const floorNumber = this.dungeon.currentFloor;
            this.ui.addMessage(`You ${direction === 'up' ? 'ascend' : 'descend'} to floor ${floorNumber}.`);
            
            // Save game when changing floors
            this.saveGame();
        } else {
            this.ui.addMessage(`There are no stairs ${direction} here.`);
        }
    }
    
    /**
     * Handle healing fountain interaction
     */
    handleHealingFountain(special) {
        this.ui.addMessage('You drink from the crystal clear waters...');
        
        let totalHealed = 0;
        this.party.members.forEach(member => {
            if (member.currentHP < member.maxHP) {
                const healAmount = Random.integer(1, 8);
                const actualHeal = Math.min(healAmount, member.maxHP - member.currentHP);
                member.currentHP += actualHeal;
                totalHealed += actualHeal;
                
                if (member.status === 'unconscious' && member.currentHP > 0) {
                    member.status = 'ok';
                    this.ui.addMessage(`${member.name} regains consciousness!`);
                }
            }
        });
        
        if (totalHealed > 0) {
            this.ui.addMessage(`The party is healed for ${totalHealed} hit points!`);
            this.eventSystem.emit('party-update');
        } else {
            this.ui.addMessage('The water has no effect on your party.');
        }
        
        special.used = true;
    }
    
    /**
     * Handle stamina fountain interaction
     */
    handleStaminaFountain(special) {
        this.ui.addMessage('You drink from the energizing waters...');
        
        // TODO: Restore spell points when spell system is fully integrated
        this.ui.addMessage('You feel refreshed! (Spell points would be restored)');
        
        special.used = true;
    }
    
    /**
     * Handle poison fountain interaction
     */
    handlePoisonFountain(special) {
        this.ui.addMessage('You cautiously drink from the tainted waters...');
        
        if (Random.chance(0.3)) {
            // Lucky - actually beneficial
            const member = Random.choice(this.party.members);
            member.currentHP = Math.min(member.maxHP, member.currentHP + Random.integer(2, 12));
            this.ui.addMessage(`Surprisingly, ${member.name} feels invigorated!`);
        } else {
            // Poisoned
            const member = Random.choice(this.party.members);
            const damage = Random.integer(1, 6);
            member.currentHP = Math.max(0, member.currentHP - damage);
            this.ui.addMessage(`${member.name} is poisoned and takes ${damage} damage!`);
            
            if (member.currentHP === 0) {
                member.status = 'unconscious';
                this.ui.addMessage(`${member.name} collapses from the poison!`);
            }
        }
        
        this.eventSystem.emit('party-update');
        special.used = true;
    }
    
    /**
     * Handle teleporter interaction
     */
    handleTeleporter(special) {
        this.ui.addMessage('You step onto the magical portal...');
        
        // Teleport to random location on current floor
        const newX = Random.integer(1, 19);
        const newY = Random.integer(1, 19);
        this.dungeon.playerX = newX;
        this.dungeon.playerY = newY;
        
        this.ui.addMessage('Reality blurs around you as you are teleported elsewhere!');
        
        // Teleporters don't get used up - they're permanent
    }
    
    /**
     * Handle treasure chest interaction
     */
    handleTreasureChest(special) {
        this.ui.addMessage('You attempt to open the treasure chest...');
        
        // Check for chest trap
        if (Random.chance(0.4)) {
            // Trapped!
            const damage = Random.integer(1, 6);
            const target = Random.choice(this.party.members);
            target.currentHP = Math.max(0, target.currentHP - damage);
            
            this.ui.addMessage(`The chest is trapped! ${target.name} takes ${damage} damage from a poison needle.`);
            
            if (target.currentHP === 0) {
                target.status = 'unconscious';
                this.ui.addMessage(`${target.name} collapses from the trap!`);
            }
            
            this.eventSystem.emit('party-update');
        }
        
        // Generate treasure regardless of trap
        if (Random.chance(0.8)) {
            const goldFound = Random.integer(10, 100) * this.dungeon.currentFloor;
            this.ui.addMessage(`You find ${goldFound} gold pieces!`);
            // TODO: Add gold to party inventory
            
            // Small chance of special item
            if (Random.chance(0.1)) {
                this.ui.addMessage('You also find a magical item!');
                // TODO: Generate and add magical item
            }
        } else {
            this.ui.addMessage('The chest is empty...');
        }
        
        special.used = true;
    }
    
    /**
     * Handle character creation completion
     */
    async handleCharacterCreated(character) {
        console.log('Character created:', character);
        
        // Save character to persistent storage
        try {
            await Storage.saveCharacter(character);
            console.log(`Character ${character.name} saved to persistent storage`);
        } catch (error) {
            console.error('Failed to save character to persistent storage:', error);
            // Still continue with party addition even if persistence fails
        }
        
        // Add character to party
        if (this.party.addMember(character)) {
            this.ui.addMessage(`${character.name} the ${character.race} ${character.class} has joined your party!`);
            this.eventSystem.emit('party-update');
            
            // Return to training grounds
            this.gameState.setState('training-grounds');
            
            // Return to training grounds - player can choose to create another character from the menu
        } else {
            this.ui.addMessage('Party is full! Cannot add more characters.');
            this.gameState.setState('training-grounds');
        }
    }
    
    /**
     * Handle character creation cancellation
     */
    handleCharacterCreationCancelled() {
        console.log('Character creation cancelled');
        
        // Return to training grounds only if not already there
        if (!this.gameState.isState('training-grounds')) {
            this.gameState.setState('training-grounds');
        }
        this.ui.addMessage('Character creation cancelled.');
    }
    
    /**
     * Handle party leader change
     */
    handlePartyLeaderChange(characterId) {
        const character = this.party.members.find(c => c.id === characterId);
        if (character) {
            this.party.currentLeader = character;
            console.log('Party leader changed to:', character.name);
        }
    }
    
    /**
     * Handle town location selection
     */
    handleTownLocationSelection(location) {
        console.log('Town location selected:', location);
        console.log('Current state before location selection:', this.gameState.currentState);
        
        switch (location) {
            case 'training-grounds':
                this.gameState.setState('training-grounds');
                break;
                
            case 'dungeon':
                console.log('Attempting dungeon entry...');
                if (this.validateDungeonEntry()) {
                    console.log('Dungeon entry validation passed, entering dungeon...');
                    this.ui.hideTown(); // Ensure town modal is closed
                    this.gameState.setState('playing');
                    this.ui.addMessage('You enter the dungeon...');
                    // Emit event to notify UI of dungeon entry
                    this.eventSystem.emit('dungeon-entered');
                } else {
                    console.log('Dungeon entry validation failed');
                    // Validation failed - stay in town
                    this.ui.addMessage('Cannot enter dungeon. Check party requirements.');
                    // Ensure we're still in town state
                    if (!this.gameState.isState('town')) {
                        console.log('Forcing state back to town after failed validation');
                        this.gameState.setState('town');
                    }
                }
                break;
                
            default:
                this.ui.addMessage(`${location} is not yet implemented.`);
        }
    }
    
    /**
     * Handle training grounds actions
     */
    handleTrainingAction(action) {
        console.log('Training action:', action);
        
        switch (action) {
            case 'create-character':
                this.gameState.setState('character-creation');
                break;
                
            case 'back-to-town':
                this.gameState.setState('town');
                break;
                
            case 'view-party':
                this.ui.addMessage('Party stats viewing not yet implemented.');
                break;
                
            default:
                this.ui.addMessage(`Training action ${action} not yet implemented.`);
        }
    }
    
    /**
     * Validate if party can enter the dungeon
     */
    validateDungeonEntry() {
        console.log('=== Dungeon Entry Validation ===');
        console.log('Current game state:', this.gameState.currentState);
        console.log('Party exists:', !!this.party);
        console.log('Party size:', this.party ? this.party.size : 'N/A');
        
        // Check if party exists and has members
        if (!this.party || this.party.size === 0) {
            console.log('Validation failed: No party or empty party');
            this.ui.addMessage('You need at least one character to enter the dungeon!');
            return false;
        }
        
        // Check if party has any living members
        const livingMembers = this.party.members.filter(member => 
            member.status !== 'dead' && member.status !== 'lost'
        );
        
        console.log('Living members:', livingMembers.length);
        console.log('Member statuses:', this.party.members.map(m => `${m.name}: ${m.status || 'OK'}`));
        
        if (livingMembers.length === 0) {
            console.log('Validation failed: No living members');
            this.ui.addMessage('Your party has no living members! Visit the Temple for resurrections.');
            return false;
        }
        
        // Check if we're in a valid state to enter dungeon
        if (!this.gameState.isState('town')) {
            console.log('Validation failed: Invalid state for dungeon entry:', this.gameState.currentState);
            console.warn('Invalid state for dungeon entry:', this.gameState.currentState);
            this.ui.addMessage('You must be in town to enter the dungeon.');
            return false;
        }
        
        // All validation passed
        console.log('Validation passed: Ready to enter dungeon');
        return true;
    }
    
    /**
     * Handle encounter triggered in dungeon
     */
    handleEncounterTriggered(data) {
        console.log('Encounter triggered:', data);
        
        const { encounter, x, y, floor } = data;
        
        // Generate combat encounter based on dungeon encounter
        const encounterType = encounter.type === 'boss' ? 'boss' : 'normal';
        const dungeonLevel = floor;
        
        this.ui.addMessage(`You are attacked by monsters!`);
        
        // Start combat through combat interface
        this.combatInterface.initiateCombat(this.party, encounterType, dungeonLevel);
        
        // Change game state to combat
        this.gameState.setState('combat');
    }
    
    /**
     * Handle trap triggered in dungeon
     */
    handleTrapTriggered(data) {
        console.log('Trap triggered:', data);
        
        const { type, x, y, floor } = data;
        let damage = 0;
        let message = '';
        
        switch (type) {
            case 'pit_trap':
                damage = Random.integer(1, 6);
                message = `The floor gives way! You fall into a pit trap for ${damage} damage.`;
                break;
                
            case 'poison_dart':
                damage = Random.integer(1, 4);
                message = `A dart shoots from the wall, striking for ${damage} poison damage!`;
                // TODO: Apply poison effect
                break;
                
            case 'teleport_trap':
                // Teleport party to random location on same floor
                const newX = Random.integer(1, 19);
                const newY = Random.integer(1, 19);
                this.dungeon.playerX = newX;
                this.dungeon.playerY = newY;
                message = `You are suddenly teleported to another part of the dungeon!`;
                break;
                
            case 'alarm_trap':
                message = `An alarm sounds! Monsters are alerted to your presence.`;
                // Increase encounter chance for next few moves
                // TODO: Implement alarm effect
                break;
                
            default:
                message = `You triggered an unknown trap!`;
        }
        
        this.ui.addMessage(message);
        
        // Apply damage to random party member if any
        if (damage > 0) {
            const livingMembers = this.party.members.filter(m => m.currentHP > 0);
            if (livingMembers.length > 0) {
                const target = Random.choice(livingMembers);
                target.currentHP = Math.max(0, target.currentHP - damage);
                
                this.ui.addMessage(`${target.name} takes ${damage} damage from the trap.`);
                
                if (target.currentHP === 0) {
                    target.status = 'unconscious';
                    this.ui.addMessage(`${target.name} is knocked unconscious!`);
                }
                
                this.eventSystem.emit('party-update');
            }
        }
    }
    
    /**
     * Handle special square found in dungeon
     */
    handleSpecialSquareFound(data) {
        console.log('Special square found:', data);
        
        const { special, x, y, floor } = data;
        
        // Display special square message
        this.ui.addMessage(special.message);
        
        switch (special.type) {
            case 'healing_fountain':
                this.ui.addMessage('Press SPACE to drink from the healing fountain.');
                // TODO: Implement fountain interaction
                break;
                
            case 'stamina_fountain':
                this.ui.addMessage('Press SPACE to drink from the energizing fountain.');
                // TODO: Implement stamina restoration
                break;
                
            case 'poison_fountain':
                this.ui.addMessage('This water looks dangerous. Proceed with caution.');
                // TODO: Implement poison fountain risk/reward
                break;
                
            case 'teleporter':
                this.ui.addMessage('Press SPACE to activate the teleporter.');
                // TODO: Implement teleporter mechanics
                break;
                
            case 'message_square':
                // Generate a random message from ancient carved text
                const messages = [
                    'Here lies the bones of forty thieves...',
                    'Beware the wrath of the Mad Overlord!',
                    'Only the worthy may claim the sacred amulet.',
                    'Many have entered, few have returned.',
                    'The deeper you go, the greater the danger.',
                    'Trust not the fountains of the lower levels.'
                ];
                this.ui.addMessage(`The text reads: "${Random.choice(messages)}"`);
                break;
                
            case 'treasure_chest':
                this.ui.addMessage('A treasure chest! Press SPACE to attempt to open it.');
                // TODO: Implement chest mechanics with trap/treasure chances
                break;
                
            default:
                this.ui.addMessage('You find something unusual here.');
        }
    }
    
    /**
     * Handle combat start
     */
    handleCombatStart(data) {
        console.log('Combat started:', data);
        this.ui.addMessage('Combat begins!');
        
        // Update UI to show combat interface
        this.ui.showCombatInterface();
    }
    
    /**
     * Handle combat end
     */
    handleCombatEnd(data) {
        console.log('Combat ended:', data);
        
        const { victory, fled, casualties } = data;
        
        if (victory) {
            this.ui.addMessage('Victory! The monsters are defeated.');
            
            if (data.experience) {
                this.ui.addMessage(`Your party gains ${data.experience} experience!`);
                // TODO: Distribute experience to party members
            }
            
            if (data.treasure) {
                this.ui.addMessage(`You found treasure: ${data.treasure.join(', ')}`);
                // TODO: Add treasure to party inventory
            }
        } else if (fled) {
            this.ui.addMessage('You successfully fled from combat.');
        } else {
            this.ui.addMessage('Your party has been defeated...');
            // TODO: Handle party defeat (return to town, lost members, etc.)
        }
        
        if (casualties && casualties.length > 0) {
            casualties.forEach(casualty => {
                this.ui.addMessage(`${casualty.name} has fallen in battle.`);
                casualty.status = 'dead';
            });
        }
        
        // Return to dungeon exploration
        this.gameState.setState('playing');
        this.ui.hideCombatInterface();
        this.eventSystem.emit('party-update');
    }
    
    /**
     * Handle successful flee from combat
     */
    handleCombatFleeSuccess() {
        console.log('Successfully fled from combat');
        this.ui.addMessage('You successfully escape from the monsters!');
        
        // Return to dungeon exploration
        this.gameState.setState('playing');
        this.ui.hideCombatInterface();
    }
    
    /**
     * Get current game statistics
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            currentState: this.gameState ? this.gameState.currentState : 'uninitialized',
            partySize: this.party ? this.party.size : 0,
            frameRate: Math.round(1000 / this.frameInterval),
            dungeonFloor: this.dungeon ? this.dungeon.currentFloor : 0,
            combatActive: this.combatInterface ? this.combatInterface.isInCombat() : false
        };
    }
}