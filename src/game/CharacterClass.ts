/**
 * Class Definitions
 * Handles character class requirements and abilities
 */
export class CharacterClass {
  static getClassData(className: string) {
    const classes = {
      // Base Classes (available at creation)
      Fighter: {
        name: 'Fighter',
        description: 'Melee combat specialist',
        requirements: { strength: 11 },
        hitDie: 10,
        spells: false,
        type: 'base',
        spellProgression: null,
      },
      Mage: {
        name: 'Mage',
        description: 'Arcane spellcaster',
        requirements: { intelligence: 11 },
        hitDie: 4,
        spells: 'arcane',
        type: 'base',
        spellProgression: 'mage',
      },
      Priest: {
        name: 'Priest',
        description: 'Divine spellcaster',
        requirements: { piety: 11 },
        hitDie: 8,
        spells: 'divine',
        type: 'base',
        spellProgression: 'priest',
      },
      Thief: {
        name: 'Thief',
        description: 'Stealth and utility specialist',
        requirements: { agility: 11 },
        hitDie: 6,
        spells: false,
        type: 'base',
        spellProgression: null,
      },
      // Elite Classes (require level 4+ and class change)
      Bishop: {
        name: 'Bishop',
        description: 'Master of both arcane and divine magic',
        requirements: { intelligence: 12, piety: 12 },
        hitDie: 6,
        spells: 'both',
        type: 'elite',
        prerequisites: [
          { class: 'Priest', level: 4 },
          { class: 'Mage', level: 4 },
        ],
        spellProgression: 'bishop',
        abilities: ['identify_items', 'dual_spellcasting'],
      },
      Samurai: {
        name: 'Samurai',
        description: 'Elite warrior with limited magical ability',
        requirements: {
          strength: 15,
          intelligence: 11,
          piety: 10,
          vitality: 14,
          agility: 10,
          luck: 9,
        },
        hitDie: 10,
        spells: 'limited_arcane',
        type: 'elite',
        prerequisites: [{ class: 'Fighter', level: 4 }],
        spellProgression: 'samurai',
        abilities: ['critical_bonus', 'limited_mage_spells'],
      },
      Lord: {
        name: 'Lord',
        description: 'Noble warrior with divine blessing',
        requirements: {
          strength: 15,
          intelligence: 12,
          piety: 12,
          vitality: 15,
          agility: 14,
          luck: 15,
        },
        hitDie: 10,
        spells: 'limited_divine',
        type: 'elite',
        prerequisites: [{ class: 'Fighter', level: 4 }],
        spellProgression: 'lord',
        abilities: ['lay_on_hands', 'limited_priest_spells'],
      },
      Ninja: {
        name: 'Ninja',
        description: 'Master of stealth and shadow magic',
        requirements: {
          strength: 17,
          intelligence: 17,
          piety: 17,
          vitality: 17,
          agility: 17,
          luck: 17,
        },
        hitDie: 8,
        spells: 'limited_arcane',
        type: 'elite',
        prerequisites: [{ class: 'Thief', level: 4 }],
        spellProgression: 'ninja',
        abilities: ['enhanced_backstab', 'critical_hits', 'limited_mage_spells'],
      },
    };

    return (classes as Record<string, any>)[className] || null;
  }

  static checkRequirements(className: string, attributes: Record<string, number>) {
    const classData = this.getClassData(className);
    if (!classData) return false;

    for (const [attr, minValue] of Object.entries(classData.requirements) as [string, any][]) {
      if (attributes[attr] < minValue) {
        return false;
      }
    }

    return true;
  }

  static getAllClasses() {
    return ['Fighter', 'Mage', 'Priest', 'Thief', 'Bishop', 'Samurai', 'Lord', 'Ninja'];
  }

  static getBaseClasses() {
    return ['Fighter', 'Mage', 'Priest', 'Thief'];
  }

  static getEliteClasses() {
    return ['Bishop', 'Samurai', 'Lord', 'Ninja'];
  }

  static isEliteClass(className: string) {
    return this.getEliteClasses().includes(className);
  }

