const fs = require('fs');
const files = [
    'src/core/Engine.ts',
    'src/game/Character.ts',
    'src/game/Dungeon.ts',
    'src/game/Equipment.ts',
    'src/game/Monster.ts',
    'src/game/Party.ts',
    'src/game/Spells.ts',
    'src/rendering/UI.ts'
];

for (const f of files) {
    let content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');

    // Find trailing import lines (after last closing brace)
    const trailingImports = [];
    while (lines.length > 0) {
        const last = lines[lines.length - 1].trim();
        if (last === '') { lines.pop(); continue; }
        if (last.startsWith('import ')) {
            trailingImports.unshift(lines.pop());
        } else {
            break;
        }
    }

    if (trailingImports.length > 0) {
        console.log(f + ': moving ' + trailingImports.length + ' trailing imports to top');

        // Check which imports already exist at top
        const existingTop = new Set();
        for (const l of lines) {
            if (l.trim().startsWith('import ')) existingTop.add(l.trim());
        }

        // Only add imports that don't already exist at top
        const newImports = trailingImports.filter(i => !existingTop.has(i.trim()));

        // Reconstruct: new imports + original content (without trailing imports)
        const newContent = [...newImports, ...lines].join('\n');
        fs.writeFileSync(f, newContent + '\n', 'utf-8');
    } else {
        console.log(f + ': no trailing imports found');
    }
}
console.log('Done!');
