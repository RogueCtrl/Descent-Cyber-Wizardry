/**
 * Helper Utilities
 * Common utility functions used throughout the game
 */
class Helpers {
    /**
     * Clamp a value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * Linear interpolation between two values
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    /**
     * Map a value from one range to another
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    
    /**
     * Check if a value is between min and max (inclusive)
     */
    static between(value, min, max) {
        return value >= min && value <= max;
    }
    
    /**
     * Calculate distance between two points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate angle between two points (in radians)
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    /**
     * Convert degrees to radians
     */
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Convert radians to degrees
     */
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Normalize an angle to 0-2π range
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }
    
    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        
        return obj;
    }
    
    /**
     * Check if two objects are deeply equal
     */
    static deepEqual(obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        }
        
        if (obj1 == null || obj2 == null) {
            return false;
        }
        
        if (typeof obj1 !== typeof obj2) {
            return false;
        }
        
        if (typeof obj1 !== 'object') {
            return false;
        }
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) {
            return false;
        }
        
        for (const key of keys1) {
            if (!keys2.includes(key)) {
                return false;
            }
            
            if (!this.deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Debounce a function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle a function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Format a number with thousand separators
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Format time in MM:SS format
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Format a date as readable string
     */
    static formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    /**
     * Capitalize first letter of a string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    /**
     * Convert camelCase to Title Case
     */
    static camelToTitle(str) {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    /**
     * Generate a hash code for a string
     */
    static hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash;
    }
    
    /**
     * Check if a string is empty or whitespace
     */
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }
    
    /**
     * Truncate a string to specified length
     */
    static truncate(str, length, suffix = '...') {
        if (str.length <= length) {
            return str;
        }
        
        return str.substring(0, length - suffix.length) + suffix;
    }
    
    /**
     * Generate a random ID
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Wait for a specified amount of time
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Retry a function with exponential backoff
     */
    static async retry(func, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                
                await this.wait(delay * Math.pow(2, attempt - 1));
            }
        }
    }
    
    /**
     * Load an image and return a promise
     */
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    /**
     * Load an audio file and return a promise
     */
    static loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
            audio.src = src;
        });
    }
    
    /**
     * Check if an element is visible in the viewport
     */
    static isVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Scroll an element into view smoothly
     */
    static scrollIntoView(element, behavior = 'smooth') {
        element.scrollIntoView({ behavior, block: 'nearest' });
    }
    
    /**
     * Get the current timestamp in milliseconds
     */
    static timestamp() {
        return Date.now();
    }
    
    /**
     * Get a high-resolution timestamp for performance measurement
     */
    static perfTimestamp() {
        return performance.now();
    }
    
    /**
     * Measure execution time of a function
     */
    static async measureTime(func, label = 'Operation') {
        const start = this.perfTimestamp();
        const result = await func();
        const end = this.perfTimestamp();
        
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    /**
     * Create a simple state machine
     */
    static createStateMachine(states, initialState) {
        let currentState = initialState;
        
        return {
            getState: () => currentState,
            setState: (newState) => {
                if (states[newState]) {
                    currentState = newState;
                    return true;
                }
                return false;
            },
            isState: (state) => currentState === state,
            canTransition: (toState) => {
                return states[currentState] && states[currentState].includes(toState);
            }
        };
    }
    
    /**
     * Remove casualties from party and return info about removed members
     * @param {Party} party - The party object to process
     * @returns {Object} Object containing casualties array and survivors array
     */
    static removeCasualtiesFromParty(party) {
        if (!party || !party.members) {
            return { casualties: [], survivors: [] };
        }
        
        const casualties = [];
        const survivors = [];
        
        // Separate casualties from survivors
        party.members.forEach(member => {
            if (member.status === 'unconscious' || 
                member.status === 'dead' || 
                member.status === 'ashes' || 
                member.status === 'lost' ||
                !member.isAlive) {
                casualties.push(member);
            } else {
                survivors.push(member);
            }
        });
        
        // Update party with only survivors
        party.members = survivors;
        
        // Log casualties
        if (casualties.length > 0) {
            console.log(`Removing ${casualties.length} casualties from party:`, casualties.map(c => ({
                name: c.name,
                status: c.status || 'dead'
            })));
        }
        
        return { casualties, survivors };
    }
}