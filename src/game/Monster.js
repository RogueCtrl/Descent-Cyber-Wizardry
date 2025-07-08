/**
 * Monster System
 * Handles enemy creatures and encounter generation
 */
class Monster {
    constructor(monsterType = 'Kobold') {
        const data = Monster.getMonsterData(monsterType);
        
        this.name = data.name;
        this.type = data.type;
        this.level = data.level;
        this.hitDie = data.hitDie;
        this.maxHP = this.rollHP(data.hitDie, data.level);
        this.currentHP = this.maxHP;
        this.isAlive = true;
        this.status = 'OK';
        
        // Attributes (simplified for monsters)
        this.attributes = {
            strength: data.strength || 10,
            intelligence: data.intelligence || 10,
            agility: data.agility || 10,
            vitality: data.vitality || 10
        };
        
        // Combat stats
        this.armorClass = data.armorClass || 10;
        this.attackBonus = data.attackBonus || 0;
        this.damageBonus = data.damageBonus || 0;
        this.attacks = data.attacks || [{ name: 'Basic Attack', damage: { dice: 1, sides: 6 } }];
        
        // Special abilities
        this.abilities = data.abilities || [];
        this.resistances = data.resistances || [];
        this.immunities = data.immunities || [];
        
        // AI behavior
        this.aiType = data.aiType || 'aggressive';
        this.preferredTargets = data.preferredTargets || ['front'];
        
        // Experience and treasure
        this.experienceValue = data.experienceValue || 10;
        this.treasureType = data.treasureType || 'none';
        
        // Generate unique ID
        this.id = Helpers.generateId('monster');
    }
    
