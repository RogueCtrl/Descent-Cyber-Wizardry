# Character & Party System

> **Files**: `src/game/Character.js`, `src/game/Party.js`, `src/game/DeathSystem.js`, `src/game/RestSystem.js`, `src/game/Class.js`
> **Total Lines**: ~2,500

## Character System

### Character Data Structure

```javascript
{
    id: 'char_xxxxx',
    name: string,
    race: 'Human' | 'Elf' | 'Dwarf' | 'Hobbit' | 'Gnome',
    class: 'Fighter' | 'Mage' | 'Priest' | 'Thief' | 'Bishop' | 'Samurai' | 'Lord' | 'Ninja',
    level: number,
    experience: number,
    experienceToNext: number,
    age: number,
    maxAge: number,

    // Attributes
    attributes: {
        strength: number,
        intelligence: number,
        piety: number,
        vitality: number,
        agility: number,
        luck: number
    },

    // Health
    currentHP: number,
    maxHP: number,
    currentSP: number,
    maxSP: number,
    status: 'ok' | 'unconscious' | 'dead' | 'ashes' | 'lost',
    isAlive: boolean,

    // Equipment
    equipment: { weapon, armor, shield, accessory },
    inventory: [],
    memorizedSpells: { arcane: [], divine: [] },

    // Party membership
    partyId: string,
    isPhasedOut: boolean,
    classHistory: []
}
```

---

## Races

| Race | Modifiers | Restrictions | Abilities |
|------|-----------|--------------|-----------|
| Human | None | None | Balanced |
| Elf | +1 INT, +1 PIE, +1 AGI, -1 VIT, +1 LCK | No Lord | Sleep/Charm Resist |
| Dwarf | +1 STR, -1 INT, +1 PIE, +2 VIT, -1 AGI, +1 LCK | No Ninja | Poison/Level Drain Resist |
| Hobbit | -2 STR, +1 INT, +1 PIE, -1 VIT, +2 AGI, +2 LCK | No Fighter/Lord/Samurai/Ninja | Stealth/Crit Bonus |
| Gnome | -1 STR, +2 INT, +1 PIE, -1 VIT, +1 AGI, +1 LCK | No Fighter/Lord/Samurai | Spell Resist, ID Bonus |

**Max Age by Race**:
- Human: 80 + (VIT-10)×2
- Elf: 400 + (VIT-10)×2
- Dwarf: 300 + (VIT-10)×2
- Hobbit: 100 + (VIT-10)×2
- Gnome: 350 + (VIT-10)×2

---

## Classes

### Base Classes (Available at Creation)

| Class | Hit Die | Spells | Requirements |
|-------|---------|--------|--------------|
| Fighter | 10 | None | STR ≥ 11 |
| Mage | 4 | Arcane | INT ≥ 11 |
| Priest | 8 | Divine | PIE ≥ 11 |
| Thief | 6 | None | AGI ≥ 11 |

### Elite Classes (Require Level 4+)

| Class | Hit Die | Spells | Requirements | Prerequisite |
|-------|---------|--------|--------------|--------------|
| Bishop | 6 | Both | INT ≥ 12, PIE ≥ 12 | Priest OR Mage level 4+ |
| Samurai | 10 | Limited Arcane | All ≥ 9-15 | Fighter level 4+ |
| Lord | 10 | Limited Divine | All ≥ 12-15 | Fighter level 4+ |
| Ninja | 8 | Limited Arcane | ALL ≥ 17 | Thief level 4+ |

---

## Attributes

### Attribute Effects

| Attribute | Effect |
|-----------|--------|
| Strength | Melee damage: `(STR-10)/2` |
| Intelligence | Arcane spells, spell slots |
| Piety | Divine spells, resurrection chance |
| Vitality | HP per level: `(VIT-10)/2`, max age |
| Agility | AC modifier: `-((AGI-10)/2)`, initiative |
| Luck | Crit chance, resurrection bonus |

### Attribute Rolling
```javascript
// Standard: 3d6 per attribute
rollAllAttributes() {
    return {
        strength: Random.dice(3, 6),
        intelligence: Random.dice(3, 6),
        // ... etc
    };
}

// Validation: Total must be ≥ 65
isAcceptableRoll(attrs, minTotal = 65);
```

---

## Level Progression

### Experience Formula
```javascript
experienceToNext = 100 * currentLevel
// Level 1→2: 100 XP
// Level 5→6: 500 XP
// Level 10→11: 1000 XP
```

### HP Calculation
```javascript
maxHP = hitDie + vitBonus + (level - 1) * (Math.floor(hitDie / 2) + vitBonus)
// vitBonus = Math.floor((vitality - 10) / 2)

// Example: Fighter (d10) with VIT 16 at Level 3
// vitBonus = 3
// maxHP = 10 + 3 + (2 * (5 + 3)) = 29
```

### Level Up Process
```javascript
await character.levelUp();
// Returns: { success, hpGain, newLevel }
```

---

## Class Change

**Requirements**:
1. Level 4+
2. Meet all attribute requirements
3. Have prerequisite class in history

**What Happens**:
- Level resets to 1
- Experience resets to 0
- HP recalculated (ratio preserved)
- Spell slots updated
- Class history updated

