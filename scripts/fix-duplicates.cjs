/**
 * Fix duplicate property declarations caused by the automated script
 * finding the same property in both constructor and method bodies.
 */
const fs = require('fs');

const fixes = [
    { file: 'src/core/Engine.ts', prop: 'gameLoop' },
    { file: 'src/game/CombatTest.ts', prop: 'testResults' },
    { file: 'src/game/Monster.ts', prop: 'encounterTables' },
    { file: 'src/game/RestSystem.ts', prop: 'eventSystem' },
    { file: 'src/game/RestSystem.ts', prop: 'restConfigurations' },
    { file: 'src/game/SpellMemorization.ts', prop: 'spellSystem' },
    { file: 'src/game/SpellMemorization.ts', prop: 'spellSystemInitialized' },
];

// Group by file
const fileFixMap = new Map();
for (const fix of fixes) {
    if (!fileFixMap.has(fix.file)) fileFixMap.set(fix.file, []);
    fileFixMap.get(fix.file).push(fix.prop);
}

for (const [file, props] of fileFixMap) {
    let content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const prop of props) {
        // Find duplicate: property declaration that matches `    propName: type;`
        // Keep the first one, remove the second
        let firstFound = false;
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.match(new RegExp(`^${prop}\\s*[:;]`))) {
                if (!firstFound) {
                    firstFound = true;
                } else {
                    console.log(`${file}: removing duplicate '${prop}' at line ${i + 1}`);
                    lines[i] = null; // Mark for removal
                }
            }
        }
    }

    const newContent = lines.filter(l => l !== null).join('\n');
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf-8');
    }
}

console.log('Done fixing duplicates!');
