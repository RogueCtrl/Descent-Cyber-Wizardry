/**
 * Automated class property declaration generator.
 *
 * Scans all .ts files, finds class constructors, extracts `this.x = value`
 * assignments, infers types from the RHS, and inserts property declarations
 * at the top of each class body.
 *
 * This resolves ~3500 TS2339 "Property does not exist on type" errors.
 */
import fs from 'fs';
import path from 'path';

const SRC = '/Users/roguectrl/Fun/Descent-Cyber-Wizardry/src';

// ─── Helpers ─────────────────────────────────────────────────

function findTsFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...findTsFiles(full));
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) results.push(full);
    }
    return results;
}

/**
 * Infer a TS type string from a JS value expression.
 */
function inferType(value) {
    const v = value.trim();

    // null / undefined
    if (v === 'null') return 'any';
    if (v === 'undefined') return 'any';

    // boolean
    if (v === 'true' || v === 'false') return 'boolean';

    // number
    if (/^-?\d+(\.\d+)?$/.test(v)) return 'number';

    // string
    if (/^['"`]/.test(v)) return 'string';

    // array
    if (v === '[]') return 'any[]';
    if (v.startsWith('[')) return 'any[]';

    // object literal
    if (v === '{}') return 'Record<string, any>';
    if (v.startsWith('{')) return 'Record<string, any>';

    // new Map / Set
    if (v.startsWith('new Map')) return 'Map<any, any>';
    if (v.startsWith('new Set')) return 'Set<any>';

    // new ClassName(...)
    const newMatch = v.match(/^new (\w+)/);
    if (newMatch) return newMatch[1];

    // Constructor parameter or other variable
    if (/^[a-zA-Z_$][\w$]*$/.test(v)) return 'any';

    // Expressions like `param || default`, ternary, etc.
    if (v.includes('||') || v.includes('??')) {
        // Try to infer from the fallback
        const parts = v.split(/\|\||\?\?/);
        if (parts.length >= 2) return inferType(parts[parts.length - 1]);
    }

    // Date.now(), Math.*, etc
    if (v.startsWith('Date.now')) return 'number';
    if (v.startsWith('Math.')) return 'number';

    // document.getElementById etc
    if (v.startsWith('document.')) return 'any';

    // Default
    return 'any';
}

/**
 * Extract all `this.x = value` from a constructor body, handling nested braces.
 */
function extractConstructorProps(content, classStartIndex) {
    // Find constructor within this class
    const afterClass = content.substring(classStartIndex);

    // Find `constructor(` - be careful to find the right one
    const ctorMatch = afterClass.match(/\bconstructor\s*\(/);
    if (!ctorMatch) return null;

    const ctorStart = classStartIndex + ctorMatch.index;

    // Find the opening brace of the constructor
    let braceStart = content.indexOf('{', ctorStart + ctorMatch[0].length);
    if (braceStart === -1) return null;

    // Walk braces to find the end of the constructor body
    let depth = 1;
    let i = braceStart + 1;
    while (i < content.length && depth > 0) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') depth--;
        i++;
    }
    const ctorEnd = i;
    const ctorBody = content.substring(braceStart + 1, ctorEnd - 1);

    // Extract this.x = value patterns
    const props = new Map();
    // Match this.xxx = ... up to ; or end of line
    const regex = /this\.(\w+)\s*=\s*([^;]+)/g;
    let match;
    while ((match = regex.exec(ctorBody)) !== null) {
        const propName = match[1];
        const value = match[2].trim();

        // Skip if it's inside a nested function/method/if block at a deeper scope
        // Simple heuristic: check brace depth at match position
        const beforeMatch = ctorBody.substring(0, match.index);
        let d = 0;
        for (const ch of beforeMatch) {
            if (ch === '{') d++;
            else if (ch === '}') d--;
        }
        // Only include top-level constructor assignments (depth 0)
        // and first-level if/try blocks (depth 1)
        if (d > 1) continue;

        if (!props.has(propName)) {
            props.set(propName, inferType(value));
        }
    }

    return { props, ctorEnd: braceStart }; // ctorEnd = position of constructor's opening brace
}

/**
 * Find all class bodies in a file and extract properties that need declarations.
 */
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Find all class declarations: export class X { or class X extends Y {
    const classRegex = /^(export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/gm;
    let classMatch;
    const edits = []; // { insertAt, declarations }

    while ((classMatch = classRegex.exec(content)) !== null) {
        const className = classMatch[2];
        const classOpenBrace = content.indexOf('{', classMatch.index + classMatch[0].length - 1);

        // Check if this class already has property declarations
        // Look at the first few lines after the opening brace
        const afterBrace = content.substring(classOpenBrace + 1, classOpenBrace + 500);
        // If we see lines like `propertyName: type;` or `propertyName;` before constructor, skip
        const hasDeclarations = /^\s*\w+\s*[:;]/m.test(afterBrace.split('constructor')[0]);

        if (hasDeclarations) {
            // Check if there are already many declarations (more than 3 lines of prop: type)
            const declCount = (afterBrace.split('constructor')[0].match(/^\s+\w+\s*[;:]/gm) || []).length;
            if (declCount >= 3) {
                console.log(`  [skip] ${className}: already has ${declCount} property declarations`);
                continue;
            }
        }

        // Extract properties from constructor
        const result = extractConstructorProps(content, classMatch.index);
        if (!result || result.props.size === 0) {
            continue;
        }

        const { props } = result;

        // Also scan entire class body for this.x assignments outside constructor
        // (in methods) to catch properties initialized in methods
        const classEnd = findClassEnd(content, classOpenBrace);
        const classBody = content.substring(classOpenBrace + 1, classEnd);

        const methodRegex = /this\.(\w+)\s*=/g;
        let methodMatch;
        while ((methodMatch = methodRegex.exec(classBody)) !== null) {
            const propName = methodMatch[1];
            if (!props.has(propName)) {
                props.set(propName, 'any');
            }
        }

        // Generate declarations
        const declarations = [];
        for (const [name, type] of props) {
            // Skip private-ish patterns like _instance
            declarations.push(`    ${name}: ${type};`);
        }

        if (declarations.length > 0) {
            edits.push({
                insertAt: classOpenBrace + 1,
                text: '\n' + declarations.join('\n') + '\n',
                className,
                count: declarations.length
            });
        }
    }

    if (edits.length === 0) return 0;

    // Apply edits in reverse order to preserve positions
    edits.sort((a, b) => b.insertAt - a.insertAt);
    for (const edit of edits) {
        content = content.substring(0, edit.insertAt) + edit.text + content.substring(edit.insertAt);
        console.log(`  [${edit.className}] Added ${edit.count} property declarations`);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return edits.reduce((sum, e) => sum + e.count, 0);
    }
    return 0;
}

function findClassEnd(content, openBrace) {
    let depth = 1;
    let i = openBrace + 1;
    while (i < content.length && depth > 0) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') depth--;
        i++;
    }
    return i - 1;
}

// ─── Main ────────────────────────────────────────────────────

const files = findTsFiles(SRC);
let totalProps = 0;
let filesModified = 0;

console.log(`Scanning ${files.length} .ts files for class constructors...\n`);

for (const file of files) {
    const rel = path.relative(SRC, file);
    const content = fs.readFileSync(file, 'utf-8');

    // Skip files without classes
    if (!content.includes('class ')) continue;

    console.log(`Processing: ${rel}`);
    const count = processFile(file);
    if (count > 0) {
        totalProps += count;
        filesModified++;
    }
}

console.log(`\n✅ Done! Added ${totalProps} property declarations across ${filesModified} files.`);
console.log(`Run 'npx tsc --noEmit 2>&1 | grep -c "error TS"' to check remaining errors.`);
