# Combat System

> **Files**: `src/game/Combat.ts`, `src/game/Formation.ts`, `src/game/CombatInterface.ts`
> **Total Lines**: ~2,100

## Overview

Turn-based combat with initiative system, formation mechanics, and multi-wave encounters.

---

## Combat Flow

```
1. startCombat(party, enemies, surpriseType)
   ├─ Setup combatants (handle waves)
   ├─ Check for surprise round
   ├─ Calculate initiative
   └─ Return first actor

2. Combat Loop:
   ├─ getCurrentActor() → next valid combatant
   ├─ Player selects action OR Monster AI chooses
   ├─ processAction(action) → resolveAction()
   ├─ Check combat end conditions
   └─ Repeat until victory/defeat

3. Combat End:
   ├─ Victory: calculateRewards(), save loot/gold to active Party inventory, emit 'combat-ended'
   └─ Defeat: emit 'party-defeated'
```

---

## Combat.ts

### Key Properties

```typescript
export class Combat {
  engine: any;
  isActive: boolean;
  currentTurn: number;
  combatants: any[];
  actionQueue: any[];
  turnOrder: any[];
  currentTurnIndex: number;
  combatPhase: string;              // 'initiative', 'action_selection', 'resolution', 'cleanup'
  pendingActions: Map<any, any>;
  combatLog: any[];
  surpriseRound: any;               // 'party', 'enemies', or null

  // Multi-wave combat
  playerParty: any;
  enemyParties: any[];
  currentEnemyPartyIndex: number;
  currentEnemyParty: any;

  // Tracking
  disconnectedCharacters: any[];
  spellSystem: Spells;
  lastCombatRewards: any;
}
```

---

## Initiative System

```typescript
calculateInitiative(): void {
    this.turnOrder = combatants.map(c => ({
        combatant: c,
        initiative: this.getInitiative(c),
        isPlayer: c.hasOwnProperty('class')
    })).sort((a, b) => b.initiative - a.initiative);
}

getInitiative(combatant: any): number {
    const baseAgility = combatant.attributes?.agility || 10;
    const classBonus = this.getClassInitiativeBonus(combatant);
    const randomFactor = Random.die(6);
    return baseAgility + classBonus + randomFactor;
}
```

### Class Initiative Bonuses
| Class | Bonus |
|-------|-------|
| Ninja | +4 |
| Thief, Samurai | +2 |
| Fighter, Lord | +1 |
| Bishop | 0 |
| Mage, Priest | -1 |

---

## Action Types

### Attack
```typescript
{
    type: 'attack',
    attacker: character,
    target: monster
}
```
- Roll d20 + attackBonus vs target AC
- On hit: roll damage + strength modifier
- Critical on natural 20 (2x damage, 5% instant kill)

### Spell
```typescript
{
    type: 'spell',
    caster: character,
    spellName: 'Fireball',
    target: monster
}
```
- Success: 85% base + (level diff × 5) + attribute bonus
- Spell consumed from memory regardless of success

### Defend
- Grants +2 AC bonus until next turn
- Resets after being attacked

### Item
- Uses consumable from inventory
- Effect applied immediately

### Flee/Disconnect
- 50% base success rate
- Success: Character phases out, returns to town "Confused"
- Failure: Random monster attacks fleeing character

---

## Damage Calculations

### Attack Roll
```typescript
attackRoll = d20 + attackBonus
HIT if attackRoll >= targetAC
```

### Damage Roll
```typescript
rollDamage(attacker: any): number {
    let damage = Random.die(6);  // Base 1d6
    damage += Math.floor((attacker.attributes.strength - 10) / 2);
    damage += attacker.equipment?.weapon?.damageBonus || 0;
    return Math.max(1, damage);
}
```

### Armor Class
```typescript
getArmorClass(combatant: any): number {
    let ac = 10;  // Base
    ac -= Math.floor((combatant.attributes.agility - 10) / 2);
    ac -= combatant.equipment?.armor?.acBonus || 0;
    ac -= combatant.equipment?.shield?.acBonus || 0;
    if (combatant.isDefending) ac -= 2;
    return ac;  // Lower is better
}
```

### Critical Hits
```typescript
if (attackRoll >= 20) {  // Natural 20
    const critRoll = Random.die(20);
    if (critRoll >= 18) result.multiplier = 2;
    if (critRoll === 20 && Random.percent(5)) {
        result.instant = true;  // Instant kill
    }
}
```

---

## Formation System

### Structure
- **Front Row**: 0-3 positions (melee)
- **Back Row**: 0-3 positions (caster/ranged)
- **Max Party Size**: 4

### Formation.ts Properties

```typescript
export class Formation {
  frontRow: any[];
  backRow: any[];
  maxFrontRow: number = 3;
  maxBackRow: number = 3;

  setupFromParty(party: any): FormationData;
  shouldBeInFrontRow(character: any): boolean;
  setFormation(frontRowMembers: any[], backRowMembers: any[]): any;
  moveCharacter(character: any, targetRow: 'front' | 'back'): any;
}
```

