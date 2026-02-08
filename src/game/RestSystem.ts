/**
 * Rest and Recovery System for Descent: Cyber Wizardry
 * Handles character rest, recovery, and aging mechanics
 */

import { Random } from '../utils/Random.ts';
import { EventSystem } from '../core/EventSystem.ts';

export class RestSystem {
    eventSystem: any;
    restConfigurations: Record<string, any>;

    constructor() {
        this.eventSystem = EventSystem.getInstance();

        // Rest location configurations
        this.restConfigurations = {
            inn: {
                name: 'Inn',
                hpRecoveryRate: 1.0,        // Full HP recovery
                spRecoveryRate: 1.0,        // Full spell point recovery
                agingMonths: 1,             // Ages character 1 month per rest
                baseCost: 10,               // Base cost per character
                riskChance: 0.0,            // No encounter risk
                description: 'Safe, comfortable rest with full recovery'
            },
            dungeon: {
                name: 'Dungeon Camp',
                hpRecoveryRate: 0.3,        // 30% HP recovery
                spRecoveryRate: 0.5,        // 50% spell point recovery
                agingMonths: 0,             // No aging in dungeon
                baseCost: 0,                // Free to rest
                riskChance: 0.15,           // 15% chance of encounter
                description: 'Risky rest with partial recovery'
            },
            temple: {
                name: 'Temple',
                hpRecoveryRate: 1.0,        // Full HP recovery
                spRecoveryRate: 1.0,        // Full spell point recovery
                agingMonths: 0,             // No aging at temple
                baseCost: 50,               // Expensive but safe
                riskChance: 0.0,            // No encounter risk
                description: 'Sacred rest with divine protection'
            },
            wilderness: {
                name: 'Wilderness',
                hpRecoveryRate: 0.2,        // 20% HP recovery
                spRecoveryRate: 0.3,        // 30% spell point recovery
                agingMonths: 0,             // No aging
                baseCost: 0,                // Free but dangerous
                riskChance: 0.25,           // 25% chance of encounter
                description: 'Dangerous outdoor rest'
            }
        };
    }

    /**
     * Attempt to rest the party at a specific location
     * @param {Object} party - The party to rest
     * @param {string} location - Type of rest location
     * @param {Object} options - Additional options for rest
     * @returns {Object} Rest result with success status and effects
     */
    async restParty(party, location, options = {}) {
        const config = this.restConfigurations[location];
        if (!config) {
            throw new Error(`Unknown rest location: ${location}`);
        }

        const restResult: any = {
            success: false,
            location: config.name,
            totalCost: 0,
            recoveryDetails: [],
            agingEffects: [],
            encounterTriggered: false,
            messages: []
        };

        // Calculate total cost
        const aliveMemberCount = party.members.filter(member => member.isAlive).length;
        restResult.totalCost = config.baseCost * aliveMemberCount;

        // Check if party can afford the rest
        if (party.gold < restResult.totalCost) {
            restResult.messages.push(`Not enough gold! Need ${restResult.totalCost} gold, have ${party.gold}.`);
            return restResult;
        }

        // Deduct cost
        party.gold -= restResult.totalCost;

        // Apply rest effects to each party member
        for (const character of party.members) {
            if (character.isAlive && character.status !== 'dead') {
                const memberResult = this.applyRestEffects(character, config);
                restResult.recoveryDetails.push(memberResult);

                if (memberResult.aged) {
                    restResult.agingEffects.push({
                        character: character.name,
                        ageIncrease: config.agingMonths
                    });
                }
            }
        }

        // Check for random encounters (if applicable)
        if (config.riskChance > 0 && Random.percent(config.riskChance * 100)) {
            restResult.encounterTriggered = true;
            restResult.encounter = this.generateRestEncounter(location, party);
            restResult.messages.push(`Your rest was interrupted by ${restResult.encounter.description}!`);
        }

        restResult.success = true;
        restResult.messages.push(`Party rested at ${config.name}. Total cost: ${restResult.totalCost} gold.`);

        // Emit rest event
        this.eventSystem.emit('party-rested', {
            party,
            location,
            result: restResult
        });

        return restResult;
    }

    /**
     * Apply rest effects to a single character
     * @param {Object} character - Character to apply effects to
     * @param {Object} config - Rest configuration
     * @returns {Object} Character-specific rest results
     */
    applyRestEffects(character, config) {
        const result = {
            character: character.name,
            hpBefore: character.currentHP,
            spBefore: character.currentSP || 0,
            hpAfter: 0,
            spAfter: 0,
            hpRecovered: 0,
            spRecovered: 0,
            aged: false
        };

        // Recover hit points
        const maxHPRecovery = Math.floor(character.maxHP * config.hpRecoveryRate);
        const hpRecovered = Math.min(maxHPRecovery, character.maxHP - character.currentHP);
        character.currentHP = Math.min(character.maxHP, character.currentHP + hpRecovered);

        result.hpAfter = character.currentHP;
        result.hpRecovered = hpRecovered;

        // Recover spell points (if character has spellcasting)
        if (character.currentSP !== undefined) {
            const maxSPRecovery = Math.floor(character.maxSP * config.spRecoveryRate);
            const spRecovered = Math.min(maxSPRecovery, character.maxSP - character.currentSP);
            character.currentSP = Math.min(character.maxSP, character.currentSP + spRecovered);

            result.spAfter = character.currentSP;
            result.spRecovered = spRecovered;
        }

        // Apply aging effects
        if (config.agingMonths > 0) {
            character.ageCharacter(config.agingMonths);
            result.aged = true;
        }

        // Clear temporary conditions that rest removes
        this.clearRestorableConditions(character);

        return result;
    }

