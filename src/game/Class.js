/**
 * Class Definitions
 * Handles character class requirements and abilities
 */
class Class {
    static getClassData(className) {
        const classes = {
            Fighter: {
                name: 'Fighter',
                description: 'Melee combat specialist',
                requirements: { strength: 11 },
                hitDie: 10,
                spells: false
            },
            Mage: {
                name: 'Mage',
                description: 'Arcane spellcaster',
                requirements: { intelligence: 11 },
                hitDie: 4,
                spells: 'arcane'
            },
            Priest: {
                name: 'Priest',
                description: 'Divine spellcaster',
                requirements: { piety: 11 },
                hitDie: 8,
                spells: 'divine'
            },
            Thief: {
                name: 'Thief',
                description: 'Stealth and utility specialist',
                requirements: { agility: 11 },
                hitDie: 6,
                spells: false
            }
        };
        
        return classes[className] || null;
    }
    
    static checkRequirements(className, attributes) {
        const classData = this.getClassData(className);
        if (!classData) return false;
        
        for (const [attr, minValue] of Object.entries(classData.requirements)) {
            if (attributes[attr] < minValue) {
                return false;
            }
        }
        
        return true;
    }
    
    static getAllClasses() {
        return ['Fighter', 'Mage', 'Priest', 'Thief'];
    }
}