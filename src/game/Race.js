/**
 * Race Definitions
 * Handles race-specific attributes and restrictions
 */
class Race {
    static getRaceData(raceName) {
        const races = {
            Human: {
                name: 'Human',
                description: 'Balanced and adaptable',
                modifiers: {},
                restrictions: [],
                abilities: []
            },
            Elf: {
                name: 'Elf',
                description: 'Graceful and intelligent',
                modifiers: { intelligence: 1, piety: 1, agility: 1, vitality: -1, luck: 1 },
                restrictions: ['Lord'],
                abilities: ['Sleep Resistance', 'Charm Resistance']
            },
            Dwarf: {
                name: 'Dwarf',
                description: 'Hardy and resilient',
                modifiers: { strength: 1, intelligence: -1, piety: 1, vitality: 2, agility: -1, luck: 1 },
                restrictions: ['Ninja'],
                abilities: ['Poison Resistance', 'Level Drain Resistance']
            },
            Hobbit: {
                name: 'Hobbit',
                description: 'Small but lucky',
                modifiers: { strength: -2, intelligence: 1, piety: 1, vitality: -1, agility: 2, luck: 2 },
                restrictions: ['Fighter', 'Lord', 'Samurai', 'Ninja'],
                abilities: ['Stealth Bonus', 'Critical Hit Bonus']
            },
            Gnome: {
                name: 'Gnome',
                description: 'Intellectually gifted',
                modifiers: { strength: -1, intelligence: 2, piety: 1, vitality: -1, agility: 1, luck: 1 },
                restrictions: ['Fighter', 'Lord', 'Samurai'],
                abilities: ['Spell Resistance', 'Item Identification']
            }
        };
        
        return races[raceName] || null;
    }
    
    static getAllRaces() {
        return ['Human', 'Elf', 'Dwarf', 'Hobbit', 'Gnome'];
    }
}