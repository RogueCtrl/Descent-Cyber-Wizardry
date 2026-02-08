# Contributing to Descent: Cyber Wizardry

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/RogueCtrl/Descent-Cyber-Wizardry.git
cd Descent-Cyber-Wizardry

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

Follow the project conventions:

- **TypeScript strict mode**: All code must pass `tsc --noEmit` with zero errors
- **Dual-mode text**: All user-facing strings need both fantasy and cyberpunk versions
- **Event-driven**: Systems communicate via `EventSystem`, not direct calls
- **No runtime deps**: Only browser APIs (Canvas, IndexedDB, Web Audio)

### 3. Test Your Changes

Run all validation checks before pushing:

```bash
# TypeScript compilation
npm run build

# Linting
npm run lint

# Formatting
npm run format:check

# Tests
npm test

# Or run all at once
npm run build && npm run lint && npm run format:check && npm test
```

### 4. Commit Your Work

Use conventional commit format for individual commits (optional but recommended):

```bash
git add .
git commit -m "feat: add new monster AI behavior"
```

### 5. Push and Create a Pull Request

```bash
git push origin feat/your-feature-name
```

Then open a PR on GitHub with a **conventional commit prefix** in the title.

---

## Pull Request Guidelines

### PR Title Format (REQUIRED)

Your PR title **MUST** use conventional commit format. This determines the version bump:

#### Major Version (Breaking Changes)
Use when making incompatible API changes or major refactors:

```
major: redesign combat system
major(dungeon): complete maze generation overhaul
```

Or include `BREAKING CHANGE` in the PR body.

#### Minor Version (Features & Refactors)
Use for new features or significant refactoring:

```
feat: add spell memorization system
feat(audio): new combat victory track
refactor: improve party management system
refactor(rendering): optimize 3D viewport performance
```

#### Patch Version (Fixes & Docs)
Use for bug fixes, documentation, chores:

```
fix: resolve IndexedDB migration error
fix(combat): correct initiative calculation
docs: update system architecture diagrams
docs(README): add installation instructions
chore: update dependencies
chore(build): configure prettier
```

### PR Description

Use the provided template to describe:
- **What** the PR does
- **Why** it's needed
- **How** to test it
- Checklist of validations

### Example PR

**Title:**
```
feat: add multi-party dungeon sharing
```

**Body:**
```markdown
## What does this PR do?

Enables multiple parties to explore the same dungeon instance with shared
structure but independent positions.

## Why?

Allows players to create multiple parties that can explore the same dungeon,
enabling future rescue missions and party interactions.

## How to test

1. npm run dev
2. Create Party A and explore dungeon
3. Return to town, create Party B
4. Enter dungeon with Party B
5. Verify both parties see the same dungeon layout
6. Verify positions are tracked independently

## Checklist

- [x] npm run build passes
- [x] npm run lint passes
- [x] npm run format:check passes
- [x] npm test passes
- [x] Tested manually in browser
- [x] Updated docs in docs/systems/dungeon-system.md
- [x] PR title follows conventional commits
```

---

## Automated Release Process

### How It Works

1. **Merge PR to main** → Release workflow triggers
2. **Determine version bump** → Based on PR title prefix
3. **Generate changelog** → From commit messages since last tag
4. **Create release branch** → `release/vX.Y.Z`
5. **Open release PR** → With version bump and changelog
6. **Auto-merge** → Release PR merges automatically (if enabled)

### What Gets Updated

When a release is created:
- `package.json` version field
- `CHANGELOG.md` with new entries
- Git tag `vX.Y.Z`

### Changelog Sections

Commits are grouped by type:

- **Features** (`feat:`)
- **Bug Fixes** (`fix:`)
- **Refactoring** (`refactor:`)
- **Performance** (`perf:`)
- **Documentation** (`docs:`)
- **Tests** (`test:`)

Hidden from changelog:
- `chore:`, `style:`, `ci:`, `build:`

