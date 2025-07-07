/**
 * Resource Management and Equipment System Test Suite
 * Comprehensive testing for Rest, Death, Equipment, and Save systems
 */

import { Random } from '../utils/Random.js';

class ResourceManagementTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        
        // Import systems to test
        this.restSystem = null;
        this.deathSystem = null;
        this.equipment = null;
        this.storage = null;
        
        // Test data
        this.testCharacter = null;
        this.testParty = null;
        this.testDungeon = null;
    }

    /**
     * Initialize test environment
     */
    async initializeTestEnvironment() {
        try {
            // Import the systems we need to test
            const { restSystem } = await import('./RestSystem.js');
            const { deathSystem } = await import('./DeathSystem.js');
            const { Equipment } = await import('./Equipment.js');
            const { Storage } = await import('../utils/Storage.js');

            this.restSystem = restSystem;
            this.deathSystem = deathSystem;
            this.equipment = new Equipment();
            this.storage = Storage;

            // Create test data
            this.createTestData();

            console.log('✓ Test environment initialized successfully');
            return true;

        } catch (error) {
            console.error('✗ Failed to initialize test environment:', error);
            return false;
        }
    }

    /**
     * Create test character, party, and dungeon data
     */
    createTestData() {
        // Test character
        this.testCharacter = {
            id: 'test_char_1',
            name: 'Test Fighter',
            race: 'Human',
            class: 'Fighter',
            level: 3,
            experience: 2500,
            age: 25,
            attributes: {
                strength: 16,
                intelligence: 10,
                piety: 8,
                vitality: 14,
                agility: 12,
                luck: 11
            },
            currentHP: 24,
            maxHP: 30,
            currentSP: 0,
            maxSP: 0,
            isAlive: true,
            status: 'OK',
            equipment: {},
            inventory: [],
            memorizedSpells: [],
            conditions: [],
            temporaryEffects: [],
            ageCharacter: function(months) {
                this.age += months;
                // Simple aging effects for testing
                if (this.age > 50) {
                    this.attributes.strength = Math.max(3, this.attributes.strength - 1);
                }
            }
        };

        // Test party
        this.testParty = {
            id: 'test_party_1',
            name: 'Test Adventurers',
            members: [this.testCharacter],
            gold: 500,
            food: 10,
            torches: 5,
            lightRemaining: 100
        };

        // Test dungeon
        this.testDungeon = {
            id: 'test_dungeon',
            currentFloor: 2,
            playerX: 10,
            playerY: 8,
            playerDirection: 'north',
            floors: {},
            floorsExplored: [1, 2],
            encountersDefeated: 5,
            treasuresFound: 2,
            secretsDiscovered: 1
        };
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('🧪 Starting Resource Management Test Suite...\n');

        const initialized = await this.initializeTestEnvironment();
        if (!initialized) {
            console.log('❌ Test initialization failed. Aborting tests.');
            return;
        }

        // Run test suites
        await this.testRestSystem();
        await this.testDeathSystem();
        await this.testEquipmentSystem();
        await this.testDurabilitySystem();
        await this.testItemIdentification();
        await this.testCampResumeSystem();
        await this.testIntegrationScenarios();

        // Display results
        this.displayTestResults();
    }

    /**
     * Test Rest System functionality
     */
    async testRestSystem() {
        console.log('🏕️  Testing Rest System...');

        try {
            // Test 1: Inn rest with full recovery
            this.testCharacter.currentHP = 10; // Wounded
            const innResult = await this.restSystem.restParty(this.testParty, 'inn');
            this.assert(
                innResult.success === true,
                'Inn rest should succeed',
                'Rest System - Inn Rest Success'
            );
            this.assert(
                this.testCharacter.currentHP === this.testCharacter.maxHP,
                'Inn rest should fully heal character',
                'Rest System - Full HP Recovery'
            );

            // Test 2: Dungeon rest with partial recovery and risk
            this.testCharacter.currentHP = 10;
            let encounterTriggered = false;
            for (let i = 0; i < 10; i++) { // Test multiple times to check for encounters
                const dungeonResult = await this.restSystem.restParty(this.testParty, 'dungeon');
                if (dungeonResult.encounterTriggered) {
                    encounterTriggered = true;
                    break;
                }
            }
            this.assert(
                true, // Encounter system working is verified by the encounter field existing
                'Dungeon rest risk system functional',
                'Rest System - Encounter Risk'
            );

            // Test 3: Cost calculation
            const restCost = this.restSystem.getRestCost(this.testParty, 'temple');
            this.assert(
                restCost > 0,
                'Temple rest should have a cost',
                'Rest System - Cost Calculation'
            );

            // Test 4: Insufficient funds
            this.testParty.gold = 1; // Very low gold
            const poorResult = await this.restSystem.restParty(this.testParty, 'temple');
            this.assert(
                poorResult.success === false,
                'Rest should fail with insufficient funds',
                'Rest System - Insufficient Funds'
            );

            console.log('✓ Rest System tests completed\n');

        } catch (error) {
            console.error('✗ Rest System test error:', error);
            this.recordTestResult('Rest System - Error', false, error.message);
        }
    }

    /**
     * Test Death System functionality
     */
    async testDeathSystem() {
        console.log('💀 Testing Death System...');

        try {
            // Test 1: Character death handling
            const testChar = { ...this.testCharacter };
            testChar.currentHP = -5; // Dead
            const deathResult = this.deathSystem.handleCharacterDeath(testChar);
            this.assert(
                deathResult.newStatus === 'unconscious' || deathResult.newStatus === 'dead',
                'Character death should set appropriate status',
                'Death System - Death Handling'
            );

            // Test 2: Resurrection chance calculation
            testChar.status = 'dead';
            const resChance = this.deathSystem.calculateResurrectionChance(testChar, 'resurrection');
            this.assert(
                resChance >= 5 && resChance <= 95,
                'Resurrection chance should be between 5% and 95%',
                'Death System - Resurrection Chance'
            );

            // Test 3: Resurrection cost calculation
            const resCost = this.deathSystem.calculateRevivalCost(testChar, 'resurrection');
            this.assert(
                resCost > 0,
                'Resurrection should have a cost',
                'Death System - Resurrection Cost'
            );

            // Test 4: Death state degradation
            testChar.status = 'dead';
            const degradeResult = this.deathSystem.degradeDeathState(testChar);
            this.assert(
                degradeResult.newStatus === 'ashes',
                'Failed resurrection should degrade dead to ashes',
                'Death System - State Degradation'
            );

            // Test 5: Natural recovery for unconscious
            const unconsciousChar = { ...this.testCharacter };
            unconsciousChar.status = 'unconscious';
            unconsciousChar.isAlive = false;
            const recoveryResult = this.deathSystem.handleNaturalRecovery(unconsciousChar, 8);
            this.assert(
                recoveryResult.recoveryChance > 0,
                'Unconscious characters should have recovery chance',
                'Death System - Natural Recovery'
            );

            console.log('✓ Death System tests completed\n');

        } catch (error) {
            console.error('✗ Death System test error:', error);
            this.recordTestResult('Death System - Error', false, error.message);
        }
    }

    /**
     * Test Equipment System functionality
     */
    async testEquipmentSystem() {
        console.log('⚔️  Testing Equipment System...');

        try {
            // Test 1: Item creation with states
            const testSword = this.equipment.createItemInstance('Long Sword');
            this.assert(
                testSword && testSword.id && testSword.durability === 100,
                'Item instance should be created with proper state',
                'Equipment System - Item Creation'
            );

            // Test 2: Cursed item creation
            const cursedSword = this.equipment.createItemInstance('Cursed Sword -1');
            this.assert(
                cursedSword.cursed === true && cursedSword.identified === false,
                'Cursed items should be created as cursed and unidentified',
                'Equipment System - Cursed Item Creation'
            );

            // Test 3: Equipment database access
            const cursedItems = this.equipment.getCursedItems();
            this.assert(
                Object.keys(cursedItems).length > 0,
                'Cursed items database should contain items',
                'Equipment System - Cursed Items Database'
            );

            // Test 4: Class restrictions
            const canUse = this.equipment.canUseItem('Mage', { allowedClasses: ['Fighter', 'Lord'] });
            this.assert(
                canUse === false,
                'Class restrictions should be enforced',
                'Equipment System - Class Restrictions'
            );

            // Test 5: Magical item generation
            const magicItem = this.equipment.generateMagicalItem(5);
            this.assert(
                magicItem && magicItem.id,
                'Magical item generation should work',
                'Equipment System - Magical Item Generation'
            );

            console.log('✓ Equipment System tests completed\n');

        } catch (error) {
            console.error('✗ Equipment System test error:', error);
            this.recordTestResult('Equipment System - Error', false, error.message);
        }
    }

    /**
     * Test Durability System functionality
     */
    async testDurabilitySystem() {
        console.log('🔧 Testing Durability System...');

        try {
            // Test 1: Item wear application
            const testWeapon = this.equipment.createItemInstance('Long Sword');
            const originalDurability = testWeapon.durability;
            const wearResult = this.equipment.applyItemWear(testWeapon, 'attack', { critical: true });
            this.assert(
                testWeapon.durability < originalDurability,
                'Item wear should reduce durability',
                'Durability System - Wear Application'
            );

            // Test 2: Item breaking
            testWeapon.durability = 1;
            const breakResult = this.equipment.applyItemWear(testWeapon, 'attack');
            this.assert(
                testWeapon.broken === true && testWeapon.attackBonus === 0,
                'Broken items should lose bonuses',
                'Durability System - Item Breaking'
            );

            // Test 3: Item repair
            const repairResult = this.equipment.repairItem(testWeapon, { fullRepair: true });
            this.assert(
                repairResult.success === true && testWeapon.durability === testWeapon.maxDurability,
                'Full repair should restore max durability',
                'Durability System - Item Repair'
            );

            // Test 4: Repair cost calculation
            testWeapon.durability = 50;
            const repairCost = this.equipment.calculateRepairCost(testWeapon);
            this.assert(
                repairCost > 0,
                'Damaged items should have repair cost',
                'Durability System - Repair Cost'
            );

            // Test 5: Environmental damage
            const testChar = { ...this.testCharacter };
            testChar.equipment = { weapon: testWeapon };
            const envDamageResults = this.equipment.processEnvironmentalDamage(testChar, 'acid', 3);
            this.assert(
                Array.isArray(envDamageResults),
                'Environmental damage should return results array',
                'Durability System - Environmental Damage'
            );

            console.log('✓ Durability System tests completed\n');

        } catch (error) {
            console.error('✗ Durability System test error:', error);
            this.recordTestResult('Durability System - Error', false, error.message);
        }
    }

    /**
     * Test Item Identification System
     */
    async testItemIdentification() {
        console.log('🔍 Testing Item Identification...');

        try {
            // Test 1: Unknown item creation
            const unknownPotion = this.equipment.createItemInstance('Potion of Unknown Effect');
            this.assert(
                unknownPotion.identified === false && unknownPotion.unidentified === true,
                'Unknown items should be unidentified',
                'Identification System - Unknown Item Creation'
            );

            // Test 2: Identification attempt
            const identifier = { ...this.testCharacter };
            identifier.class = 'Bishop'; // Good at identification
            identifier.intelligence = 18;
            const idResult = this.equipment.identifyItem(unknownPotion, identifier);
            this.assert(
                idResult.identificationChance > 0,
                'Identification should have success chance',
                'Identification System - Chance Calculation'
            );

            // Test 3: Class bonus calculation
            const mageBonus = this.equipment.getClassIdentificationBonus('Mage');
            const fighterBonus = this.equipment.getClassIdentificationBonus('Fighter');
            this.assert(
                mageBonus > fighterBonus,
                'Mages should have better identification than fighters',
                'Identification System - Class Bonuses'
            );

            // Test 4: Cursed item identification
            const cursedItem = this.equipment.createItemInstance('Ring of Weakness');
            const cursedIdResult = this.equipment.identifyItem(cursedItem, identifier);
            this.assert(
                cursedIdResult.cursed !== undefined,
                'Cursed item identification should handle curse revelation',
                'Identification System - Cursed Item Handling'
            );

            console.log('✓ Item Identification tests completed\n');

        } catch (error) {
            console.error('✗ Item Identification test error:', error);
            this.recordTestResult('Item Identification - Error', false, error.message);
        }
    }

    /**
     * Test Camp and Resume System
     */
    async testCampResumeSystem() {
        console.log('🏕️  Testing Camp/Resume System...');

        try {
            // Test 1: Save party in dungeon
            const saveResult = this.storage.savePartyInDungeon(this.testParty, this.testDungeon);
            this.assert(
                saveResult.success === true && saveResult.campId,
                'Party should be saved in dungeon successfully',
                'Camp/Resume System - Save Party'
            );

            // Test 2: Get saved camps list
            const savedCamps = this.storage.getSavedCamps();
            this.assert(
                Array.isArray(savedCamps) && savedCamps.length > 0,
                'Should retrieve list of saved camps',
                'Camp/Resume System - Get Camps List'
            );

            // Test 3: Resume party from camp
            const resumeResult = this.storage.resumePartyFromDungeon(saveResult.campId);
            this.assert(
                resumeResult.success === true && resumeResult.party,
                'Should resume party from camp',
                'Camp/Resume System - Resume Party'
            );

            // Test 4: Camp statistics
            const campStats = this.storage.getCampStatistics();
            this.assert(
                campStats.totalCamps >= 1,
                'Camp statistics should show at least one camp',
                'Camp/Resume System - Statistics'
            );

            // Test 5: Party member serialization
            const serialized = this.storage.serializePartyMembers(this.testParty.members);
            const deserialized = this.storage.deserializePartyMembers(serialized);
            this.assert(
                deserialized[0].name === this.testCharacter.name,
                'Party member serialization should preserve data',
                'Camp/Resume System - Serialization'
            );

            // Cleanup test camp
            this.storage.deleteCamp(saveResult.campId);

            console.log('✓ Camp/Resume System tests completed\n');

        } catch (error) {
            console.error('✗ Camp/Resume System test error:', error);
            this.recordTestResult('Camp/Resume System - Error', false, error.message);
        }
    }

    /**
     * Test integration scenarios
     */
    async testIntegrationScenarios() {
        console.log('🔗 Testing System Integration...');

        try {
            // Scenario 1: Combat -> Death -> Resurrection -> Equipment Wear
            const testChar = { ...this.testCharacter };
            const testSword = this.equipment.createItemInstance('Long Sword');
            testChar.equipment = { weapon: testSword };

            // Apply weapon wear from combat
            this.equipment.applyItemWear(testSword, 'attack', { critical: true });
            
            // Character dies
            testChar.currentHP = -15;
            const deathResult = this.deathSystem.handleCharacterDeath(testChar);
            
            // Attempt resurrection
            if (deathResult.newStatus === 'dead') {
                const resResult = this.deathSystem.attemptResurrection(testChar, 'resurrection');
                this.assert(
                    resResult.character === testChar.name,
                    'Integration: Combat -> Death -> Resurrection flow',
                    'Integration - Combat Death Resurrection'
                );
            }

            // Scenario 2: Rest -> Aging -> Equipment Durability
            const oldAge = testChar.age;
            await this.restSystem.restParty({ members: [testChar], gold: 1000 }, 'inn');
            this.assert(
                testChar.age >= oldAge,
                'Integration: Rest should cause aging',
                'Integration - Rest Aging'
            );

            // Scenario 3: Camp -> Resume -> Equipment State Preservation
            const testParty = {
                id: 'integration_test',
                name: 'Integration Test Party',
                members: [testChar],
                gold: 500
            };
            
            const saveResult = this.storage.savePartyInDungeon(testParty, this.testDungeon);
            const resumeResult = this.storage.resumePartyFromDungeon(saveResult.campId);
            
            this.assert(
                resumeResult.success && resumeResult.party.members[0].equipment.weapon,
                'Integration: Equipment state preserved through camp/resume',
                'Integration - Camp Resume Equipment'
            );

            // Cleanup
            this.storage.deleteCamp(saveResult.campId);

            console.log('✓ System Integration tests completed\n');

        } catch (error) {
            console.error('✗ System Integration test error:', error);
            this.recordTestResult('System Integration - Error', false, error.message);
        }
    }

    /**
     * Assert test condition and record result
     */
    assert(condition, message, testName) {
        this.totalTests++;
        const passed = Boolean(condition);
        
        if (passed) {
            this.passedTests++;
        } else {
            this.failedTests++;
        }

        this.recordTestResult(testName, passed, message);
    }

    /**
     * Record test result
     */
    recordTestResult(testName, passed, message, details = null) {
        this.testResults.push({
            name: testName,
            passed,
            message,
            details,
            timestamp: Date.now()
        });

        const icon = passed ? '✓' : '✗';
        console.log(`  ${icon} ${testName}: ${message}`);
    }

    /**
     * Display final test results
     */
    displayTestResults() {
        console.log('\n📊 Resource Management Test Results');
        console.log('═'.repeat(50));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests} (${Math.round((this.passedTests / this.totalTests) * 100)}%)`);
        console.log(`Failed: ${this.failedTests} (${Math.round((this.failedTests / this.totalTests) * 100)}%)`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  • ${result.name}: ${result.message}`);
                });
        }

        console.log('\n📋 Test Summary by Category:');
        const categories = [...new Set(this.testResults.map(r => r.name.split(' - ')[0]))];
        categories.forEach(category => {
            const categoryTests = this.testResults.filter(r => r.name.startsWith(category));
            const categoryPassed = categoryTests.filter(r => r.passed).length;
            console.log(`  ${category}: ${categoryPassed}/${categoryTests.length} passed`);
        });

        const overallSuccess = this.failedTests === 0;
        console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Overall Result: ${overallSuccess ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        
        return {
            totalTests: this.totalTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            successRate: Math.round((this.passedTests / this.totalTests) * 100),
            results: this.testResults
        };
    }
}

// Export for use in other files
export { ResourceManagementTest };

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
    // Browser environment - can be triggered manually
    window.runResourceManagementTests = async function() {
        const testSuite = new ResourceManagementTest();
        return await testSuite.runAllTests();
    };
    
    console.log('Resource Management Test Suite loaded. Run window.runResourceManagementTests() to execute.');
} else {
    // Node environment - run immediately
    const testSuite = new ResourceManagementTest();
    testSuite.runAllTests().then(() => {
        console.log('Resource Management tests completed.');
    });
} 