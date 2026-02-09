/**
 * Formation System
 * Handles party positioning and formation effects in combat
 */
export class Formation {
  frontRow: any[];
  backRow: any[];
  maxFrontRow: number;
  maxBackRow: number;

  constructor() {
    this.frontRow = [] as any[];
    this.backRow = [] as any[];
    this.maxFrontRow = 3;
    this.maxBackRow = 3;
  }

  /**
   * Set up formation from party
   */
  setupFromParty(party: any) {
    this.frontRow = [];
    this.backRow = [];

    const aliveMembers = party.aliveMembers;

    // Default formation assignment based on class
    aliveMembers.forEach((member: any, index: number) => {
      if (this.shouldBeInFrontRow(member) && this.frontRow.length < this.maxFrontRow) {
        this.frontRow.push(member);
      } else if (this.backRow.length < this.maxBackRow) {
        this.backRow.push(member);
      } else if (this.frontRow.length < this.maxFrontRow) {
        this.frontRow.push(member);
      }
    });

    return this.getFormationData();
  }

  /**
   * Determine if character should default to front row
   */
  shouldBeInFrontRow(character: any) {
    const frontRowClasses = ['Fighter', 'Lord', 'Samurai', 'Thief', 'Ninja'];
    return frontRowClasses.includes(character.class);
  }

  /**
   * Set custom formation
   */
  setFormation(frontRowMembers: any[], backRowMembers: any[]) {
    if (frontRowMembers.length > this.maxFrontRow || backRowMembers.length > this.maxBackRow) {
      return { success: false, reason: 'Too many members in row' };
    }

    this.frontRow = [...frontRowMembers];
    this.backRow = [...backRowMembers];

    return { success: true, formation: this.getFormationData() };
  }

  /**
   * Move character between rows
   */
  moveCharacter(character: any, targetRow: string) {
    // Remove from current position
    this.frontRow = this.frontRow.filter((member) => member.id !== character.id);
    this.backRow = this.backRow.filter((member) => member.id !== character.id);

    // Add to target row
    if (targetRow === 'front' && this.frontRow.length < this.maxFrontRow) {
      this.frontRow.push(character);
      return { success: true };
    } else if (targetRow === 'back' && this.backRow.length < this.maxBackRow) {
      this.backRow.push(character);
      return { success: true };
    } else {
      // Put back in original position (simplified)
      if (this.shouldBeInFrontRow(character) && this.frontRow.length < this.maxFrontRow) {
        this.frontRow.push(character);
      } else if (this.backRow.length < this.maxBackRow) {
        this.backRow.push(character);
      }
      return { success: false, reason: 'Target row is full' };
    }
  }

  /**
   * Get current formation data
   */
  getFormationData() {
    return {
      frontRow: [...this.frontRow],
      backRow: [...this.backRow],
      totalMembers: this.frontRow.length + this.backRow.length,
    };
  }

  /**
   * Check if character can attack from their position
   */
  canAttackFromPosition(attacker: any, target: any, attackType: string = 'melee') {
    const attackerPosition = this.getCharacterPosition(attacker);
    const targetPosition = this.getCharacterPosition(target, true); // true for enemy

    if (!attackerPosition || !targetPosition) return false;

    switch (attackType) {
      case 'melee':
        return this.canMeleeAttack(attackerPosition, targetPosition);
      case 'ranged':
        return this.canRangedAttack(attackerPosition, targetPosition);
      case 'reach':
        return this.canReachAttack(attackerPosition, targetPosition);
      case 'spell':
        return this.canCastSpell(attackerPosition, targetPosition);
      default:
        return false;
    }
  }

  /**
   * Get character's position in formation
   */
  getCharacterPosition(character: any, isEnemy: boolean = false) {
    if (isEnemy) {
      // Simplified enemy positioning
      return { row: 'front', index: 0 };
    }

    const frontIndex = this.frontRow.findIndex((member) => member.id === character.id);
    if (frontIndex !== -1) {
      return { row: 'front', index: frontIndex };
    }

    const backIndex = this.backRow.findIndex((member) => member.id === character.id);
    if (backIndex !== -1) {
      return { row: 'back', index: backIndex };
    }

    return null;
  }

