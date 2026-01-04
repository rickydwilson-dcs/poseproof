# /update.docs - Svolta Documentation Synchronization

Synchronize all project documentation with the current codebase state, following [docs/standards/documentation.md](../../docs/standards/documentation.md).

## Purpose

Keep README.md, CLAUDE.md, CHANGELOG.md, and all `/docs/*.md` files current and accurate. This command scans the repository, counts metrics, validates documentation, and updates files to reflect the actual codebase.

## When to Use

- After adding new features, hooks, components, or API routes
- After making significant code changes
- Before creating a pull request
- Weekly documentation maintenance
- When documentation feels stale or outdated

---

## What This Command Does

### Phase 1: Scan Repository Metrics

Counts and catalogs:

```bash
# TypeScript/TSX source files (exclude node_modules, tests)
find app components hooks lib stores -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l

# Custom React hooks (exclude tests)
find hooks -name "use*.ts" ! -name "*.test.ts" | wc -l

# Zustand state stores
find stores -name "*.ts" | wc -l

# UI components
find components/ui -name "*.tsx" | wc -l

# API route directories
find app/api -type d -mindepth 1 -maxdepth 1 | wc -l

# Test files
find tests -name "*.test.ts" -o -name "*.test.tsx" | wc -l

# Visual test fixtures
find tests/visual/fixtures -type f | wc -l

# Documentation files
find docs -name "*.md" | wc -l
```

**Expected Current Counts:**

| Metric               | Count |
| -------------------- | ----- |
| Source Files         | 92    |
| Custom Hooks         | 7     |
| State Stores         | 2     |
| UI Components        | 13    |
| API Route Dirs       | 5     |
| Test Files           | 5     |
| Visual Test Fixtures | 170   |
| Documentation Files  | 21    |

### Phase 2: Update Root Documentation

#### README.md

**Update "Current Scope" table:**

```markdown
| Metric               | Count             |
| -------------------- | ----------------- |
| Source Files         | 92 TypeScript/TSX |
| Custom Hooks         | 7                 |
| State Stores         | 2                 |
| UI Components        | 13                |
| API Routes           | 5                 |
| Test Files           | 5                 |
| Visual Test Fixtures | 170               |
```

**Update "Last Updated" date:**

```markdown
**Last Updated:** 2026-01-04
```

#### CLAUDE.md

**Update "Current Scope" section:**

```markdown
## Current Scope

**Source Files:** 92 TypeScript/TSX files
**Custom Hooks:** 7 (useAlignment, useBackgroundRemoval, useCanvasExport, useGifExport, useKeyboardShortcuts, usePoseDetection, useUsageLimit)
**State Stores:** 2 (editor-store, user-store)
**UI Components:** 13 primitives (Button, BottomSheet, Card, ErrorBoundary, Input, MagicLinkForm, Modal, OAuthButtons, SegmentedControl, Slider, SvoltaLogo, Toggle, UpgradePrompt)
**API Routes:** 5 directories (account, backgrounds, debug, stripe, usage)
**Test Files:** 5 test files
**Visual Test Fixtures:** 170 fixtures
```

**Update "Last Updated" date:**

```markdown
**Last Updated:** 2026-01-04
```

#### CHANGELOG.md

**Add recent git commits as entries:**

1. Get last 10 commits: `git log --oneline -10`
2. Parse conventional commit messages
3. Group by type: feat, fix, chore, docs, test
4. Add to **versioned section** (not "Unreleased")

**CRITICAL:** Per [docs/standards/documentation.md](../../docs/standards/documentation.md):

- **NO "Unreleased" section**
- Use versioned headers: `## [0.3.1] - 2026-01-04`
- Categories: Security, Added, Changed, Fixed, Removed, Technical

**Example entry format:**

```markdown
## [0.3.1] - 2026-01-04

### Fixed

- Security code review remediation (P0, P1, P2 priority fixes)
- Export modal: British English usage and background colour applied to preview
- Export modal: Error handling and timeout for background removal

### Added

- Debug feature: Toggleable alignment debug logging with file output

### Changed

- Updated Next.js to 16.1.1
- Migrated middleware to proxy architecture
```

### Phase 3: Update /docs/\* Documentation

**This is critical.** Verify and update all documentation files:

#### docs/README.md (Documentation Hub)

- [ ] Verify all navigation links point to existing files
- [ ] Update tech stack versions (Next.js, Tailwind, MediaPipe)
- [ ] Update API endpoint count (should match `app/api` scan)
- [ ] Update "Last Updated" date
- [ ] Validate all internal links work

**Key sections to verify:**

```markdown
### Reference

- **[API Reference](./api/reference.md)** - All 5 API route directories documented
```

#### docs/api/reference.md

- [ ] Scan `app/api/**/route.ts` for all API routes
- [ ] Verify each route is documented with:
  - HTTP method (GET, POST, DELETE, etc.)
  - Request body schema
  - Response schema
  - Authentication requirements
  - Example requests/responses
