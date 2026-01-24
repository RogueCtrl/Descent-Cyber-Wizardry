# Entity Systems (Monster, Equipment, Spells)

> **Files**: `src/game/Monster.js`, `src/game/Equipment.js`, `src/game/Spells.js`
> **Total Lines**: ~3,500

## Overview

Three interconnected entity systems loaded from IndexedDB migrations with dual-mode terminology support.

---

## Monster System

### Monster Data Structure

```javascript
{
    id: string,
    name: string,
    cyberName: string,  // Cyberpunk mode name
    type: 'humanoid' | 'beast' | 'undead' | 'giant' | 'monstrosity' | 'dragon',
    level: 1-8,
    hitDie: 4|6|8|10|12,
    maxHP: number,
    currentHP: number,

    // Attributes
    attributes: {
        strength, intelligence, agility, vitality
    },

    // Combat stats
    armorClass: number,
    attackBonus: number,
    damageBonus: number,
    attacks: [{
        name: string,
        damage: { dice, sides, bonus },
        range: 'melee' | 'ranged' | 'area',
        special: ['disease', 'knockdown', 'fire'],
        magical: boolean
    }],

    // AI
    aiType: 'aggressive' | 'cowardly' | 'tactical' | 'pack' | 'intelligent',
    preferredTargets: string[],

    // Rewards
    experienceValue: number,
    treasureType: 'none' | 'poor' | 'standard' | 'rich' | 'hoard',

    // Visual
    portraitModel: { vertices, edges, scale, rotation },
    asciiArt: string
}
```

### Monster AI Types

```javascript
// 'cowardly' - Targets weakest
target = sortByHP(targets)[0];

// 'aggressive' - Front row or random
target = frontRow.length ? random(frontRow) : random(all);

// 'tactical' - Targets spellcasters
target = find(['Mage', 'Priest', 'Bishop']);

// 'intelligent' - Scoring system
score = injuryBonus + casterBonus + easyTargetBonus + hitChance;
```

### Monster Level Guidelines

| Level | Examples | Hit Die | XP |
|-------|----------|---------|-----|
| 1 | Kobold, Giant Rat | 4-6 | 10-50 |
| 2-3 | Orc, Wolf | 6-8 | 50-200 |
| 4-5 | Ogre, Owlbear | 10 | 450-700 |
| 6+ | Dragon, Orc Chief | 12 | 1100+ |

### Adding New Monster

```javascript
// In migrations/monsters-v1.X.X.js
"monster_hydra_001": {
    id: "monster_hydra_001",
    name: "Hydra",
    cyberName: "Multi-Process Daemon",
    type: "dragon-like",
    level: 8,
    hitDie: 12,
    maxHP: 72,
    armorClass: 12,
    attacks: [
        { name: "Bite", damage: { dice: 3, sides: 6 }, range: "melee" }
    ],
    aiType: "intelligent",
    experienceValue: 500,
    portraitModel: { vertices: [...], edges: [...] }
}
```

---

## Equipment System

### Equipment Structure

```javascript
{
    id: string,
    name: string,
    cyberName: string,
    type: 'weapon' | 'armor' | 'shield' | 'accessory',
    subtype: string,

    // Combat stats
    damage: { dice, sides, bonus },  // Weapons
    attackBonus: number,
    acBonus: number,                 // Armor/shields
    damageBonus: number,

    // Properties
    weight: number,
    value: number,
    quality: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    magical: boolean,

    // Restrictions
    allowedClasses: string[],
    special: ['throwable', 'reach', 'two-handed'],

    // Curse system
    cursed: boolean,
    curseName: string,
    curseEffect: string,
    disguisedAs: string,
    unidentified: boolean
}
```

### Equipment Subtypes

**Weapons**:
| Subtype | Damage | Special |
|---------|--------|---------|
| dagger | 1d4 | Throwable |
| sword | 1d6-1d8 | — |
| mace | 1d6 | +1 attack |
| staff | 1d6 | Spell bonus |
| spear | 1d6 | Reach, Throwable |
| bow | 1d6 | Ranged |

**Armor**:
| Subtype | AC Bonus | Weight |
|---------|----------|--------|
| light | +2-3 | 15-20 |
| medium | +5 | 40 |
| heavy | +8 | 50 |

### Cursed Items

```javascript
{
    cursed: true,
    curseName: 'Binding Curse',
    curseEffect: 'Cannot be removed',
    disguisedAs: 'Magic Sword +1',  // Shows as this until identified
    magical: true
}
```

