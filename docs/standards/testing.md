# Testing Standards

This document outlines the testing strategy and standards for PoseProof.

## Testing Stack

- **Unit/Integration Tests:** Vitest + Testing Library
- **E2E Tests:** Playwright
- **Coverage:** V8 provider via Vitest

## Test File Conventions

| Test Type  | Location                     | Naming                    |
| ---------- | ---------------------------- | ------------------------- |
| Unit tests | `tests/` or alongside source | `*.test.ts`, `*.test.tsx` |
| E2E tests  | `e2e/`                       | `*.spec.ts`               |
| Fixtures   | `tests/fixtures/`            | Any                       |

## Test Commands

```bash
# Unit tests
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report

# E2E tests
npm run test:e2e       # All E2E tests
npm run test:e2e:smoke # Smoke tests only (@smoke tag)
npm run test:e2e:ui    # Interactive UI mode
```

## Tiered Testing Strategy

### Tier 1: Smoke Tests (~30 seconds)

- Tagged with `@smoke` in E2E tests
- Critical user paths only
- Run on every push to `develop`

### Tier 2: Standard Tests (2-3 minutes)

- All unit tests + standard E2E
- Run on pushes to `staging`

### Tier 3: Full Suite (10+ minutes)

- Comprehensive coverage
- Run manually before major releases

## Test Coverage Expectations

| Area               | Target | Priority |
| ------------------ | ------ | -------- |
| Utility functions  | 80%+   | High     |
| State stores       | 70%+   | High     |
| API routes         | 70%+   | High     |
| React components   | 50%+   | Medium   |
| E2E critical paths | 100%   | High     |

## Writing Good Tests

### Unit Tests

```typescript
describe("FeatureName", () => {
  it("should describe the expected behavior", () => {
    // Arrange
    const input = createTestData();

    // Act
    const result = featureFunction(input);

    // Assert
    expect(result).toMatchObject({ expected: "value" });
  });
});
```

### E2E Tests

```typescript
test("should complete critical user flow", async ({ page }) => {
  // Navigate
  await page.goto("/feature");

  // Interact
  await page.click('button[data-testid="action"]');

  // Assert
  await expect(page.locator(".result")).toBeVisible();
});
```

## Mocking Guidelines

### What to Mock

- External APIs (Stripe, Supabase)
- Browser APIs not available in jsdom
- Time-dependent functions

### What NOT to Mock

- Internal utility functions
- React component interactions
- State management

## CI Integration

Tests run automatically on:

- `develop` branch: Unit tests + Smoke E2E
- `staging` branch: Unit tests + Full E2E
- `main` branch: Unit tests only (E2E verified on staging)

See `.github/workflows/ci.yml` for details.
