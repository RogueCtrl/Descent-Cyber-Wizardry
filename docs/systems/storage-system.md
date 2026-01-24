# Storage System

> **Files**: `src/utils/Storage.js`, `src/data/migrations/*.js`
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

## CRUD Operations

### Characters

```javascript
// Save
await Storage.saveCharacter(character);

// Load
const character = await Storage.loadCharacter(characterId);
const allCharacters = await Storage.loadAllCharacters();

// Query
const fighters = await Storage.queryCharacters({class: 'Fighter'});

// Delete
await Storage.deleteCharacter(characterId);

// Statistics
const stats = await Storage.getCharacterStatistics();
```

### Parties

```javascript
// Save/Load
await Storage.saveParty(party);
const party = await Storage.loadParty(partyId);

// Active party
Storage.setActiveParty(partyId);
const activeId = Storage.getActivePartyId();
const activeParty = await Storage.loadActiveParty();

// Query
const campingParties = await Storage.getCampingParties();
const lostParties = await Storage.getLostParties();
```

### Dungeons (Shared World)

```javascript
// Save shared dungeon + party position
await Storage.saveDungeon(dungeon, partyId);
await Storage.savePartyPosition(partyId, dungeonId, positionData);

// Load
const dungeon = await Storage.loadDungeon(dungeonId);
const position = await Storage.loadPartyPosition(partyId);

// Multi-party queries
const partiesInDungeon = await Storage.getPartiesInDungeon(dungeonId);
```

### Camp System

```javascript
// Save camp (localStorage version)
const result = Storage.savepartyInDungeon(party, dungeon, gameState);

// Save camp (IndexedDB version)
const result = await Storage.saveCampWithEntityReferences(party, dungeon, gameState);

// Resume
const campData = Storage.resumePartyFromDungeon(campId);
const campData = await Storage.resumeCampWithEntityReferences(campId);

// Management
const camps = Storage.getSavedCamps();
Storage.deleteCamp(campId);
Storage.cleanupOldCamps(30);  // Delete camps older than 30 days
```

### Entities

```javascript
// Load from migrations (on startup)
await Storage.loadEntitiesFromJSON(forceReload = false);

// Get entities
const weapon = await Storage.getWeapon(weaponId);
const allWeapons = await Storage.getAllWeapons();
const magicSwords = await Storage.queryEntities('weapons', {magical: true});

// Force reload
await Storage.forceReloadEntities();
```

---

## Migration System

### Migration File Structure

```javascript
// src/data/migrations/weapons-v1.1.0.js
window.weaponsMigrationV110 = {
    version: '1.1.0',
    entity: 'weapons',
    store: 'weapons',
    description: 'Enhanced weapons with cyber terminology',

    data: {
        'weapon_dagger': {
            id: 'weapon_dagger',
            name: 'Dagger',
            cyberName: 'Blade Subroutine',
            // ... properties
        }
    },

    validate: (data) => {
        return data.id && data.name;
    },

    transform: (data) => {
        // Optional transformation
        return data;
    }
};
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
```javascript
// src/data/migrations/newentity-v1.0.0.js
window.newentityMigration = {
    version: '1.0.0',
    entity: 'newentity',
    store: 'newentity',
    data: { /* entities */ },
    validate: (data) => true,
    transform: (data) => data
};
```

2. **Load in HTML** before Storage.js:
```html
<script src="src/data/migrations/newentity-v1.0.0.js"></script>
```

3. **Update Storage.js**:
```javascript
static ENTITY_TYPES = [..., 'newentity'];
```

---

## Adding New Object Store

1. **Increment DB_VERSION**:
```javascript
static DB_VERSION = 8;  // Was 7
```

2. **Add store constant**:
```javascript
static NEW_STORE = 'new_store';
```

3. **Create in onupgradeneeded**:
```javascript
if (!db.objectStoreNames.contains(this.NEW_STORE)) {
    const store = db.createObjectStore(this.NEW_STORE, { keyPath: 'id' });
    store.createIndex('name', 'name', { unique: false });
    // Add more indexes as needed
}
```

4. **Add CRUD methods**:
```javascript
static async saveNewEntity(entity) { /* ... */ }
static async loadNewEntity(id) { /* ... */ }
static async getAllNewEntities() { /* ... */ }
```

---

## Transaction Patterns

### Read Transaction
```javascript
const transaction = this._db.transaction([storeName], 'readonly');
const store = transaction.objectStore(storeName);
const request = store.get(id);

return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(null);
});
```

### Write Transaction
```javascript
const transaction = this._db.transaction([storeName], 'readwrite');
const store = transaction.objectStore(storeName);
const request = store.put(data);

return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(false);
});
```

### Bulk Transaction
```javascript
const transaction = this._db.transaction([storeName], 'readwrite');
const store = transaction.objectStore(storeName);

for (const [id, entity] of Object.entries(entities)) {
    store.put({ id, ...entity });
}

return new Promise((resolve, reject) => {
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

```javascript
// Save/Load
Storage.saveSettings(settings);
const settings = Storage.loadSettings();

// Default settings
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

### Dungeon
- Floors Map → Object: `{floorNumber: floorData, ...}`
- Sets → Arrays: discoveredSecrets, disarmedTraps, usedSpecials

### Party
- Member snapshots or member IDs (for IndexedDB)

---

## Breaking Changes

### Version Tracking
- **DB_VERSION**: Schema changes
- **ENTITY_VERSION**: Entity data changes
- **Save Version**: Game save format

### Reset Storage
```javascript
// Via DevTools:
// Application → IndexedDB → DescentCyberWizardry → Delete

// Or programmatically:
Storage.clearAll();
```

---

## Debugging

```javascript
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