    /**
     * Clear conditions that are restored by rest
     * @param {Object} character - Character to clear conditions from
     */
    clearRestorableConditions(character) {
        const restorableConditions = ['exhausted', 'fatigued', 'drained'];

        if (character.conditions) {
            character.conditions = character.conditions.filter(
                condition => !restorableConditions.includes(condition.type)
            );
        }

        // Clear temporary spell effects that don't persist through rest
        if (character.temporaryEffects) {
            character.temporaryEffects = character.temporaryEffects.filter(
                effect => effect.persistsThroughRest === true
            );
        }
    }

    /**
     * Generate a random encounter for risky rest locations
     * @param {string} location - Rest location type
     * @param {Object} party - The resting party
     * @returns {Object} Encounter details
     */
    generateRestEncounter(location, party) {
        const encounters = {
            dungeon: [
                { description: 'wandering monsters', type: 'combat', difficulty: 'easy' },
                { description: 'trap discovery', type: 'trap', difficulty: 'medium' },
                { description: 'disturbing sounds', type: 'event', difficulty: 'easy' },
                { description: 'rival adventurers', type: 'combat', difficulty: 'medium' }
            ],
            wilderness: [
                { description: 'wild animals', type: 'combat', difficulty: 'easy' },
                { description: 'bandits', type: 'combat', difficulty: 'medium' },
                { description: 'severe weather', type: 'event', difficulty: 'medium' },
                { description: 'dangerous terrain', type: 'trap', difficulty: 'easy' }
            ]
        };

        const locationEncounters = encounters[location] || encounters.dungeon;
        const encounter = Random.choice(locationEncounters);

        return {
            ...encounter,
            partyLevel: this.calculatePartyLevel(party),
            timestamp: Date.now()
        };
    }

    /**
     * Calculate average party level for encounter scaling
     * @param {Object} party - The party
     * @returns {number} Average party level
     */
    calculatePartyLevel(party) {
        const aliveMembers = party.members.filter(member => member.isAlive);
        if (aliveMembers.length === 0) return 1;

        const totalLevels = aliveMembers.reduce((sum, member) => sum + member.level, 0);
        return Math.round(totalLevels / aliveMembers.length);
    }

    /**
     * Get rest cost for a party at a specific location
     * @param {Object} party - The party
     * @param {string} location - Rest location
     * @returns {number} Total cost for the party
     */
    getRestCost(party, location) {
        const config = this.restConfigurations[location];
        if (!config) return 0;

        const aliveMemberCount = party.members.filter(member => member.isAlive).length;
        return config.baseCost * aliveMemberCount;
    }

    /**
     * Check if party can afford to rest at location
     * @param {Object} party - The party
     * @param {string} location - Rest location
     * @returns {boolean} Whether party can afford the rest
     */
    canAffordRest(party, location) {
        return party.gold >= this.getRestCost(party, location);
    }

    /**
     * Get detailed information about a rest location
     * @param {string} location - Rest location type
     * @returns {Object} Location configuration and details
     */
    getLocationInfo(location) {
        const config = this.restConfigurations[location];
        if (!config) return null;

        return {
            ...config,
            costDescription: config.baseCost > 0 ? `${config.baseCost} gold per character` : 'Free',
            riskDescription: config.riskChance > 0 ? `${Math.round(config.riskChance * 100)}% encounter chance` : 'Safe'
        };
    }

    /**
     * Process long-term rest for training or extended recovery
     * @param {Object} character - Character to rest
     * @param {number} days - Number of days to rest
     * @param {string} location - Rest location
     * @returns {Object} Extended rest results
     */
    extendedRest(character, days, location = 'inn') {
        const config = this.restConfigurations[location];
        const result = {
            character: character.name,
            daysRested: days,
            totalCost: config.baseCost * days,
            agingMonths: Math.floor(days / 30) * config.agingMonths,
            fullRecovery: true
        };

        // Full recovery for extended rest
        character.currentHP = character.maxHP;
        if (character.currentSP !== undefined) {
            character.currentSP = character.maxSP;
        }

        // Apply aging for long rest periods
        if (result.agingMonths > 0) {
            character.ageCharacter(result.agingMonths);
        }

        // Clear all temporary conditions
        character.conditions = [];
        character.temporaryEffects = [];

        return result;
    }

    /**
     * Get available rest locations for UI
     * @returns {Array} List of rest location configurations
     */
    getAvailableLocations() {
        return Object.keys(this.restConfigurations).map(key => ({
            key,
            ...this.getLocationInfo(key)
        }));
    }
}

// Export singleton instance
export const restSystem = new RestSystem(); 