  /**
   * Check if melee attack is possible
   */
  canMeleeAttack(attackerPos: any, targetPos: any) {
    // Front row can melee attack front row
    if (attackerPos.row === 'front') {
      return true;
    }

    // Back row can only melee if front row is empty or has reach weapons
    if (attackerPos.row === 'back') {
      return this.frontRow.length === 0 || this.hasReachWeapon(attackerPos.character);
    }

    return false;
  }

  /**
   * Check if ranged attack is possible
   */
  canRangedAttack(attackerPos: any, targetPos: any) {
    // Ranged attacks can be made from any position
    // But may have penalties based on position and line of sight
    return true;
  }

  /**
   * Check if reach attack is possible
   */
  canReachAttack(attackerPos: any, targetPos: any) {
    // Reach weapons can attack from back row
    return true;
  }

  /**
   * Check if spell can be cast
   */
  canCastSpell(attackerPos: any, targetPos: any) {
    // Most spells can be cast from any position
    // Some may require line of sight
    return true;
  }

  /**
   * Check if character has reach weapon
   */
  hasReachWeapon(character: any) {
    if (!character.equipment || !character.equipment.weapon) return false;

    const reachWeapons = ['Spear', 'Halberd', 'Pike', 'Poleaxe'];
    return reachWeapons.includes(character.equipment.weapon.name);
  }

