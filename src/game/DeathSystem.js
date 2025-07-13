/**
 * Death and Resurrection System for Descent: Cyber Wizardry
 * Handles character death states, resurrection mechanics, and aging effects
 */

import { Random } from '../utils/Random.js';
import { EventSystem } from '../core/EventSystem.js';

export class DeathSystem {
    constructor() {
        this.eventSystem = EventSystem.getInstance();
        
        // Death state definitions
        this.DEATH_STATES = {
            UNCONSCIOUS: 'unconscious',
            DEAD: 'dead',
            ASHES: 'ashes',
            LOST: 'lost'
        };

        // Temple service configurations
        this.templeServices = {
            healing: {
                name: 'Healing',
                baseCost: 50,
                description: 'Restore HP and cure diseases',
                requirements: ['alive']
            },
            resurrection: {
                name: 'Resurrection',
                baseCost: 500,
                description: 'Bring back the recently dead',
                requirements: ['dead'],
                baseSuccessChance: 85,
                agingMonths: Random.integer(1, 6)
            },
            restoration: {
                name: 'Restoration',
                baseCost: 1000,
                description: 'Restore from ashes',
                requirements: ['ashes'],
                baseSuccessChance: 60,
                agingMonths: Random.integer(3, 12)
            },
            miracle: {
                name: 'Divine Miracle',
                baseCost: 2500,
                description: 'Last hope for the lost',
                requirements: ['lost'],
                baseSuccessChance: 30,
                agingMonths: Random.integer(6, 24)
            }
        };
    }

    /**
     * Handle character death when HP reaches 0 or below
     * @param {Object} character - The dying character
     * @param {Object} deathContext - Context about the death
     * @returns {Object} Death result with new status
     */
    handleCharacterDeath(character, deathContext = {}) {
        const previousStatus = character.status;
        let newStatus;
        let deathMessage;

        // Determine death state based on damage and current HP
        if (character.currentHP <= -10) {
            // Massive damage - straight to dead
            newStatus = this.DEATH_STATES.DEAD;
            deathMessage = `${character.name} has died from massive trauma!`;
        } else if (character.currentHP <= 0) {
            // Normal death - unconscious first
            newStatus = this.DEATH_STATES.UNCONSCIOUS;
            deathMessage = `${character.name} has fallen unconscious!`;
        }

        // Update character status
        character.status = newStatus;
        character.isAlive = newStatus === this.DEATH_STATES.UNCONSCIOUS;
        character.deathTimestamp = Date.now();
        character.deathContext = deathContext;

        const deathResult = {
            character: character.name,
            previousStatus,
            newStatus,
            message: deathMessage,
            requiresResurrection: newStatus !== this.DEATH_STATES.UNCONSCIOUS,
            canBeRevived: this.canAttemptRevival(character),
            revivalCost: this.calculateRevivalCost(character)
        };

        // Emit death event
        this.eventSystem.emit('character-death', {
            character,
            deathResult,
            deathContext
        });

        return deathResult;
    }

    /**
     * Attempt to resurrect a character
     * @param {Object} character - Character to resurrect
     * @param {string} serviceType - Type of resurrection service
     * @param {Object} temple - Temple providing the service
     * @returns {Object} Resurrection result
     */
    attemptResurrection(character, serviceType = 'resurrection', temple = {}) {
        const service = this.templeServices[serviceType];
        if (!service) {
            throw new Error(`Unknown resurrection service: ${serviceType}`);
        }

        // Validate character can receive this service
        if (!service.requirements.includes(character.status)) {
            return {
                success: false,
                message: `${character.name} cannot receive ${service.name} (status: ${character.status})`,
                cost: 0
            };
        }

        const cost = this.calculateRevivalCost(character, serviceType);
        const successChance = this.calculateResurrectionChance(character, serviceType, temple);
        const success = Random.percent(successChance);

        const result = {
            character: character.name,
            service: service.name,
            cost: success ? cost : Math.floor(cost / 2), // Half cost on failure
            successChance,
            success,
            agingEffect: 0
        };

        if (success) {
            // Successful resurrection
            character.status = 'ok';
            character.isAlive = true;
            character.currentHP = 1; // Start with 1 HP
            
            // Apply aging effect
            const agingMonths = service.agingMonths || Random.integer(1, 6);
            character.ageCharacter(agingMonths);
            result.agingEffect = agingMonths;
            result.message = `${character.name} has been successfully restored! Aged ${agingMonths} months.`;

            // Clear death-related properties
            delete character.deathTimestamp;
            delete character.deathContext;

        } else {
            // Failed resurrection - character moves to worse state
            const degradationResult = this.degradeDeathState(character);
            result.newStatus = degradationResult.newStatus;
            result.message = `Resurrection failed! ${degradationResult.message}`;
        }

        // Emit resurrection event
        this.eventSystem.emit('character-resurrection', {
            character,
            result,
            serviceType
        });

        return result;
    }

