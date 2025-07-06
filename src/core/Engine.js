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
            this.gameState = new GameState();
            this.renderer = new Renderer(this.canvas, this.context);
            this.ui = new UI(this.eventSystem);
            
            // Initialize game objects
            this.party = new Party();
            this.dungeon = new Dungeon();
            
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
        
        switch (newState) {
            case 'town':
                this.ui.showTown();
                this.ui.updatePartyDisplay(this.party);
                break;
                
            case 'training-grounds':
                this.ui.showTrainingGrounds();
                this.ui.updatePartyDisplay(this.party);
                break;
                
            case 'character-creation':
                this.ui.showCharacterCreation();
                break;
                
            case 'dungeon':
            case 'playing':
                this.ui.hideCharacterCreation();
                this.ui.hideTown();
                this.ui.hideTrainingGrounds();
                this.ui.updatePartyDisplay(this.party);
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
     * Handle character creation completion
     */
    handleCharacterCreated(character) {
        console.log('Character created:', character);
        
        // Add character to party
        if (this.party.addMember(character)) {
            this.ui.addMessage(`${character.name} the ${character.race} ${character.class} has joined your party!`);
            this.eventSystem.emit('party-update');
            
            // Return to training grounds
            this.gameState.setState('training-grounds');
            
            // Ask if they want to create another character
            setTimeout(() => {
                if (this.party.size < 6 && confirm('Would you like to create another character?')) {
                    this.gameState.setState('character-creation');
                }
            }, 500);
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
        
        // Always return to training grounds
        this.gameState.setState('training-grounds');
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
        
        switch (location) {
            case 'training-grounds':
                this.gameState.setState('training-grounds');
                break;
                
            case 'dungeon':
                if (this.party.size > 0) {
                    this.gameState.setState('playing');
                    this.ui.addMessage('You enter the dungeon...');
                } else {
                    this.ui.addMessage('You need at least one character to enter the dungeon!');
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
     * Get current game statistics
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            currentState: this.gameState ? this.gameState.currentState : 'uninitialized',
            partySize: this.party ? this.party.size : 0,
            frameRate: Math.round(1000 / this.frameInterval)
        };
    }
}