```javascript
// Check eligibility
Class.checkClassChangeRequirements(character, 'Samurai');

// Perform change
character.changeClass('Samurai');
```

---

## Party System

### Party Structure
```javascript
{
    id: 'party_timestamp_random',
    name: string,
    members: Character[],
    maxSize: 4,
    currentLeader: Character,
    gold: number,
    inventory: any[],
    inTown: boolean,
    campId: string | null
}
```

### Party Management
```javascript
// Add/Remove members
party.addMember(character);    // Sets character.partyId
party.removeMember(character); // Clears character.partyId

// Properties
party.size;          // Current count
party.isFull;        // size >= 4
party.isEmpty;       // size === 0
party.aliveMembers;  // Members with isAlive = true

// Location
party.returnToTown();  // inTown = true
party.leaveTown();     // inTown = false
party.setCamp(campId); // Set camp reference
```

---

## Death System

### Death States

| State | HP Range | Recovery |
|-------|----------|----------|
| Unconscious | -10 < HP ≤ 0 | Natural/Healing |
| Dead | HP ≤ -10 or failed recovery | Resurrection |
| Ashes | Failed resurrection | Restoration |
| Lost | Failed restoration | Divine Miracle |

### Temple Services

| Service | Status | Base Cost | Success | Aging |
|---------|--------|-----------|---------|-------|
| Healing | Alive | 50g | 100% | None |
| Resurrection | Dead | 500g × level | 85% | 1-6 months |
| Restoration | Ashes | 1000g × level | 60% | 3-12 months |
| Divine Miracle | Lost | 2500g × level | 30% | 6-24 months |

### Success Modifiers
```javascript
finalChance = baseChance
    + (piety - 10) / 2
    + (luck - 10) / 4
    + level / 2
    - (age - 30) / 5
    - weeksSinceDeath * 5
```

### Failure Degradation
- Unconscious → Dead
- Dead → Ashes
- Ashes → Lost
- Lost → Stays lost

---

## Rest System

### Rest Locations

| Location | HP% | SP% | Cost | Risk | Aging |
|----------|-----|-----|------|------|-------|
| Inn | 100% | 100% | 10g/char | 0% | 1 month |
| Temple | 100% | 100% | 50g/char | 0% | None |
| Dungeon Camp | 30% | 50% | Free | 15% | None |
| Wilderness | 20% | 30% | Free | 25% | None |

### Rest Process
```javascript
const result = await restSystem.restParty(party, 'inn');
// Returns: { success, totalCost, recoveryDetails, agingEffects, encounterTriggered }
```

### Natural Recovery (Unconscious)
```javascript
recoveryChance = 30 + (vitality - 10) * 5 + (hours / 4) * 10
// Max 90%
```

---

## Spell Memorization

### Spell Slots by Class

```javascript
// Mage/Priest at level 5: [3, 2, 1, 0, 0, 0, 0]
// 3 level-1, 2 level-2, 1 level-3 spells

// Bishop (reduced): [2, 2, 1, 0, 0, 0, 0]
// Can cast BOTH schools

// Samurai/Lord/Ninja: Start at level 4, very limited
```

### Memorization
```javascript
// Prepare spells during rest
await spellMemorization.prepareSpells(character, {
    arcane: [{name: 'Magic Missile'}, {name: 'Shield'}],
    divine: [{name: 'Cure Light Wounds'}]
});

// Auto-prepare based on priority
spellMemorization.autoPrepareSpells(character);

// Check if needs preparation
spellMemorization.needsSpellPreparation(character);
```

---

## Phase Out System

Used when characters flee combat or are temporarily removed:

```javascript
// Phase out
character.phaseOut('combat_disconnect');
// isPhasedOut = true, phaseOutReason set, partyId preserved

// Phase back in
character.phaseIn();
// Requires canPhaseBackIn = true

// Check status
character.isActiveTeamMember();  // Has party, not phased, not lost
```

---

## Key Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `character-created` | New character | `{character}` |
| `character-death` | HP reaches 0 | `{character, deathResult, context}` |
| `character-resurrection` | Resurrection attempted | `{character, result, serviceType}` |
| `character-updated` | State change | `{character}` |
| `party-rested` | Rest complete | `{party, location, result}` |

---

## Adding New Features

### New Race
```javascript
// In Character.js RACE_DATA
RACE_DATA = {
    NewRace: {
        modifiers: { strength: 1, intelligence: -1, ... },
        restrictions: ['SomeClass'],
        abilities: ['special_ability'],
        baseMaxAge: 150
    }
};
```

### New Class
```javascript
// In Class.js CLASS_DATA
CLASS_DATA = {
    NewClass: {
        hitDie: 8,
        spells: 'limited_arcane',
        requirements: { strength: 14, ... },
        prerequisites: ['Fighter'],
        prerequisiteLevel: 4,
        spellProgression: 'newclass',
        abilities: ['special']
    }
};
```

### New Death State
```javascript
// In DeathSystem.js
DEATH_STATES = ['ok', 'unconscious', 'dead', 'ashes', 'lost', 'newState'];

// Add service
TEMPLE_SERVICES = {
    newRecovery: { cost: 5000, successBase: 20, aging: [12, 36] }
};
```