    /**
     * Monster database
     */
    static getMonsterData(monsterType) {
        const monsters = {
            // Level 1 Monsters
            'Kobold': {
                name: 'Kobold',
                type: 'humanoid',
                level: 1,
                hitDie: 4,
                strength: 8,
                intelligence: 10,
                agility: 15,
                vitality: 9,
                armorClass: 7,
                attackBonus: 0,
                damageBonus: -1,
                attacks: [
                    { name: 'Short Sword', damage: { dice: 1, sides: 6, bonus: -1 } },
                    { name: 'Sling', damage: { dice: 1, sides: 4 }, range: 'ranged' }
                ],
                abilities: ['pack_tactics'],
                aiType: 'cowardly',
                preferredTargets: ['weakest'],
                experienceValue: 25,
                treasureType: 'poor'
            },
            'Giant Rat': {
                name: 'Giant Rat',
                type: 'beast',
                level: 1,
                hitDie: 4,
                strength: 7,
                intelligence: 2,
                agility: 15,
                vitality: 12,
                armorClass: 7,
                attackBonus: 1,
                damageBonus: -2,
                attacks: [
                    { name: 'Bite', damage: { dice: 1, sides: 3 }, special: ['disease'] }
                ],
                abilities: ['disease_bite'],
                resistances: ['disease'],
                aiType: 'aggressive',
                preferredTargets: ['random'],
                experienceValue: 10,
                treasureType: 'none'
            },
            'Skeleton': {
                name: 'Skeleton',
                type: 'undead',
                level: 1,
                hitDie: 6,
                strength: 10,
                intelligence: 10,
                agility: 14,
                vitality: 15,
                armorClass: 7,
                attackBonus: 0,
                damageBonus: 0,
                attacks: [
                    { name: 'Claw', damage: { dice: 1, sides: 6 } }
                ],
                resistances: ['cold', 'necrotic'],
                immunities: ['poison', 'disease'],
                aiType: 'aggressive',
                preferredTargets: ['front'],
                experienceValue: 50,
                treasureType: 'poor'
            },
            
            // Level 2-3 Monsters
            'Orc': {
                name: 'Orc',
                type: 'humanoid',
                level: 2,
                hitDie: 6,
                strength: 16,
                intelligence: 7,
                agility: 12,
                vitality: 16,
                armorClass: 6,
                attackBonus: 1,
                damageBonus: 3,
                attacks: [
                    { name: 'Battleaxe', damage: { dice: 1, sides: 8, bonus: 3 } },
                    { name: 'Javelin', damage: { dice: 1, sides: 6, bonus: 3 }, range: 'thrown' }
                ],
                abilities: ['aggressive'],
                aiType: 'aggressive',
                preferredTargets: ['strongest'],
                experienceValue: 100,
                treasureType: 'standard'
            },
            'Wolf': {
                name: 'Wolf',
                type: 'beast',
                level: 2,
                hitDie: 6,
                strength: 12,
                intelligence: 3,
                agility: 15,
                vitality: 12,
                armorClass: 7,
                attackBonus: 2,
                damageBonus: 1,
                attacks: [
                    { name: 'Bite', damage: { dice: 2, sides: 4, bonus: 2 }, special: ['knockdown'] }
                ],
                abilities: ['pack_tactics', 'keen_hearing'],
                aiType: 'pack',
                preferredTargets: ['isolated'],
                experienceValue: 50,
                treasureType: 'none'
            },
            'Hobgoblin': {
                name: 'Hobgoblin',
                type: 'humanoid',
                level: 3,
                hitDie: 8,
                strength: 13,
                intelligence: 12,
                agility: 12,
                vitality: 12,
                armorClass: 5,
                attackBonus: 2,
                damageBonus: 1,
                attacks: [
                    { name: 'Longsword', damage: { dice: 1, sides: 8, bonus: 1 } },
                    { name: 'Longbow', damage: { dice: 1, sides: 8, bonus: 1 }, range: 'ranged' }
                ],
                abilities: ['martial_advantage'],
                aiType: 'tactical',
                preferredTargets: ['spellcasters'],
                experienceValue: 200,
                treasureType: 'standard'
            },
            
            // Level 4-5 Monsters
            'Ogre': {
                name: 'Ogre',
                type: 'giant',
                level: 4,
                hitDie: 10,
                strength: 19,
                intelligence: 5,
                agility: 8,
                vitality: 16,
                armorClass: 5,
                attackBonus: 3,
                damageBonus: 4,
                attacks: [
                    { name: 'Greatclub', damage: { dice: 2, sides: 8, bonus: 4 } },
                    { name: 'Javelin', damage: { dice: 2, sides: 6, bonus: 4 }, range: 'thrown' }
                ],
                abilities: ['powerful_build'],
                aiType: 'aggressive',
                preferredTargets: ['front'],
                experienceValue: 450,
                treasureType: 'standard'
            },
            'Owlbear': {
                name: 'Owlbear',
                type: 'monstrosity',
                level: 5,
                hitDie: 10,
                strength: 20,
                intelligence: 3,
                agility: 12,
                vitality: 17,
                armorClass: 6,
                attackBonus: 4,
                damageBonus: 5,
                attacks: [
                    { name: 'Claw', damage: { dice: 2, sides: 8, bonus: 5 } },
                    { name: 'Bite', damage: { dice: 1, sides: 10, bonus: 5 } }
                ],
                abilities: ['multiattack', 'keen_sight'],
                aiType: 'aggressive',
                preferredTargets: ['random'],
                experienceValue: 700,
                treasureType: 'rich'
            },
            
            // Boss Monsters
            'Orc Chief': {
                name: 'Orc Chief',
                type: 'humanoid',
                level: 6,
                hitDie: 8,
                strength: 18,
                intelligence: 12,
                agility: 12,
                vitality: 18,
                armorClass: 4,
                attackBonus: 5,
                damageBonus: 4,
                attacks: [
                    { name: 'Magic Axe +1', damage: { dice: 1, sides: 8, bonus: 5 }, magical: true },
                    { name: 'Spear', damage: { dice: 1, sides: 6, bonus: 4 }, range: 'thrown' }
                ],
                abilities: ['leadership', 'aggressive', 'multiattack'],
                aiType: 'tactical',
                preferredTargets: ['strongest'],
                experienceValue: 1100,
                treasureType: 'rich'
            },
            'Young Dragon': {
                name: 'Young Dragon',
                type: 'dragon',
                level: 8,
                hitDie: 12,
                strength: 23,
                intelligence: 14,
                agility: 10,
                vitality: 21,
                armorClass: 2,
                attackBonus: 7,
                damageBonus: 6,
                attacks: [
                    { name: 'Bite', damage: { dice: 2, sides: 10, bonus: 6 } },
                    { name: 'Claw', damage: { dice: 2, sides: 6, bonus: 6 } },
                    { name: 'Fire Breath', damage: { dice: 8, sides: 6 }, range: 'area', special: ['fire'] }
                ],
                abilities: ['multiattack', 'breath_weapon', 'frightful_presence', 'magic_resistance'],
                resistances: ['fire', 'physical'],
                immunities: ['fire', 'sleep', 'paralysis'],
                aiType: 'intelligent',
                preferredTargets: ['spellcasters'],
                experienceValue: 2300,
                treasureType: 'hoard'
            }
        };
        
        return monsters[monsterType] || monsters['Kobold'];
    }
    
