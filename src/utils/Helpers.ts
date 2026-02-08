/**
 * Helper Utilities
 * Common utility functions used throughout the game
 */
export class Helpers {
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
        return function executedFunction(this: any, ...args: any[]) {
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
        return function executedFunction(this: any, ...args: any[]) {
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
     * @deprecated Use character.phaseOut() instead for Agents Always Part of Teams mechanic
     * Remove casualties from party and return info about removed members
     * @param {Party} party - The party object to process
     * @returns {Object} Object containing casualties array and survivors array
     */
    static removeCasualtiesFromParty(party) {
        if (!party || !party.members) {
            return { casualties: [], survivors: [] };
        }

        const casualties: any[] = [];
        const survivors: any[] = [];

        // Separate casualties from survivors using death system helpers
        party.members.forEach(member => {
            if (this.isDead(member)) {
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

    /**
     * Death System Helper Functions
     * Provides canonical death states and utility functions for character/monster status management
     */

    /**
     * Canonical death states as defined in the death system guide
     */
    static DEATH_STATES = {
        OK: 'ok',                    // OK/Online - fully functional
        UNCONSCIOUS: 'unconscious',  // Unconscious/Crashed - knocked out but recoverable
        DEAD: 'dead',               // Dead/Offline - recently deceased, resurrection possible
        ASHES: 'ashes',             // Ashes/Fragmented - reduced to ashes/fragmented data
        LOST: 'lost'                // Lost/Uninstalled - permanently lost
    };

    /**
     * Death state severity levels (0 = best, 4 = worst)
     */
    static DEATH_SEVERITY = {
        [this.DEATH_STATES.OK]: 0,
        [this.DEATH_STATES.UNCONSCIOUS]: 1,
        [this.DEATH_STATES.DEAD]: 2,
        [this.DEATH_STATES.ASHES]: 3,
        [this.DEATH_STATES.LOST]: 4
    };

    /**
     * Normalize a death state to canonical form
     * @param {string} status - The status to normalize
     * @returns {string} Canonical death state or original if invalid
     */
    static normalizeDeathState(status) {
        if (!status || typeof status !== 'string') {
            return this.DEATH_STATES.OK;
        }

        const normalized = status.toLowerCase();

        // Handle common variations and legacy values
        switch (normalized) {
            case 'ok':
            case 'online':
            case 'alive':
            case 'active':
                return this.DEATH_STATES.OK;

            case 'unconscious':
            case 'crashed':
            case 'knocked out':
            case 'ko':
            case 'scrambled':
            case 'confused':
                return this.DEATH_STATES.UNCONSCIOUS;

            case 'dead':
            case 'offline':
            case 'deceased':
            case 'killed':
                return this.DEATH_STATES.DEAD;

            case 'ashes':
            case 'fragmented':
            case 'destroyed':
                return this.DEATH_STATES.ASHES;

            case 'lost':
            case 'uninstalled':
            case 'gone':
            case 'missing':
                return this.DEATH_STATES.LOST;

            default:
                // If it's already a valid canonical state, return it
                if (Object.values(this.DEATH_STATES).includes(normalized)) {
                    return normalized;
                }

                // Log warning for unknown status
                console.warn(`Unknown death state: ${status}, defaulting to 'ok'`);
                return this.DEATH_STATES.OK;
        }
    }

    /**
     * Check if a character/monster is alive
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if alive
     */
    static isAlive(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        return status === this.DEATH_STATES.OK;
    }

    /**
     * Check if a character/monster is dead (any death state)
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if dead
     */
    static isDead(entity) {
        if (!entity) return true;

        const status = this.normalizeDeathState(entity.status);
        return status !== this.DEATH_STATES.OK;
    }

    /**
     * Check if a character/monster is unconscious
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if unconscious
     */
    static isUnconscious(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        return status === this.DEATH_STATES.UNCONSCIOUS;
    }

    /**
     * Check if a character/monster is permanently lost
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if permanently lost
     */
    static isPermanentlyLost(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        return status === this.DEATH_STATES.LOST;
    }

    /**
     * Check if a character/monster can be resurrected
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if resurrection is possible
     */
    static canBeResurrected(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        return status === this.DEATH_STATES.UNCONSCIOUS ||
            status === this.DEATH_STATES.DEAD ||
            status === this.DEATH_STATES.ASHES;
    }

    /**
     * Get the next worse death state for failed resurrection
     * @param {string} currentStatus - Current death state
     * @returns {string} Next worse death state
     */
    static getNextWorseDeathState(currentStatus) {
        const status = this.normalizeDeathState(currentStatus);

        switch (status) {
            case this.DEATH_STATES.OK:
                return this.DEATH_STATES.UNCONSCIOUS;
            case this.DEATH_STATES.UNCONSCIOUS:
                return this.DEATH_STATES.DEAD;
            case this.DEATH_STATES.DEAD:
                return this.DEATH_STATES.ASHES;
            case this.DEATH_STATES.ASHES:
                return this.DEATH_STATES.LOST;
            case this.DEATH_STATES.LOST:
                return this.DEATH_STATES.LOST; // Can't get worse
            default:
                return this.DEATH_STATES.DEAD;
        }
    }

    /**
     * Get death state severity level
     * @param {string} status - Death state to check
     * @returns {number} Severity level (0-4)
     */
    static getDeathSeverity(status) {
        const normalized = this.normalizeDeathState(status);
        return this.DEATH_SEVERITY[normalized] || 0;
    }

    /**
     * Compare two death states by severity
     * @param {string} status1 - First death state
     * @param {string} status2 - Second death state
     * @returns {number} -1 if status1 is better, 1 if status2 is better, 0 if equal
     */
    static compareDeathStates(status1, status2) {
        const severity1 = this.getDeathSeverity(status1);
        const severity2 = this.getDeathSeverity(status2);

        if (severity1 < severity2) return -1;
        if (severity1 > severity2) return 1;
        return 0;
    }

    /**
     * Update entity's death state safely
     * @param {Object} entity - Character or monster object
     * @param {string} newStatus - New death state
     * @returns {boolean} True if update was successful
     */
    static setDeathState(entity, newStatus) {
        if (!entity) return false;

        const normalizedStatus = this.normalizeDeathState(newStatus);

        // Update status and related properties
        entity.status = normalizedStatus;
        entity.isAlive = (normalizedStatus === this.DEATH_STATES.OK);

        // Set legacy flag for lost characters
        if (normalizedStatus === this.DEATH_STATES.LOST) {
            entity.isLost = true;
        } else {
            entity.isLost = false;
        }

        return true;
    }

    /**
     * Get all living members from a party/group
     * @param {Array} members - Array of character/monster objects
     * @returns {Array} Array of living members
     */
    static getLivingMembers(members) {
        if (!Array.isArray(members)) return [];

        return members.filter(member => this.isAlive(member));
    }

    /**
     * Get all dead members from a party/group
     * @param {Array} members - Array of character/monster objects
     * @returns {Array} Array of dead members
     */
    static getDeadMembers(members) {
        if (!Array.isArray(members)) return [];

        return members.filter(member => this.isDead(member));
    }

    /**
     * Get all members that can be resurrected
     * @param {Array} members - Array of character/monster objects
     * @returns {Array} Array of resurrectable members
     */
    static getResurrectableMembers(members) {
        if (!Array.isArray(members)) return [];

        return members.filter(member => this.canBeResurrected(member));
    }

    /**
     * Validate death state consistency
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if status and isAlive are consistent
     */
    static validateDeathState(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        const shouldBeAlive = (status === this.DEATH_STATES.OK);

        return entity.isAlive === shouldBeAlive;
    }

    /**
     * Fix inconsistent death state
     * @param {Object} entity - Character or monster object
     * @returns {boolean} True if fixes were applied
     */
    static fixDeathState(entity) {
        if (!entity) return false;

        const status = this.normalizeDeathState(entity.status);
        const shouldBeAlive = (status === this.DEATH_STATES.OK);

        let fixed = false;

        if (entity.isAlive !== shouldBeAlive) {
            entity.isAlive = shouldBeAlive;
            fixed = true;
        }

        if (entity.status !== status) {
            entity.status = status;
            fixed = true;
        }

        // Set lost flag consistency
        const shouldBeLost = (status === this.DEATH_STATES.LOST);
        if (entity.isLost !== shouldBeLost) {
            entity.isLost = shouldBeLost;
            fixed = true;
        }

        return fixed;
    }
}