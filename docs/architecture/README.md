# Svolta Architecture Documentation

**Last Updated:** 2026-01-04
**Status:** Phase 6 (Landing & Polish)

---

## Documentation Overview

This directory contains comprehensive architecture documentation for the Svolta application, including system design, technical decisions, and improvement recommendations.

### Quick Navigation

| Document                                               | Purpose                                  | Audience              | Read Time |
| ------------------------------------------------------ | ---------------------------------------- | --------------------- | --------- |
| **[ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md)** | Executive summary with key findings      | Leadership, PMs       | 5 min     |
| **[ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md)**   | Complete technical architecture analysis | Engineers, Architects | 30 min    |
| **[ACTION_PLAN.md](ACTION_PLAN.md)**                   | Production hardening checklist with code | Engineers             | 15 min    |
| [overview.md](overview.md)                             | Original system design documentation     | All                   | 10 min    |
| [database.md](database.md)                             | Database schema and patterns             | Backend Engineers     | 15 min    |

---

## Latest Review (2026-01-04)

### Overall Score: 8.5/10

**Status:** Production-ready with recommended hardening

### Key Highlights

**Strengths:**

- Privacy-first client-side architecture (competitive moat)
- Clean code organization with strong type safety
- Excellent test coverage (379 test files)
- Modern tech stack (Next.js 16, React 19, Supabase)
- Scalable to 50,000+ MAU without major changes

**Critical Actions Required:**

- Add rate limiting (prevents abuse)
- Add request validation (security + stability)
- Add security headers (compliance)
- Optimize MediaPipe loading (UX improvement)

**Timeline:** 3.5 days of focused work before public launch

---

## Documentation Quick Links

### For Product Managers

Start with [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md) to understand:

- What's working well
- What needs attention
- Timeline and cost projections
- Scaling capabilities

### For Engineers

Read [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) for:

- Detailed architecture analysis
- Design pattern evaluation
- Technical debt assessment
- Code examples and recommendations

Then follow [ACTION_PLAN.md](ACTION_PLAN.md) for:

- Step-by-step implementation guides
- Code samples for immediate improvements
- Testing and deployment checklists

### For Leadership

Review [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md) sections:

- Scaling projections (50k → 100k MAU)
- Cost analysis at scale
- Risk assessment and mitigations
- Competitive advantages

---

## Architecture at a Glance

### System Architecture

```
┌─────────────────────────────────────────────────┐
│         PRIVACY-FIRST CLIENT-SIDE ARCH          │
│                                                 │
│  Photos processed 100% in browser:             │
│  - MediaPipe (pose detection)                   │
│  - Fabric.js (canvas rendering)                 │
│  - Background removal (AI model)                │
│  - GIF export (animation)                       │
│                                                 │
│  Server handles only:                           │
│  - Authentication (Supabase)                    │
│  - Subscriptions (Stripe)                       │
│  - Usage tracking                               │
└─────────────────────────────────────────────────┘
```

**Key Innovation:** Zero photos stored on servers = GDPR compliant by design

### Tech Stack

| Layer          | Technologies                                     |
| -------------- | ------------------------------------------------ |
| **Frontend**   | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **State**      | Zustand (2 stores: editor, user)                 |
| **Processing** | MediaPipe, Fabric.js, @imgly/background-removal  |
| **Backend**    | Next.js API Routes (8 routes)                    |
| **Database**   | Supabase (PostgreSQL + Auth + RLS)               |
| **Payments**   | Stripe (checkout, webhooks, portal)              |
| **Hosting**    | Vercel (serverless + edge)                       |

### Codebase Stats

- **Files:** 108 TypeScript/TSX files
- **Custom Hooks:** 7 (useAlignment, usePoseDetection, etc.)
- **State Stores:** 2 (editor-store, user-store)
- **UI Components:** 13 reusable primitives
- **API Routes:** 8 serverless functions
- **Tests:** 379 test files
- **Type Coverage:** ~98%

---

## Architecture Principles

### 1. Privacy First

All photo processing happens client-side. No photos ever uploaded to servers.

**Impact:**

- User trust (critical for fitness photos)
- GDPR compliant by design
- No photo storage costs

### 2. Client-Side Processing

MediaPipe, Fabric.js, and AI models run in browser.

**Impact:**

- Zero upload/download latency
- Scales infinitely (user devices)
- Low infrastructure costs

### 3. Minimal Backend

Only 8 API routes handling auth, payments, and usage tracking.

**Impact:**

- Fast development iteration
- Low operational complexity
- Easy to scale

### 4. Strong Type Safety

TypeScript throughout with generated Supabase types.

**Impact:**

- Fewer runtime errors
- Better IDE support
- Easier refactoring

### 5. Test-Driven Quality

379 test files covering critical paths.

**Impact:**

- Confidence in deployments
- Faster bug detection
- Living documentation

---

## Performance Characteristics