    /**
     * Roll hit points for monster
     */
    rollHP(hitDie, level) {
        let hp = 0;
        for (let i = 0; i < level; i++) {
            hp += Random.die(hitDie);
        }
        
        // Add constitution bonus
        const conBonus = Math.floor((this.attributes?.vitality - 10) / 2) || 0;
        hp += conBonus * level;
        
        return Math.max(1, hp);
    }
    
    /**
     * Get monster's attack options
     */
    getAttackOptions() {
        return this.attacks.map((attack, index) => ({
            id: index,
            name: attack.name,
            damage: attack.damage,
            range: attack.range || 'melee',
            special: attack.special || [],
            magical: attack.magical || false
        }));
    }
    
    /**
     * Perform monster attack
     */
    performAttack(attackIndex, target) {
        if (attackIndex >= this.attacks.length) {
            return { success: false, message: 'Invalid attack' };
        }
        
        const attack = this.attacks[attackIndex];
        
        // Calculate attack roll
        const attackRoll = Random.die(20) + this.attackBonus;
        const targetAC = this.calculateTargetAC(target);
        
        if (attackRoll >= targetAC) {
            // Hit! Calculate damage
            let damage = Random.dice(attack.damage.dice, attack.damage.sides);
            damage += attack.damage.bonus || 0;
            damage += this.damageBonus;
            damage = Math.max(1, damage);
            
            // Apply damage
            target.currentHP = Math.max(0, target.currentHP - damage);
            
            if (target.currentHP <= 0) {
                target.isAlive = false;
                target.status = target.currentHP <= -10 ? 'dead' : 'unconscious';
            }
            
            // Apply special effects
            const specialEffects = this.applySpecialEffects(attack, target);
            
            return {
                success: true,
                hit: true,
                damage: damage,
                attack: attack.name,
                specialEffects: specialEffects,
                message: `${this.name} hits ${target.name || 'target'} with ${attack.name} for ${damage} damage!`
            };
        } else {
            return {
                success: true,
                hit: false,
                attack: attack.name,
                message: `${this.name} misses ${target.name || 'target'} with ${attack.name}`
            };
        }
    }
    
    /**
     * Calculate target AC (simplified)
     */
    calculateTargetAC(target) {
        let ac = 10; // Base AC
        
        if (target.attributes) {
            ac -= Math.floor((target.attributes.agility - 10) / 2);
        }
        
        // Equipment bonuses (if available)
        if (target.equipment) {
            const equipment = new Equipment();
            ac -= equipment.calculateACBonus(target);
        }
        
        return ac;
    }
    
    /**
     * Apply special attack effects
     */
    applySpecialEffects(attack, target) {
        const effects = [];
        
        if (attack.special) {
            attack.special.forEach(effect => {
                switch (effect) {
                    case 'disease':
                        if (Random.percent(25)) {
                            target.addTemporaryEffect?.({
                                type: 'disease',
                                duration: 'long',
                                effect: 'stat_drain',
                                stat: 'vitality',
                                amount: 1
                            });
                            effects.push('diseased');
                        }
                        break;
                    
                    case 'knockdown':
                        if (Random.percent(50)) {
                            target.addTemporaryEffect?.({
                                type: 'knockdown',
                                duration: 1,
                                effect: 'prone'
                            });
                            effects.push('knocked down');
                        }
                        break;
                    
                    case 'fire':
                        // Fire damage (already included in damage calculation)
                        effects.push('burning');
                        break;
                }
            });
        }
        
        return effects;
    }
    
    /**
     * Monster AI decision making
     */
    chooseAction(targets, allies = []) {
        const availableTargets = targets.filter(target => target.isAlive);
        if (availableTargets.length === 0) {
            return { action: 'wait' };
        }
        
        // Choose target based on AI type
        const target = this.chooseTarget(availableTargets, allies);
        
        // Choose attack based on situation
        const attackIndex = this.chooseAttack(target, availableTargets);
        
        return {
            action: 'attack',
            target: target,
            attackIndex: attackIndex
        };
    }
    
