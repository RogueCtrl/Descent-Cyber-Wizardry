/**
 * Game State Management
 * Handles game state transitions and state-specific logic
 */
class GameState {
    constructor(eventSystem = null) {
        this.eventSystem = eventSystem;
        this.currentState = 'loading';
        this.previousState = null;
        this.stateData = {};
        this.stateHistory = [];
        
        // Define valid state transitions
        this.validTransitions = {
            'loading': ['town', 'playing'],
            'town': ['training-grounds', 'dungeon', 'menu', 'playing'],
            'training-grounds': ['town', 'character-creation'],
            'character-creation': ['training-grounds'],
            'dungeon': ['playing', 'town'],
            'playing': ['combat', 'menu', 'paused', 'town'],
            'combat': ['playing', 'game-over'],
            'menu': ['town', 'playing'],
            'paused': ['playing', 'menu'],
            'game-over': ['town']
        };
    }
    
    /**
     * Set the current game state
     */
    setState(newState, data = {}) {
        if (!this.isValidTransition(newState)) {
            console.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
            return false;
        }
        
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        this.stateData = { ...data };
        
        // Add to history
        this.stateHistory.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            data: data
        });
        
        // Keep history limited
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }
        
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // Emit state change event
        if (this.eventSystem) {
            this.eventSystem.emit('game-state-change', newState, oldState, data);
        }
        
        return true;
    }
    
    /**
     * Check if a state transition is valid
     */
    isValidTransition(newState) {
        const validStates = this.validTransitions[this.currentState];
        return validStates && validStates.includes(newState);
    }
    
    /**
     * Get the current state
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Get the previous state
     */
    getPreviousState() {
        return this.previousState;
    }
    
    /**
     * Get state data
     */
    getStateData() {
        return this.stateData;
    }
    
    /**
     * Update state data
     */
    updateStateData(newData) {
        this.stateData = { ...this.stateData, ...newData };
    }
    
    /**
     * Go back to previous state
     */
    goToPreviousState() {
        if (this.previousState && this.isValidTransition(this.previousState)) {
            this.setState(this.previousState);
            return true;
        }
        return false;
    }
    
    /**
     * Check if currently in a specific state
     */
    isState(state) {
        return this.currentState === state;
    }
    
    /**
     * Check if in any of the provided states
     */
    isAnyState(states) {
        return states.includes(this.currentState);
    }
    
    /**
     * Update method called each frame
     */
    update(deltaTime) {
        // State-specific update logic
        switch (this.currentState) {
            case 'playing':
                this.updatePlaying(deltaTime);
                break;
                
            case 'combat':
                this.updateCombat(deltaTime);
                break;
                
            case 'character-creation':
                this.updateCharacterCreation(deltaTime);
                break;
                
            default:
                // No update needed for other states
                break;
        }
    }
    
    /**
     * Update logic for playing state
     */
    updatePlaying(deltaTime) {
        // Update any playing-specific timers or logic
        if (this.stateData.autoSaveTimer) {
            this.stateData.autoSaveTimer -= deltaTime;
            if (this.stateData.autoSaveTimer <= 0) {
                this.stateData.autoSaveTimer = 30000; // 30 seconds
                // Trigger autosave
                if (typeof EventSystem !== 'undefined') {
                    const eventSystem = window.eventSystem || new EventSystem();
                    eventSystem.emit('autosave-requested');
                }
            }
        }
    }
    
    /**
     * Update logic for combat state
     */
    updateCombat(deltaTime) {
        // Handle combat-specific timing
        if (this.stateData.combatTimer) {
            this.stateData.combatTimer -= deltaTime;
        }
        
        if (this.stateData.actionDelay) {
            this.stateData.actionDelay -= deltaTime;
            if (this.stateData.actionDelay <= 0) {
                this.stateData.actionDelay = 0;
                // Action delay completed
                if (typeof EventSystem !== 'undefined') {
                    const eventSystem = window.eventSystem || new EventSystem();
                    eventSystem.emit('combat-action-ready');
                }
            }
        }
    }
    
    /**
     * Update logic for character creation state
     */
    updateCharacterCreation(deltaTime) {
        // Handle character creation timing (if any)
        // This could include auto-save of character creation progress
    }
    
    /**
     * Get save data for this state manager
     */
    getSaveData() {
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            stateData: this.stateData,
            stateHistory: this.stateHistory.slice(-10) // Only save last 10 states
        };
    }
    
    /**
     * Load state from save data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        this.currentState = saveData.currentState || 'loading';
        this.previousState = saveData.previousState || null;
        this.stateData = saveData.stateData || {};
        this.stateHistory = saveData.stateHistory || [];
        
        console.log(`Loaded game state: ${this.currentState}`);
    }
    
    /**
     * Reset state to initial values
     */
    reset() {
        this.currentState = 'loading';
        this.previousState = null;
        this.stateData = {};
        this.stateHistory = [];
        
        console.log('Game state reset');
    }
    
    /**
     * Get state history
     */
    getStateHistory() {
        return [...this.stateHistory];
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            stateData: this.stateData,
            historyLength: this.stateHistory.length,
            validTransitions: this.validTransitions[this.currentState]
        };
    }
}