| Metric             | Current   | Target  | Status                |
| ------------------ | --------- | ------- | --------------------- |
| HEIC Conversion    | 1-3s      | <3s     | ✅                    |
| Canvas Render      | 100-300ms | <500ms  | ✅                    |
| **MediaPipe Load** | **3-5s**  | **<1s** | ⚠️ Needs optimization |
| Pose Detection     | 500ms     | <1s     | ✅                    |
| Alignment Calc     | <10ms     | <50ms   | ✅                    |
| PNG/JPEG Export    | 100ms     | <500ms  | ✅                    |
| GIF Export         | 5-10s     | <15s    | ✅                    |
| Background Removal | 2-4s      | <5s     | ✅                    |

**Bottleneck:** MediaPipe model loading on first use (addressed in ACTION_PLAN.md)

---

## Scaling Capacity

### Current Architecture Capacity

| Component          | Limit     | Bottleneck At    |
| ------------------ | --------- | ---------------- |
| Client Processing  | Unlimited | - (user devices) |
| Supabase Database  | 10k QPS   | 50k MAU          |
| Supabase Auth      | 100 req/s | 10k MAU          |
| Next.js API Routes | 1k req/s  | 50k MAU          |
| Stripe API         | 100 req/s | 5k upgrades/hr   |

**Current Capacity:** 50,000 MAU before infrastructure changes needed

### Cost Projections

| Scale       | Monthly Cost | Notes                         |
| ----------- | ------------ | ----------------------------- |
| 1,000 MAU   | ~$50         | Base hosting + database       |
| 10,000 MAU  | ~$100        | + Stripe transaction fees     |
| 100,000 MAU | ~$700-1,200  | + Redis cache, higher DB tier |

**Cost Efficiency:** Client-side processing keeps costs extremely low even at scale

---

## Security Posture

### Current Strengths

- ✅ Privacy-first (no photos on servers)
- ✅ HTTPS enforced (Vercel SSL)
- ✅ Supabase RLS (row-level security)
- ✅ Stripe webhook verification
- ✅ OAuth integration (Google, GitHub)
- ✅ TypeScript (type safety)

### Areas Requiring Attention

- ⚠️ No rate limiting (HIGH PRIORITY)
- ⚠️ No input validation (HIGH PRIORITY)
- ⚠️ No security headers (HIGH PRIORITY)
- ⚠️ Dependencies not regularly audited
- ⚠️ Minimal security logging

**Status:** Requires hardening before public launch (see ACTION_PLAN.md)

---

## Development Workflow

### Current Process

```bash
# 1. Development
npm run dev              # Local development
npm run test             # Unit/integration tests
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint + TypeScript

# 2. Quality Checks
npm run build            # Production build
npm audit                # Security audit

# 3. Deployment
vercel --prod            # Deploy to production
```

### Recommended Additions

```bash
# After Phase 1 (Production Hardening)
npm run test:coverage    # Coverage reporting (80%+ target)
npm run security:headers # Verify security headers
npm run load:test        # Load testing (k6)

# After Phase 2 (Code Quality)
npm run analyze          # Bundle size analysis
npm run benchmark        # Performance benchmarks
```

---

## Action Items by Priority

### Priority 1: Critical (Do Before Launch)

- [ ] Add rate limiting to API routes (1 day)
- [ ] Add request validation with Zod (1 day)
- [ ] Add security headers (0.5 days)
- [ ] Optimize MediaPipe loading (1 day)

**Total: 3.5 days**

### Priority 2: Important (Next Sprint)

- [ ] Refactor large hooks (2 days)
- [ ] Decompose user-store (1 day)
- [ ] Add test coverage metrics (0.5 days)
- [ ] Implement canvas cleanup (0.5 days)
- [ ] Add structured logging (1 day)

**Total: 5 days**

### Priority 3: Nice to Have (Next Quarter)

- [ ] Repository pattern abstraction (3-4 days)
- [ ] Webhook event logging (1 day)
- [ ] Edge function migration (2 days)
- [ ] Redis caching layer (2 days)
- [ ] Integration test suite (3 days)

**Total: 11-12 days**

---

## Related Documentation

### Internal Documentation

- [Code Style Guide](../standards/code-style.md)
- [API Documentation](../api/)
- [Component Documentation](../components/)
- [Development Guide](../development/)
- [Feature Documentation](../features/)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [MediaPipe Documentation](https://ai.google.dev/edge/mediapipe/solutions/guide)
- [Fabric.js Documentation](http://fabricjs.com/docs/)

---

## Review Schedule

### Quarterly Reviews

- Review architecture against current scale
- Update cost projections
- Assess technical debt
- Plan next quarter improvements

### After Major Changes

- New major feature (e.g., video support)
- Significant refactoring (e.g., repository pattern)
- Infrastructure changes (e.g., edge migration)
- Framework upgrades (e.g., Next.js major version)

### Next Review Due

- **After Phase 6 completion** (Landing & Polish done)
- **Or Q2 2026** (whichever comes first)

---

## Questions or Feedback?

For questions about this architecture documentation:

- **Technical Questions:** Review detailed analysis in [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md)
- **Implementation Questions:** See code samples in [ACTION_PLAN.md](ACTION_PLAN.md)
- **Strategic Questions:** Review [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-04
**Next Review:** After Phase 6 completion or Q2 2026