### Identification

```javascript
// Success chance
chance = 50  // Base
    + (intelligence - 10) * 3
    + classBonus  // Bishop: 20, Mage: 15, Thief: 10
    + level * 2
    - difficultyPenalty
    + (hasIdentifySpell ? 25 : 0)

// Clamp to 5-95%
```

### Adding New Equipment

```javascript
// In migrations/weapons-v1.X.X.js
"weapon_plasma_blade": {
    id: "weapon_plasma_blade",
    name: "Plasma Blade",
    cyberName: "Energy Cutter",
    type: "weapon",
    subtype: "sword",
    damage: { dice: 1, sides: 10, bonus: 2 },
    weight: 3,
    value: 500,
    magical: true,
    allowedClasses: ["Fighter", "Samurai"]
}
```

---

## Spell System

### Spell Structure

```javascript
{
    id: string,
    name: string,
    cyberName: string,
    school: 'arcane' | 'divine',
    level: 1-7,
    description: string,

    // Effect
    effect: 'damage' | 'heal' | 'buff' | 'protection' | 'control' | 'utility' | 'resurrection',
    dice: { count, sides, bonus },
    areaEffect: boolean,

    // Targeting
    range: 'touch' | 'medium' | 'long' | 'self',
    duration: 'instantaneous' | 'combat' | 'long' | 'permanent',

    // Special
    special: 'death' | 'full_heal' | 'perfect',
    acBonus: number,
    magicResistance: boolean
}
```

### Spell Effects

| Effect | Description |
|--------|-------------|
| `damage` | Direct HP reduction |
| `heal` | Restore HP (full_heal = max) |
| `buff` | Increase stats temporarily |
| `protection` | Increase AC |
| `control` | Incapacitate (Hold, Web) |
| `utility` | Non-combat (Light, Teleport) |
| `resurrection` | Restore dead characters |

### Spell Schools

**Arcane (Mage)**:
- Damage: Magic Missile, Fireball, Lightning Bolt
- Control: Web, Hold Person, Confusion
- Utility: Light, Invisibility, Teleport

**Divine (Priest)**:
- Healing: Cure Light Wounds, Heal, Cure Disease
- Protection: Bless, Protection from Evil
- Resurrection: Raise Dead, Resurrection

### Casting Success

```javascript
successChance = 85  // Base
    + (casterLevel - spellLevel) * 5
    + (attributeBonus)  // INT for arcane, PIE for divine

// Clamp to 5-95%
// Spell consumed regardless of success
```

### Adding New Spell

```javascript
// In migrations/spells-v1.X.X.js
"spell_chain_lightning": {
    id: "spell_chain_lightning",
    name: "Chain Lightning",
    cyberName: "Cascade Protocol",
    school: "arcane",
    level: 6,
    effect: "damage",
    dice: { count: 6, sides: 6, bonus: 0 },
    areaEffect: true,
    range: "long",
    duration: "instantaneous",
    description: "Lightning arcs between multiple targets"
}
```

---

## Class Spell Access

| Class | Arcane | Divine | Notes |
|-------|--------|--------|-------|
| Fighter | — | — | No spells |
| Mage | Full | — | Best arcane |
| Priest | — | Full | Best divine |
| Thief | — | — | No spells |
| Bishop | Reduced | Reduced | Both schools |
| Samurai | Limited | — | Starts level 4 |
| Lord | — | Limited | Starts level 4 |
| Ninja | Limited | — | Starts level 4 |

---

## Dual Terminology

All entities support both fantasy and cyber names:

```javascript
// Get appropriate name
const name = TextManager.isCyberMode()
    ? entity.cyberName
    : entity.name;

// Or use TerminologyUtils
const name = TerminologyUtils.getContextualName(entity);

// Get both
const names = TerminologyUtils.getDualNames(entity);
// { classic: "Ogre", cyber: "Guardian Program" }
```

---

## Entity Loading

```javascript
// On startup
await Storage.loadEntitiesFromJSON();

// Get entities
const monster = await Storage.getMonster('monster_ogre_001');
const weapon = await Storage.getWeapon('weapon_longsword');
const spell = await Storage.getSpell('spell_fireball');

// Query
const magicWeapons = await Storage.queryEntities('weapons', { magical: true });
const healSpells = await Storage.queryEntities('spells', { effect: 'heal' });
```