    /**
     * Choose target based on AI behavior
     */
    chooseTarget(targets, allies) {
        switch (this.aiType) {
            case 'cowardly':
                // Target weakest enemy
                return targets.reduce((weakest, current) => 
                    current.currentHP < weakest.currentHP ? current : weakest
                );
                
            case 'aggressive':
                // Target closest enemy (simplified to random front row)
                const frontTargets = targets.filter(target => 
                    this.preferredTargets.includes('front') || this.preferredTargets.includes('random')
                );
                return frontTargets.length > 0 ? Random.choice(frontTargets) : Random.choice(targets);
                
            case 'tactical':
                // Target spellcasters first
                const spellcasters = targets.filter(target => 
                    ['Mage', 'Priest', 'Bishop'].includes(target.class)
                );
                return spellcasters.length > 0 ? Random.choice(spellcasters) : Random.choice(targets);
                
            case 'pack':
                // Target isolated enemies
                // For now, just target random
                return Random.choice(targets);
                
            case 'intelligent':
                // Complex targeting logic
                return this.intelligentTargeting(targets, allies);
                
            default:
                return Random.choice(targets);
        }
    }
    
    /**
     * Intelligent targeting for smart monsters
     */
    intelligentTargeting(targets, allies) {
        // Score each target
        const scoredTargets = targets.map(target => {
            let score = 0;
            
            // Prefer injured targets
            const hpRatio = target.currentHP / target.maxHP;
            score += (1 - hpRatio) * 30;
            
            // Prefer spellcasters
            if (['Mage', 'Priest', 'Bishop'].includes(target.class)) {
                score += 20;
            }
            
            // Prefer low AC targets
            const ac = this.calculateTargetAC(target);
            score += Math.max(0, 15 - ac) * 2;
            
            // Prefer targets that can be easily hit
            const hitChance = (21 - ac + this.attackBonus) * 5;
            score += hitChance;
            
            return { target, score };
        });
        
        // Sort by score and return best target
        scoredTargets.sort((a, b) => b.score - a.score);
        return scoredTargets[0].target;
    }
    
    /**
     * Choose best attack for situation
     */
    chooseAttack(target, allTargets) {
        // For now, simple logic
        if (this.attacks.length === 1) return 0;
        
        // Prefer area attacks if multiple targets
        const areaAttacks = this.attacks.filter((attack, index) => 
            attack.range === 'area' && allTargets.length >= 3
        );
        
        if (areaAttacks.length > 0) {
            return this.attacks.indexOf(areaAttacks[0]);
        }
        
        // Prefer ranged attacks if target is far (simplified)
        const rangedAttacks = this.attacks.filter(attack => 
            attack.range === 'ranged' || attack.range === 'thrown'
        );
        
        if (rangedAttacks.length > 0 && Random.percent(30)) {
            return this.attacks.indexOf(Random.choice(rangedAttacks));
        }
        
        // Default to first attack
        return 0;
    }
    
    /**
     * Check if monster has specific ability
     */
    hasAbility(abilityName) {
        return this.abilities.includes(abilityName);
    }
    
    /**
     * Use special ability
     */
    useAbility(abilityName, targets) {
        switch (abilityName) {
            case 'breath_weapon':
                return this.useBreathWeapon(targets);
            case 'frightful_presence':
                return this.useFrightfulPresence(targets);
            case 'multiattack':
                return this.useMultiattack(targets);
            default:
                return { success: false, message: 'Unknown ability' };
        }
    }
    
    /**
     * Use breath weapon (dragons)
     */
    useBreathWeapon(targets) {
        const breathAttack = this.attacks.find(attack => attack.special?.includes('fire'));
        if (!breathAttack) return { success: false };
        
        const results = [];
        targets.forEach(target => {
            if (target.isAlive) {
                const damage = Random.dice(breathAttack.damage.dice, breathAttack.damage.sides);
                target.currentHP = Math.max(0, target.currentHP - damage);
                if (target.currentHP <= 0) {
                    target.isAlive = false;
                    target.status = 'dead';
                }
                results.push({ target, damage });
            }
        });
        
        return {
            success: true,
            message: `${this.name} breathes fire!`,
            results: results
        };
    }
    
    /**
     * Use frightful presence
     */
    useFrightfulPresence(targets) {
        const affected = [];
        targets.forEach(target => {
            if (target.level < this.level && Random.percent(50)) {
                target.addTemporaryEffect?.({
                    type: 'fear',
                    duration: 3,
                    effect: 'disadvantage'
                });
                affected.push(target);
            }
        });
        
        return {
            success: true,
            message: `${this.name} roars terrifyingly!`,
            affected: affected
        };
    }
    
