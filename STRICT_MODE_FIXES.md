# TypeScript Strict Mode Fix Guide — Claude Code Swarm Prompt

## Context

This is a vanilla JS browser game (Wizardry homage) recently converted to TypeScript. We just enabled `strict: true` in `tsconfig.json` (with `noImplicitAny: false` still set). There are **440 errors** across **31 files**. The game currently runs fine — these are all type-level errors, not runtime bugs.

**Run `npx tsc --noEmit` from the project root to see all errors.**

**CRITICAL RULES:**
- Do NOT change any runtime behavior. These are type-only fixes.
- Do NOT add new dependencies.
- Do NOT restructure files or change architecture.
- Do NOT remove `as any` casts that are already there (they're intentional).
- Prefer minimal, targeted fixes. Keep changes as small as possible.
- After all fixes, `npx tsc --noEmit` must return 0 errors.
- After all fixes, `npm run dev` must still work (game loads in browser).

---

## Error Categories & Fix Strategies

### 1. `TS2345` — "Argument of type X is not assignable to parameter of type 'never'" (206 errors)

**Root cause:** Arrays initialized as `[]` without type annotation get inferred as `never[]`.

**Fix pattern:** Add `as any[]` type assertion to the array initialization, OR add an explicit type annotation.

```typescript
// BEFORE (inferred as never[])
const notes = [];
notes.push({ freq: 440, duration: 0.3 }); // TS2345

// FIX OPTION A — type annotation
const notes: any[] = [];

// FIX OPTION B — assertion
const notes = [] as any[];
```

**Subvariant — emoji strings not assignable to `null | undefined`:** In `Combat.ts`, the `addCombatLogEntry` method's icon parameter is typed too narrowly. The fix is to find the method signature and widen it, OR cast the icon argument.

**Files affected:** AudioManager.ts (43), Combat.ts (50), Dungeon.ts (16), CombatInterface.ts (7), TeamAssignmentService.ts (24), Formation.ts (11), Equipment.ts (6), InventorySystem.ts (7), plus others.

---

### 2. `TS2531` — "Object is possibly 'null'" (42 errors)

**Root cause:** `strictNullChecks` is now enforcing null safety on variables that could be null.

**Fix pattern:** Add non-null assertion `!` where you're confident the value exists, OR add a null guard.

```typescript
// BEFORE
this.db.transaction(...)  // TS2531: this.db is possibly null

// FIX — non-null assertion (when you know it's initialized)
this.db!.transaction(...)

// FIX — null guard (when genuinely uncertain)
if (this.db) { this.db.transaction(...) }
```

**Files affected:** Storage.ts (30), UI.ts (8), CharacterUI.ts (3), CombatTest.ts (1).

---

### 3. `TS2339` — "Property X does not exist on type" (74 errors)

**Root cause:** Properties accessed on `never[]` elements (cascading from untyped arrays), or properties on objects inferred too narrowly.

**Fix pattern:** These are almost always _cascade errors_ from the `never[]` array problem. Fix the array typing (Category 1) and most of these disappear. For remaining ones, cast the object to `any`.

```typescript
// These disappear once the parent array is typed:
// rooms: never[]  →  rooms: any[]
// Then rooms[i].x works without error
```

**Files affected:** Dungeon.ts (19), UI.ts (24), Storage.ts (9), others.

---

### 4. `TS18046` — "'X' is of type 'unknown'" (53 errors)

**Root cause:** `catch (error)` blocks — TypeScript strict mode types caught errors as `unknown` instead of `any`.

**Fix pattern:** Cast `error` to `Error` or `any` in catch blocks.

```typescript
// BEFORE
catch (error) {
    console.error(error.message); // TS18046

// FIX
catch (error: any) {
    console.error(error.message);
```

Also affects `Object.entries()` / `Object.values()` iteration where values are `unknown`.

**Files affected:** Engine.ts (4), Storage.ts (9), CombatTest.ts (8), MagicTest.ts (8), ResourceManagementTest.ts (7), CharacterClass.ts (2), Spells.ts (5), Monster.ts (2), CharacterUI.ts (2), UI.ts (1), DungeonTest.ts (1).

---

### 5. `TS2322` — "Type X is not assignable to type Y" (26 errors)

**Root cause:** Variables initialized as `null` get their type locked to `null`, then later assigned other values.

**Fix pattern:** Add explicit type annotation with union.

```typescript
// BEFORE
let result = null;
result = someValue; // TS2322: Type X not assignable to 'null'

// FIX
let result: any = null;
// OR more specific:
let result: SomeType | null = null;
```

**Files affected:** Dungeon.ts (12), UI.ts (6), Engine.ts (3), EventSystem.ts (2), Equipment.ts (2), Storage.ts (1).

---

### 6. `TS18047` / `TS18048` — "X is possibly 'null' / 'undefined'" (21 errors)

**Root cause:** Same as TS2531 but for variable access rather than method calls.

**Fix pattern:** Same as Category 2 — add `!` non-null assertion or a null guard.

**Files affected:** Dungeon.ts (8), Engine.ts (6), TeamAssignmentService.ts (3), CombatTest.ts (2), CharacterRoster.ts (2).

---

### 7. `TS2564` — "Property has no initializer and is not definitely assigned" (7 errors)

**Root cause:** Class properties declared but assigned in methods other than the constructor.

**Fix pattern:** Add the definite assignment assertion `!`.

```typescript
// BEFORE
contentArea: HTMLElement; // TS2564

// FIX
contentArea!: HTMLElement;
```

**Files affected:** Modal.ts (3), Party.ts (3), MonsterPortraitRenderer.ts (1).

---

### 8. `TS2538` — "Type 'null' cannot be used as an index type" (6 errors)

**Root cause:** Variables typed as `null` used as array indices.

**Fix pattern:** This is a cascade from TS2322. Once the variable is typed as `number | null`, add a non-null assertion at the index usage site.

```typescript
tiles[targetY!][targetX!] = 'floor';  // Add ! assertion
```

**Files affected:** Dungeon.ts (6).

---

### 9. Minor / One-off Errors (4 total)

| Code | File | Fix |
|------|------|-----|
| `TS2790` | Random.ts | `delete` on required property — cast object to `any` before delete |
| `TS2698` | Random.ts | Spread on non-object — add type assertion |
| `TS2683` | Helpers.ts | `this` has implicit `any` — add explicit `this: any` parameter |
| `TS2769` | UI.ts, Engine.ts | Overload mismatch — cast arguments |

---

## File-by-File Error Counts

| File | Errors | Primary Error Types |
|------|--------|-------------------|
| `src/game/Dungeon.ts` | 61 | TS2345 (16), TS2339 (19), TS2322 (12), TS18047 (8), TS2538 (6) |
| `src/utils/Storage.ts` | 51 | TS2531 (30), TS2339 (9), TS18046 (9), TS2345 (2), TS2322 (1) |
| `src/game/Combat.ts` | 50 | TS2345 (50) — all emoji icon args + array pushes |
| `src/rendering/UI.ts` | 44 | TS2339 (24), TS2531 (8), TS2322 (6), TS2345 (5), TS18046 (1) |
| `src/audio/AudioManager.ts` | 43 | TS2345 (43) — all `notes.push()` on `never[]` |
| `src/game/TeamAssignmentService.ts` | 32 | TS2345 (24), TS18047 (3), TS18046 (3), TS2339 (2) |
| `src/game/Monster.ts` | 21 | TS2345 (11), TS2339 (6), TS18046 (2), other (2) |
| `src/core/Engine.ts` | 14 | TS18047 (6), TS18046 (4), TS2322 (3), other (1) |
| `src/game/Formation.ts` | 13 | TS2345 (11), TS2339 (2) |
| `src/game/MagicTest.ts` | 12 | TS18046 (8), TS2345 (2), TS2339 (2) |
| `src/game/CombatTest.ts` | 11 | TS18046 (8), TS18047 (2), TS2531 (1) |
| `src/game/Equipment.ts` | 9 | TS2345 (6), TS2322 (2), other (1) |
| `src/game/Spells.ts` | 8 | TS18046 (5), TS2345 (3) |
| `src/game/ResourceManagementTest.ts` | 7 | TS18046 (7) |
| `src/game/InventorySystem.ts` | 7 | TS2345 (7) |
| `src/game/CombatInterface.ts` | 7 | TS2345 (7) |
| `src/rendering/Viewport3D.ts` | 6 | TS2345 (3), TS2339 (3) |
| `src/rendering/CharacterUI.ts` | 6 | TS2531 (3), TS18046 (2), other (1) |
| `src/utils/Helpers.ts` | 5 | TS2345 (2), TS2339 (2), TS2683 (1) |
| `src/game/Party.ts` | 5 | TS2564 (3), TS2345 (2) |
| `src/game/AdvancedCharacterSheet.ts` | 4 | TS2345 (4) |
| `src/utils/Modal.ts` | 3 | TS2564 (3) |
| `src/rendering/Renderer.ts` | 3 | TS2345 (3) |
| `src/game/SpellMemorization.ts` | 3 | TS2339 (2), other (1) |
| `src/game/DungeonTest.ts` | 3 | TS18046 (1), TS2339 (2) |
| `src/game/CharacterRoster.ts` | 3 | TS18048 (2), TS2345 (1) |
| `src/core/EventSystem.ts` | 3 | TS2322 (2), TS2345 (1) |
| `src/utils/Random.ts` | 2 | TS2790 (1), TS2345 (1) |
| `src/game/CharacterClass.ts` | 2 | TS18046 (2) |
| `src/rendering/MonsterPortraitRenderer.ts` | 1 | TS2564 (1) |
| `src/game/DeathSystem.ts` | 1 | TS2345 (1) |

---

## Suggested Swarm Task Allocation

### Agent 1: Array typing (`never[]` → `any[]`) — ~180 errors
Fix all untyped `[]` initializations across ALL files. This is the single highest-impact fix.
- Search for `= [];` in class properties and local variables
- Change to `= [] as any[];` or add `: any[]` annotation
- **Start with:** AudioManager.ts, Combat.ts, Dungeon.ts, Formation.ts, CombatInterface.ts, TeamAssignmentService.ts, InventorySystem.ts
- **Also fixes most TS2339 cascade errors**

### Agent 2: Null safety (`null` typing) — ~70 errors
Fix all `strictNullChecks` errors:
- Add `!` non-null assertions to `this.db`, DOM element accesses, and confident-not-null vars
- Change `let x = null` to `let x: any = null` where x is later reassigned
- **Files:** Storage.ts, Dungeon.ts, Engine.ts, UI.ts, CharacterUI.ts, EventSystem.ts

### Agent 3: Catch blocks + unknown types — ~53 errors
Fix all `catch (error)` blocks and `unknown` type iterations:
- Change `catch (error)` to `catch (error: any)` in every catch block
- Cast `Object.entries`/`Object.values` iterations where values are `unknown`
- **Files:** ALL test files, Storage.ts, Engine.ts, CharacterClass.ts, Spells.ts, Monster.ts, CharacterUI.ts, UI.ts

### Agent 4: Property initialization + one-offs — ~15 errors
- Add `!:` definite assignment assertions to Modal.ts, Party.ts, MonsterPortraitRenderer.ts
- Fix `this: any` in Helpers.ts
- Fix `delete` operator in Random.ts
- Fix any remaining TS2769 overload mismatches

---

## Verification

After all fixes:
```bash
npx tsc --noEmit          # Must return 0 errors
npm run dev               # Game must load and work
```
