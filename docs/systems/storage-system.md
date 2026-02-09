# Storage System

> **Files**: `src/utils/Storage.ts`, `src/data/migrations/*.ts`
> **Total Lines**: ~4,000

## Overview

Hybrid storage using **localStorage** for simple data and **IndexedDB** for complex persistent game data.

---

## IndexedDB Schema (Version 7)

**Database Name**: `DescentCyberWizardry`

### Object Stores

| Store | Key | Purpose |
|-------|-----|---------|
| `characters` | `id` | Individual character entities |
| `parties` | `id` | Party definitions |
| `camps` | `campId` | Dungeon camp saves |
| `dungeons` | `dungeonId` | Shared dungeon world state |
| `party_positions` | `partyId` | Per-party position in dungeon |
| `weapons` | `id` | Weapon entities |
| `armor` | `id` | Armor entities |
| `shields` | `id` | Shield entities |
| `accessories` | `id` | Ring/amulet/cloak entities |
| `spells` | `id` | Spell entities |
| `conditions` | `id` | Status conditions |
| `effects` | `id` | Temporary effects |
| `monsters` | `id` | Monster templates |
| `entity_versions` | `id` | Entity version tracking |

---

## Storage Class

### Static Properties

```typescript
export class Storage {
  // Storage keys
  static SAVE_KEY = 'descent_cyber_wizardry_save';
  static SETTINGS_KEY = 'descent_cyber_wizardry_settings';
  static CHARACTERS_KEY = 'descent_cyber_wizardry_characters';
  static CAMP_KEY_PREFIX = 'descent_camp_';
  static DUNGEON_STATE_KEY = 'descent_dungeon_states';
  static ACTIVE_PARTY_KEY = 'descent_active_party';

  // IndexedDB configuration
  static DB_NAME = 'DescentCyberWizardry';
  static DB_VERSION = 7; // Incremented for party store

  // Object store names
  static CHARACTER_STORE = 'characters';
  static ROSTER_STORE = 'roster';
  static CAMP_STORE = 'camps';
  static PARTY_STORE = 'parties';
  static WEAPON_STORE = 'weapons';
  static ARMOR_STORE = 'armor';
  static SHIELD_STORE = 'shields';
  static ACCESSORY_STORE = 'accessories';
  static SPELL_STORE = 'spells';
  static CONDITION_STORE = 'conditions';
  static EFFECT_STORE = 'effects';
  static MONSTER_STORE = 'monsters';
  static VERSION_STORE = 'entity_versions';
  static DUNGEON_STORE = 'dungeons';
  static PARTY_POSITION_STORE = 'party_positions';

  // Database instance (static singleton pattern)
  static _db: IDBDatabase | null = null;
  static _dbInitialized = false;

  // Entity version tracking
  static ENTITY_VERSION = '1.1.0'; // Increment when migration files change
  static ENTITY_TYPES = [
    'weapons',
    'armor',
    'shields',
    'accessories',
    'spells',
    'conditions',
    'effects',
    'monsters',
  ];
}
```

### Note on Static Pattern

Storage uses `static _db` (not `this.db`). When accessing the database in Storage methods:

```typescript
// Correct: Use static property
const transaction = Storage._db!.transaction([storeName], 'readonly');

// Incorrect: Don't use this.db
const transaction = this.db.transaction([storeName], 'readonly');
```

---

## CRUD Operations

### Characters

```typescript
// Save
await Storage.saveCharacter(character: CharacterData): Promise<boolean>;

// Load
const character = await Storage.loadCharacter(characterId: string): Promise<CharacterData | null>;
const allCharacters = await Storage.loadAllCharacters(): Promise<CharacterData[]>;

// Query
const fighters = await Storage.queryCharacters({ class: 'Fighter' }): Promise<CharacterData[]>;

// Delete
await Storage.deleteCharacter(characterId: string): Promise<boolean>;

// Statistics
const stats = await Storage.getCharacterStatistics();
```

### Parties

```typescript
// Save/Load
await Storage.saveParty(party: PartyData): Promise<boolean>;
const party = await Storage.loadParty(partyId: string): Promise<PartyData | null>;

// Active party
Storage.setActiveParty(partyId: string): void;
const activeId = Storage.getActivePartyId(): string | null;
const activeParty = await Storage.loadActiveParty(): Promise<PartyData | null>;

// Query
const campingParties = await Storage.getCampingParties(): Promise<PartyData[]>;
const lostParties = await Storage.getLostParties(): Promise<PartyData[]>;
```

### Dungeons (Shared World)