    /**
     * Use multiattack
     */
    useMultiattack(targets) {
        const results = [];
        const attackCount = this.level >= 5 ? 2 : 1;
        
        for (let i = 0; i < attackCount; i++) {
            const target = Random.choice(targets.filter(t => t.isAlive));
            if (target) {
                const result = this.performAttack(0, target);
                results.push(result);
            }
        }
        
        return {
            success: true,
            message: `${this.name} attacks multiple times!`,
            attacks: results
        };
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            name: this.name,
            type: this.type,
            level: this.level,
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            isAlive: this.isAlive,
            status: this.status,
            attributes: { ...this.attributes },
            armorClass: this.armorClass,
            attackBonus: this.attackBonus,
            damageBonus: this.damageBonus,
            id: this.id
        };
    }
    
    /**
     * Load from save data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        Object.keys(saveData).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = saveData[key];
            }
        });
    }
}

/**
 * Encounter Generator
 * Creates monster encounters for dungeons
 */
class EncounterGenerator {
    constructor() {
        this.encounterTables = this.initializeEncounterTables();
    }
    
    /**
     * Initialize encounter tables by level
     */
    initializeEncounterTables() {
        return {
            1: [
                { monsters: ['Kobold'], count: [2, 4], weight: 30 },
                { monsters: ['Giant Rat'], count: [3, 6], weight: 25 },
                { monsters: ['Skeleton'], count: [1, 2], weight: 20 },
                { monsters: ['Kobold', 'Giant Rat'], count: [1, 2], weight: 15 },
                { monsters: [], count: [0], weight: 10 } // Empty encounter
            ],
            2: [
                { monsters: ['Orc'], count: [1, 3], weight: 25 },
                { monsters: ['Wolf'], count: [2, 4], weight: 20 },
                { monsters: ['Kobold'], count: [4, 8], weight: 20 },
                { monsters: ['Skeleton'], count: [2, 4], weight: 15 },
                { monsters: ['Orc', 'Kobold'], count: [1, 3], weight: 15 },
                { monsters: [], count: [0], weight: 5 }
            ],
            3: [
                { monsters: ['Hobgoblin'], count: [1, 2], weight: 25 },
                { monsters: ['Orc'], count: [2, 4], weight: 20 },
                { monsters: ['Wolf'], count: [3, 6], weight: 15 },
                { monsters: ['Hobgoblin', 'Orc'], count: [1, 2], weight: 20 },
                { monsters: ['Skeleton'], count: [3, 6], weight: 15 },
                { monsters: [], count: [0], weight: 5 }
            ],
            4: [
                { monsters: ['Ogre'], count: [1], weight: 20 },
                { monsters: ['Hobgoblin'], count: [2, 4], weight: 25 },
                { monsters: ['Orc'], count: [3, 6], weight: 20 },
                { monsters: ['Ogre', 'Orc'], count: [1, 2], weight: 15 },
                { monsters: ['Hobgoblin', 'Wolf'], count: [1, 3], weight: 15 },
                { monsters: [], count: [0], weight: 5 }
            ],
            5: [
                { monsters: ['Owlbear'], count: [1], weight: 15 },
                { monsters: ['Ogre'], count: [1, 2], weight: 20 },
                { monsters: ['Orc Chief'], count: [1], weight: 10 },
                { monsters: ['Hobgoblin'], count: [3, 6], weight: 25 },
                { monsters: ['Ogre', 'Hobgoblin'], count: [1, 2], weight: 20 },
                { monsters: ['Owlbear', 'Wolf'], count: [1, 2], weight: 5 },
                { monsters: [], count: [0], weight: 5 }
            ]
        };
    }
    
    /**
     * Generate random encounter
     */
    generateEncounter(partyLevel, dungeonLevel = 1) {
        const effectiveLevel = Math.min(5, Math.max(1, dungeonLevel));
        const table = this.encounterTables[effectiveLevel];
        
        // Choose encounter type based on weights
        const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
        const roll = Random.integer(1, totalWeight);
        
        let currentWeight = 0;
        let chosenEncounter = null;
        
        for (const entry of table) {
            currentWeight += entry.weight;
            if (roll <= currentWeight) {
                chosenEncounter = entry;
                break;
            }
        }
        
        if (!chosenEncounter || chosenEncounter.monsters.length === 0) {
            return { monsters: [], isEmpty: true };
        }
        
        // Generate monsters
        const encounter = { monsters: [], isEmpty: false };
        
        chosenEncounter.monsters.forEach(monsterType => {
            const count = Array.isArray(chosenEncounter.count) ? 
                Random.integer(chosenEncounter.count[0], chosenEncounter.count[1]) :
                chosenEncounter.count;
                
            for (let i = 0; i < count; i++) {
                encounter.monsters.push(new Monster(monsterType));
            }
        });
        
        return encounter;
    }
    
