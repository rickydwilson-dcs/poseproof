# Deployment Standards

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Scope:** PoseProof application

---

## Overview

PoseProof uses a multi-stage deployment pipeline with GitHub Actions CI/CD and Vercel automatic deployments. All deployments follow a validated promotion strategy.

## Core Principles

### 1. Git Branch Flow

```
develop → staging → main
```

- **develop:** Development environment, smoke tests required
- **staging:** Preview/QA gate, full E2E tests required
- **main:** Production, requires staging CI passing

### 2. Automated CI/CD

All deployments validated by GitHub Actions before proceeding.

### 3. Pre-Push Validation

Local pre-push hooks run lint, type-check, and build before any push.

## GitHub Actions Workflows

### CI Workflow (ci.yml)

Runs on every push to develop, staging, main:

```yaml
- ESLint linting
- TypeScript validation
- Unit tests (Vitest)
- Production build
```

### E2E Tests by Branch

| Branch  | Tests     | When Run |
| ------- | --------- | -------- |
| develop | Smoke E2E | On push  |
| staging | Full E2E  | On push  |
| main    | Full E2E  | On push  |

## Pre-Deployment Checks

Before any push, pre-push hooks run:

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run build         # Production build
```

These block the push if any check fails.

## Git Workflow Commands

```bash
# Push to develop
git push origin develop
gh run watch  # Wait for CI

# Merge to staging (after CI passes)
git checkout staging
git merge develop
git push origin staging
gh run watch  # Wait for E2E tests

# Merge to main (after staging E2E passes)
git checkout main
git merge staging
git push origin main
gh run watch  # Wait for deployment
```

## Vercel Configuration

PoseProof has automatic deployments configured:

| Branch  | Environment | URL                    |
| ------- | ----------- | ---------------------- |
| develop | Development | Auto-generated preview |
| staging | Preview     | staging.poseproof.com  |
| main    | Production  | poseproof.com          |

## Deployment Checklist

### Before Merging develop → staging

- [ ] All develop CI checks passing (lint, type-check, build, unit tests)
- [ ] Smoke E2E tests pass on develop
- [ ] Run `gh run watch` to confirm CI is green

### Before Merging staging → main

- [ ] All staging CI checks passing
- [ ] Full E2E tests pass on staging
- [ ] 24-hour staging soak time complete (optional for urgent fixes)
- [ ] Manual QA verification complete
- [ ] Run `gh run watch` to confirm CI is green

### After Production Deployment

- [ ] Site loads successfully
- [ ] Authentication working
- [ ] Core editor functionality works
- [ ] Stripe checkout loads
- [ ] Monitor for 30 minutes post-deploy

## Rollback Procedure

If issues are discovered in production:

1. **Immediate:** Use Vercel's instant rollback feature
2. **Navigate to:** Vercel Dashboard → Deployments → Previous deployment → Promote to Production
3. **Fix:** Create fix on develop, fast-track through staging

## What NOT to Do

| Anti-Pattern             | Why It's Wrong       | Correct Approach      |
| ------------------------ | -------------------- | --------------------- |
| Merge without CI green   | May break production | Always `gh run watch` |
| Skip pre-push hooks      | May break CI         | Let hooks run         |
| Force push to any branch | Loses history        | Never force push      |
| Deploy on Friday evening | No support coverage  | Deploy early in day   |

## Environment Variables

### Local Development

- Copy `.env.example` to `.env.local`
- Fill in development/test values

### Vercel (Production/Preview)

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable                        | Scope               |
| ------------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | All                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production, Preview |
| `STRIPE_SECRET_KEY`             | Production, Preview |
| `STRIPE_WEBHOOK_SECRET`         | Production, Preview |
| `NEXT_PUBLIC_APP_URL`           | Per environment     |

## Commands Reference

```bash
# Local development
npm run dev           # Start dev server
npm run build         # Production build
npm run validate      # Full validation suite

# Pre-push checks (run automatically)
npm run lint          # ESLint check
npm run type-check    # TypeScript validation

# Testing
npm test              # Unit tests
npm run test:e2e      # Full E2E tests
npm run test:e2e:smoke # Smoke E2E tests
```

## Related Guides

- [Git Workflow](../guides/git-workflow.md)
- [Testing Standards](./testing.md)

---

**Maintained By:** Ricky Wilson