    /**
     * Degrade character to worse death state on failed resurrection
     * @param {Object} character - Character to degrade
     * @returns {Object} Degradation result
     */
    degradeDeathState(character) {
        const currentStatus = character.status;
        let newStatus;
        let message;

        switch (currentStatus) {
            case this.DEATH_STATES.UNCONSCIOUS:
                newStatus = this.DEATH_STATES.DEAD;
                message = `${character.name} has died from the failed healing attempt.`;
                break;
            case this.DEATH_STATES.DEAD:
                newStatus = this.DEATH_STATES.ASHES;
                message = `${character.name} has been reduced to ashes by the failed resurrection.`;
                break;
            case this.DEATH_STATES.ASHES:
                newStatus = this.DEATH_STATES.LOST;
                message = `${character.name} is now lost forever.`;
                break;
            case this.DEATH_STATES.LOST:
                message = `${character.name} is already lost forever.`;
                return { newStatus: currentStatus, message };
            default:
                message = `${character.name} cannot be degraded further.`;
                return { newStatus: currentStatus, message };
        }

        character.status = newStatus;
        character.isAlive = false;

        return { newStatus, message };
    }

    /**
     * Calculate resurrection success chance
     * @param {Object} character - Character to resurrect
     * @param {string} serviceType - Type of service
     * @param {Object} temple - Temple providing service
     * @returns {number} Success percentage (0-100)
     */
    calculateResurrectionChance(character, serviceType, temple = {}) {
        const service = this.templeServices[serviceType];
        let baseChance = service.baseSuccessChance || 50;

        // Character attribute modifiers
        const piety = character.piety || 10;
        const luck = character.luck || 10;
        
        // Higher piety helps with divine magic
        const pietyBonus = Math.floor((piety - 10) / 2);
        const luckBonus = Math.floor((luck - 10) / 4);

        // Age penalty - older characters are harder to resurrect
        const agePenalty = Math.max(0, Math.floor((character.age - 30) / 5));

        // Level bonus - higher level characters are more resilient
        const levelBonus = Math.floor(character.level / 2);

        // Temple quality modifier
        const templeBonus = temple.quality || 0;

        // Time since death penalty (for dead characters)
        let timePenalty = 0;
        if (character.deathTimestamp) {
            const daysSinceDeath = (Date.now() - character.deathTimestamp) / (1000 * 60 * 60 * 24);
            timePenalty = Math.floor(daysSinceDeath / 7) * 5; // -5% per week
        }

        const finalChance = Math.max(5, Math.min(95, 
            baseChance + pietyBonus + luckBonus + levelBonus + templeBonus - agePenalty - timePenalty
        ));

        return finalChance;
    }

    /**
     * Calculate cost for resurrection service
     * @param {Object} character - Character to resurrect
     * @param {string} serviceType - Type of service
     * @returns {number} Cost in gold
     */
    calculateRevivalCost(character, serviceType = 'resurrection') {
        const service = this.templeServices[serviceType];
        if (!service) return 0;

        let baseCost = service.baseCost;

        // Level modifier - higher level characters cost more
        const levelMultiplier = 1 + (character.level - 1) * 0.1;

        // Status modifier - worse states cost more
        const statusMultipliers = {
            [this.DEATH_STATES.UNCONSCIOUS]: 0.1,
            [this.DEATH_STATES.DEAD]: 1.0,
            [this.DEATH_STATES.ASHES]: 2.0,
            [this.DEATH_STATES.LOST]: 5.0
        };

        const statusMultiplier = statusMultipliers[character.status] || 1.0;

        return Math.floor(baseCost * levelMultiplier * statusMultiplier);
    }