  /**
   * Get targeting priority for enemies
   */
  getTargetPriority(enemyFormation: any) {
    const targets = [] as any[];

    // Front row gets targeted first
    this.frontRow.forEach((character, index) => {
      if (character.isAlive) {
        targets.push({
          character,
          priority: 10 + (3 - index), // Higher priority for leftmost positions
          row: 'front',
          position: index,
        });
      }
    });

    // Back row only targetable if front row is eliminated or with ranged/spell attacks
    if (this.frontRow.filter((c) => c.isAlive).length === 0) {
      this.backRow.forEach((character, index) => {
        if (character.isAlive) {
          targets.push({
            character,
            priority: 5 + (3 - index),
            row: 'back',
            position: index,
          });
        }
      });
    }

    return targets.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Apply formation effects to combat
   */
  applyFormationEffects(character: any, actionType: string = 'attack') {
    const position = this.getCharacterPosition(character);
    if (!position) return {};

    const effects = {};

    // Front row effects
    if (position.row === 'front') {
      (effects as any).damageBonus = 0;
      (effects as any).accuracyBonus = 0;
      (effects as any).damageTakenMultiplier = 1.0; // Takes normal damage
      (effects as any).targetingPriority = 'high';
    }

    // Back row effects
    if (position.row === 'back') {
      (effects as any).damageBonus = -1; // Slight penalty to melee damage
      (effects as any).accuracyBonus = actionType === 'ranged' ? 1 : -1; // Bonus for ranged, penalty for melee
      (effects as any).damageTakenMultiplier = 0.75; // Takes less damage when protected
      (effects as any).targetingPriority = 'low';
    }

    return effects;
  }

  /**
   * Check if formation is valid
   */
  validateFormation() {
    const issues: string[] = [];

    if (this.frontRow.length + this.backRow.length === 0) {
      issues.push('Formation cannot be empty');
    }

    if (this.frontRow.length > this.maxFrontRow) {
      issues.push(`Too many characters in front row (max ${this.maxFrontRow})`);
    }

    if (this.backRow.length > this.maxBackRow) {
      issues.push(`Too many characters in back row (max ${this.maxBackRow})`);
    }

    // Check for duplicates
    const allMembers = [...this.frontRow, ...this.backRow];
    const uniqueIds = new Set(allMembers.map((member) => member.id));
    if (uniqueIds.size !== allMembers.length) {
      issues.push('Character cannot be in multiple positions');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get formation statistics
   */
  getFormationStats() {
    const frontRowClasses = this.frontRow.map((member) => member.class);
    const backRowClasses = this.backRow.map((member) => member.class);

    return {
      frontRow: {
        count: this.frontRow.length,
        classes: frontRowClasses,
        totalHP: this.frontRow.reduce((sum, member) => sum + member.currentHP, 0),
        averageAC:
          this.frontRow.length > 0
            ? this.frontRow.reduce((sum, member) => sum + this.calculateAC(member), 0) /
              this.frontRow.length
            : 0,
      },
      backRow: {
        count: this.backRow.length,
        classes: backRowClasses,
        totalHP: this.backRow.reduce((sum, member) => sum + member.currentHP, 0),
        averageAC:
          this.backRow.length > 0
            ? this.backRow.reduce((sum, member) => sum + this.calculateAC(member), 0) /
              this.backRow.length
            : 0,
      },
      overall: {
        totalMembers: this.frontRow.length + this.backRow.length,
        frontRowRatio: this.frontRow.length / (this.frontRow.length + this.backRow.length),
        balanceScore: this.calculateFormationBalance(),
      },
    };
  }

  /**
   * Calculate character AC (simplified)
   */
  calculateAC(character: any) {
    let ac = 10; // Base AC

    // Dexterity modifier
    if (character.attributes) {
      ac -= Math.floor((character.attributes.agility - 10) / 2);
    }

    // Equipment bonuses
    if (character.equipment) {
      if (character.equipment.armor) {
        ac -= character.equipment.armor.acBonus || 0;
      }
      if (character.equipment.shield) {
        ac -= character.equipment.shield.acBonus || 0;
      }
    }

    return ac;
  }

  /**
   * Calculate formation balance score
   */
  calculateFormationBalance() {
    const total = this.frontRow.length + this.backRow.length;
    if (total === 0) return 0;

    const idealFrontRatio = 0.5; // 50% front row is balanced
    const actualFrontRatio = this.frontRow.length / total;
    const deviation = Math.abs(actualFrontRatio - idealFrontRatio);

    return Math.max(0, 100 - deviation * 200); // Score from 0-100
  }

  /**
   * Suggest formation improvements
   */
  suggestFormationImprovements() {
    const suggestions: string[] = [];
    const stats = this.getFormationStats();

    if (stats.frontRow.count === 0) {
      suggestions.push(
        'Consider moving a fighter or tough character to the front row for protection'
      );
    }

    if (stats.backRow.count === 0 && stats.overall.totalMembers > 3) {
      suggestions.push('Consider moving spellcasters to the back row for protection');
    }

    if (stats.overall.balanceScore < 50) {
      suggestions.push('Formation is unbalanced - consider redistributing characters between rows');
    }

    // Check for class-specific suggestions
    const frontRowSpellcasters = this.frontRow.filter((member) =>
      ['Mage', 'Priest', 'Bishop'].includes(member.class)
    );
    if (frontRowSpellcasters.length > 0) {
      suggestions.push('Consider moving spellcasters to the back row for better protection');
    }

    const backRowFighters = this.backRow.filter((member) =>
      ['Fighter', 'Lord', 'Samurai'].includes(member.class)
    );
    if (backRowFighters.length > 1) {
      suggestions.push('Consider moving some fighters to the front row for better offense');
    }

    return suggestions;
  }

  /**
   * Auto-optimize formation
   */
  optimizeFormation() {
    const allMembers = [...this.frontRow, ...this.backRow];

    // Reset formation
    this.frontRow = [];
    this.backRow = [];

    // Sort by priority for front row
    const sortedMembers = allMembers.sort((a, b) => {
      const aPriority = this.getFrontRowPriority(a);
      const bPriority = this.getFrontRowPriority(b);
      return bPriority - aPriority;
    });

    // Assign to front row first
    sortedMembers.forEach((member) => {
      if (this.shouldBeInFrontRow(member) && this.frontRow.length < this.maxFrontRow) {
        this.frontRow.push(member);
      } else if (this.backRow.length < this.maxBackRow) {
        this.backRow.push(member);
      } else if (this.frontRow.length < this.maxFrontRow) {
        this.frontRow.push(member);
      }
    });

    return this.getFormationData();
  }

  /**
   * Get front row priority score for character
   */
  getFrontRowPriority(character: any) {
    const classPriorities = {
      Fighter: 10,
      Lord: 9,
      Samurai: 9,
      Thief: 6,
      Ninja: 7,
      Priest: 3,
      Mage: 2,
      Bishop: 1,
    };

    let priority = (classPriorities as Record<string, number>)[character.class] || 5;

    // Adjust for HP
    const hpRatio = character.currentHP / character.maxHP;
    priority += hpRatio * 2;

    // Adjust for AC (lower AC = higher priority)
    const ac = this.calculateAC(character);
    priority += Math.max(0, 15 - ac); // Better AC increases priority

    return priority;
  }
}