### Manual Release (Maintainers Only)

If you need to manually create a release:

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major
```

---

## Code Style

### TypeScript

- **Strict mode enabled** — `strictNullChecks`, `strictPropertyInitialization`, etc.
- **Implicit any allowed** — `noImplicitAny: false` (legacy from conversion)
- **ES modules only** — All files use `import`/`export`
- **Type definitions** — Use `src/types/index.ts` for shared types

### Formatting

The project uses **Prettier** with these settings:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

Auto-format your code:

```bash
npm run format
```

### Linting

The project uses **ESLint** with TypeScript support:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

---

## Dual-Mode Terminology

All user-facing text must support both fantasy and cyberpunk modes.

### Adding New Terms

1. **Add to terminology.ts:**

```typescript
// src/data/terminology.ts
export const terminology = {
  classic: {
    new_term: "Fantasy Text",
    // ...
  },
  cyber: {
    new_term: "Cyber Text",
    // ...
  }
};
```

2. **Use in HTML:**

```html
<span data-text-key="new_term">Fantasy Text</span>
```

3. **Or use TextManager programmatically:**

```typescript
import { TextManager } from '../utils/TextManager.ts';

const text = TextManager.getText('new_term');
```

### Mode-Aware Properties

Entity data (monsters, equipment, spells) have both properties:

```typescript
{
  name: "Dagger",           // Fantasy mode
  cyberName: "Blade Subroutine", // Cyber mode
  // ...
}
```

---

## Adding Game Content

### New Monster

1. Create migration file: `src/data/migrations/monsters-vX.Y.Z.ts`
2. Add monster data with `portraitModel` (3D wireframe)
3. Import in `src/main.ts`
4. Test in both fantasy and cyber modes

### New Spell

1. Add to `src/data/migrations/spells-vX.Y.Z.ts`
2. Include both `name` and `cyberName`
3. Define `effects` array with typed effects
4. Import in `src/main.ts`

### New Equipment

1. Add to appropriate migration file (weapons, armor, shields, accessories)
2. Include dual-mode names
3. Define stat modifiers and special properties
4. Import in `src/main.ts`

---

## Testing

### Browser Testing Required

This project uses browser-only APIs, so tests run in a browser-like environment (`happy-dom`).

### Writing Tests

Create tests in `src/__tests__/`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    // Test implementation
    expect(actual).toBe(expected);
  });
});
```

### Running Tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

---

## Common Tasks

### Adding a New Game State

1. Define transitions in `GameState.ts`
2. Handle in `Engine.ts` game loop
3. Add to `GameStateName` type in `src/types/index.ts`
4. Create UI in `UI.ts`

### Adding Sound Effects

```typescript
// src/audio/AudioManager.ts
this.soundEffects = {
  newSound: {
    freq: 440,
    duration: 0.3,
    wave: 'sine',
    volume: 0.4,
  }
};
```

### Modifying Storage Schema

1. Increment `DB_VERSION` in `Storage.ts`
2. Add migration in `onupgradeneeded`
3. Test with existing save data

---

## Repository Settings (Maintainers)

For the automated release system to work, configure:

### 1. Actions Permissions

```
Settings → Actions → General → Workflow permissions
→ Read and write permissions
→ ✅ Allow GitHub Actions to create and approve pull requests
```

### 2. Auto-merge

```
Settings → General → Pull Requests
→ ✅ Allow auto-merge
```

### 3. Branch Protection

```
Settings → Branches → Add branch protection rule
Branch name pattern: main

✅ Require a pull request before merging
✅ Require status checks to pass before merging
   - Status checks: build
   - ✅ Require branches to be up to date
✅ Require linear history (recommended)
```

---

## Questions?

- **Documentation**: See [`docs/systems/`](systems/) for detailed system docs
- **Issues**: Open a [GitHub issue](https://github.com/RogueCtrl/Descent-Cyber-Wizardry/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/RogueCtrl/Descent-Cyber-Wizardry/discussions)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