```typescript
// Save shared dungeon + party position
await Storage.saveDungeon(dungeon: any, partyId: string): Promise<boolean>;
await Storage.savePartyPosition(
  partyId: string,
  dungeonId: string,
  positionData: any
): Promise<boolean>;

// Load
const dungeon = await Storage.loadDungeon(dungeonId: string): Promise<any | null>;
const position = await Storage.loadPartyPosition(partyId: string): Promise<any | null>;

// Multi-party queries
const partiesInDungeon = await Storage.getPartiesInDungeon(
  dungeonId: string
): Promise<string[]>;
```

### Camp System

```typescript
// Save camp (localStorage version)
const result = Storage.savepartyInDungeon(
  party: PartyData,
  dungeon: any,
  gameState: any
): { success: boolean; campId?: string; error?: string };

// Save camp (IndexedDB version)
const result = await Storage.saveCampWithEntityReferences(
  party: PartyData,
  dungeon: any,
  gameState: any
): Promise<{ success: boolean; campId?: string; error?: string }>;

// Resume
const campData = Storage.resumePartyFromDungeon(campId: string);
const campData = await Storage.resumeCampWithEntityReferences(campId: string);

// Management
const camps = Storage.getSavedCamps(): any[];
Storage.deleteCamp(campId: string): boolean;
Storage.cleanupOldCamps(maxAgeDays: number): number; // Delete camps older than N days
```

### Entities

```typescript
// Load from migrations (on startup)
await Storage.loadEntitiesFromJSON(forceReload?: boolean): Promise<void>;

// Get entities
const weapon = await Storage.getWeapon(weaponId: string): Promise<any | null>;
const allWeapons = await Storage.getAllWeapons(): Promise<any[]>;
const magicSwords = await Storage.queryEntities(
  'weapons',
  { magical: true }
): Promise<any[]>;

// Force reload
await Storage.forceReloadEntities(): Promise<void>;
```

---

## Migration System

### Migration File Structure

```typescript
// src/data/migrations/weapons-v1.1.0.ts
export const weaponsMigrationV110 = {
    version: '1.1.0',
    entity: 'weapons',
    store: 'weapons',
    description: 'Enhanced weapons with cyber terminology',

    data: {
        'weapon_dagger': {
            id: 'weapon_dagger',
            name: 'Dagger',
            cyberName: 'Blade Subroutine',
            damageBonus: 2,
            // ... properties
        }
    },

    validate: (data: any) => {
        return data.id && data.name;
    },

    transform: (data: any) => {
        // Optional transformation
        return data;
    }
};
```

### Migration Imports

Migrations are imported as ES modules in `Storage.ts`:

```typescript
import { weaponsMigration } from '../data/migrations/weapons-v1.0.0.ts';
import { armorMigration } from '../data/migrations/armor-v1.0.0.ts';
import { shieldsMigration } from '../data/migrations/shields-v1.0.0.ts';
import { accessoriesMigration } from '../data/migrations/accessories-v1.0.0.ts';
import { spellsMigration } from '../data/migrations/spells-v1.0.0.ts';
import { conditionsMigration } from '../data/migrations/conditions-v1.0.0.ts';
import { effectsMigration } from '../data/migrations/effects-v1.0.0.ts';
import { monstersMigration } from '../data/migrations/monsters-v1.0.0.ts';
```

### Entity Types
- `weapons` (v1.0.0, v1.1.0)
- `armor` (v1.0.0, v1.1.0)
- `shields` (v1.0.0)
- `accessories` (v1.0.0)
- `spells` (v1.0.0, v1.1.0)
- `conditions` (v1.0.0)
- `effects` (v1.0.0)
- `monsters` (v1.0.0)

### Adding New Migration

1. **Create migration file**:
```typescript
// src/data/migrations/newentity-v1.0.0.ts
export const newentityMigration = {
    version: '1.0.0',
    entity: 'newentity',
    store: 'newentity',
    data: { /* entities */ },
    validate: (data: any) => true,
    transform: (data: any) => data
};
```

2. **Import in Storage.ts**:
```typescript
import { newentityMigration } from '../data/migrations/newentity-v1.0.0.ts';
```

3. **Update Storage.ts entity list**:
```typescript
static ENTITY_TYPES = [..., 'newentity'];
```

4. **Register in loadEntitiesFromJSON()**:
```typescript
const migrations = [
  // ... existing migrations
  newentityMigration
];
```

---

## Adding New Object Store

1. **Increment DB_VERSION**:
```typescript
static DB_VERSION = 8;  // Was 7
```

2. **Add store constant**:
```typescript
static NEW_STORE = 'new_store';
```

3. **Create in onupgradeneeded**:
```typescript
if (!db.objectStoreNames.contains(this.NEW_STORE)) {
    const store = db.createObjectStore(this.NEW_STORE, { keyPath: 'id' });
    store.createIndex('name', 'name', { unique: false });
    // Add more indexes as needed
}
```

