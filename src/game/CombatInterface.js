/**
 * Combat Interface
 * Provides clean integration points between combat system and UI
 */
class CombatInterface {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.combat = new Combat();
        this.formation = new Formation();
        this.equipment = new Equipment();
        this.encounterGenerator = new EncounterGenerator();
        this.equipmentInitialized = false;
        
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for combat events
     */
    setupEventListeners() {
        this.eventSystem.on('combat-start-requested', this.handleCombatStart.bind(this));
        this.eventSystem.on('combat-action-selected', this.handleActionSelected.bind(this));
        this.eventSystem.on('combat-formation-change', this.handleFormationChange.bind(this));
        this.eventSystem.on('combat-flee-attempt', this.handleFleeAttempt.bind(this));
        this.eventSystem.on('combat-end-requested', this.handleCombatEnd.bind(this));
    }
    
    /**
     * Initialize equipment system
     */
    async initializeEquipment() {
        if (!this.equipmentInitialized) {
            await this.equipment.initializeEntities();
            this.equipmentInitialized = true;
        }
    }
    
    /**
     * Initialize combat encounter
     */
    async initiateCombat(party, encounterType = 'random', dungeonLevel = 1) {
        // Initialize equipment system
        await this.initializeEquipment();
        // Generate encounter
        let encounter;
        if (encounterType === 'boss') {
            encounter = await this.encounterGenerator.generateBossEncounter(dungeonLevel);
        } else {
            encounter = await this.encounterGenerator.generateEncounter(party.level || 1, dungeonLevel);
        }
        
        if (encounter.isEmpty) {
            return {
                success: false,
                reason: 'no_encounter',
                message: 'The area is quiet...'
            };
        }
        
        // Setup formation
        const formationData = this.formation.setupFromParty(party);
        
        // Start combat
        const combatStart = await this.combat.startCombat(party, encounter.monsters);
        
        // Calculate difficulty
        const difficulty = this.encounterGenerator.calculateDifficulty(
            encounter, 
            party.averageLevel || 1, 
            party.size
        );
        
        // Emit combat started event
        this.eventSystem.emit('combat-started', {
            encounter,
            formation: formationData,
            difficulty,
            firstActor: combatStart,
            surpriseRound: this.combat.surpriseRound
        });
        
        return {
            success: true,
            encounter,
            formation: formationData,
            difficulty,
            currentActor: combatStart
        };
    }
    
    /**
     * Handle combat start event
     */
    handleCombatStart(data) {
        const { party, encounterType, dungeonLevel } = data;
        return this.initiateCombat(party, encounterType, dungeonLevel);
    }
    
    /**
     * Process combat action
     */
    processAction(action) {
        // Validate action
        const validation = this.validateAction(action);
        if (!validation.valid) {
            return {
                success: false,
                reason: validation.reason,
                nextActor: this.combat.getCurrentActor()
            };
        }
        
        // Process the action through combat system
        const result = this.combat.processAction(action);
        
        // Emit action processed event
        this.eventSystem.emit('combat-action-processed', {
            action,
            result,
            combatLog: this.combat.getCombatLog(),
            nextActor: result.nextActor
        });
        
        // Check for combat end
        if (result.combatEnded) {
            this.handleCombatEnd({
                winner: result.winner,
                experience: this.calculateExperienceGained(),
                treasure: this.generateTreasure()
            });
        }
        
        return result;
    }
    
    /**
     * Handle action selection event
     */
    handleActionSelected(data) {
        const { actionType, actor, target, options } = data;
        
        const action = {
            type: actionType,
            actor,
            target,
            ...options
        };
        
        return this.processAction(action);
    }
    
    /**
     * Validate combat action
     */
    validateAction(action) {
        if (!action.type) {
            return { valid: false, reason: 'Action type is required' };
        }
        
        if (!action.actor) {
            return { valid: false, reason: 'Actor is required' };
        }
        
        if (!action.actor.isAlive) {
            return { valid: false, reason: 'Actor is not alive' };
        }
        
        // Validate specific action types
        switch (action.type) {
            case 'attack':
                if (!action.target) {
                    return { valid: false, reason: 'Target is required for attack' };
                }
                if (!action.target.isAlive) {
                    return { valid: false, reason: 'Target is not alive' };
                }
                // Check if attack is possible from current formation
                const canAttack = this.formation.canAttackFromPosition(
                    action.actor, 
                    action.target, 
                    action.attackType || 'melee'
                );
                if (!canAttack) {
                    return { valid: false, reason: 'Cannot attack from current position' };
                }
                break;
                
            case 'spell':
                if (!action.spell) {
                    return { valid: false, reason: 'Spell is required' };
                }
                // Check if spell can be cast
                const canCast = this.validateSpellCasting(action.actor, action.spell);
                if (!canCast.valid) {
                    return canCast;
                }
                break;
                
            case 'item':
                if (!action.item) {
                    return { valid: false, reason: 'Item is required' };
                }
                break;
        }
        
        return { valid: true };
    }
    
