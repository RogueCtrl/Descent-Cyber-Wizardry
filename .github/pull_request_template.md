## What does this PR do?

Brief description of the change.

## Why?

Context on motivation — link to issue if applicable.

## How to test

Steps to verify this works:
1. `npm run build`
2. `npm run dev`
3. Test in browser at `localhost:5173`

## Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm test` passes
- [ ] Tested manually in browser
- [ ] Updated docs if behavior changed
- [ ] PR title follows [conventional commits](https://www.conventionalcommits.org/) (feat:, fix:, docs:, etc.)

## Conventional Commit Prefix

⚠️ **Important**: Your PR title determines the version bump:
- `major:` → 1.0.0 → 2.0.0 (breaking changes)
- `feat:` or `refactor:` → 1.0.0 → 1.1.0 (new features)
- `fix:`, `docs:`, `chore:` → 1.0.0 → 1.0.1 (patches)