  static checkClassChangeRequirements(character: any, newClassName: string) {
    const classData = this.getClassData(newClassName);
    if (!classData) return { canChange: false, reason: 'Invalid class' };

    // Check if it's an elite class
    if (classData.type === 'elite') {
      // Check level requirement (must be level 4+)
      if (character.level < 4) {
        return { canChange: false, reason: 'Must be at least level 4' };
      }

      // Check attribute requirements
      for (const [attr, minValue] of Object.entries(classData.requirements) as [string, any][]) {
        if (character.attributes[attr] < minValue) {
          return { canChange: false, reason: `Insufficient ${attr} (need ${minValue})` };
        }
      }

      // Check prerequisites (must have been one of the required classes)
      if (classData.prerequisites && classData.prerequisites.length > 0) {
        const hasPrerequisite = classData.prerequisites.some((prereq: any) => {
          return (
            character.classHistory &&
            character.classHistory.some(
              (history: any) => history.class === prereq.class && history.maxLevel >= prereq.level
            )
          );
        });

        if (!hasPrerequisite) {
          const prereqText = classData.prerequisites
            .map((p: any) => `${p.class} (level ${p.level}+)`)
            .join(' or ');
          return { canChange: false, reason: `Must have been: ${prereqText}` };
        }
      }
    }

    return { canChange: true };
  }

  static getSpellSlots(character: any, spellSchool: string) {
    const classData = this.getClassData(character.class);
    if (!classData || !classData.spellProgression) return [];

    const level = character.level;
    const primaryStat =
      spellSchool === 'arcane' ? character.attributes.intelligence : character.attributes.piety;

    // Calculate spell slots based on class progression
    return this.calculateSpellSlots(level, primaryStat, classData.spellProgression, spellSchool);
  }

  static calculateSpellSlots(level: number, primaryStat: number, progression: string, school: string) {
    const slots = [];

    // Base spell progression tables (simplified)
    const progressionTables = {
      mage: {
        1: [1, 0, 0, 0, 0, 0, 0],
        2: [2, 0, 0, 0, 0, 0, 0],
        3: [2, 1, 0, 0, 0, 0, 0],
        4: [3, 2, 0, 0, 0, 0, 0],
        5: [3, 2, 1, 0, 0, 0, 0],
        6: [3, 3, 2, 0, 0, 0, 0],
        7: [4, 3, 2, 1, 0, 0, 0],
        8: [4, 3, 3, 2, 0, 0, 0],
        9: [4, 4, 3, 2, 1, 0, 0],
        10: [4, 4, 3, 3, 2, 0, 0],
      },
      priest: {
        1: [1, 0, 0, 0, 0, 0, 0],
        2: [2, 0, 0, 0, 0, 0, 0],
        3: [2, 1, 0, 0, 0, 0, 0],
        4: [3, 2, 0, 0, 0, 0, 0],
        5: [3, 2, 1, 0, 0, 0, 0],
        6: [3, 3, 2, 0, 0, 0, 0],
        7: [4, 3, 2, 1, 0, 0, 0],
        8: [4, 3, 3, 2, 0, 0, 0],
        9: [4, 4, 3, 2, 1, 0, 0],
        10: [4, 4, 3, 3, 2, 0, 0],
      },
      bishop: {
        1: [1, 0, 0, 0, 0, 0, 0],
        2: [1, 0, 0, 0, 0, 0, 0],
        3: [2, 1, 0, 0, 0, 0, 0],
        4: [2, 1, 0, 0, 0, 0, 0],
        5: [2, 2, 1, 0, 0, 0, 0],
        6: [3, 2, 1, 0, 0, 0, 0],
        7: [3, 2, 2, 1, 0, 0, 0],
        8: [3, 3, 2, 1, 0, 0, 0],
        9: [4, 3, 2, 2, 1, 0, 0],
        10: [4, 3, 3, 2, 1, 0, 0],
      },
      samurai: {
        4: [1, 0, 0, 0, 0, 0, 0],
        5: [1, 0, 0, 0, 0, 0, 0],
        6: [2, 1, 0, 0, 0, 0, 0],
        7: [2, 1, 0, 0, 0, 0, 0],
        8: [2, 2, 1, 0, 0, 0, 0],
        9: [3, 2, 1, 0, 0, 0, 0],
        10: [3, 2, 2, 1, 0, 0, 0],
      },
      lord: {
        4: [1, 0, 0, 0, 0, 0, 0],
        5: [1, 0, 0, 0, 0, 0, 0],
        6: [2, 1, 0, 0, 0, 0, 0],
        7: [2, 1, 0, 0, 0, 0, 0],
        8: [2, 2, 1, 0, 0, 0, 0],
        9: [3, 2, 1, 0, 0, 0, 0],
        10: [3, 2, 2, 1, 0, 0, 0],
      },
      ninja: {
        4: [1, 0, 0, 0, 0, 0, 0],
        6: [1, 0, 0, 0, 0, 0, 0],
        8: [2, 1, 0, 0, 0, 0, 0],
        10: [2, 2, 1, 0, 0, 0, 0],
      },
    };

    const table = (progressionTables as Record<string, any>)[progression];
    if (!table || !table[level]) return [];

    return table[level];
  }
}
// Backward compatibility alias — original name was `Class`
export { CharacterClass as Class };
