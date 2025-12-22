# Deployment Standards

This document outlines the deployment workflow and standards for PoseProof.

## Three-Tier Branching Strategy

```
develop → staging → main
  (dev)   (preview)  (production)
```

### Branch Purposes

| Branch    | Environment | URL                   | Purpose                |
| --------- | ----------- | --------------------- | ---------------------- |
| `develop` | Development | Auto-generated        | Active development     |
| `staging` | Preview     | staging.poseproof.com | Pre-production testing |
| `main`    | Production  | poseproof.com         | Live production        |

## Deployment Flow

### 1. Development (develop branch)

- All feature work happens here
- Automatic Vercel preview deployments
- Smoke tests run on every push
- Quick iteration cycle

### 2. Staging (staging branch)

- Merge from `develop` when ready for testing
- Full E2E test suite runs
- Manual QA verification
- **Minimum 24-hour soak time before production**

### 3. Production (main branch)

- Merge from `staging` after verification
- Automatic production deployment
- Monitor for 30 minutes post-deploy

## Pre-Push Quality Gates

The following checks run automatically before each push:

1. **TypeScript Check** - `npm run type-check`
2. **Production Build** - `npm run build`

If either fails, the push is blocked.

## CI/CD Pipeline

See `.github/workflows/ci.yml` for the full configuration.

### Jobs by Branch

| Job        | develop | staging | main |
| ---------- | ------- | ------- | ---- |
| Lint       | Yes     | Yes     | Yes  |
| TypeScript | Yes     | Yes     | Yes  |
| Build      | Yes     | Yes     | Yes  |
| Unit Tests | Yes     | Yes     | Yes  |
| Smoke E2E  | Yes     | No      | No   |
| Full E2E   | No      | Yes     | No   |

## Deployment Checklist

### Before Promoting develop → staging

- [ ] All CI checks passing
- [ ] Smoke tests passing
- [ ] No console errors in development
- [ ] Feature tested locally
- [ ] TypeScript compilation successful
- [ ] Build successful

### Before Promoting staging → main

- [ ] All CI checks passing on staging
- [ ] Full E2E tests passed
- [ ] 24-hour staging soak time complete
- [ ] Manual QA verification complete
- [ ] Critical user flows tested
- [ ] No new errors in staging logs

### After Production Deployment

- [ ] Verify deployment success in Vercel
- [ ] Check production URL loads correctly
- [ ] Verify critical user flows work
- [ ] Monitor for 30 minutes post-deploy
- [ ] Check for any new error reports

## Rollback Procedure

If issues are discovered in production:

1. **Immediate:** Use Vercel's instant rollback feature
2. **Navigate to:** Vercel Dashboard → Deployments → Previous deployment → Promote to Production
3. **Notify:** Team of rollback and investigate issue
4. **Fix:** Create hotfix on develop, fast-track through staging

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

# Pre-push checks
npm run type-check    # TypeScript validation
npm run lint          # ESLint check

# Testing
npm test              # Unit tests
npm run test:e2e      # E2E tests
```

## Critical Rules

### NEVER Do

- Push directly to `main` without staging verification
- Skip the 24-hour staging soak time
- Deploy on Fridays without urgent need
- Force push to shared branches
- Skip pre-push hooks

### ALWAYS Do

- Run quality checks before committing
- Wait for CI to pass before promoting branches
- Verify on staging before production
- Monitor for 30 minutes after production deploy
- Document any manual overrides
