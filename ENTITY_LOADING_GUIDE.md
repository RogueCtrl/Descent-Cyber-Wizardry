# Entity Loading System Guide

## Overview
The entity loading system now includes automatic version checking and JSON file update detection. This ensures that when JSON files are modified, the game will automatically reload them into IndexedDB.

## How It Works

### 1. Version Tracking
- Each time entities are loaded, a version record is stored in IndexedDB
- The current version is defined in `Storage.ENTITY_VERSION = '1.0.0'`
- When you modify JSON files, increment this version to trigger automatic reloading

### 2. Automatic Update Detection
```javascript
// On game start, the system checks:
const needsUpdate = await Storage.needsEntityUpdate();
if (needsUpdate) {
    await Storage.loadEntitiesFromJSON(); // Reloads from JSON
}
```

### 3. Smart Loading
- First run: Loads entities from JSON files into IndexedDB
- Subsequent runs: Checks version, only reloads if version changed
- No performance impact when no changes are made

## For Developers

### When You Modify JSON Files:
1. Edit your JSON files in `src/data/`
2. Increment the version in `Storage.js`:
   ```javascript
   static ENTITY_VERSION = '1.0.1'; // Increment this number
   ```
3. Reload the game - entities will automatically update!

### Development Methods:
```javascript
// Force reload all entities (ignores version checking)
await Storage.forceReloadEntities();

// Clear all entity data
await Storage.clearAllEntities();

// Get version information
const versionInfo = await Storage.getEntityVersionInfo();
console.log(versionInfo);
// Output: {
//   currentVersion: '1.0.0',
//   storedVersion: '1.0.0',
//   needsUpdate: false,
//   lastUpdated: 1720483200000,
//   files: { weapons: '/src/data/weapons.json', ... }
// }

// Force reload equipment entities
await Equipment.forceReloadEntities();

// Force reload spell entities
await Spells.forceReloadEntities();
```

## User Experience

### For Players:
- **Seamless updates**: No manual cache clearing needed
- **Automatic content updates**: New items/spells appear automatically
- **Performance**: No loading delay when no changes are made
- **Reliable**: Always gets the latest content

### For Developers:
- **Version control**: Easy to track which content version is loaded
- **Development workflow**: Change JSON → increment version → reload
- **Debugging**: Clear methods to force reload when needed
- **Monitoring**: Version info to troubleshoot loading issues

## File Structure
```
src/data/
├── weapons.json         # Tracked for updates
├── armor.json          # Tracked for updates
├── shields.json        # Tracked for updates
├── accessories.json    # Tracked for updates
├── spells/
│   ├── arcane.json     # Tracked for updates
│   └── divine.json     # Tracked for updates
├── conditions.json     # Tracked for updates
└── effects.json        # Tracked for updates
```

## Version History
- **v1.0.0**: Initial entity system with basic loading
- **v1.0.1**: Added version tracking and automatic update detection
- **v1.0.2**: (Future) Enhanced with file timestamp checking

## Technical Details

### IndexedDB Schema
```javascript
// New store added:
entity_versions: {
    keyPath: 'id',
    indexes: ['version', 'lastUpdated']
}

// Version record structure:
{
    id: 'entity_version',
    version: '1.0.0',
    lastUpdated: 1720483200000,
    files: { /* tracked files */ }
}
```

### Loading Flow
1. Game starts → Check `needsEntityUpdate()`
2. If needed → `loadEntitiesFromJSON()` → `updateEntityVersion()`
3. If not needed → Skip loading (performance optimization)

This system ensures that content creators can easily update game data while maintaining optimal performance for players.