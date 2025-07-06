/**
 * Storage Utilities
 * Handles saving and loading game data using localStorage
 */
class Storage {
    static SAVE_KEY = 'descent_cyber_wizardry_save';
    static SETTINGS_KEY = 'descent_cyber_wizardry_settings';
    static CHARACTERS_KEY = 'descent_cyber_wizardry_characters';
    
    /**
     * Save game data
     */
    static saveGame(gameData) {
        try {
            const saveData = {
                ...gameData,
                version: '1.0.0',
                timestamp: Date.now()
            };
            
            const serialized = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, serialized);
            
            console.log('Game saved successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to save game:', error);
            throw new Error('Failed to save game: ' + error.message);
        }
    }
    
    /**
     * Load game data
     */
    static loadGame() {
        try {
            const serialized = localStorage.getItem(this.SAVE_KEY);
            
            if (!serialized) {
                return null;
            }
            
            const saveData = JSON.parse(serialized);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                console.warn('Invalid save data detected');
                return null;
            }
            
            console.log('Game loaded successfully');
            return saveData;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    
    /**
     * Check if a save game exists
     */
    static hasSavedGame() {
        const serialized = localStorage.getItem(this.SAVE_KEY);
        return serialized !== null;
    }
    
    /**
     * Delete saved game
     */
    static deleteSavedGame() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Saved game deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete saved game:', error);
            return false;
        }
    }
    
    /**
     * Save game settings
     */
    static saveSettings(settings) {
        try {
            const settingsData = {
                ...settings,
                timestamp: Date.now()
            };
            
            const serialized = JSON.stringify(settingsData);
            localStorage.setItem(this.SETTINGS_KEY, serialized);
            
            return true;
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    /**
     * Load game settings
     */
    static loadSettings() {
        try {
            const serialized = localStorage.getItem(this.SETTINGS_KEY);
            
            if (!serialized) {
                return this.getDefaultSettings();
            }
            
            const settings = JSON.parse(serialized);
            
            // Merge with defaults to ensure all settings exist
            return { ...this.getDefaultSettings(), ...settings };
            
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    /**
     * Get default settings
     */
    static getDefaultSettings() {
        return {
            volume: 0.7,
            soundEffects: true,
            music: true,
            autoSave: true,
            autoSaveInterval: 300, // 5 minutes
            keyBindings: {
                moveForward: 'ArrowUp',
                moveBackward: 'ArrowDown',
                turnLeft: 'ArrowLeft',
                turnRight: 'ArrowRight',
                action: 'Space',
                menu: 'Escape',
                inventory: 'i',
                spells: 's',
                rest: 'r',
                camp: 'c'
            },
            graphics: {
                wireframe: true,
                fillColors: false,
                smoothLines: true,
                showMinimap: true
            },
            gameplay: {
                confirmActions: true,
                showDamageNumbers: true,
                autoPickup: false,
                pauseOnLostFocus: true
            }
        };
    }
    
    /**
     * Save character templates
     */
    static saveCharacterTemplates(templates) {
        try {
            const templatesData = {
                templates: templates,
                timestamp: Date.now()
            };
            
            const serialized = JSON.stringify(templatesData);
            localStorage.setItem(this.CHARACTERS_KEY, serialized);
            
            return true;
            
        } catch (error) {
            console.error('Failed to save character templates:', error);
            return false;
        }
    }
    
    /**
     * Load character templates
     */
    static loadCharacterTemplates() {
        try {
            const serialized = localStorage.getItem(this.CHARACTERS_KEY);
            
            if (!serialized) {
                return [];
            }
            
            const data = JSON.parse(serialized);
            return data.templates || [];
            
        } catch (error) {
            console.error('Failed to load character templates:', error);
            return [];
        }
    }
    
    /**
     * Validate save data structure
     */
    static validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        // Check required fields
        const requiredFields = ['timestamp', 'version'];
        for (const field of requiredFields) {
            if (!(field in saveData)) {
                return false;
            }
        }
        
        // Check version compatibility
        if (saveData.version !== '1.0.0') {
            console.warn('Save data version mismatch:', saveData.version);
            // For now, we'll allow it but this is where migration logic would go
        }
        
        return true;
    }
    
    /**
     * Export save data as JSON string
     */
    static exportSave() {
        const saveData = this.loadGame();
        if (!saveData) {
            throw new Error('No save data to export');
        }
        
        return JSON.stringify(saveData, null, 2);
    }
    
    /**
     * Import save data from JSON string
     */
    static importSave(jsonString) {
        try {
            const saveData = JSON.parse(jsonString);
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data format');
            }
            
            this.saveGame(saveData);
            return true;
            
        } catch (error) {
            console.error('Failed to import save:', error);
            throw new Error('Failed to import save: ' + error.message);
        }
    }
    
    /**
     * Get storage usage information
     */
    static getStorageInfo() {
        try {
            const saveSize = localStorage.getItem(this.SAVE_KEY)?.length || 0;
            const settingsSize = localStorage.getItem(this.SETTINGS_KEY)?.length || 0;
            const charactersSize = localStorage.getItem(this.CHARACTERS_KEY)?.length || 0;
            
            return {
                totalSize: saveSize + settingsSize + charactersSize,
                saveSize: saveSize,
                settingsSize: settingsSize,
                charactersSize: charactersSize,
                hasSave: saveSize > 0,
                hasSettings: settingsSize > 0,
                hasCharacters: charactersSize > 0
            };
            
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }
    
    /**
     * Clear all stored data
     */
    static clearAll() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            localStorage.removeItem(this.CHARACTERS_KEY);
            
            console.log('All stored data cleared');
            return true;
            
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    /**
     * Check if localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get available storage space (approximate)
     */
    static getAvailableSpace() {
        if (!this.isAvailable()) {
            return 0;
        }
        
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            
            // Most browsers have a 5-10MB limit for localStorage
            const estimatedLimit = 5 * 1024 * 1024; // 5MB
            return Math.max(0, estimatedLimit - total);
            
        } catch (error) {
            return 0;
        }
    }
}