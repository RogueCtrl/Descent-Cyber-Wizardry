/**
 * Character Creator
 * Handles the character creation process
 */
class CharacterCreator {
    constructor() {
        this.currentCharacter = null;
        this.step = 'race';
        this.availableRaces = ['Human', 'Elf', 'Dwarf', 'Hobbit', 'Gnome'];
        this.availableClasses = ['Fighter', 'Mage', 'Priest', 'Thief'];
    }
    
    /**
     * Start character creation
     */
    startCreation() {
        this.currentCharacter = new Character();
        this.step = 'race';
    }
    
    /**
     * Set character race
     */
    setRace(race) {
        if (this.availableRaces.includes(race)) {
            this.currentCharacter.race = race;
            this.step = 'attributes';
            return true;
        }
        return false;
    }
    
    /**
     * Roll attributes
     */
    rollAttributes() {
        const attributes = AttributeRoller.rollAllAttributes();
        this.currentCharacter.attributes = attributes;
        this.step = 'class';
        return attributes;
    }
    
    /**
     * Set character class
     */
    setClass(characterClass) {
        if (this.availableClasses.includes(characterClass)) {
            this.currentCharacter.class = characterClass;
            this.step = 'finalize';
            return true;
        }
        return false;
    }
    
    /**
     * Finalize character creation
     */
    finalizeCharacter(name) {
        this.currentCharacter.name = name;
        const character = this.currentCharacter;
        this.currentCharacter = null;
        this.step = 'race';
        return character;
    }
}