### Default Placement
| Front Row | Back Row |
|-----------|----------|
| Fighter, Lord, Samurai, Thief, Ninja | Mage, Priest, Bishop |

### Position Effects

```typescript
// Front Row
damageBonus: 0
accuracyBonus: 0
damageTakenMultiplier: 1.0
targetingPriority: 'high'

// Back Row
damageBonus: -1 (melee penalty)
accuracyBonus: +1 ranged, -1 melee
damageTakenMultiplier: 0.75
targetingPriority: 'low'
```

### Attack Restrictions
- **Melee**: Front row always; back row only if front empty OR has reach weapon
- **Ranged/Spell**: Any position
- **Reach Weapons**: Spear, Halberd, Pike, Poleaxe

### Targeting Priority
Enemies target front row first; back row only when front is eliminated.

---

## Monster AI

### AI Types

```typescript
// 'cowardly' - Targets weakest
target = targets.sort((a,b) => a.currentHP - b.currentHP)[0];

// 'aggressive' - Targets front row / random
target = frontRowTargets.length ? Random.choice(frontRowTargets) : Random.choice(targets);

// 'tactical' - Targets spellcasters
target = targets.find(t => ['Mage','Priest','Bishop'].includes(t.class));

// 'intelligent' - Scoring system
score = 0;
score += (1 - hpRatio) * 30;           // Injured bonus
score += isSpellcaster ? 20 : 0;       // Caster priority
score += Math.max(0, 15 - ac) * 2;     // Easy target
score += hitChance;
```

### Attack Selection
- Prefers area attacks with 3+ targets
- 30% chance ranged attacks
- Default: first attack in list

---

## Multi-Wave Combat

```typescript
// Setup multiple waves
await combat.startCombat(party, [wave1, wave2, wave3]);

// Between waves
advanceToNextEnemyParty(): boolean {
    this.currentEnemyPartyIndex++;
    if (this.currentEnemyPartyIndex >= this.enemyParties.length) {
        return false;  // All waves defeated
    }
    this.currentEnemyParty = this.enemyParties[this.currentEnemyPartyIndex];
    this.calculateInitiative();
    return true;
}
```

---

## Type Definitions

Combat types are defined in `src/types/index.ts`:

```typescript
export interface CombatAction {
  type: 'attack' | 'spell' | 'item' | 'defend' | 'flee' | 'parry';
  actorId: string;
  targetId?: string;
  spellId?: string;
  itemId?: string;
}

export interface CombatResult {
  hit: boolean;
  damage: number;
  critical: boolean;
  message: string;
}

export type AIType = 'aggressive' | 'defensive' | 'caster' | 'support' | 'random';
```

---

## Combat Events

```typescript
// Start
emit('combat-started', {
    encounter, formation, difficulty, firstActor, surpriseRound
});

// Action processed
emit('combat-action-processed', {
    action, result, combatLog, nextActor
});

// Victory
emit('combat-ended', {
    victory: true,
    rewards: { experience, loot, gold }, // Loot is automatically deposited to party.inventory before emit
    casualties, disconnectedCharacters
});

// Defeat
emit('party-defeated', {
    victory: false,
    casualties, disconnectedCharacters, totalDefeat
});

// Character state
emit('character-updated', { character });
emit('character-disconnected', { character, reason });
```

---

## Adding New Combat Mechanics

### New Action Type

1. **Add handler in resolveAction():**
```typescript
case 'newAction':
    return this.resolveNewAction(action);
```

2. **Implement resolver:**
```typescript
async resolveNewAction(action: CombatAction): Promise<CombatResult> {
    const { actor, target } = action;
    this.logMessage(`${actor.name} performs new action!`);
    return { success: true, message: 'Action performed' };
}
```

3. **Update validation:**
```typescript
// In CombatInterface.validateAction()
case 'newAction':
    // Validate prerequisites
    break;
```

4. **(Optional) Add to type definition:**
```typescript
// In src/types/index.ts
export interface CombatAction {
  type: 'attack' | 'spell' | 'item' | 'defend' | 'flee' | 'parry' | 'newAction';
  // ...
}
```

### New Formation Effect

```typescript
// In Formation.applyFormationEffects()
effects.spellPowerBonus = position.row === 'back' ? 1 : 0;
effects.critChance = position.row === 'front' ? 5 : 0;
```

### New Status Condition

```typescript
character.conditions.push({
    type: 'poisoned',
    duration: 3,
    effect: (char: CharacterData) => { char.currentHP -= 5; }
});

// Apply each turn
combatant.conditions?.forEach(c => c.effect?.(combatant));
```

---

## Testing

```typescript
// Create test combat
const party = new Party();
const monster = await Monster.createFromData('Kobold');
const combat = new Combat();
await combat.startCombat(party, [monster]);

// Process action
const result = await combat.processAction({
    type: 'attack',
    attacker: party.members[0],
    target: monster
});
```
