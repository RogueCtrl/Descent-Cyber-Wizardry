/**
 * Automated import resolution script.
 *
 * Scans all .ts files for TS2304 "Cannot find name" errors and adds
 * the appropriate import statements based on a known module map.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = '/Users/roguectrl/Fun/Descent-Cyber-Wizardry';
const SRC = path.join(ROOT, 'src');

// Map of global names → their module paths (relative from src/)
const MODULE_MAP = {
    // Core
    'EventSystem': 'core/EventSystem.ts',
    'GameState': 'core/GameState.ts',
    'Engine': 'core/Engine.ts',

    // Utils
    'Random': 'utils/Random.ts',
    'Helpers': 'utils/Helpers.ts',
    'Storage': 'utils/Storage.ts',
    'TextManager': 'utils/TextManager.ts',
    'Modal': 'utils/Modal.ts',
    'PartySetupModal': 'utils/PartySetupModal.ts',
    'AttributeRoller': 'utils/AttributeRoller.ts',

    // Rendering
    'Viewport3D': 'rendering/Viewport3D.ts',
    'MiniMapRenderer': 'rendering/MiniMapRenderer.ts',
    'MonsterPortraitRenderer': 'rendering/MonsterPortraitRenderer.ts',
    'Renderer': 'rendering/Renderer.ts',
    'CharacterUI': 'rendering/CharacterUI.ts',
    'UI': 'rendering/UI.ts',

    // Audio
    'AudioManager': 'audio/AudioManager.ts',

    // Game
    'Character': 'game/Character.ts',
    'CharacterCreator': 'game/CharacterCreator.ts',
    'CharacterRoster': 'game/CharacterRoster.ts',
    'Race': 'game/Race.ts',
    'Class': 'game/CharacterClass.ts',
    'CharacterClass': 'game/CharacterClass.ts',
    'Party': 'game/Party.ts',
    'Combat': 'game/Combat.ts',
    'CombatInterface': 'game/CombatInterface.ts',
    'Dungeon': 'game/Dungeon.ts',
    'Equipment': 'game/Equipment.ts',
    'Spells': 'game/Spells.ts',
    'SpellMemorization': 'game/SpellMemorization.ts',
    'Monster': 'game/Monster.ts',
    'EncounterGenerator': 'game/Monster.ts',
    'Formation': 'game/Formation.ts',
    'InventorySystem': 'game/InventorySystem.ts',
    'TeamAssignmentService': 'game/TeamAssignmentService.ts',
    'DeathSystem': 'game/DeathSystem.ts',
    'RestSystem': 'game/RestSystem.ts',
    'AdvancedCharacterSheet': 'game/AdvancedCharacterSheet.ts',

    // Data
    'TERMINOLOGY': 'data/terminology.ts',
    'TerminologyUtils': 'data/terminology.ts',
};

// Parse tsc output to find which files need which names
function getTscErrors() {
    try {
        const output = execSync('npx tsc --noEmit 2>&1', {
            cwd: ROOT,
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
        });
        return output;
    } catch (e) {
        return e.stdout || '';
    }
}

function parseErrors(output) {
    // Map of file → Set of missing names
    const fileNeeds = new Map();

    const regex = /^(.+?)\(\d+,\d+\): error TS2304: Cannot find name '(\w+)'/gm;
    let match;
    while ((match = regex.exec(output)) !== null) {
        const file = match[1];
        const name = match[2];

        if (!MODULE_MAP[name]) continue; // Skip unknowns

        if (!fileNeeds.has(file)) fileNeeds.set(file, new Set());
        fileNeeds.get(file).add(name);
    }

    return fileNeeds;
}

function getRelativeImportPath(fromFile, toModulePath) {
    const fromDir = path.dirname(fromFile);
    const toFile = path.join(SRC, toModulePath);
    let rel = path.relative(fromDir, toFile);
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

function addImports(filePath, names) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Group names by their module
    const moduleImports = new Map(); // modulePath → [names]
    for (const name of names) {
        const modulePath = MODULE_MAP[name];
        if (!modulePath) continue;

        // Don't import a module into itself
        const absModule = path.join(SRC, modulePath);
        if (path.resolve(filePath) === path.resolve(absModule)) continue;

        const importPath = getRelativeImportPath(filePath, modulePath);
        if (!moduleImports.has(importPath)) moduleImports.set(importPath, []);
        moduleImports.get(importPath).push(name);
    }

    if (moduleImports.size === 0) return false;

    // Check which imports already exist
    const existingImports = new Set();
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRegex.exec(content)) !== null) {
        // Extract imported names
        const importLine = m[0];
        const nameMatches = importLine.match(/\{\s*([^}]+)\}/);
        if (nameMatches) {
            for (const n of nameMatches[1].split(',')) {
                existingImports.add(n.trim().split(/\s+as\s+/)[0]);
            }
        }
        // Default import
        const defaultMatch = importLine.match(/import\s+(\w+)\s+from/);
        if (defaultMatch) {
            existingImports.add(defaultMatch[1]);
        }
    }

    // Build new import lines
    const newImports = [];
    for (const [importPath, importNames] of moduleImports) {
        const newNames = importNames.filter(n => !existingImports.has(n));
        if (newNames.length === 0) continue;

        // Check if there's already an import from this path that we can extend
        const pathEscaped = importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingForPath = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${pathEscaped}['"]`);
        const existingMatch = content.match(existingForPath);

        if (existingMatch) {
            // Extend existing import
            const currentNames = existingMatch[1].split(',').map(n => n.trim());
            const allNames = [...new Set([...currentNames, ...newNames])].sort();
            const newImportLine = `import { ${allNames.join(', ')} } from '${importPath}'`;
            content = content.replace(existingMatch[0], newImportLine);
        } else {
            newImports.push(`import { ${newNames.sort().join(', ')} } from '${importPath}';`);
        }
    }

    if (newImports.length === 0 && content === fs.readFileSync(filePath, 'utf-8')) return false;

    // Insert new imports at the top of the file (after any existing imports)
    if (newImports.length > 0) {
        // Find last import statement
        const lines = content.split('\n');
        let lastImportLine = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^import\s/)) lastImportLine = i;
        }

        if (lastImportLine >= 0) {
            // Insert after last import
            lines.splice(lastImportLine + 1, 0, ...newImports);
        } else {
            // No existing imports, add at top
            lines.unshift(...newImports, '');
        }
        content = lines.join('\n');
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
}

// ── Main ─────────────────────────────────────────────────────

console.log('Running tsc --noEmit to find TS2304 errors...\n');
const tscOutput = getTscErrors();
const fileNeeds = parseErrors(tscOutput);

console.log(`Found ${fileNeeds.size} files needing imports\n`);

let totalImports = 0;
let filesModified = 0;

for (const [file, names] of fileNeeds) {
    const rel = path.relative(ROOT, file);
    console.log(`${rel}: needs ${[...names].join(', ')}`);

    if (addImports(file, names)) {
        filesModified++;
        totalImports += names.size;
    }
}

console.log(`\n✅ Done! Added imports for ${totalImports} names across ${filesModified} files.`);
