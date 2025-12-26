# /update.docs - Svolta Documentation Synchronization

Keep documentation synchronized with the actual codebase state. This command scans the repository and updates statistics, changelogs, and documentation references.

## What This Command Does

### 1. Scan Repository State

Gather current metrics:

```bash
# Source files
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v ".next" | wc -l

# Custom hooks
ls hooks/*.ts | wc -l

# State stores
ls stores/*.ts | wc -l

# UI components
ls components/ui/*.tsx | wc -l

# API routes
find app/api -name "route.ts" | wc -l

# Test files
find tests -name "*.ts" | wc -l

# Visual test fixtures
cat tests/visual/fixtures/manifest.json | grep -c '"id":'
```

### 2. Update Root Documentation Files

| File           | Sections to Update                       |
| -------------- | ---------------------------------------- |
| `README.md`    | Current Scope table, Last Updated date   |
| `CHANGELOG.md` | [Unreleased] section with recent changes |
| `CLAUDE.md`    | Current Scope section                    |

### 3. Update /docs/\* Documentation

Scan and update all documentation files in `/docs/` to ensure accuracy:

| File                                  | What to Verify/Update                              |
| ------------------------------------- | -------------------------------------------------- |
| `docs/README.md`                      | Documentation index, verify all linked files exist |
| `docs/api/reference.md`               | API routes list matches actual `app/api/` routes   |
| `docs/architecture/overview.md`       | Project structure matches actual directories       |
| `docs/architecture/database.md`       | Supabase tables/schema if changed                  |
| `docs/components/reference.md`        | UI component list matches `components/ui/`         |
| `docs/development/setup.md`           | Installation steps, dependencies version           |
| `docs/development/state-hooks.md`     | Hook list matches `hooks/` directory               |
| `docs/development/troubleshooting.md` | Common issues still relevant                       |
| `docs/features/alignment-export.md`   | Export feature documentation                       |
| `docs/features/billing.md`            | Pricing, plan details match `lib/stripe/plans.ts`  |
| `docs/features/pose-detection.md`     | MediaPipe integration details                      |
| `docs/standards/code-style.md`        | Coding standards current                           |
| `docs/standards/design-tokens.md`     | Tailwind tokens match `tailwind.config.ts`         |
| `docs/standards/git-workflow.md`      | Branch strategy current                            |
| `docs/standards/testing.md`           | Test setup matches actual config                   |

### 4. Documentation Validation Checks

For each `/docs/*.md` file:

1. **Link Validation** - Verify all internal links point to existing files
2. **Code Reference Accuracy** - File paths and line numbers are correct
3. **Component/Hook Lists** - Match actual codebase exports
4. **API Endpoint Lists** - Match actual route files
5. **Configuration Examples** - Match actual config files

### 5. Check Recent Git Activity

```bash
# Get recent commits for changelog
git log --oneline -15

# Check for uncommitted documentation drift
git diff --name-only | grep -E '\.(md|json)$'
```

## Files to Update

### README.md - Current Scope Section

```markdown
## Current Scope

| Metric               | Count                  |
| -------------------- | ---------------------- |
| Source Files         | {count} TypeScript/TSX |
| Custom Hooks         | {count}                |
| State Stores         | {count}                |
| UI Components        | {count}                |
| API Routes           | {count}                |
| Test Files           | {count}                |
| Visual Test Fixtures | {count}                |
```

### CHANGELOG.md - [Unreleased] Section

Add entries for:

- New features (feat commits)
- Bug fixes (fix commits)
- Breaking changes
- Technical changes (refactor, perf, test)

### CLAUDE.md - Current Scope Section

```markdown
## Current Scope

**Source Files:** {count} TypeScript/TSX files
**Custom Hooks:** {count} (list hook names)
**State Stores:** {count} (editor-store, user-store)
**UI Components:** {count} primitives
**API Routes:** {count}
**Test Files:** {count} test files
**Visual Test Fixtures:** {count} fixtures across {categories} categories
```

### docs/development/state-hooks.md

Update hook documentation when hooks are added/modified:

```markdown
## Available Hooks

| Hook            | Location                 | Purpose                     |
| --------------- | ------------------------ | --------------------------- |
| useAlignment    | hooks/useAlignment.ts    | Alignment calculations      |
| useCanvasExport | hooks/useCanvasExport.ts | Canvas export functionality |
| ...             | ...                      | ...                         |
```

### docs/components/reference.md

Update component documentation when UI components change:

```markdown
## UI Components

| Component | Location                 | Props                   |
| --------- | ------------------------ | ----------------------- |
| Button    | components/ui/Button.tsx | variant, size, disabled |
| ...       | ...                      | ...                     |
```

### docs/api/reference.md

Update API documentation when routes are added/modified:

```markdown
## API Routes

| Endpoint             | Method | Description             |
| -------------------- | ------ | ----------------------- |
| /api/stripe/checkout | POST   | Create checkout session |
| ...                  | ...    | ...                     |
```

## Expected Output

After running this command:

1. All metric counts are accurate in README.md, CLAUDE.md
2. CHANGELOG.md reflects recent commits
3. Last Updated dates are current
4. All /docs/\*.md files verified for accuracy
5. No broken internal links
6. No documentation drift warnings

## When to Run

- After adding new components, hooks, or API routes
- After merging feature branches
- Before creating releases
- Weekly maintenance
- After any structural changes to the codebase

---

**Project:** Svolta
**Last Updated:** 2025-12-26
