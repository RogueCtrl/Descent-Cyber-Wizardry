# Combat System

> **Files**: `src/game/Combat.js`, `src/game/Formation.js`, `src/game/CombatInterface.js`
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
   ├─ Victory: calculateRewards(), emit 'combat-ended'
   └─ Defeat: emit 'party-defeated'
```

---

## Initiative System

```javascript
calculateInitiative() {
    this.turnOrder = combatants.map(c => ({
        combatant: c,
        initiative: this.getInitiative(c),
        isPlayer: c.hasOwnProperty('class')
    })).sort((a, b) => b.initiative - a.initiative);
}

getInitiative(combatant) {
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
```javascript
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
```javascript
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
```
attackRoll = d20 + attackBonus
HIT if attackRoll >= targetAC
```

### Damage Roll
```javascript
rollDamage(attacker) {
    let damage = Random.die(6);  // Base 1d6
    damage += Math.floor((attacker.attributes.strength - 10) / 2);
    damage += attacker.equipment?.weapon?.damageBonus || 0;
    return Math.max(1, damage);
}
```

### Armor Class
```javascript
getArmorClass(combatant) {
    let ac = 10;  // Base
    ac -= Math.floor((combatant.attributes.agility - 10) / 2);
    ac -= combatant.equipment?.armor?.acBonus || 0;
    ac -= combatant.equipment?.shield?.acBonus || 0;
    if (combatant.isDefending) ac -= 2;
    return ac;  // Lower is better
}
```

### Critical Hits
```javascript
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

### Default Placement
| Front Row | Back Row |
|-----------|----------|
| Fighter, Lord, Samurai, Thief, Ninja | Mage, Priest, Bishop |

### Position Effects

```javascript
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

```javascript
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

```javascript
// Setup multiple waves
await combat.startCombat(party, [wave1, wave2, wave3]);

// Between waves
advanceToNextEnemyParty() {
    this.currentEnemyPartyIndex++;
    if (this.currentEnemyPartyIndex >= this.enemyParties.length) {
        return false;  // All waves defeated
    }
    this.currentWaveCombatants = this.enemyParties[this.currentEnemyPartyIndex];
    this.calculateInitiative();
    return true;
}
```

---

## Combat Events

```javascript
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
    rewards: { experience, loot, gold },
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
```javascript
case 'newAction':
    return this.resolveNewAction(action);
```

2. **Implement resolver:**
```javascript
async resolveNewAction(action) {
    const { actor, target } = action;
    this.logMessage(`${actor.name} performs new action!`);
    return { success: true, message: 'Action performed' };
}
```

3. **Update validation:**
```javascript
// In CombatInterface.validateAction()
case 'newAction':
    // Validate prerequisites
    break;
```

### New Formation Effect

```javascript
// In Formation.applyFormationEffects()
effects.spellPowerBonus = position.row === 'back' ? 1 : 0;
effects.critChance = position.row === 'front' ? 5 : 0;
```

### New Status Condition

```javascript
character.conditions.push({
    type: 'poisoned',
    duration: 3,
    effect: (char) => { char.currentHP -= 5; }
});

// Apply each turn
combatant.conditions?.forEach(c => c.effect?.(combatant));
```

---

## Testing

```javascript
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
