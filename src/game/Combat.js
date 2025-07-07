/**
 * Combat System
 * Handles turn-based combat mechanics
 */
class Combat {
    constructor() {
        this.isActive = false;
        this.currentTurn = 0;
        this.combatants = [];
        this.actionQueue = [];
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.combatPhase = 'initiative'; // initiative, action_selection, resolution, cleanup
        this.pendingActions = new Map();
        this.combatLog = [];
        this.surpriseRound = null; // 'party', 'enemies', or null
    }
    
    /**
     * Start combat
     */
    startCombat(party, enemies, surpriseType = null) {
        this.isActive = true;
        this.currentTurn = 0;
        this.combatants = [...party.aliveMembers, ...enemies];
        this.actionQueue = [];
        this.combatLog = [];
        this.surpriseRound = surpriseType;
        
        // Check for surprise
        if (!surpriseType) {
            this.surpriseRound = this.checkSurprise(party, enemies);
        }
        
        // Calculate initiative
        this.calculateInitiative();
        
        this.logMessage('Combat started!');
        if (this.surpriseRound) {
            this.logMessage(`${this.surpriseRound === 'party' ? 'Party' : 'Enemies'} achieve surprise!`);
        }
        
        // Start first turn
        this.combatPhase = 'action_selection';
        return this.getCurrentActor();
    }
    
    /**
     * End combat
     */
    endCombat() {
        this.isActive = false;
        this.combatants = [];
        this.actionQueue = [];
        
        console.log('Combat ended!');
    }
    
    /**
     * Check for surprise round
     */
    checkSurprise(party, enemies) {
        const partyAverageAgility = party.aliveMembers.reduce((sum, member) => 
            sum + member.attributes.agility, 0) / party.aliveMembers.length;
        const enemyAverageAgility = enemies.reduce((sum, enemy) => 
            sum + (enemy.agility || 10), 0) / enemies.length;
        
        const surpriseChance = Math.abs(partyAverageAgility - enemyAverageAgility) * 2;
        
        if (Random.percent(surpriseChance)) {
            return partyAverageAgility > enemyAverageAgility ? 'party' : 'enemies';
        }
        
        return null;
    }
    
    /**
     * Calculate initiative order
     */
    calculateInitiative() {
        this.turnOrder = [...this.combatants].map(combatant => ({
            combatant,
            initiative: this.getInitiative(combatant),
            isPlayer: combatant.hasOwnProperty('class')
        })).sort((a, b) => b.initiative - a.initiative);
    }
    
    /**
     * Get initiative value for a combatant
     */
    getInitiative(combatant) {
        const baseAgility = combatant.attributes ? combatant.attributes.agility : (combatant.agility || 10);
        const classBonus = this.getClassInitiativeBonus(combatant);
        const randomFactor = Random.die(6);
        
        return baseAgility + classBonus + randomFactor;
    }
    
    /**
     * Get class-specific initiative bonus
     */
    getClassInitiativeBonus(combatant) {
        if (!combatant.class) return 0;
        
        const bonuses = {
            Thief: 2,
            Ninja: 4,
            Mage: -1,
            Priest: -1,
            Fighter: 1,
            Lord: 1,
            Samurai: 2,
            Bishop: 0
        };
        
        return bonuses[combatant.class] || 0;
    }
    
    /**
     * Get current actor whose turn it is
     */
    getCurrentActor() {
        if (this.turnOrder.length === 0) return null;
        
        // Handle surprise round
        if (this.surpriseRound && this.currentTurn === 0) {
            const surprisedSide = this.turnOrder.filter(entry => 
                this.surpriseRound === 'party' ? entry.isPlayer : !entry.isPlayer
            );
            
            if (this.currentTurnIndex < surprisedSide.length) {
                return surprisedSide[this.currentTurnIndex];
            } else {
                // Surprise round over, start normal combat
                this.surpriseRound = null;
                this.currentTurn++;
                this.currentTurnIndex = 0;
            }
        }
        
        // Normal turn order
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this.currentTurn++;
            this.currentTurnIndex = 0;
        }
        
