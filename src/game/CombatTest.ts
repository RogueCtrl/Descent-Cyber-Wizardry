import { Character } from './Character.ts';
import { Equipment } from './Equipment.ts';
import { Formation } from './Formation.ts';
import { EncounterGenerator, Monster } from './Monster.ts';
import { Combat } from './Combat.ts';
import { Party } from './Party.ts';

/**
 * Combat System Test
 * Simple test scenarios to validate combat mechanics
 */
export class CombatTest {
  testResults: any[];

  constructor() {
    this.testResults = [];
  }

  /**
   * Run all combat tests
   */
  runAllTests() {
    console.log('Starting Combat System Tests...');

    this.testResults = [];

    try {
      this.testCharacterCreation();
      this.testEquipmentSystem();
      this.testFormationSystem();
      this.testMonsterCreation();
      this.testCombatInitiation();
      this.testCombatActions();
      this.testEncounterGeneration();

      this.printTestResults();
    } catch (error: any) {
      console.error('Test failed with error:', error);
      this.testResults.push({
        test: 'Critical Error',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test character creation for combat
   */
  testCharacterCreation() {
    console.log('Testing character creation...');

    try {
      // Create a test fighter
      const fighter = new Character('Test Fighter', 'Human', 'Fighter');
      fighter.attributes = {
        strength: 16,
        intelligence: 10,
        piety: 10,
        vitality: 14,
        agility: 12,
        luck: 10,
      };
      fighter.level = 3;
      fighter.maxHP = 25;
      fighter.currentHP = 25;

      // Create a test mage
      const mage = new Character('Test Mage', 'Elf', 'Mage');
      mage.attributes = {
        strength: 8,
        intelligence: 16,
        piety: 12,
        vitality: 10,
        agility: 14,
        luck: 12,
      };
      mage.level = 3;
      mage.maxHP = 15;
      mage.currentHP = 15;

      this.testResults.push({
        test: 'Character Creation',
        passed: true,
        details: `Created ${fighter.name} (${fighter.class}) and ${mage.name} (${mage.class})`,
      });

      return { fighter, mage };
    } catch (error: any) {
      this.testResults.push({
        test: 'Character Creation',
        passed: false,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Test equipment system
   */
  testEquipmentSystem() {
    console.log('Testing equipment system...');

    try {
      const equipment = new Equipment();

      // Test item retrieval
      const longSword = equipment.getItem('Long Sword');
      const chainMail = equipment.getItem('Chain Mail');
      const largeShield = equipment.getItem('Large Shield');

      if (!longSword || !chainMail || !largeShield) {
        throw new Error('Failed to retrieve equipment items');
      }

      // Test equipment for character
      const fighter = new Character('Equipment Test', 'Human', 'Fighter');
      fighter.attributes = { strength: 16, agility: 12 };

      const equipResult = equipment.equipItem(fighter, longSword);
      if (!equipResult.success) {
        throw new Error('Failed to equip weapon');
      }

      // Test combat calculations
      const attackBonus = equipment.calculateAttackBonus(fighter);
      const acBonus = equipment.calculateACBonus(fighter);

      this.testResults.push({
        test: 'Equipment System',
        passed: true,
        details: `Equipment loaded, attack bonus: ${attackBonus}, AC bonus: ${acBonus}`,
      });
    } catch (error: any) {
      this.testResults.push({
        test: 'Equipment System',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test formation system
   */
  testFormationSystem() {
    console.log('Testing formation system...');

    try {
      const formation = new Formation();
      const party = this.createTestParty();

      if (!party) {
        throw new Error('Failed to create test party');
      }

      // Setup formation
      const formationData = formation.setupFromParty(party);

      if (formationData.totalMembers !== party.aliveMembers.length) {
        throw new Error('Formation member count mismatch');
      }

      // Test formation validation
      const validation = formation.validateFormation();
      if (!validation.valid) {
        throw new Error('Formation validation failed');
      }

      // Test formation effects
      const frontMember = formationData.frontRow[0];
      if (frontMember) {
        const effects = formation.applyFormationEffects(frontMember, 'attack');
        console.log('Formation effects:', effects);
      }

      this.testResults.push({
        test: 'Formation System',
        passed: true,
        details: `Formation setup: ${formationData.frontRow.length} front, ${formationData.backRow.length} back`,
      });
    } catch (error: any) {
      this.testResults.push({
        test: 'Formation System',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test monster creation
   */
  testMonsterCreation() {
    console.log('Testing monster creation...');

    try {
      // Create various monsters
      const kobold = new Monster('Kobold');
      const orc = new Monster('Orc');
      const dragon = new Monster('Young Dragon');

      if (!kobold.name || !orc.name || !dragon.name) {
        throw new Error('Monster creation failed');
      }

      // Test monster AI
      const testTargets = this.createTestParty()!.aliveMembers;
      const aiDecision = orc.chooseAction(testTargets);

      if (!aiDecision.action) {
        throw new Error('Monster AI decision failed');
      }

      this.testResults.push({
        test: 'Monster Creation',
        passed: true,
        details: `Created ${kobold.name}, ${orc.name}, ${dragon.name}. AI decision: ${aiDecision.action}`,
      });
    } catch (error: any) {
      this.testResults.push({
        test: 'Monster Creation',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test combat initiation
   */
  testCombatInitiation() {
    console.log('Testing combat initiation...');

    try {
      const combat = new Combat();
      const party = this.createTestParty();
      const enemies = [new Monster('Orc'), new Monster('Kobold')];
      const enemyParties = [enemies]; // Wrap enemies in party structure

      if (!party || enemies.length === 0) {
        throw new Error('Failed to create combat participants');
      }

      // Start combat with new party-based format
      const firstActor = combat.startCombat(party, enemyParties);

      if (!combat.isActive) {
        throw new Error('Combat failed to start');
      }

      if (!firstActor) {
        throw new Error('Failed to determine first actor');
      }

      // Test initiative system
      if (combat.turnOrder.length === 0) {
        throw new Error('Initiative order not calculated');
      }

      this.testResults.push({
        test: 'Combat Initiation',
        passed: true,
        details: `Combat started, ${combat.turnOrder.length} combatants in initiative order`,
      });

      // Clean up
      combat.endCombat();
    } catch (error: any) {
      this.testResults.push({
        test: 'Combat Initiation',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test combat actions
   */
  testCombatActions() {
    console.log('Testing combat actions...');

    try {
      const combat = new Combat();
      const party = this.createTestParty();
      const enemies = [new Monster('Kobold')];
      const enemyParties = [enemies]; // Wrap enemies in party structure

      // Start combat with new party-based format
      combat.startCombat(party, enemyParties);

      // Test attack action
      const attacker = party!.aliveMembers[0];
      const target = enemies[0];

      const attackAction = {
        type: 'attack',
        attacker: attacker,
        target: target,
      };

      const attackResult = combat.processAction(attackAction);

      if (!(attackResult as any).success && (attackResult as any).hit === undefined) {
        throw new Error('Attack action failed to process');
      }

      // Test defend action
      const defendAction = {
        type: 'defend',
        defender: attacker,
      };

      const defendResult = combat.processAction(defendAction);

      if (!(defendResult as any).success) {
        throw new Error('Defend action failed');
      }

      this.testResults.push({
        test: 'Combat Actions',
        passed: true,
        details: `Attack processed: ${(attackResult as any).hit ? 'hit' : 'miss'}, Defend: ${(defendResult as any).success}`,
      });

      combat.endCombat();
    } catch (error: any) {
      this.testResults.push({
        test: 'Combat Actions',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test encounter generation
   */
  testEncounterGeneration() {
    console.log('Testing encounter generation...');

    try {
      const generator = new EncounterGenerator();

      // Test random encounters
      const encounter1 = generator.generateEncounter(1, 1);
      const encounter2 = generator.generateEncounter(3, 3);
      const encounter5 = generator.generateEncounter(5, 5);

      // Test boss encounter
      const bossEncounter = generator.generateBossEncounter(3);

      if (!(bossEncounter as any).isBoss) {
        throw new Error('Boss encounter not properly marked');
      }

      // Test difficulty calculation
      const party = this.createTestParty();
      const difficulty = generator.calculateDifficulty(encounter2, 3, party!.size);

      // Check if encounter has enemyParties or monsters for backward compatibility
      const enemyCount = (bossEncounter as any).enemyParties
        ? (bossEncounter as any).enemyParties[0].length
        : (bossEncounter as any).monsters.length;

      this.testResults.push({
        test: 'Encounter Generation',
        passed: true,
        details: `Generated encounters for levels 1,3,5. Boss encounter: ${enemyCount} monsters. Difficulty: ${difficulty}`,
      });
    } catch (error: any) {
      this.testResults.push({
        test: 'Encounter Generation',
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Create a test party
   */
  createTestParty() {
    try {
      const party = new Party();

      // Create fighter
      const fighter = new Character('Tank', 'Human', 'Fighter');
      fighter.attributes = { strength: 16, vitality: 14, agility: 12 };
      fighter.level = 3;
      fighter.maxHP = 25;
      fighter.currentHP = 25;

      // Create mage
      const mage = new Character('Wizard', 'Elf', 'Mage');
      mage.attributes = { intelligence: 16, agility: 14, vitality: 10 };
      mage.level = 3;
      mage.maxHP = 15;
      mage.currentHP = 15;

      // Create priest
      const priest = new Character('Healer', 'Human', 'Priest');
      priest.attributes = { piety: 16, vitality: 12, agility: 10 };
      priest.level = 3;
      priest.maxHP = 20;
      priest.currentHP = 20;

      party.addMember(fighter);
      party.addMember(mage);
      party.addMember(priest);

      return party;
    } catch (error: any) {
      console.error('Failed to create test party:', error);
      return null;
    }
  }

  /**
   * Print test results
   */
  printTestResults() {
    console.log('\n=== COMBAT SYSTEM TEST RESULTS ===');

    const passed = this.testResults.filter((result) => result.passed).length;
    const total = this.testResults.length;

    console.log(`\nTests Passed: ${passed}/${total}`);

    this.testResults.forEach((result) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${status}: ${result.test}`);

      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    if (passed === total) {
      console.log('\n🎉 All tests passed! Combat system is ready.');
    } else {
      console.log(`\n⚠️  ${total - passed} test(s) failed. Please review the errors above.`);
    }

    console.log('\n=== END TEST RESULTS ===\n');
  }

  /**
   * Run a specific test
   */
  runSpecificTest(testName) {
    console.log(`Running specific test: ${testName}`);

    switch (testName) {
      case 'character':
        this.testCharacterCreation();
        break;
      case 'equipment':
        this.testEquipmentSystem();
        break;
      case 'formation':
        this.testFormationSystem();
        break;
      case 'monster':
        this.testMonsterCreation();
        break;
      case 'combat':
        this.testCombatInitiation();
        break;
      case 'actions':
        this.testCombatActions();
        break;
      case 'encounters':
        this.testEncounterGeneration();
        break;
      default:
        console.log(
          'Unknown test name. Available tests: character, equipment, formation, monster, combat, actions, encounters'
        );
        return;
    }

    this.printTestResults();
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).CombatTest = CombatTest;
}