- [ ] Flag any undocumented routes
- [ ] Update "Last Updated" date

**Current API routes:**

```
app/api/account/delete/route.ts
app/api/backgrounds/upload/route.ts
app/api/debug/alignment-log/route.ts
app/api/stripe/checkout/route.ts
app/api/stripe/portal/route.ts
app/api/stripe/webhook/route.ts
app/api/usage/route.ts
app/api/usage/increment/route.ts
```

#### docs/components/api-reference.md

- [ ] Scan `components/ui/*.tsx` for all UI components
- [ ] Verify each component is documented with:
  - Component purpose
  - Props interface
  - Usage examples
  - Variants/options
- [ ] List all 13 components
- [ ] Flag any undocumented components
- [ ] Update "Last Updated" date

**Current UI components:**

```
BottomSheet, Button, Card, ErrorBoundary, Input, MagicLinkForm, Modal,
OAuthButtons, SegmentedControl, Slider, SvoltaLogo, Toggle, UpgradePrompt
```

#### docs/development/state-hooks.md

- [ ] Scan `hooks/` directory for all custom hooks
- [ ] Verify each hook is documented
- [ ] List all 7 hooks with interfaces
- [ ] Scan `stores/` directory for all Zustand stores
- [ ] Verify both stores are documented
- [ ] Update "Last Updated" date

**Current hooks:**

```
useAlignment, useBackgroundRemoval, useCanvasExport, useGifExport,
useKeyboardShortcuts, usePoseDetection, useUsageLimit
```

**Current stores:**

```
editor-store.ts, user-store.ts
```

#### docs/features/billing.md

- [ ] Verify pricing matches `lib/stripe/plans.ts`
- [ ] Current pricing: £7.99/month, £79/year
- [ ] Free tier: 5 exports/month
- [ ] Update if pricing changed

#### docs/architecture/\*.md

- [ ] Verify architecture diagrams match current structure
- [ ] Update if major architectural changes occurred

#### docs/standards/\*.md

- [ ] Verify all standards are current
- [ ] Update if new standards introduced

### Phase 4: Documentation Validation

Run quality checks on all `/docs/*.md` files:

#### 1. Link Validation

- Check all internal markdown links `[text](path)`
- Verify all linked files exist
- Report broken links

**Example check:**

```bash
# Extract all markdown links
grep -r "\[.*\](.*\.md)" docs/

# Verify each linked file exists
```

#### 2. Heading Hierarchy

- Ensure no skipped heading levels (H1 → H2 → H3, not H1 → H3)
- Report violations with file and line number

#### 3. Code Block Syntax Highlighting

- Verify all code blocks have language tags
- Report blocks without language tags

**Good:**

````markdown
```typescript
const foo = "bar";
```
````

**Bad:**

````markdown
```
const foo = "bar";
```
````

#### 4. File Reference Accuracy

- Verify file paths mentioned in prose exist
- Example: "See `lib/stripe/plans.ts`" → check file exists

#### 5. Component/Hook/API Lists

- Cross-reference lists with actual codebase
- Flag missing or extra entries

---

## Expected Output

The command produces a structured report:

### 1. Scan Phase

```
🔍 Scanning Repository...

✓ Found 92 TypeScript/TSX source files
✓ Found 7 custom hooks
✓ Found 2 state stores
✓ Found 13 UI components
✓ Found 5 API route directories
✓ Found 5 test files
✓ Found 170 visual test fixtures
✓ Found 21 documentation files
```

### 2. Update Phase

```
📝 Updating Documentation...

✓ Updated README.md (Current Scope table)
✓ Updated CLAUDE.md (Current Scope section)
✓ Updated CHANGELOG.md (added 5 commits to v0.3.1)

✓ Verified docs/README.md (all links valid)
✓ Updated docs/api/reference.md (all 8 routes documented)
✓ Updated docs/components/api-reference.md (all 13 components listed)
✓ Updated docs/development/state-hooks.md (7 hooks, 2 stores)
```

### 3. Validation Phase

```
✅ Validating Documentation...

✓ 21 markdown files checked
✓ 87 internal links validated (all valid)
✓ Heading hierarchy correct (no skipped levels)
✓ All code blocks have syntax highlighting

Warnings:
⚠ docs/api/reference.md: Missing documentation for /api/debug/alignment-log
```

### 4. Summary Report

```
📊 Documentation Update Complete

Files Updated:
  - README.md (Current Scope)
  - CLAUDE.md (Current Scope)
  - CHANGELOG.md (5 new entries in v0.3.1)
  - docs/README.md (verified links)
  - docs/api/reference.md (verified routes)
  - docs/components/api-reference.md (verified components)
  - docs/development/state-hooks.md (verified hooks/stores)

Validation Results:
  - 21 documentation files checked
  - 87 internal links validated
  - 0 errors found
  - 1 warning (missing API docs for debug endpoint)

Action Required:
  ⚠ Add documentation for /api/debug/alignment-log in docs/api/reference.md
```

