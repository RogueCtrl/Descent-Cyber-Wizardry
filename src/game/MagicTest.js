/**
 * Magic System Test
 * Comprehensive test suite for the enhanced magic system
 */
class MagicTest {
    constructor() {
        this.testResults = [];
        this.spellSystem = new Spells();
        this.memorization = new SpellMemorization();
        this.initialized = false;
    }
    
    /**
     * Initialize systems
     */
    async initializeSystems() {
        if (!this.initialized) {
            await this.spellSystem.initializeEntities();
            await this.memorization.initializeSpellSystem();
            this.initialized = true;
        }
    }
    
    /**
     * Run all magic system tests
     */
    async runAllTests() {
        console.log('Starting Magic System Tests...');
        
        await this.initializeSystems();
        this.testResults = [];
        
        try {
            await this.testSpellDatabase();
            await this.testSpellSlotCalculation();
            await this.testSpellMemorization();
            await this.testSpellCasting();
            await this.testEliteClassSpells();
            await this.testHighLevelSpells();
            await this.testSpellEffects();
            
            this.printTestResults();
            
        } catch (error) {
            console.error('Test failed with error:', error);
            this.testResults.push({
                test: 'Critical Error',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test spell database completeness
     */
    async testSpellDatabase() {
        console.log('Testing spell database...');
        
        try {
            const spellCount = { arcane: 0, divine: 0 };
            const levelCount = { arcane: {}, divine: {} };
            
            // Count spells in database
            for (const school of ['arcane', 'divine']) {
                for (let level = 1; level <= 7; level++) {
                    const spells = await this.spellSystem.getSpellsBySchoolAndLevel(school, level);
                    spellCount[school] += spells.length;
                    levelCount[school][level] = spells.length;
                }
            }
            
            // Verify we have spells for all 7 levels
            let hasAllLevels = true;
            for (const school of ['arcane', 'divine']) {
                for (let level = 1; level <= 7; level++) {
                    if (levelCount[school][level] === 0) {
                        hasAllLevels = false;
                    }
                }
            }
            
            // Test specific spell retrieval
            const testSpells = [
                'Magic Missile', 'Fireball', 'Meteor Swarm',
                'Cure Light Wounds', 'Heal', 'Resurrection'
            ];
            
            let allSpellsFound = true;
            for (const spellName of testSpells) {
                const spell = this.spellSystem.getSpell(spellName);
                if (!spell) {
                    allSpellsFound = false;
                }
            }
            
            this.testResults.push({
                test: 'Spell Database',
                passed: hasAllLevels && allSpellsFound && spellCount.arcane > 15 && spellCount.divine > 15,
                details: `Arcane: ${spellCount.arcane} spells, Divine: ${spellCount.divine} spells, All levels: ${hasAllLevels}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Spell Database',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test spell slot calculation for all classes
     */
    testSpellSlotCalculation() {
        console.log('Testing spell slot calculation...');
        
        try {
            const testResults = [];
            
            // Test all spellcasting classes
            const spellcastingClasses = ['Mage', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja'];
            
            for (const className of spellcastingClasses) {
                const character = this.createTestCharacter(className, 5);
                
                const arcaneSlots = Class.getSpellSlots(character, 'arcane');
                const divineSlots = Class.getSpellSlots(character, 'divine');
                
                const hasSpellSlots = arcaneSlots.length > 0 || divineSlots.length > 0;
                const totalSlots = [...arcaneSlots, ...divineSlots].reduce((sum, count) => sum + count, 0);
                
                testResults.push({
                    class: className,
                    hasSlots: hasSpellSlots,
                    totalSlots: totalSlots,
                    arcane: arcaneSlots,
                    divine: divineSlots
                });
            }
            
            const allClassesHaveSlots = testResults.every(result => result.hasSlots);
            
            this.testResults.push({
                test: 'Spell Slot Calculation',
                passed: allClassesHaveSlots,
                details: `Tested ${spellcastingClasses.length} classes, all have spell slots: ${allClassesHaveSlots}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Spell Slot Calculation',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test spell memorization system
     */
    testSpellMemorization() {
        console.log('Testing spell memorization...');
        
        try {
            const mage = this.createTestCharacter('Mage', 3);
            
            // Get available spells
            const availableSpells = this.spellSystem.getAvailableSpells(mage);
            
            if (availableSpells.arcane.length === 0) {
                throw new Error('No arcane spells available for mage');
            }
            
            // Prepare spell selections
            const spellSelections = {
                arcane: [
                    { name: 'Magic Missile' },
                    { name: 'Light' },
                    { name: 'Fireball' }
                ],
                divine: []
            };
            
            // Test memorization
            const memorizeResult = this.memorization.prepareSpells(mage, spellSelections);
            
            if (!memorizeResult.success) {
                throw new Error(`Memorization failed: ${memorizeResult.reason}`);
            }
            
            // Verify spells were memorized
            const memorized = mage.memorizedSpells;
            const memorizedCount = memorized.arcane.length + memorized.divine.length;
            
            this.testResults.push({
                test: 'Spell Memorization',
                passed: memorizeResult.success && memorizedCount > 0,
                details: `Memorized ${memorizedCount} spells successfully`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Spell Memorization',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test spell casting mechanics
     */
    testSpellCasting() {
        console.log('Testing spell casting...');
        
        try {
            const priest = this.createTestCharacter('Priest', 3);
            const target = this.createTestCharacter('Fighter', 2);
            
            // Damage the target
            target.currentHP = 5;
            
            // Memorize a healing spell
            priest.memorizedSpells = {
                arcane: [],
                divine: [this.spellSystem.getSpell('Cure Light Wounds')]
            };
            
            // Cast healing spell
            const castResult = this.spellSystem.castSpell(priest, 'Cure Light Wounds', target);
            
            if (!castResult.success) {
                throw new Error(`Spell casting failed: ${castResult.message}`);
            }
            
            // Verify spell had effect
            const spellWorked = target.currentHP > 5; // Should have healed
            
            this.testResults.push({
                test: 'Spell Casting',
                passed: castResult.success && spellWorked,
                details: `Spell cast successfully, target healed: ${spellWorked}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Spell Casting',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test elite class spell access
     */
    testEliteClassSpells() {
        console.log('Testing elite class spells...');
        
        try {
            const bishop = this.createTestCharacter('Bishop', 6);
            const samurai = this.createTestCharacter('Samurai', 6);
            
            // Test Bishop (both schools)
            const bishopArcane = this.spellSystem.getAvailableSpells(bishop).arcane;
            const bishopDivine = this.spellSystem.getAvailableSpells(bishop).divine;
            const bishopHasBoth = bishopArcane.length > 0 && bishopDivine.length > 0;
            
            // Test Samurai (limited arcane)
            const samuraiArcane = this.spellSystem.getAvailableSpells(samurai).arcane;
            const samuraiDivine = this.spellSystem.getAvailableSpells(samurai).divine;
            const samuraiCorrect = samuraiArcane.length > 0 && samuraiDivine.length === 0;
            
            this.testResults.push({
                test: 'Elite Class Spells',
                passed: bishopHasBoth && samuraiCorrect,
                details: `Bishop dual access: ${bishopHasBoth}, Samurai limited arcane: ${samuraiCorrect}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Elite Class Spells',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test high-level spells (levels 6-7)
     */
    testHighLevelSpells() {
        console.log('Testing high-level spells...');
        
        try {
            // Test level 7 spells exist
            const meteorSwarm = this.spellSystem.getSpell('Meteor Swarm');
            const resurrection = this.spellSystem.getSpell('Resurrection');
            
            if (!meteorSwarm || !resurrection) {
                throw new Error('High-level spells not found');
            }
            
            // Test high-level character can access them
            const highLevelMage = this.createTestCharacter('Mage', 10);
            const availableSpells = this.spellSystem.getAvailableSpells(highLevelMage);
            
            const hasHighLevelSpells = availableSpells.arcane.some(spell => spell.level >= 6);
            
            this.testResults.push({
                test: 'High-Level Spells',
                passed: meteorSwarm && resurrection && hasHighLevelSpells,
                details: `Level 7 spells exist and are accessible to high-level characters`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'High-Level Spells',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Test special spell effects
     */
    testSpellEffects() {
        console.log('Testing special spell effects...');
        
        try {
            const caster = this.createTestCharacter('Priest', 8);
            const target = this.createTestCharacter('Fighter', 3);
            
            // Test healing spell
            target.currentHP = 1;
            const healSpell = this.spellSystem.getSpell('Heal');
            const healResult = this.spellSystem.executeSpellEffect(healSpell, caster, target);
            const healWorked = target.currentHP === target.maxHP;
            
            // Test damage spell
            const target2 = this.createTestCharacter('Fighter', 3);
            const damageSpell = this.spellSystem.getSpell('Fireball');
            const damageResult = this.spellSystem.executeSpellEffect(damageSpell, caster, target2);
            const damageWorked = target2.currentHP < target2.maxHP;
            
            this.testResults.push({
                test: 'Spell Effects',
                passed: healWorked && damageWorked,
                details: `Heal restored to full HP: ${healWorked}, Fireball dealt damage: ${damageWorked}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Spell Effects',
                passed: false,
                error: error.message
            });
        }
    }
    
    /**
     * Create a test character
     */
    createTestCharacter(className, level) {
        const character = new Character(`Test ${className}`, 'Human', className);
        character.level = level;
        character.maxHP = level * 8;
        character.currentHP = character.maxHP;
        character.attributes = {
            strength: 12,
            intelligence: 16,
            piety: 16,
            vitality: 12,
            agility: 12,
            luck: 12
        };
        
        // Initialize memorized spells
        character.memorizedSpells = { arcane: [], divine: [] };
        
        // Add temporary effects tracking
        character.temporaryEffects = [];
        character.addTemporaryEffect = function(effect) {
            this.temporaryEffects.push(effect);
        };
        
        return character;
    }
    
    /**
     * Print test results
     */
    printTestResults() {
        console.log('\\n=== MAGIC SYSTEM TEST RESULTS ===');
        
        const passed = this.testResults.filter(result => result.passed).length;
        const total = this.testResults.length;
        
        console.log(`\\nTests Passed: ${passed}/${total}`);
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`\\n${status}: ${result.test}`);
            
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
            
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        if (passed === total) {
            console.log('\\n🎉 All tests passed! Magic system is ready.');
        } else {
            console.log(`\\n⚠️  ${total - passed} test(s) failed. Please review the errors above.`);
        }
        
        console.log('\\n=== END TEST RESULTS ===\\n');
    }
    
    /**
     * Run a specific test
     */
    runSpecificTest(testName) {
        console.log(`Running specific test: ${testName}`);
        
        switch (testName) {
            case 'database':
                this.testSpellDatabase();
                break;
            case 'slots':
                this.testSpellSlotCalculation();
                break;
            case 'memorization':
                this.testSpellMemorization();
                break;
            case 'casting':
                this.testSpellCasting();
                break;
            case 'elite':
                this.testEliteClassSpells();
                break;
            case 'highlevel':
                this.testHighLevelSpells();
                break;
            case 'effects':
                this.testSpellEffects();
                break;
            default:
                console.log('Unknown test name. Available tests: database, slots, memorization, casting, elite, highlevel, effects');
                return;
        }
        
        this.printTestResults();
    }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
    window.MagicTest = MagicTest;
}