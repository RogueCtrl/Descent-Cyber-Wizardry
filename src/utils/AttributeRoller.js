/**
 * Attribute Roller
 * Handles 3d6 attribute generation for character creation
 */
class AttributeRoller {
    /**
     * Roll a single attribute (3d6)
     */
    static rollAttribute() {
        return Random.dice(3, 6);
    }
    
    /**
     * Roll all six attributes
     */
    static rollAllAttributes() {
        return {
            strength: this.rollAttribute(),
            intelligence: this.rollAttribute(),
            piety: this.rollAttribute(),
            vitality: this.rollAttribute(),
            agility: this.rollAttribute(),
            luck: this.rollAttribute()
        };
    }
    
    /**
     * Roll attributes with advantage (roll twice, take better)
     */
    static rollWithAdvantage() {
        const roll1 = this.rollAllAttributes();
        const roll2 = this.rollAllAttributes();
        
        return {
            strength: Math.max(roll1.strength, roll2.strength),
            intelligence: Math.max(roll1.intelligence, roll2.intelligence),
            piety: Math.max(roll1.piety, roll2.piety),
            vitality: Math.max(roll1.vitality, roll2.vitality),
            agility: Math.max(roll1.agility, roll2.agility),
            luck: Math.max(roll1.luck, roll2.luck)
        };
    }
    
    /**
     * Calculate attribute total
     */
    static getAttributeTotal(attributes) {
        return attributes.strength + attributes.intelligence + attributes.piety +
               attributes.vitality + attributes.agility + attributes.luck;
    }
    
    /**
     * Check if attributes meet minimum standards
     */
    static isAcceptableRoll(attributes, minTotal = 65) {
        return this.getAttributeTotal(attributes) >= minTotal;
    }
}