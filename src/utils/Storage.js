/**
 * Storage Utilities
 * Handles saving and loading game data using localStorage and IndexedDB
 * Enhanced with camp/resume mechanics for dungeon exploration
 * IndexedDB used for character persistence
 */
class Storage {
    static SAVE_KEY = 'descent_cyber_wizardry_save';
    static SETTINGS_KEY = 'descent_cyber_wizardry_settings';
    static CHARACTERS_KEY = 'descent_cyber_wizardry_characters';
    static CAMP_KEY_PREFIX = 'descent_camp_'; // For individual party camps
    static DUNGEON_STATE_KEY = 'descent_dungeon_states';
    
    // IndexedDB configuration
    static DB_NAME = 'DescentCyberWizardry';
    static DB_VERSION = 1;
    static CHARACTER_STORE = 'characters';
    static ROSTER_STORE = 'roster';
    
    static _db = null;
    static _dbInitialized = false;
    
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
    
    // IndexedDB Methods for Character Persistence
    
    /**
     * Initialize IndexedDB for character storage
     * @returns {Promise<boolean>} Success status
     */
    static async initializeDB() {
        if (this._dbInitialized && this._db) {
            return true;
        }
        
        if (!window.indexedDB) {
            console.error('IndexedDB not supported');
            return false;
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(false);
            };
            
            request.onsuccess = () => {
                this._db = request.result;
                this._dbInitialized = true;
                console.log('IndexedDB initialized successfully');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create characters store
                if (!db.objectStoreNames.contains(this.CHARACTER_STORE)) {
                    const characterStore = db.createObjectStore(this.CHARACTER_STORE, {
                        keyPath: 'id'
                    });
                    
                    // Create indexes for efficient queries
                    characterStore.createIndex('name', 'name', { unique: false });
                    characterStore.createIndex('race', 'race', { unique: false });
                    characterStore.createIndex('class', 'class', { unique: false });
                    characterStore.createIndex('level', 'level', { unique: false });
                    characterStore.createIndex('status', 'status', { unique: false });
                    characterStore.createIndex('dateCreated', 'dateCreated', { unique: false });
                    characterStore.createIndex('lastModified', 'lastModified', { unique: false });
                }
                
                // Create roster store for party management
                if (!db.objectStoreNames.contains(this.ROSTER_STORE)) {
                    const rosterStore = db.createObjectStore(this.ROSTER_STORE, {
                        keyPath: 'id'
                    });
                    
                    rosterStore.createIndex('name', 'name', { unique: false });
                    rosterStore.createIndex('dateCreated', 'dateCreated', { unique: false });
                    rosterStore.createIndex('lastModified', 'lastModified', { unique: false });
                }
                
                console.log('IndexedDB upgrade completed');
            };
        });
    }
    
    /**
     * Save character to IndexedDB
     * @param {Object} character - Character object to save
     * @returns {Promise<boolean>} Success status
     */
    static async saveCharacter(character) {
        try {
            if (!await this.initializeDB()) {
                throw new Error('Failed to initialize database');
            }
            
            const transaction = this._db.transaction([this.CHARACTER_STORE], 'readwrite');
            const store = transaction.objectStore(this.CHARACTER_STORE);
            
            // Prepare character data for storage
            const characterData = {
                id: character.id,
                name: character.name,
                race: character.race,
                class: character.class,
                level: character.level,
                experience: character.experience,
                attributes: { ...character.attributes },
                currentHP: character.currentHP,
                maxHP: character.maxHP,
                currentSP: character.currentSP,
                maxSP: character.maxSP,
                isAlive: character.isAlive,
                status: character.status,
                age: character.age,
                equipment: character.equipment ? { ...character.equipment } : {},
                inventory: character.inventory ? [...character.inventory] : [],
                memorizedSpells: character.memorizedSpells ? { ...character.memorizedSpells } : { arcane: [], divine: [] },
                conditions: character.conditions ? [...character.conditions] : [],
                temporaryEffects: character.temporaryEffects ? [...character.temporaryEffects] : [],
                classHistory: character.classHistory ? [...character.classHistory] : [],
                dateCreated: character.dateCreated || Date.now(),
                lastModified: Date.now()
            };
            
            return new Promise((resolve, reject) => {
                const request = store.put(characterData);
                
                request.onsuccess = () => {
                    console.log(`Character ${character.name} saved to IndexedDB`);
                    resolve(true);
                };
                
                request.onerror = () => {
                    console.error('Failed to save character:', request.error);
                    reject(false);
                };
            });
            
        } catch (error) {
            console.error('Failed to save character:', error);
            return false;
        }
    }
    
    /**
     * Load character from IndexedDB
     * @param {string} characterId - Character ID to load
     * @returns {Promise<Object|null>} Character data or null
     */
    static async loadCharacter(characterId) {
        try {
            if (!await this.initializeDB()) {
                throw new Error('Failed to initialize database');
            }
            
            const transaction = this._db.transaction([this.CHARACTER_STORE], 'readonly');
            const store = transaction.objectStore(this.CHARACTER_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.get(characterId);
                
                request.onsuccess = () => {
                    const character = request.result;
                    if (character) {
                        console.log(`Character ${character.name} loaded from IndexedDB`);
                    }
                    resolve(character || null);
                };
                
                request.onerror = () => {
                    console.error('Failed to load character:', request.error);
                    reject(null);
                };
            });
            
        } catch (error) {
            console.error('Failed to load character:', error);
            return null;
        }
    }
    
    /**
     * Load all characters from IndexedDB
     * @returns {Promise<Array>} Array of character objects
     */
    static async loadAllCharacters() {
        try {
            if (!await this.initializeDB()) {
                throw new Error('Failed to initialize database');
            }
            
            const transaction = this._db.transaction([this.CHARACTER_STORE], 'readonly');
            const store = transaction.objectStore(this.CHARACTER_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                
                request.onsuccess = () => {
                    const characters = request.result || [];
                    console.log(`Loaded ${characters.length} characters from IndexedDB`);
                    resolve(characters);
                };
                
                request.onerror = () => {
                    console.error('Failed to load characters:', request.error);
                    reject([]);
                };
            });
            
        } catch (error) {
            console.error('Failed to load characters:', error);
            return [];
        }
    }
    
    /**
     * Delete character from IndexedDB
     * @param {string} characterId - Character ID to delete
     * @returns {Promise<boolean>} Success status
     */
    static async deleteCharacter(characterId) {
        try {
            if (!await this.initializeDB()) {
                throw new Error('Failed to initialize database');
            }
            
            const transaction = this._db.transaction([this.CHARACTER_STORE], 'readwrite');
            const store = transaction.objectStore(this.CHARACTER_STORE);
            
            return new Promise((resolve, reject) => {
                const request = store.delete(characterId);
                
                request.onsuccess = () => {
                    console.log(`Character ${characterId} deleted from IndexedDB`);
                    resolve(true);
                };
                
                request.onerror = () => {
                    console.error('Failed to delete character:', request.error);
                    reject(false);
                };
            });
            
        } catch (error) {
            console.error('Failed to delete character:', error);
            return false;
        }
    }
    
    /**
     * Query characters by criteria
     * @param {Object} criteria - Query criteria (race, class, level, status, etc.)
     * @returns {Promise<Array>} Array of matching characters
     */
    static async queryCharacters(criteria = {}) {
        try {
            if (!await this.initializeDB()) {
                throw new Error('Failed to initialize database');
            }
            
            const transaction = this._db.transaction([this.CHARACTER_STORE], 'readonly');
            const store = transaction.objectStore(this.CHARACTER_STORE);
            
            // If no criteria, return all characters
            if (Object.keys(criteria).length === 0) {
                return this.loadAllCharacters();
            }
            
            // Use index if available
            const indexName = Object.keys(criteria)[0];
            const indexValue = criteria[indexName];
            
            return new Promise((resolve, reject) => {
                let request;
                
                if (store.indexNames.contains(indexName)) {
                    const index = store.index(indexName);
                    request = index.getAll(indexValue);
                } else {
                    // Fallback to full scan
                    request = store.getAll();
                }
                
                request.onsuccess = () => {
                    let characters = request.result || [];
                    
                    // Apply additional filters if using fallback
                    if (!store.indexNames.contains(indexName) || Object.keys(criteria).length > 1) {
                        characters = characters.filter(char => {
                            return Object.entries(criteria).every(([key, value]) => {
                                return char[key] === value;
                            });
                        });
                    }
                    
                    console.log(`Found ${characters.length} characters matching criteria`);
                    resolve(characters);
                };
                
                request.onerror = () => {
                    console.error('Failed to query characters:', request.error);
                    reject([]);
                };
            });
            
        } catch (error) {
            console.error('Failed to query characters:', error);
            return [];
        }
    }
    
    /**
     * Get character statistics
     * @returns {Promise<Object>} Character statistics
     */
    static async getCharacterStatistics() {
        try {
            const characters = await this.loadAllCharacters();
            
            const stats = {
                totalCharacters: characters.length,
                aliveCharacters: characters.filter(c => c.isAlive).length,
                deadCharacters: characters.filter(c => !c.isAlive).length,
                byRace: {},
                byClass: {},
                byLevel: {},
                byStatus: {},
                averageLevel: 0,
                highestLevel: 0,
                oldestCharacter: null,
                newestCharacter: null
            };
            
            if (characters.length > 0) {
                // Calculate distributions
                characters.forEach(char => {
                    // Race distribution
                    stats.byRace[char.race] = (stats.byRace[char.race] || 0) + 1;
                    
                    // Class distribution
                    stats.byClass[char.class] = (stats.byClass[char.class] || 0) + 1;
                    
                    // Level distribution
                    stats.byLevel[char.level] = (stats.byLevel[char.level] || 0) + 1;
                    
                    // Status distribution
                    stats.byStatus[char.status] = (stats.byStatus[char.status] || 0) + 1;
                });
                
                // Calculate averages and extremes
                const levels = characters.map(c => c.level);
                stats.averageLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
                stats.highestLevel = Math.max(...levels);
                
                // Find oldest and newest characters
                const sortedByDate = characters.sort((a, b) => a.dateCreated - b.dateCreated);
                stats.oldestCharacter = sortedByDate[0];
                stats.newestCharacter = sortedByDate[sortedByDate.length - 1];
            }
            
            return stats;
            
        } catch (error) {
            console.error('Failed to get character statistics:', error);
            return null;
        }
    }
    
    /**
     * Save character templates (legacy localStorage method)
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
     * Get available storage space
     */
    static getAvailableSpace() {
        try {
            const totalSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
            let usedSize = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    usedSize += localStorage[key].length;
                }
            }
            
            return {
                total: totalSize,
                used: usedSize,
                available: totalSize - usedSize,
                percentage: Math.round((usedSize / totalSize) * 100)
            };
            
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    // NEW: Camp and Resume System

    /**
     * Save party state when camping in dungeon
     * @param {Object} party - Party to save
     * @param {Object} dungeon - Current dungeon state
     * @param {Object} gameState - Current game state
     * @returns {Object} Save result
     */
    static savePartyInDungeon(party, dungeon, gameState = {}) {
        try {
            const campId = `${this.CAMP_KEY_PREFIX}${party.id}_${Date.now()}`;
            
            const campData = {
                campId,
                partyId: party.id,
                partyName: party.name,
                members: this.serializePartyMembers(party.members),
                location: {
                    currentFloor: dungeon.currentFloor,
                    playerX: dungeon.playerX,
                    playerY: dungeon.playerY,
                    playerDirection: dungeon.playerDirection,
                    dungeonId: dungeon.id || 'main_dungeon'
                },
                campTime: Date.now(),
                resources: {
                    gold: party.gold || 0,
                    food: party.food || 0,
                    torches: party.torches || 0,
                    lightRemaining: party.lightRemaining || 0
                },
                dungeonProgress: {
                    floorsExplored: dungeon.floorsExplored || [],
                    encountersDefeated: dungeon.encountersDefeated || 0,
                    treasuresFound: dungeon.treasuresFound || 0,
                    secretsDiscovered: dungeon.secretsDiscovered || 0
                },
                gameVersion: '1.0.0',
                saveType: 'dungeon_camp'
            };

            // Save dungeon state separately for efficiency
            this.saveDungeonState(dungeon);

            const serialized = JSON.stringify(campData);
            localStorage.setItem(campId, serialized);

            console.log(`Party ${party.name} camped in dungeon at floor ${dungeon.currentFloor}`);
            
            return {
                success: true,
                campId,
                message: `${party.name} has made camp on floor ${dungeon.currentFloor}.`
            };

        } catch (error) {
            console.error('Failed to save party camp:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to save camp state.'
            };
        }
    }

    /**
     * Resume party from dungeon camp
     * @param {string} campId - Camp save ID to resume
     * @returns {Object} Resume result with party and dungeon data
     */
    static resumePartyFromDungeon(campId) {
        try {
            const serialized = localStorage.getItem(campId);
            
            if (!serialized) {
                return {
                    success: false,
                    error: 'Camp save not found',
                    message: 'The specified camp save could not be found.'
                };
            }

            const campData = JSON.parse(serialized);
            
            // Validate camp data
            if (!this.validateCampData(campData)) {
                return {
                    success: false,
                    error: 'Invalid camp data',
                    message: 'The camp save data is corrupted or invalid.'
                };
            }

            // Deserialize party members
            const party = {
                id: campData.partyId,
                name: campData.partyName,
                members: this.deserializePartyMembers(campData.members),
                gold: campData.resources.gold,
                food: campData.resources.food,
                torches: campData.resources.torches,
                lightRemaining: campData.resources.lightRemaining
            };

            // Load dungeon state
            const dungeonState = this.loadDungeonState();

            const resumeResult = {
                success: true,
                party,
                location: campData.location,
                dungeonState,
                campTime: campData.campTime,
                timeCamped: Date.now() - campData.campTime,
                dungeonProgress: campData.dungeonProgress,
                message: `${party.name} resumed exploration from floor ${campData.location.currentFloor}.`
            };

            console.log(`Party ${party.name} resumed from camp`);
            return resumeResult;

        } catch (error) {
            console.error('Failed to resume party from camp:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to resume from camp.'
            };
        }
    }

    /**
     * Get list of all saved camps
     * @returns {Array} List of camp saves
     */
    static getSavedCamps() {
        const camps = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.CAMP_KEY_PREFIX)) {
                    const serialized = localStorage.getItem(key);
                    if (serialized) {
                        const campData = JSON.parse(serialized);
                        camps.push({
                            campId: key,
                            partyName: campData.partyName,
                            partyId: campData.partyId,
                            floor: campData.location.currentFloor,
                            campTime: campData.campTime,
                            timeCamped: Date.now() - campData.campTime,
                            memberCount: campData.members.length,
                            aliveCount: campData.members.filter(m => m.isAlive).length
                        });
                    }
                }
            }

            // Sort by most recent first
            camps.sort((a, b) => b.campTime - a.campTime);
            
        } catch (error) {
            console.error('Failed to get saved camps:', error);
        }

        return camps;
    }

    /**
     * Delete a saved camp
     * @param {string} campId - Camp ID to delete
     * @returns {boolean} Success status
     */
    static deleteCamp(campId) {
        try {
            localStorage.removeItem(campId);
            console.log(`Deleted camp: ${campId}`);
            return true;
        } catch (error) {
            console.error('Failed to delete camp:', error);
            return false;
        }
    }

    /**
     * Save dungeon state (floors, exploration data)
     * @param {Object} dungeon - Dungeon object to save
     * @returns {boolean} Success status
     */
    static saveDungeonState(dungeon) {
        try {
            const dungeonStates = this.loadDungeonStates() || {};
            
            const dungeonId = dungeon.id || 'main_dungeon';
            dungeonStates[dungeonId] = {
                currentFloor: dungeon.currentFloor,
                floors: dungeon.floors || {},
                floorsExplored: dungeon.floorsExplored || [],
                playerX: dungeon.playerX,
                playerY: dungeon.playerY,
                playerDirection: dungeon.playerDirection,
                encountersDefeated: dungeon.encountersDefeated || 0,
                treasuresFound: dungeon.treasuresFound || 0,
                secretsDiscovered: dungeon.secretsDiscovered || 0,
                lastSaved: Date.now()
            };

            const serialized = JSON.stringify(dungeonStates);
            localStorage.setItem(this.DUNGEON_STATE_KEY, serialized);
            
            return true;
        } catch (error) {
            console.error('Failed to save dungeon state:', error);
            return false;
        }
    }

    /**
     * Load specific dungeon state
     * @param {string} dungeonId - Dungeon ID to load
     * @returns {Object|null} Dungeon state or null
     */
    static loadDungeonState(dungeonId = 'main_dungeon') {
        try {
            const dungeonStates = this.loadDungeonStates();
            return dungeonStates ? dungeonStates[dungeonId] : null;
        } catch (error) {
            console.error('Failed to load dungeon state:', error);
            return null;
        }
    }

    /**
     * Load all dungeon states
     * @returns {Object|null} All dungeon states or null
     */
    static loadDungeonStates() {
        try {
            const serialized = localStorage.getItem(this.DUNGEON_STATE_KEY);
            return serialized ? JSON.parse(serialized) : null;
        } catch (error) {
            console.error('Failed to load dungeon states:', error);
            return null;
        }
    }

    /**
     * Serialize party members for storage
     * @param {Array} members - Party members array
     * @returns {Array} Serialized member data
     */
    static serializePartyMembers(members) {
        return members.map(member => ({
            id: member.id,
            name: member.name,
            race: member.race,
            class: member.class,
            level: member.level,
            experience: member.experience,
            attributes: { ...member.attributes },
            currentHP: member.currentHP,
            maxHP: member.maxHP,
            currentSP: member.currentSP,
            maxSP: member.maxSP,
            isAlive: member.isAlive,
            status: member.status,
            age: member.age,
            equipment: member.equipment ? { ...member.equipment } : {},
            inventory: member.inventory ? [...member.inventory] : [],
            memorizedSpells: member.memorizedSpells ? { ...member.memorizedSpells } : { arcane: [], divine: [] },
            conditions: member.conditions ? [...member.conditions] : [],
            temporaryEffects: member.temporaryEffects ? [...member.temporaryEffects] : [],
            classHistory: member.classHistory ? [...member.classHistory] : []
        }));
    }

    /**
     * Deserialize party members from storage
     * @param {Array} serializedMembers - Serialized member data
     * @returns {Array} Deserialized party members
     */
    static deserializePartyMembers(serializedMembers) {
        return serializedMembers.map(memberData => {
            // Reconstruct member object with proper structure
            const member = { ...memberData };
            
            // Ensure arrays and objects are properly reconstructed
            member.inventory = memberData.inventory || [];
            member.memorizedSpells = memberData.memorizedSpells || { arcane: [], divine: [] };
            member.conditions = memberData.conditions || [];
            member.temporaryEffects = memberData.temporaryEffects || [];
            member.classHistory = memberData.classHistory || [];
            
            return member;
        });
    }

    /**
     * Validate camp save data
     * @param {Object} campData - Camp data to validate
     * @returns {boolean} Whether data is valid
     */
    static validateCampData(campData) {
        if (!campData || typeof campData !== 'object') return false;
        
        const requiredFields = [
            'campId', 'partyId', 'partyName', 'members', 
            'location', 'campTime', 'resources'
        ];
        
        for (const field of requiredFields) {
            if (!(field in campData)) {
                console.warn(`Missing required field in camp data: ${field}`);
                return false;
            }
        }

        // Validate location data
        if (!campData.location.currentFloor || 
            campData.location.playerX === undefined || 
            campData.location.playerY === undefined) {
            console.warn('Invalid location data in camp save');
            return false;
        }

        // Validate members array
        if (!Array.isArray(campData.members) || campData.members.length === 0) {
            console.warn('Invalid members data in camp save');
            return false;
        }

        return true;
    }

    /**
     * Get camp save statistics
     * @returns {Object} Camp save statistics
     */
    static getCampStatistics() {
        const camps = this.getSavedCamps();
        
        return {
            totalCamps: camps.length,
            partiesInDungeons: new Set(camps.map(c => c.partyId)).size,
            oldestCamp: camps.length > 0 ? Math.min(...camps.map(c => c.campTime)) : null,
            newestCamp: camps.length > 0 ? Math.max(...camps.map(c => c.campTime)) : null,
            averageFloor: camps.length > 0 ? 
                Math.round(camps.reduce((sum, c) => sum + c.floor, 0) / camps.length) : 0,
            deepestFloor: camps.length > 0 ? Math.max(...camps.map(c => c.floor)) : 0
        };
    }

    /**
     * Clean up old camp saves (older than specified days)
     * @param {number} maxAgeDays - Maximum age in days before cleanup
     * @returns {Object} Cleanup result
     */
    static cleanupOldCamps(maxAgeDays = 30) {
        const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        
        try {
            const camps = this.getSavedCamps();
            
            for (const camp of camps) {
                if (camp.campTime < cutoffTime) {
                    this.deleteCamp(camp.campId);
                    deletedCount++;
                }
            }
            
            return {
                success: true,
                deletedCount,
                message: `Cleaned up ${deletedCount} old camp saves.`
            };
            
        } catch (error) {
            console.error('Failed to cleanup old camps:', error);
            return {
                success: false,
                error: error.message,
                deletedCount: 0
            };
        }
    }

    /**
     * Export camp save data for backup
     * @param {string} campId - Camp ID to export
     * @returns {string|null} JSON string of camp data
     */
    static exportCamp(campId) {
        try {
            const serialized = localStorage.getItem(campId);
            if (!serialized) return null;
            
            const campData = JSON.parse(serialized);
            return JSON.stringify(campData, null, 2);
            
        } catch (error) {
            console.error('Failed to export camp:', error);
            return null;
        }
    }

    /**
     * Import camp save data from backup
     * @param {string} jsonString - JSON string of camp data
     * @returns {Object} Import result
     */
    static importCamp(jsonString) {
        try {
            const campData = JSON.parse(jsonString);
            
            if (!this.validateCampData(campData)) {
                return {
                    success: false,
                    error: 'Invalid camp data format'
                };
            }
            
            // Generate new camp ID to avoid conflicts
            const newCampId = `${this.CAMP_KEY_PREFIX}${campData.partyId}_${Date.now()}`;
            campData.campId = newCampId;
            
            const serialized = JSON.stringify(campData);
            localStorage.setItem(newCampId, serialized);
            
            return {
                success: true,
                campId: newCampId,
                partyName: campData.partyName,
                message: `Imported camp for ${campData.partyName}.`
            };
            
        } catch (error) {
            console.error('Failed to import camp:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}