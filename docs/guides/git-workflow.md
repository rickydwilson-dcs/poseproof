# Git Workflow Guide

This guide covers the Git branching strategy and workflow for PoseProof.

## Branch Structure

```
main (production)
  ↑
staging (preview/testing)
  ↑
develop (active development)
```

## Daily Development Workflow

### 1. Start Work

```bash
# Ensure you're on develop and up to date
git checkout develop
git pull origin develop
```

### 2. Make Changes

```bash
# Make your changes, then stage and commit
git add .
git commit -m "feat: add new feature"
```

### 3. Push to develop

```bash
# Pre-push hooks will run automatically
git push origin develop
```

### 4. Verify CI

- Check GitHub Actions for CI status
- Ensure all checks pass before proceeding

## Promoting to Staging

When features are ready for testing:

```bash
# Merge develop into staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging
```

Wait for:

- Full E2E tests to pass
- 24-hour soak time minimum
- Manual QA verification

## Promoting to Production

After staging verification:

```bash
# Merge staging into main
git checkout main
git pull origin main
git merge staging
git push origin main
```

Then:

- Monitor Vercel deployment
- Verify production site
- Watch for 30 minutes post-deploy

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                        |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `docs`     | Documentation only                 |
| `style`    | Formatting, no code change         |
| `refactor` | Code change, no new feature or fix |
| `perf`     | Performance improvement            |
| `test`     | Adding or updating tests           |
| `chore`    | Build process, dependencies        |

### Examples

```bash
feat(editor): add alignment grid overlay
fix(auth): resolve session refresh loop
docs: update deployment guide
refactor(canvas): simplify landmark rendering
```

## Pre-Push Hooks

The following checks run automatically before each push:

1. **lint-staged** - Lints and formats staged files
2. **type-check** - TypeScript compilation check
3. **build** - Production build verification

If any check fails, the push is blocked.

### Bypassing Hooks (Emergency Only)

```bash
# Only use in emergencies with explicit approval
git push --no-verify
```

## Branch Protection Rules

Configure in GitHub Settings → Branches:

### `main` branch

- Require pull request before merging (optional)
- Require status checks to pass
- Require branches to be up to date
- Do not allow force pushes

### `staging` branch

- Require status checks to pass
- Do not allow force pushes

### `develop` branch

- Require status checks to pass

## Handling Conflicts

When merging and conflicts occur:

```bash
# After attempting merge
git status  # See conflicted files

# Resolve conflicts in your editor
# Then stage the resolved files
git add <resolved-files>
git commit  # Complete the merge
git push
```

## Rollback Procedures

### Rollback a Commit

```bash
# Create a revert commit (safe)
git revert <commit-hash>
git push
```

### Rollback Production (Emergency)

1. Use Vercel's instant rollback in dashboard
2. Or roll back via git:

```bash
git checkout main
git revert HEAD
git push origin main
```

## Common Scenarios

### Feature Not Ready, Need to Switch

```bash
git stash
git checkout develop
# ... do other work ...
git checkout feature-branch
git stash pop
```

### Accidentally Committed to Wrong Branch

```bash
# If not pushed yet
git reset HEAD~1  # Undo commit, keep changes
git stash
git checkout correct-branch
git stash pop
git add . && git commit
```

### Need to Update from develop While Working

```bash
git stash
git checkout develop
git pull origin develop
git checkout -
git merge develop
git stash pop
```

## Critical Rules

1. **Never force push** to `main`, `staging`, or `develop`
2. **Always pull** before starting work
3. **Run `npm run validate`** before pushing
4. **Follow the branch flow**: develop → staging → main
5. **Write meaningful commit messages**