---

## Standards Compliance

This command follows [docs/standards/documentation.md](../../docs/standards/documentation.md):

### CHANGELOG Standards ✓

- **No "Unreleased" section** - All changes use version numbers
- Groups by type: Security, Added, Changed, Fixed, Removed, Technical
- Uses semantic versioning: `## [0.3.1] - 2026-01-04`
- Entries start with verbs (Added, Fixed, Changed)

### CLAUDE.md Standards ✓

- Keeps file concise (target 150-200 lines, max 300)
- Focuses on actionable rules
- Avoids duplicating content from docs/
- Uses tables for quick reference

### Markdown Formatting ✓

- Validates heading hierarchy (H1 → H2 → H3)
- Ensures code blocks have language tags
- Uses relative paths for internal links
- Single blank line between sections

### Living Documentation ✓

- Updates in same commit as code changes
- Removes obsolete information
- Regular review of README, CLAUDE.md, CHANGELOG.md

---

## Error Handling

### Common Issues & Solutions

#### Issue: Count Mismatch

```
❌ Hook count mismatch
   Expected: 7 (from docs)
   Found: 8 (in hooks/ directory)
   New hook: hooks/useDebugMode.ts
```

**Solution:** Command updates docs with actual count and lists the new hook.

---

#### Issue: Broken Internal Link

```
❌ Broken link in docs/api/reference.md (line 42)
   Link: [Feature Docs](../features/missing.md)
   Error: File does not exist
```

**Solution:** Fix manually by:

1. Creating the missing file, OR
2. Updating the link to correct path, OR
3. Removing the broken link

---

#### Issue: Missing API Documentation

```
⚠ Undocumented API route
   Route: /api/debug/alignment-log
   File: app/api/debug/alignment-log/route.ts
   Action: Add to docs/api/reference.md
```

**Solution:** Add entry to docs/api/reference.md with method, request/response schemas.

---

#### Issue: Heading Hierarchy Violation

```
⚠ Heading hierarchy violation
   File: docs/features/pose-detection.md
   Line: 42
   Issue: Skips from H1 to H3 (missing H2)
```

**Solution:** Fix by correcting heading levels in the file.

---

#### Issue: Code Block Without Language

````
⚠ Code block missing language tag
   File: docs/development/setup.md
   Line: 89
   Block: ```\n   npm install\n   ```
````

**Solution:** Add language tag: ` ```bash `

---

## Quality Checklist

After running `/update.docs`, verify:

### Documentation Accuracy

- [ ] All file counts in README.md match actual codebase
- [ ] CHANGELOG.md has entries for recent commits (with version, no "Unreleased")
- [ ] CLAUDE.md "Current Scope" is accurate
- [ ] docs/api/reference.md lists all API routes
- [ ] docs/components/api-reference.md lists all 13 components
- [ ] docs/development/state-hooks.md lists all 7 hooks and 2 stores

### Validation Passed

- [ ] All internal links work correctly
- [ ] Heading hierarchy is correct (no skipped levels)
- [ ] All code blocks have language tags
- [ ] No broken file references

### Action Items

- [ ] Address any warnings reported
- [ ] Add documentation for new features/components/routes
- [ ] Update "Last Updated" dates if manually edited

---

## Integration with Git Workflow

Recommended workflow after running `/update.docs`:

```bash
# 1. Run documentation update
/update.docs

# 2. Review changes
git diff README.md CHANGELOG.md CLAUDE.md docs/

# 3. Stage documentation changes
git add README.md CHANGELOG.md CLAUDE.md docs/

# 4. Commit documentation separately
git commit -m "docs: synchronize documentation with codebase"

# 5. Continue with your work...
```

---

## Files Modified by This Command

This command may modify:

- ✏️ `README.md` - Current Scope table, Last Updated
- ✏️ `CLAUDE.md` - Current Scope section, Last Updated
- ✏️ `CHANGELOG.md` - Add recent commits to versioned section
- ✏️ `docs/README.md` - Verify/update links, versions, counts
- ✏️ `docs/api/reference.md` - Verify API route documentation
- ✏️ `docs/components/api-reference.md` - Verify component documentation
- ✏️ `docs/development/state-hooks.md` - Verify hooks/stores lists
- ✏️ `docs/features/billing.md` - Verify pricing matches code

**Files are never deleted**, only updated or flagged for manual review.

---

## Related Commands

- `/commit.changes` - Commit changes following git workflow
- `/create.pr` - Create pull request with updated documentation
- `/review.code` - Run code review (do this after updating docs)

## Related Documentation

- [Documentation Standards](../../docs/standards/documentation.md) - Complete standards
- [Git Workflow](../../docs/standards/git-workflow.md) - Branching and CI/CD
- [CHANGELOG Format](../../CHANGELOG.md) - See current structure
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) - Changelog specification

---

**Version:** 2.0.0
**Last Updated:** 2026-01-04
**Project:** Svolta
**Maintained By:** Svolta Team