        return this.turnOrder[this.currentTurnIndex];
    }
    
    /**
     * Process a combat action
     */
    processAction(action) {
        const result = this.resolveAction(action);
        this.logMessage(result.message);
        
        // Advance to next actor
        this.currentTurnIndex++;
        
        // Check for combat end
        if (this.checkCombatEnd()) {
            return { ...result, combatEnded: true, winner: this.getCombatWinner() };
        }
        
        return { ...result, nextActor: this.getCurrentActor() };
    }
    
    /**
     * Resolve a combat action
     */
    resolveAction(action) {
        switch (action.type) {
            case 'attack':
                return this.resolveAttack(action);
            case 'spell':
                return this.resolveSpell(action);
            case 'defend':
                return this.resolveDefend(action);
            case 'item':
                return this.resolveItem(action);
            case 'flee':
                return this.resolveFlee(action);
            default:
                return { success: false, message: 'Invalid action type' };
        }
    }
    
    /**
     * Resolve attack action
     */
    resolveAttack(action) {
        const { attacker, target } = action;
        
        if (!target || !target.isAlive) {
            return { success: false, message: `${attacker.name || 'Enemy'} attacks but target is invalid` };
        }
        
        const attackRoll = Random.die(20) + this.getAttackBonus(attacker);
        const targetAC = this.getArmorClass(target);
        
        if (attackRoll >= targetAC) {
            const damage = this.rollDamage(attacker);
            const criticalCheck = this.checkCriticalHit(attacker, target, attackRoll);
            
            let finalDamage = damage;
            let message = `${attacker.name || 'Enemy'} hits ${target.name || 'target'}`;
            
            if (criticalCheck.instant) {
                target.currentHP = 0;
                target.isAlive = false;
                target.status = 'dead';
                return {
                    success: true,
                    critical: true,
                    instant: true,
                    message: `${message} for an INSTANT KILL!`
                };
            }
            
            if (criticalCheck.multiplier > 1) {
                finalDamage *= criticalCheck.multiplier;
                message += ` critically`;
            }
            
            target.currentHP = Math.max(0, target.currentHP - finalDamage);
            message += ` for ${finalDamage} damage!`;
            
            if (target.currentHP <= 0) {
                target.isAlive = false;
                target.status = target.currentHP <= -10 ? 'dead' : 'unconscious';
                message += ` ${target.name || 'Target'} falls!`;
            }
            
            return {
                success: true,
                damage: finalDamage,
                critical: criticalCheck.multiplier > 1,
                message
            };
        } else {
            return {
                success: false,
                message: `${attacker.name || 'Enemy'} misses ${target.name || 'target'}`
            };
        }
    }
    
    /**
     * Resolve spell action
     */
    resolveSpell(action) {
        const { caster, spell, target } = action;
        
        // Check if caster can cast spell
        if (!this.canCastSpell(caster, spell)) {
            return { success: false, message: `${caster.name || 'Caster'} cannot cast ${spell.name}` };
        }
        
        // Roll for spell success
        const spellSuccess = this.rollSpellSuccess(caster, spell);
        if (!spellSuccess) {
            return { success: false, message: `${caster.name || 'Caster'} fails to cast ${spell.name}` };
        }
        
        // Execute spell effect
        const result = this.executeSpellEffect(spell, caster, target);
        
        // Remove memorized spell
        this.removeMemorizedSpell(caster, spell);
        
        return {
            success: true,
            spellResult: result,
            message: `${caster.name || 'Caster'} casts ${spell.name}! ${result.message || ''}`
        };
    }
    
    /**
     * Resolve defend action
     */
    resolveDefend(action) {
        const { defender } = action;
        
        // Add defensive bonus (implemented in getArmorClass)
        defender.isDefending = true;
        
        return {
            success: true,
            message: `${defender.name || 'Defender'} takes a defensive stance`
        };
    }
    
    /**
     * Resolve item use action
     */
    resolveItem(action) {
        const { user, item, target } = action;
        
        // Simple item use - would be expanded based on item type
        return {
            success: true,
            message: `${user.name || 'User'} uses ${item.name}`
        };
    }
    
    /**
     * Resolve flee action
     */
    resolveFlee(action) {
        const { fleer } = action;
        const fleeChance = this.calculateFleeChance(fleer);
        
        if (Random.percent(fleeChance)) {
            this.endCombat();
            return {
                success: true,
                fled: true,
                message: `${fleer.name || 'Character'} successfully flees from combat!`
            };
        } else {
            return {
                success: false,
                message: `${fleer.name || 'Character'} fails to flee!`
            };
        }
    }
    
    /**
     * Get attack bonus for combatant
     */
    getAttackBonus(combatant) {
        let bonus = 0;
        
        if (combatant.attributes) {
            bonus += Math.floor((combatant.attributes.strength - 10) / 2);
            bonus += combatant.level || 1;
        }
        
        if (combatant.equipment && combatant.equipment.weapon) {
            bonus += combatant.equipment.weapon.attackBonus || 0;
        }
        
        return bonus;
    }
    
    /**
     * Get armor class for combatant
     */
    getArmorClass(combatant) {
        let ac = 10; // Base AC
        
        if (combatant.attributes) {
            ac -= Math.floor((combatant.attributes.agility - 10) / 2); // Dex bonus
        }
        
        if (combatant.equipment) {
            if (combatant.equipment.armor) {
                ac -= combatant.equipment.armor.acBonus || 0;
            }
            if (combatant.equipment.shield) {
                ac -= combatant.equipment.shield.acBonus || 0;
            }
        }
        
        // Defensive stance bonus
        if (combatant.isDefending) {
            ac -= 2;
            combatant.isDefending = false; // Reset for next turn
        }
        
        return ac;
    }
    
    /**
     * Roll damage for attacker
     */
    rollDamage(attacker) {
        let damage = Random.die(6); // Base damage
        
        if (attacker.attributes) {
            damage += Math.floor((attacker.attributes.strength - 10) / 2);
        }
        
        if (attacker.equipment && attacker.equipment.weapon) {
            damage += attacker.equipment.weapon.damageBonus || 0;
        }
        
        return Math.max(1, damage);
    }
    
    /**
     * Check for critical hit
     */
    checkCriticalHit(attacker, target, attackRoll) {
        const result = { multiplier: 1, instant: false };
        
        // Natural 20 always threatens critical
        if (attackRoll >= 20) {
            const criticalRoll = Random.die(20);
            
            if (criticalRoll >= 18) {
                result.multiplier = 2;
                
                // Check for instant kill (very rare)
                if (criticalRoll === 20 && Random.percent(5)) {
                    result.instant = true;
                }
            }
        }
        
        return result;
    }
    
    /**
     * Check if combat should end
     */
    checkCombatEnd() {
        const alivePartyMembers = this.combatants.filter(c => 
            c.hasOwnProperty('class') && c.isAlive
        ).length;
        
        const aliveEnemies = this.combatants.filter(c => 
            !c.hasOwnProperty('class') && c.isAlive
        ).length;
        
        return alivePartyMembers === 0 || aliveEnemies === 0;
    }
    
    /**
     * Get combat winner
     */
    getCombatWinner() {
        const alivePartyMembers = this.combatants.filter(c => 
            c.hasOwnProperty('class') && c.isAlive
        ).length;
        
        return alivePartyMembers > 0 ? 'party' : 'enemies';
    }
    
    /**
     * Calculate flee chance
     */
    calculateFleeChance(fleer) {
        let baseChance = 50;
        
        if (fleer.attributes) {
            baseChance += (fleer.attributes.agility - 10) * 2;
        }
        
        if (fleer.class === 'Thief' || fleer.class === 'Ninja') {
            baseChance += 10;
        }
        
        return Math.min(90, Math.max(10, baseChance));
    }
    
    /**
     * Check if combatant can cast spell
     */
    canCastSpell(caster, spell) {
        if (!caster.memorizedSpells) return false;
        
        const schoolSpells = caster.memorizedSpells[spell.school] || [];
        return schoolSpells.some(memorizedSpell => memorizedSpell.name === spell.name);
    }
    
    /**
     * Roll for spell success
     */
    rollSpellSuccess(caster, spell) {
        const baseChance = 85;
        const levelDifference = (caster.level || 1) - spell.level;
        const attributeBonus = caster.attributes ? 
            (spell.school === 'arcane' ? caster.attributes.intelligence : caster.attributes.piety) - 10 : 0;
        
        const successChance = baseChance + (levelDifference * 5) + attributeBonus;
        
        return Random.percent(Math.min(95, Math.max(5, successChance)));
    }
    
    /**
     * Execute spell effect
     */
    executeSpellEffect(spell, caster, target) {
        // Use the enhanced Spells class for full spell effects
        const spellSystem = new Spells();
        return spellSystem.executeSpellEffect(spell, caster, target);
    }
    
    /**
     * Remove memorized spell from caster
     */
    removeMemorizedSpell(caster, spell) {
        const spellSystem = new Spells();
        spellSystem.removeMemorizedSpell(caster, spell);
    }
    
    /**
     * Log combat message
     */
    logMessage(message) {
        this.combatLog.push({
            message,
            timestamp: Date.now(),
            turn: this.currentTurn
        });
        console.log(`[Turn ${this.currentTurn}] ${message}`);
    }
    
    /**
     * Get combat log
     */
    getCombatLog() {
        return [...this.combatLog];
    }
    
    /**
     * Process combat turn (legacy method for compatibility)
     */
    processTurn() {
        const currentActor = this.getCurrentActor();
        if (!currentActor) {
            this.endCombat();
            return null;
        }
        
        this.logMessage(`${currentActor.combatant.name || 'Combatant'}'s turn`);
        return currentActor;
    }
}