    /**
     * Validate spell casting
     */
    validateSpellCasting(caster, spell) {
        if (!caster.memorizedSpells) {
            return { valid: false, reason: 'No spells memorized' };
        }
        
        const schoolSpells = caster.memorizedSpells[spell.school] || [];
        const hasSpell = schoolSpells.some(memorized => memorized.name === spell.name);
        
        if (!hasSpell) {
            return { valid: false, reason: 'Spell not memorized' };
        }
        
        return { valid: true };
    }
    
    /**
     * Handle formation change
     */
    handleFormationChange(data) {
        const { character, targetRow } = data;
        
        const result = this.formation.moveCharacter(character, targetRow);
        
        if (result.success) {
            this.eventSystem.emit('formation-changed', {
                formation: this.formation.getFormationData(),
                character,
                newRow: targetRow
            });
        }
        
        return result;
    }
    
    /**
     * Handle flee attempt
     */
    handleFleeAttempt(data) {
        const { character } = data;
        
        const fleeAction = {
            type: 'flee',
            fleer: character
        };
        
        return this.processAction(fleeAction);
    }
    
    /**
     * Handle combat end
     */
    handleCombatEnd(data) {
        this.combat.endCombat();
        
        this.eventSystem.emit('combat-ended', {
            winner: data.winner,
            experience: data.experience,
            treasure: data.treasure,
            combatLog: this.combat.getCombatLog()
        });
    }
    
    /**
     * Calculate experience gained from combat
     */
    calculateExperienceGained() {
        const totalXP = this.combat.combatants
            .filter(combatant => !combatant.hasOwnProperty('class')) // Enemies only
            .filter(enemy => !enemy.isAlive) // Defeated enemies
            .reduce((sum, enemy) => sum + (enemy.experienceValue || 0), 0);
            
        return totalXP;
    }
    
    /**
     * Generate treasure from defeated enemies
     */
    generateTreasure() {
        const defeatedEnemies = this.combat.combatants
            .filter(combatant => !combatant.hasOwnProperty('class'))
            .filter(enemy => !enemy.isAlive);
        
        const treasure = {
            gold: 0,
            items: []
        };
        
        defeatedEnemies.forEach(enemy => {
            // Generate gold based on enemy type
            const goldValue = this.calculateGoldReward(enemy);
            treasure.gold += goldValue;
            
            // Generate items based on treasure type
            const items = this.generateItemRewards(enemy);
            treasure.items.push(...items);
        });
        
        return treasure;
    }
    
    /**
     * Calculate gold reward from enemy
     */
    calculateGoldReward(enemy) {
        const baseGold = {
            'poor': () => Random.dice(2, 6),
            'standard': () => Random.dice(3, 6) * 10,
            'rich': () => Random.dice(1, 6) * 100,
            'hoard': () => Random.dice(2, 6) * 100,
            'none': () => 0
        };
        
        const treasureType = enemy.treasureType || 'none';
        const goldFunction = baseGold[treasureType] || baseGold['none'];
        
        return goldFunction();
    }
    
    /**
     * Generate item rewards from enemy
     */
    generateItemRewards(enemy) {
        const treasureType = enemy.treasureType || 'none';
        
        if (treasureType === 'none' || treasureType === 'poor') {
            return [];
        }
        
        const itemChances = {
            'standard': 25,
            'rich': 50,
            'hoard': 75
        };
        
        const chance = itemChances[treasureType] || 0;
        
        if (Random.percent(chance)) {
            const itemLevel = enemy.level || 1;
            return this.equipment.generateRandomLoot(itemLevel, 1);
        }
        
        return [];
    }
    
    /**
     * Get current combat state for UI
     */
    getCombatState() {
        if (!this.combat.isActive) {
            return { active: false };
        }
        
        return {
            active: true,
            currentTurn: this.combat.currentTurn,
            currentActor: this.combat.getCurrentActor(),
            combatants: this.combat.combatants.map(c => ({
                name: c.name || 'Unknown',
                currentHP: c.currentHP,
                maxHP: c.maxHP,
                isAlive: c.isAlive,
                status: c.status,
                isPlayer: c.hasOwnProperty('class')
            })),
            formation: this.formation.getFormationData(),
            phase: this.combat.combatPhase,
            log: this.combat.getCombatLog().slice(-10) // Last 10 entries
        };
    }
    