    /**
     * Generate boss encounter
     */
    generateBossEncounter(dungeonLevel) {
        const bossTypes = {
            1: ['Orc Chief'],
            2: ['Orc Chief'],
            3: ['Young Dragon'],
            4: ['Young Dragon'],
            5: ['Young Dragon']
        };
        
        const level = Math.min(5, Math.max(1, dungeonLevel));
        const possibleBosses = bossTypes[level];
        const bossType = Random.choice(possibleBosses);
        
        const encounter = {
            monsters: [new Monster(bossType)],
            isBoss: true,
            isEmpty: false
        };
        
        // Add some minions
        const minionCount = Random.integer(1, 3);
        const minionTypes = level <= 2 ? ['Orc', 'Kobold'] : ['Hobgoblin', 'Orc'];
        
        for (let i = 0; i < minionCount; i++) {
            const minionType = Random.choice(minionTypes);
            encounter.monsters.push(new Monster(minionType));
        }
        
        return encounter;
    }
    
    /**
     * Calculate encounter difficulty
     */
    calculateDifficulty(encounter, partyLevel, partySize) {
        const totalXP = encounter.monsters.reduce((sum, monster) => 
            sum + monster.experienceValue, 0
        );
        
        const expectedXPPerCharacter = partyLevel * 100;
        const partyXPBudget = expectedXPPerCharacter * partySize;
        
        const difficultyRatio = totalXP / partyXPBudget;
        
        if (difficultyRatio < 0.3) return 'trivial';
        if (difficultyRatio < 0.5) return 'easy';
        if (difficultyRatio < 0.8) return 'medium';
        if (difficultyRatio < 1.2) return 'hard';
        return 'deadly';
    }
    
    /**
     * Get random monsters by type
     */
    getMonstersByType(type) {
        const monsterTypes = Object.keys(Monster.getMonsterData());
        return monsterTypes.filter(monsterType => {
            const data = Monster.getMonsterData(monsterType);
            return data.type === type;
        });
    }
    
    /**
     * Get monsters by level range
     */
    getMonstersByLevel(minLevel, maxLevel) {
        const monsterTypes = Object.keys(Monster.getMonsterData());
        return monsterTypes.filter(monsterType => {
            const data = Monster.getMonsterData(monsterType);
            return data.level >= minLevel && data.level <= maxLevel;
        });
    }
    
    /**
     * Generate themed encounter
     */
    generateThemedEncounter(theme, partyLevel, dungeonLevel) {
        const themeTypes = {
            'undead': ['Skeleton'],
            'beasts': ['Giant Rat', 'Wolf', 'Owlbear'],
            'humanoids': ['Kobold', 'Orc', 'Hobgoblin', 'Orc Chief'],
            'giants': ['Ogre'],
            'dragons': ['Young Dragon']
        };
        
        const availableMonsters = themeTypes[theme] || Object.keys(Monster.getMonsterData());
        const encounter = { monsters: [], isEmpty: false, theme: theme };
        
        // Filter by appropriate level
        const levelAppropriate = availableMonsters.filter(monsterType => {
            const data = Monster.getMonsterData(monsterType);
            return data.level <= dungeonLevel + 1;
        });
        
        if (levelAppropriate.length === 0) {
            return { monsters: [], isEmpty: true };
        }
        
        // Generate 1-4 monsters
        const count = Random.integer(1, Math.min(4, levelAppropriate.length));
        for (let i = 0; i < count; i++) {
            const monsterType = Random.choice(levelAppropriate);
            encounter.monsters.push(new Monster(monsterType));
        }
        
        return encounter;
    }
    
    /**
     * Get encounter summary
     */
    getEncounterSummary(encounter) {
        if (encounter.isEmpty) {
            return { empty: true, message: 'The area is quiet...' };
        }
        
        const monsterCounts = {};
        encounter.monsters.forEach(monster => {
            monsterCounts[monster.name] = (monsterCounts[monster.name] || 0) + 1;
        });
        
        const summary = Object.entries(monsterCounts).map(([name, count]) => 
            count > 1 ? `${count} ${name}s` : `1 ${name}`
        ).join(', ');
        
        return {
            empty: false,
            summary: summary,
            totalMonsters: encounter.monsters.length,
            isBoss: encounter.isBoss || false,
            theme: encounter.theme || 'mixed'
        };
    }
}