/**
 * TextManager
 * Dynamic text management system for Wizardry-Tron Fusion
 * Provides centralized terminology switching between classic and cyber modes
 */

class TextManager {
    static mode = 'cyber'; // Default to cyber mode for the transformation
    static callbacks = new Set(); // UI refresh callbacks
    
    /**
     * Get text for a given key using current mode
     * @param {string} key - The terminology key to look up
     * @param {string} fallback - Fallback text if key not found
     * @returns {string} The appropriate text for current mode
     */
    static getText(key, fallback = key) {
        // Ensure TERMINOLOGY is loaded
        if (typeof TERMINOLOGY === 'undefined') {
            console.warn('TERMINOLOGY not loaded, using fallback');
            return fallback;
        }
        
        const modeData = TERMINOLOGY[this.mode];
        if (!modeData) {
            console.warn(`Unknown text mode: ${this.mode}, using fallback`);
            return fallback;
        }
        
        return modeData[key] || fallback;
    }
    
    /**
     * Update the current text mode and trigger UI refresh
     * @param {string} newMode - 'classic' or 'cyber'
     */
    static updateMode(newMode) {
        if (newMode !== 'classic' && newMode !== 'cyber') {
            console.warn(`Invalid text mode: ${newMode}, keeping current mode`);
            return;
        }
        
        const oldMode = this.mode;
        this.mode = newMode;
        
        console.log(`TextManager mode changed: ${oldMode} → ${newMode}`);
        
        // Trigger all registered UI refresh callbacks
        this.callbacks.forEach(callback => {
            try {
                callback(newMode, oldMode);
            } catch (error) {
                console.error('Error in TextManager callback:', error);
            }
        });
        
        // Trigger global UI refresh event
        if (typeof window !== 'undefined' && window.EventSystem) {
            window.EventSystem.emit('textModeChanged', { newMode, oldMode });
        }
    }
    
    /**
     * Register a callback for when text mode changes
     * @param {Function} callback - Function to call on mode change
     */
    static onModeChange(callback) {
        this.callbacks.add(callback);
    }
    
    /**
     * Unregister a mode change callback
     * @param {Function} callback - Function to remove
     */
    static offModeChange(callback) {
        this.callbacks.delete(callback);
    }
    
    /**
     * Get all available text for a key across all modes
     * @param {string} key - The terminology key
     * @returns {Object} Object with classic and cyber versions
     */
    static getAllText(key) {
        if (typeof TERMINOLOGY === 'undefined') {
            return { classic: key, cyber: key };
        }
        
        return {
            classic: TERMINOLOGY.classic[key] || key,
            cyber: TERMINOLOGY.cyber[key] || key
        };
    }
    
    /**
     * Utility method to create mode-aware text elements
     * @param {string} key - The terminology key
     * @param {string} tagName - HTML tag name (default: 'span')
     * @param {string} className - CSS class name (optional)
     * @returns {HTMLElement} Element that updates with mode changes
     */
    static createTextElement(key, tagName = 'span', className = '') {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        
        // Set initial text
        element.textContent = this.getText(key);
        
        // Update on mode changes
        const updateText = () => {
            element.textContent = this.getText(key);
        };
        
        this.onModeChange(updateText);
        
        // Store cleanup function on element for manual removal if needed
        element._textManagerCleanup = () => {
            this.offModeChange(updateText);
        };
        
        return element;
    }
    
    /**
     * Apply text mode to an existing element
     * @param {HTMLElement} element - Element to update
     * @param {string} key - The terminology key
     */
    static applyToElement(element, key) {
        if (!element) return;
        
        // Set initial text
        element.textContent = this.getText(key);
        
        // Update on mode changes
        const updateText = () => {
            element.textContent = this.getText(key);
        };
        
        this.onModeChange(updateText);
        
        // Store cleanup function on element
        element._textManagerCleanup = () => {
            this.offModeChange(updateText);
        };
    }
    
    /**
     * Get current mode
     * @returns {string} Current text mode
     */
    static getMode() {
        return this.mode;
    }
    
    /**
     * Check if current mode is cyber
     * @returns {boolean} True if cyber mode
     */
    static isCyberMode() {
        return this.mode === 'cyber';
    }
    
    /**
     * Check if current mode is classic
     * @returns {boolean} True if classic mode
     */
    static isClassicMode() {
        return this.mode === 'classic';
    }
    
    /**
     * Toggle between classic and cyber modes
     */
    static toggleMode() {
        this.updateMode(this.mode === 'classic' ? 'cyber' : 'classic');
    }
}