4. **Add CRUD methods**:
```typescript
static async saveNewEntity(entity: any): Promise<boolean> { /* ... */ }
static async loadNewEntity(id: string): Promise<any | null> { /* ... */ }
static async getAllNewEntities(): Promise<any[]> { /* ... */ }
```

---

## Transaction Patterns

### Read Transaction
```typescript
const transaction = Storage._db!.transaction([storeName], 'readonly');
const store = transaction.objectStore(storeName);
const request = store.get(id);

return new Promise<any>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(null);
});
```

### Write Transaction
```typescript
const transaction = Storage._db!.transaction([storeName], 'readwrite');
const store = transaction.objectStore(storeName);
const request = store.put(data);

return new Promise<boolean>((resolve, reject) => {
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(false);
});
```

### Bulk Transaction
```typescript
const transaction = Storage._db!.transaction([storeName], 'readwrite');
const store = transaction.objectStore(storeName);

for (const [id, entity] of Object.entries(entities)) {
    store.put({ id, ...entity });
}

return new Promise<boolean>((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(false);
});
```

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `descent_cyber_wizardry_save` | Main game save |
| `descent_cyber_wizardry_settings` | Game settings |
| `descent_active_party` | Currently active party ID |
| `descent_camp_*` | Individual camp saves (legacy) |

---

## Settings Management

```typescript
// Save/Load
Storage.saveSettings(settings: any): boolean;
const settings = Storage.loadSettings(): any | null;

// Default settings structure
{
    volume: 0.7,
    soundEffects: true,
    music: true,
    autoSave: true,
    autoSaveInterval: 300,
    keyBindings: { /* ... */ },
    graphics: { wireframe: true, showMinimap: true },
    gameplay: { confirmActions: true, autoPickup: true }
}
```

---

## Data Serialization

### Character
- Attributes, equipment spread via `{...object}`
- Memorized spells: `{ arcane: [], divine: [] }`
- Team tracking: isPhasedOut, phaseOutReason, etc.

```typescript
interface CharacterData {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  attributes: Attributes;
  currentHP: number;
  maxHP: number;
  currentSP: number;
  maxSP: number;
  isAlive: boolean;
  status: CharacterStatus;
  age: number;
  alignment: string;
  equipment: Record<string, string | null>;
  inventory: string[];
  memorizedSpells: MemorizedSpells;
  conditions: ConditionInstance[];
  temporaryEffects: TemporaryEffect[];
  classHistory: string[];
  deathState?: DeathState;
  deathCount?: number;
  cyberName?: string;
}
```

### Dungeon
- Floors Map → Object: `{floorNumber: floorData, ...}`
- Sets → Arrays: discoveredSecrets, disarmedTraps, usedSpecials

### Party
- Member snapshots or member IDs (for IndexedDB)

```typescript
interface PartyData {
  id: string;
  name: string;
  members: CharacterData[];
  gold: number;
  food: number;
  torches: number;
  lightRemaining: number;
  formation: FormationData;
}
```

---

## Breaking Changes

### Version Tracking
- **DB_VERSION**: Schema changes (currently 7)
- **ENTITY_VERSION**: Entity data changes (currently 1.1.0)
- **Save Version**: Game save format (1.0.0)

### Reset Storage
```typescript
// Via DevTools:
// Application → IndexedDB → DescentCyberWizardry → Delete

// Or programmatically:
Storage.clearAll();
```

---

## Debugging

```typescript
// Check storage info
Storage.getStorageInfo();

// Check entity versions
await Storage.getEntityVersionInfo();

// Force entity reload
await Storage.forceReloadEntities();

// Export/Import saves
const json = Storage.exportSave();
Storage.importSave(jsonString);
```

---

## Type Safety

All storage interfaces are defined in `src/types/index.ts`:

```typescript
export interface Attributes { /* ... */ }
export interface CharacterData { /* ... */ }
export interface PartyData { /* ... */ }
export interface FormationData { /* ... */ }
export type DeathState = 'alive' | 'dead' | 'ashes' | 'lost';
export type CharacterStatus = 'OK' | 'DEAD' | 'ASHES' | 'POISONED' | /* ... */;
export interface MemorizedSpells {
  arcane: string[];
  divine: string[];
}
```

Import types where needed:

```typescript
import type { CharacterData, PartyData } from '../types/index.ts';
```

---

## Key Principles

1. **Static Methods**: All Storage operations are static class methods
2. **Singleton DB**: `_db` property shared across all operations
3. **Type Safety**: Use TypeScript interfaces from `src/types/index.ts`
4. **Migration System**: Entity data loaded from versioned migration files
5. **Hybrid Storage**: Simple data in localStorage, complex data in IndexedDB
6. **Shared World**: Dungeons shared, party positions separate
7. **Error Handling**: All async operations have try/catch with meaningful errors
