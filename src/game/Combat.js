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
        
        // Party-based combat system
        this.playerParty = null;
        this.enemyParties = [];
        this.currentEnemyPartyIndex = 0;
        this.currentEnemyParty = null;
        
        // Initialize spell system
        this.spellSystem = new Spells();
        this.spellSystemInitialized = false;
    }
    
    /**
     * Initialize combat system
     */
    async initializeCombat() {
        if (!this.spellSystemInitialized) {
            await this.spellSystem.initializeEntities();
            this.spellSystemInitialized = true;
        }
    }
    
    /**
     * Start combat with party vs enemy parties
     */
    async startCombat(playerParty, enemyParties, surpriseType = null) {
        // Initialize spell system if not done
        await this.initializeCombat();
        
        this.isActive = true;
        this.currentTurn = 0;
        this.playerParty = playerParty;
        
        // Ensure enemyParties is an array (backward compatibility)
        if (!Array.isArray(enemyParties)) {
            this.enemyParties = [enemyParties];
        } else {
            this.enemyParties = enemyParties;
        }
        
        // Start with first enemy party
        this.currentEnemyPartyIndex = 0;
        this.currentEnemyParty = this.enemyParties[0];
        
        // Set up combatants for current wave
        this.setupCurrentWave();
        
        // Check for surprise
        if (!surpriseType) {
            this.surpriseRound = this.checkSurprise(this.playerParty, this.currentEnemyParty);
        } else {
            this.surpriseRound = surpriseType;
        }
        
        // Calculate initiative
        this.calculateInitiative();
        
        // Dramatic combat start
        const combatStarts = [
            'Battle is joined!',
            'The clash of steel begins!',
            'Combat erupts!',
            'Violence breaks out!'
        ];
        const combatStart = Random.choice(combatStarts);
        
        this.logMessage(`⚔️ ${combatStart}`, 'combat', '⚔️');
        this.logMessage(`Wave ${this.currentEnemyPartyIndex + 1} of ${this.enemyParties.length}`, 'wave', '🌊');
        
        // List initial enemies
        const enemies = Array.isArray(this.currentEnemyParty) ? this.currentEnemyParty : [this.currentEnemyParty];
        const enemyNames = enemies.map(enemy => enemy.name).join(', ');
        this.logMessage(`Enemies: ${enemyNames}`, 'system', '👹');
        if (this.surpriseRound) {
            if (this.surpriseRound === 'party') {
                this.logMessage(`🎯 The party strikes first! Surprise round!`, 'surprise', '🎯');
            } else {
                this.logMessage(`😱 The enemies attack by surprise!`, 'surprise', '😱');
            }
        }
        
        // Start first turn
        this.combatPhase = 'action_selection';
        return this.getCurrentActor();
    }
    
    /**
     * Setup combatants for current combat wave
     */
    setupCurrentWave() {
        this.combatants = [];
        this.actionQueue = [];
        this.combatLog = [];
        
        // Add player party members
        this.combatants.push(...this.playerParty.aliveMembers);
        
        // Add current enemy party (handle both array of monsters and single monsters)
        if (Array.isArray(this.currentEnemyParty)) {
            this.combatants.push(...this.currentEnemyParty);
        } else {
            // Single monster - wrap in array for consistency
            this.combatants.push(this.currentEnemyParty);
        }
        
        console.log(`Wave ${this.currentEnemyPartyIndex + 1}: ${this.combatants.length} combatants`);
    }
    
    /**
     * Check if current enemy party is defeated
     */
    isCurrentEnemyPartyDefeated() {
        if (Array.isArray(this.currentEnemyParty)) {
            return this.currentEnemyParty.every(enemy => !enemy.isAlive);
        } else {
            return !this.currentEnemyParty.isAlive;
        }
    }
    
    /**
     * Advance to next enemy party
     */
    advanceToNextEnemyParty() {
        this.currentEnemyPartyIndex++;
        
        if (this.currentEnemyPartyIndex < this.enemyParties.length) {
            // More enemy parties to fight
            this.currentEnemyParty = this.enemyParties[this.currentEnemyPartyIndex];
            this.setupCurrentWave();
            this.calculateInitiative();
            
            // Dramatic wave transition
            const waveTransitions = [
                `A new wave of enemies emerges from the shadows!`,
                `More foes appear to challenge the party!`,
                `The battle intensifies as reinforcements arrive!`,
                `Fresh enemies join the fray!`
            ];
            const waveTransition = Random.choice(waveTransitions);
            
            this.logMessage(`🌊 ${waveTransition}`, 'wave', '🌊');
            this.logMessage(`Wave ${this.currentEnemyPartyIndex + 1} of ${this.enemyParties.length} begins!`, 'wave', '⚔️');
            
            // List new enemies
            const enemies = Array.isArray(this.currentEnemyParty) ? this.currentEnemyParty : [this.currentEnemyParty];
            const enemyNames = enemies.map(enemy => enemy.name).join(', ');
            this.logMessage(`New enemies: ${enemyNames}`, 'system', '👹');
            
            this.combatPhase = 'action_selection';
            return true; // Combat continues
        } else {
            // All enemy parties defeated
            this.logMessage(`🎉 All enemy waves defeated!`, 'victory', '🎉');
            this.logMessage(`The party stands victorious!`, 'victory', '🏆');
            this.endCombat();
            return false; // Combat ends
        }
    }
    
    /**
     * Get current enemy party info
     */
    getCurrentEnemyPartyInfo() {
        return {
            currentWave: this.currentEnemyPartyIndex + 1,
            totalWaves: this.enemyParties.length,
            enemies: Array.isArray(this.currentEnemyParty) ? this.currentEnemyParty : [this.currentEnemyParty]
        };
    }
    
    /**
     * End combat
     */
    endCombat() {
        // Dramatic combat end
        const combatEnds = [
            'The battle comes to an end!',
            'Combat concludes!',
            'The clash of weapons falls silent!',
            'The dust settles on the battlefield!'
        ];
        const combatEnd = Random.choice(combatEnds);
        
        this.logMessage(`🏁 ${combatEnd}`, 'combat', '🏁');
        this.logMessage(`The party can rest and recover...`, 'system', '😌');
        
        // Calculate combat rewards before clearing combat state
        const combatRewards = this.calculateCombatRewards();
        
        // Check if party was defeated BEFORE clearing combatants
        const alivePartyMembers = this.combatants.filter(c => 
            c.hasOwnProperty('class') && c.isAlive
        ).length;
        
        const victory = alivePartyMembers > 0;
        
        this.isActive = false;
        this.combatants = [];
        this.actionQueue = [];
        
        // Store rewards for post-combat display
        this.lastCombatRewards = combatRewards;
        
        // Clear combat state
        this.playerParty = null;
        this.enemyParties = [];
        this.currentEnemyParty = null;
        this.currentEnemyPartyIndex = 0;
        
        console.log('Combat ended!');
        
        // Emit combat ended event with rewards or defeat
        if (window.engine && window.engine.eventSystem) {
            if (victory) {
                window.engine.eventSystem.emit('combat-ended', {
                    victory: true,
                    rewards: combatRewards
                });
            } else {
                // Party was defeated - show death screen
                const casualties = this.combatants.filter(c => 
                    c.hasOwnProperty('class') && !c.isAlive
                );
                
                window.engine.eventSystem.emit('party-defeated', {
                    victory: false,
                    casualties: casualties
                });
            }
        }
    }
    
    /**
     * Calculate combat rewards (experience and loot)
     */
    calculateCombatRewards() {
        const rewards = {
            experience: 0,
            loot: [],
            gold: 0
        };
        
        // Calculate total experience from all defeated enemies
        const defeatedEnemies = [];
        this.enemyParties.forEach(party => {
            const enemies = Array.isArray(party) ? party : [party];
            enemies.forEach(enemy => {
                if (!enemy.isAlive) {
                    defeatedEnemies.push(enemy);
                    rewards.experience += enemy.experienceValue || 10;
                    rewards.gold += Random.die(6) * (enemy.level || 1); // Random gold based on enemy level
                }
            });
        });
        
        // Generate loot based on defeated enemies
        this.generateLootFromEnemies(defeatedEnemies, rewards);
        
        return rewards;
    }
    
    /**
     * Generate loot from defeated enemies
     */
    async generateLootFromEnemies(defeatedEnemies, rewards) {
        if (defeatedEnemies.length === 0) return;
        
        // Calculate average enemy level for loot generation
        const avgEnemyLevel = defeatedEnemies.reduce((sum, enemy) => sum + (enemy.level || 1), 0) / defeatedEnemies.length;
        
        // Generate loot based on number of enemies and their levels
        const lootChance = Math.min(80, defeatedEnemies.length * 15 + avgEnemyLevel * 5); // Max 80% chance
        
        for (const enemy of defeatedEnemies) {
            if (Random.percent(lootChance)) {
                try {
                    // Use Equipment system to generate level-appropriate loot
                    if (window.engine && window.engine.equipment) {
                        const enemyLoot = await window.engine.equipment.generateRandomLoot(enemy.level || 1, 1);
                        rewards.loot.push(...enemyLoot);
                    } else {
                        // Fallback basic loot
                        rewards.loot.push({
                            name: 'Coins',
                            type: 'currency',
                            value: Random.die(10) * (enemy.level || 1)
                        });
                    }
                } catch (error) {
                    console.error('Failed to generate loot:', error);
                }
            }
        }
    }
    
    /**
     * Get last combat rewards
     */
    getLastCombatRewards() {
        return this.lastCombatRewards || null;
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
        
        // Normal turn order - skip unconscious/dead characters
        let attempts = 0;
        const maxAttempts = this.turnOrder.length;
        
        while (attempts < maxAttempts) {
            if (this.currentTurnIndex >= this.turnOrder.length) {
                this.currentTurn++;
                this.currentTurnIndex = 0;
            }
            
            const currentActor = this.turnOrder[this.currentTurnIndex];
            
            // Check if actor is alive and conscious
            if (currentActor && currentActor.combatant && currentActor.combatant.isAlive) {
                return currentActor;
            }
            
            // Skip this actor and try next
            this.currentTurnIndex++;
            attempts++;
        }
        
        // If we get here, all actors are unconscious/dead
        return null;
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
            this.logMessage(`${attacker.name || 'Enemy'} swings wildly at nothing!`, 'combat', '💨');
            return { success: false, message: `${attacker.name || 'Enemy'} attacks but target is invalid` };
        }
        
        // Determine weapon type for flavor text
        const weapon = attacker.getCurrentWeapon ? attacker.getCurrentWeapon() : { name: 'claws', type: 'natural' };
        const isUnarmed = weapon.type === 'unarmed';
        
        // Dramatic attack announcement
        if (isUnarmed) {
            this.logMessage(`${attacker.name} throws a desperate punch!`, 'combat', '👊');
        } else {
            this.logMessage(`${attacker.name} attacks with ${weapon.name}!`, 'combat', '⚔️');
        }
        
        const attackRoll = Random.die(20) + this.getAttackBonus(attacker);
        const targetAC = this.getArmorClass(target);
        
        // Log the attack mechanics for drama
        this.logMessage(`Attack roll: ${attackRoll} vs AC ${targetAC}`, 'system', '🎲');
        
        if (attackRoll >= targetAC) {
            // Play attack sound effect
            if (window.engine?.audioManager) {
                if (attacker.hasOwnProperty('class')) {
                    // Player attack
                    window.engine.audioManager.playSoundEffect('attack');
                } else {
                    // Monster attack
                    window.engine.audioManager.playSoundEffect('monsterAttack');
                }
            }
            
            const damage = this.rollDamage(attacker);
            const criticalCheck = this.checkCriticalHit(attacker, target, attackRoll);
            
            let finalDamage = damage;
            
            if (criticalCheck.instant) {
                this.logMessage(`💀 DEVASTATING BLOW! ${target.name} is slain instantly!`, 'critical', '💀');
                
                target.currentHP = 0;
                target.isAlive = false;
                target.status = 'dead';
                
                // Save character state to persistent storage
                if (target.saveToStorage) {
                    target.saveToStorage();
                }
                
                // Emit character update event for UI refresh
                if (window.engine && window.engine.eventSystem && target.hasOwnProperty('class')) {
                    window.engine.eventSystem.emit('character-updated', { character: target });
                }
                
                return {
                    success: true,
                    critical: true,
                    instant: true,
                    message: `${attacker.name} delivers an INSTANT KILL!`
                };
            }
            
            if (criticalCheck.multiplier > 1) {
                finalDamage *= criticalCheck.multiplier;
                this.logMessage(`🎯 CRITICAL HIT! Damage multiplied by ${criticalCheck.multiplier}!`, 'critical', '🎯');
            }
            
            // Dramatic hit descriptions based on damage
            let hitDescription = '';
            if (finalDamage >= target.maxHP * 0.5) {
                hitDescription = finalDamage >= target.maxHP * 0.75 ? 'devastatingly' : 'brutally';
            } else if (finalDamage >= target.maxHP * 0.25) {
                hitDescription = 'solidly';
            } else {
                hitDescription = isUnarmed ? 'weakly' : 'lightly';
            }
            
            target.currentHP = Math.max(0, target.currentHP - finalDamage);
            
            // Play hit sound effect
            if (window.engine?.audioManager) {
                if (target.hasOwnProperty('class')) {
                    // Player hit
                    window.engine.audioManager.playSoundEffect('hit');
                } else {
                    // Monster hit
                    window.engine.audioManager.playSoundEffect('monsterHit');
                }
            }
            
            this.logMessage(`💥 ${attacker.name} hits ${target.name} ${hitDescription} for ${finalDamage} damage!`, 'combat', '💥');
            
            if (target.currentHP <= 0) {
                target.isAlive = false;
                target.status = target.currentHP <= -10 ? 'dead' : 'unconscious';
                
                // Play death sound effect
                if (window.engine?.audioManager) {
                    window.engine.audioManager.playSoundEffect('characterDeath');
                }
                
                if (target.status === 'dead') {
                    this.logMessage(`💀 ${target.name} has been slain!`, 'death', '💀');
                } else {
                    this.logMessage(`😵 ${target.name} falls unconscious!`, 'unconscious', '😵');
                }
            } else {
                // Show remaining HP for dramatic effect
                const hpPercent = (target.currentHP / target.maxHP) * 100;
                let condition = '';
                if (hpPercent > 75) condition = 'slightly wounded';
                else if (hpPercent > 50) condition = 'wounded';
                else if (hpPercent > 25) condition = 'badly wounded';
                else condition = 'critically wounded';
                
                this.logMessage(`❤️ ${target.name} is ${condition} (${target.currentHP}/${target.maxHP} HP)`, 'status', '❤️');
            }
            
            // Save character state to persistent storage
            if (target.saveToStorage) {
                target.saveToStorage();
            }
            
            // Emit character update event for UI refresh
            if (window.engine && window.engine.eventSystem && target.hasOwnProperty('class')) {
                window.engine.eventSystem.emit('character-updated', { character: target });
            }
            
            return {
                success: true,
                damage: finalDamage,
                critical: criticalCheck.multiplier > 1,
                message: `Hit for ${finalDamage} damage!`
            };
        } else {
            // Dramatic miss descriptions
            const missReasons = [
                `${target.name} dodges nimbly!`,
                `The attack glances off harmlessly!`,
                `${target.name} steps back just in time!`,
                `The blow goes wide!`,
                `${target.name} deflects the attack!`
            ];
            const missReason = Random.choice(missReasons);
            
            this.logMessage(`💨 ${attacker.name} misses! ${missReason}`, 'combat', '💨');
            
            // Play miss sound effect
            if (window.engine?.audioManager) {
                window.engine.audioManager.playSoundEffect('miss');
            }
            
            return {
                success: false,
                message: `${attacker.name} misses ${target.name}`
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
            this.logMessage(`❌ ${caster.name || 'Caster'} cannot cast ${spell.name}!`, 'spell', '❌');
            this.logMessage(`Spell not memorized or insufficient power`, 'system', '📜');
            return { success: false, message: `${caster.name || 'Caster'} cannot cast ${spell.name}` };
        }
        
        // Dramatic spell casting
        const spellSchool = spell.school || 'arcane';
        const spellEmoji = spellSchool === 'divine' ? '✨' : '🔮';
        
        this.logMessage(`${spellEmoji} ${caster.name} begins casting ${spell.name}!`, 'spell', spellEmoji);
        this.logMessage(`Weaving ${spellSchool} energies...`, 'system', '🌟');
        
        // Roll for spell success
        const spellSuccess = this.rollSpellSuccess(caster, spell);
        if (!spellSuccess) {
            const failureMessages = [
                `The spell fizzles and fails!`,
                `${caster.name} loses concentration!`,
                `The magical energies dissipate!`,
                `The spell backfires harmlessly!`
            ];
            const failureMessage = Random.choice(failureMessages);
            
            this.logMessage(`💥 ${failureMessage}`, 'spell', '💥');
            this.logMessage(`${spell.name} is lost from memory`, 'system', '💭');
            
            // Remove memorized spell even on failure
            this.removeMemorizedSpell(caster, spell);
            
            return { success: false, message: `${caster.name || 'Caster'} fails to cast ${spell.name}` };
        }
        
        // Execute spell effect
        const result = this.executeSpellEffect(spell, caster, target);
        
        // Dramatic spell success
        this.logMessage(`⚡ ${spell.name} is successfully cast!`, 'spell', '⚡');
        if (result.message) {
            this.logMessage(`${result.message}`, 'spell', '✨');
        }
        
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
        
        // Dramatic defense descriptions
        const defenseMessages = [
            `${defender.name} raises their guard!`,
            `${defender.name} takes a defensive stance!`,
            `${defender.name} prepares to deflect incoming attacks!`,
            `${defender.name} focuses on protection!`
        ];
        const defenseMessage = Random.choice(defenseMessages);
        
        this.logMessage(`🛡️ ${defenseMessage}`, 'combat', '🛡️');
        this.logMessage(`${defender.name} gains +2 AC until next turn`, 'system', '📊');
        
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
        
        // Dramatic flee attempt
        const fleeAttempts = [
            `${fleer.name} tries to escape!`,
            `${fleer.name} looks for an opening to flee!`,
            `${fleer.name} attempts to break away from combat!`,
            `${fleer.name} desperately seeks an escape route!`
        ];
        const fleeAttempt = Random.choice(fleeAttempts);
        
        this.logMessage(`🏃 ${fleeAttempt}`, 'combat', '🏃');
        this.logMessage(`Flee chance: ${fleeChance}%`, 'system', '🎲');
        
        if (Random.percent(fleeChance)) {
            this.logMessage(`✅ ${fleer.name} successfully escapes from combat!`, 'flee', '✅');
            this.logMessage(`The party retreats to safety...`, 'system', '🏃‍♂️');
            this.endCombat();
            return {
                success: true,
                fled: true,
                message: `${fleer.name || 'Character'} successfully flees from combat!`
            };
        } else {
            const failureMessages = [
                `${fleer.name} is blocked by enemies!`,
                `${fleer.name} stumbles and can't escape!`,
                `The enemies surround ${fleer.name}!`,
                `${fleer.name} can't find an opening!`
            ];
            const failureMessage = Random.choice(failureMessages);
            
            this.logMessage(`❌ ${failureMessage}`, 'flee', '❌');
            this.logMessage(`${fleer.name} must continue fighting!`, 'system', '⚔️');
            
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
        } else {
            // Unarmed combat attack bonus
            bonus += this.getUnarmedAttackBonus(combatant);
        }
        
        return bonus;
    }
    
    /**
     * Get unarmed combat attack bonus
     */
    getUnarmedAttackBonus(combatant) {
        let bonus = 0;
        
        if (combatant.attributes) {
            // Agility helps with unarmed attacks
            bonus += Math.floor((combatant.attributes.agility - 10) / 4);
            
            // Class-based unarmed attack bonus
            if (combatant.class) {
                const classBonus = this.getUnarmedClassBonus(combatant.class);
                bonus += Math.floor(classBonus / 2); // Half damage bonus as attack bonus
            }
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
        } else {
            // Unarmed combat damage
            damage = this.getUnarmedDamage(attacker);
        }
        
        return Math.max(1, damage);
    }
    
    /**
     * Calculate unarmed combat damage
     */
    getUnarmedDamage(attacker) {
        let damage = 1; // Base unarmed damage
        
        if (attacker.attributes) {
            // Strength modifier
            damage += Math.floor((attacker.attributes.strength - 10) / 2);
            
            // Class-based unarmed combat bonus
            if (attacker.class) {
                const classBonus = this.getUnarmedClassBonus(attacker.class);
                damage += classBonus;
            }
        }
        
        return Math.max(1, damage);
    }
    
    /**
     * Get unarmed combat bonus based on class
     */
    getUnarmedClassBonus(characterClass) {
        const unarmedBonuses = {
            'Fighter': 2,    // Fighters are skilled in combat
            'Thief': 1,      // Thieves are scrappy
            'Samurai': 3,    // Samurai are disciplined warriors
            'Lord': 2,       // Lords have combat training
            'Ninja': 4,      // Ninjas are martial artists
            'Mage': 0,       // Mages rely on magic
            'Priest': 0,     // Priests rely on divine magic
            'Bishop': 1      // Bishops have some combat training
        };
        
        return unarmedBonuses[characterClass] || 0;
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
    async executeSpellEffect(spell, caster, target) {
        // Use the initialized spell system for full spell effects
        await this.initializeCombat();
        return this.spellSystem.executeSpellEffect(spell, caster, target);
    }
    
    /**
     * Remove memorized spell from caster
     */
    async removeMemorizedSpell(caster, spell) {
        await this.initializeCombat();
        this.spellSystem.removeMemorizedSpell(caster, spell);
    }
    
    /**
     * Log combat message
     */
    logMessage(message, type = 'combat', emoji = null) {
        const logEntry = {
            message,
            type,
            emoji,
            timestamp: Date.now(),
            turn: this.currentTurn
        };
        
        this.combatLog.push(logEntry);
        console.log(`[Turn ${this.currentTurn}] ${message}`);
        
        // Send to UI message system
        if (window.engine && window.engine.ui) {
            const displayMessage = emoji ? `${emoji} ${message}` : message;
            window.engine.ui.addMessage(displayMessage, type);
        }
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
        
        // Dramatic turn announcements
        const isPlayer = currentActor.isPlayer;
        const combatant = currentActor.combatant;
        
        if (isPlayer) {
            this.logMessage(`🛡️ ${combatant.name || 'Hero'}'s turn to act!`, 'turn', '🛡️');
        } else {
            const enemyTurnMessages = [
                `${combatant.name} prepares to strike!`,
                `${combatant.name} eyes the party menacingly!`,
                `${combatant.name} moves to attack!`,
                `${combatant.name} snarls and advances!`
            ];
            const enemyTurnMessage = Random.choice(enemyTurnMessages);
            this.logMessage(`👹 ${enemyTurnMessage}`, 'turn', '👹');
        }
        
        return currentActor;
    }
}