    /**
     * Check if character can attempt revival
     * @param {Object} character - Character to check
     * @returns {boolean} Whether revival is possible
     */
    canAttemptRevival(character) {
        return character.status !== this.DEATH_STATES.LOST && 
               character.status !== 'OK';
    }

    /**
     * Get available services for a character's current state
     * @param {Object} character - Character to check
     * @returns {Array} Available temple services
     */
    getAvailableServices(character) {
        const available = [];

        for (const [serviceKey, service] of Object.entries(this.templeServices)) {
            if (service.requirements.includes(character.status) || 
                (character.status === 'OK' && service.requirements.includes('alive'))) {
                available.push({
                    key: serviceKey,
                    ...service,
                    cost: this.calculateRevivalCost(character, serviceKey),
                    successChance: this.calculateResurrectionChance(character, serviceKey)
                });
            }
        }

        return available;
    }

    /**
     * Handle natural recovery for unconscious characters
     * @param {Object} character - Unconscious character
     * @param {number} hours - Hours of rest
     * @returns {Object} Recovery result
     */
    handleNaturalRecovery(character, hours = 8) {
        if (character.status !== this.DEATH_STATES.UNCONSCIOUS) {
            return { success: false, message: 'Character is not unconscious' };
        }

        // Base recovery chance based on vitality
        const vitality = character.vitality || 10;
        const baseChance = 30 + (vitality - 10) * 5;
        const timeBonus = Math.floor(hours / 4) * 10; // +10% per 4 hours

        const recoveryChance = Math.min(90, baseChance + timeBonus);
        const success = Random.percent(recoveryChance);

        if (success) {
            character.status = 'ok';
            character.isAlive = true;
            character.currentHP = 1;
            delete character.deathTimestamp;
            delete character.deathContext;

            return {
                success: true,
                message: `${character.name} has regained consciousness naturally!`,
                recoveryChance
            };
        }

        return {
            success: false,
            message: `${character.name} remains unconscious.`,
            recoveryChance
        };
    }

    /**
     * Get death state information for UI
     * @param {string} status - Death status
     * @returns {Object} Status information
     */
    getStatusInfo(status) {
        const statusInfo = {
            [this.DEATH_STATES.UNCONSCIOUS]: {
                name: 'Unconscious',
                description: 'Knocked out but may recover naturally',
                color: 'yellow',
                severity: 1
            },
            [this.DEATH_STATES.DEAD]: {
                name: 'Dead',
                description: 'Recently deceased, resurrection possible',
                color: 'red',
                severity: 2
            },
            [this.DEATH_STATES.ASHES]: {
                name: 'Ashes',
                description: 'Reduced to ashes, restoration very difficult',
                color: 'darkred',
                severity: 3
            },
            [this.DEATH_STATES.LOST]: {
                name: 'Lost Forever',
                description: 'Soul is lost, only divine miracle might help',
                color: 'black',
                severity: 4
            }
        };

        return statusInfo[status] || {
            name: 'Unknown',
            description: 'Status unknown',
            color: 'gray',
            severity: 0
        };
    }

    /**
     * Process time effects on dead characters
     * @param {Object} character - Character to process
     * @param {number} hoursElapsed - Hours that have passed
     * @returns {Object} Time effect result
     */
    processTimeEffects(character, hoursElapsed) {
        if (character.status === 'OK' || character.status === this.DEATH_STATES.LOST) {
            return { noChange: true };
        }

        // Dead characters may degrade over time
        if (character.status === this.DEATH_STATES.DEAD && hoursElapsed > 168) { // 1 week
            const degradeChance = Math.floor(hoursElapsed / 168) * 10; // 10% per week
            if (Random.percent(degradeChance)) {
                return this.degradeDeathState(character);
            }
        }

        return { noChange: true };
    }
}

// Export singleton instance
export const deathSystem = new DeathSystem(); 