    /**
     * Get available actions for current actor
     */
    getAvailableActions(actor) {
        if (!actor || !actor.isAlive) {
            return [];
        }
        
        const actions = [];
        
        // Attack action
        const enemies = this.combat.combatants.filter(c => 
            !c.hasOwnProperty('class') && c.isAlive
        );
        
        if (enemies.length > 0) {
            actions.push({
                type: 'attack',
                name: 'Attack',
                description: 'Make a melee or ranged attack',
                targets: enemies,
                available: true
            });
        }
        
        // Spell actions
        if (actor.memorizedSpells) {
            const availableSpells = [];
            
            ['arcane', 'divine'].forEach(school => {
                const schoolSpells = actor.memorizedSpells[school] || [];
                availableSpells.push(...schoolSpells);
            });
            
            if (availableSpells.length > 0) {
                actions.push({
                    type: 'spell',
                    name: 'Cast Spell',
                    description: 'Cast a memorized spell',
                    spells: availableSpells,
                    available: true
                });
            }
        }
        
        // Defend action
        actions.push({
            type: 'defend',
            name: 'Defend',
            description: 'Take defensive stance (+2 AC until next turn)',
            available: true
        });
        
        // Item action (if implemented)
        if (actor.inventory && actor.inventory.length > 0) {
            actions.push({
                type: 'item',
                name: 'Use Item',
                description: 'Use an item from inventory',
                items: actor.inventory,
                available: true
            });
        }
        
        // Flee action
        actions.push({
            type: 'flee',
            name: 'Flee',
            description: 'Attempt to escape from combat',
            available: true
        });
        
        return actions;
    }
    
    /**
     * Get formation management interface
     */
    getFormationInterface() {
        return {
            current: this.formation.getFormationData(),
            stats: this.formation.getFormationStats(),
            suggestions: this.formation.suggestFormationImprovements(),
            canOptimize: true
        };
    }
    
    /**
     * Auto-optimize formation
     */
    optimizeFormation() {
        const result = this.formation.optimizeFormation();
        
        this.eventSystem.emit('formation-optimized', {
            formation: result,
            stats: this.formation.getFormationStats()
        });
        
        return result;
    }
    
    /**
     * Process AI turn for monsters
     */
    processAITurn(monster) {
        const playerTargets = this.combat.combatants.filter(c => 
            c.hasOwnProperty('class') && c.isAlive
        );
        
        if (playerTargets.length === 0) {
            return { action: 'wait', message: 'No valid targets' };
        }
        
        const aiDecision = monster.chooseAction(playerTargets);
        
        if (aiDecision.action === 'attack') {
            const attackResult = monster.performAttack(
                aiDecision.attackIndex, 
                aiDecision.target
            );
            
            // Emit AI action event
            this.eventSystem.emit('ai-action-taken', {
                monster,
                action: aiDecision,
                result: attackResult
            });
            
            return attackResult;
        }
        
        return aiDecision;
    }
    
    /**
     * Get combat statistics
     */
    getCombatStatistics() {
        const players = this.combat.combatants.filter(c => c.hasOwnProperty('class'));
        const enemies = this.combat.combatants.filter(c => !c.hasOwnProperty('class'));
        
        return {
            turnNumber: this.combat.currentTurn,
            totalCombatants: this.combat.combatants.length,
            alivePlayers: players.filter(p => p.isAlive).length,
            aliveEnemies: enemies.filter(e => e.isAlive).length,
            totalDamageDealt: this.calculateTotalDamage('players'),
            totalDamageTaken: this.calculateTotalDamage('enemies'),
            actionsThisTurn: this.combat.combatLog.filter(entry => 
                entry.turn === this.combat.currentTurn
            ).length
        };
    }
    
    /**
     * Calculate total damage dealt by side
     */
    calculateTotalDamage(side) {
        // This would need to be tracked throughout combat
        // For now, return placeholder
        return 0;
    }
    
    /**
     * Get combat help text
     */
    getCombatHelp() {
        return {
            overview: 'Combat is turn-based. Each character acts in initiative order.',
            actions: {
                attack: 'Roll to hit, then roll damage if successful. Some attacks may have special effects.',
                spell: 'Cast a memorized spell. Success depends on caster level vs spell difficulty.',
                defend: 'Gain +2 AC bonus until your next turn.',
                item: 'Use a consumable item from your inventory.',
                flee: 'Attempt to escape combat. Success depends on agility and class.'
            },
            formation: {
                front: 'Front row characters take more damage but attack more effectively.',
                back: 'Back row characters are protected but have limited melee options.'
            },
            tips: [
                'Position spellcasters in the back row for protection',
                'Use formation to your advantage - fighters in front, casters in back',
                'Some weapons have reach and can attack from the back row',
                'Ranged attacks can target any enemy regardless of formation'
            ]
        };
    }
}