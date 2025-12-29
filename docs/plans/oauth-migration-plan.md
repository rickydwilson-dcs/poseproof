# OAuth Migration Plan

> **Created:** 2025-12-28
> **Status:** Planned
> **Linear Project:** Svolta

## Summary

Replace email/password authentication with Google OAuth, Apple OAuth, and Magic Link (passwordless email). This reduces security liability and improves UX.

**Auth Methods:** Google OAuth + Apple OAuth + Magic Link
**Name Collection:** Skip (OAuth provides it; Magic Link users don't need it)

---

## Why This Migration

### Security Benefits

| Concern              | Email/Password         | OAuth/Magic Link        |
| -------------------- | ---------------------- | ----------------------- |
| Password storage     | Our responsibility     | Not our problem         |
| Credential stuffing  | We're a target         | Provider handles it     |
| Password reset flows | We must build & secure | Provider handles it     |
| Breach liability     | User passwords at risk | No passwords to leak    |
| 2FA implementation   | We must add it         | Built into Google/Apple |

### UX Benefits

- Faster signup (1-2 taps vs typing)
- Higher trust ("Sign in with Google" feels safer)
- 20-50% higher conversion rates typical

---

## Why This Migration is Low-Risk

The codebase is already prepared:

- Callback route already handles OAuth codes via `exchangeCodeForSession()`
- Middleware is auth-method agnostic
- User store doesn't depend on password-specific logic
- Database already has `avatar_url` field for OAuth profiles

---

## Implementation Steps

### Step 1: Configure Supabase Providers (Manual - Dashboard)

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → Enable Google
6. Paste credentials

**Apple Sign In:**

1. Go to [Apple Developer](https://developer.apple.com)
2. Create App ID with Sign In with Apple capability
3. Create Services ID for web auth
4. Generate private key
5. In Supabase Dashboard → Authentication → Providers → Enable Apple
6. Configure with Team ID, Key ID, and private key

**Magic Link:**

- Supabase Dashboard → Authentication → Providers
- Ensure Email provider is enabled (Magic Link uses same provider)

### Step 2: Create OAuth Button Component

**New file:** `components/ui/OAuthButtons.tsx`

- Google sign-in button with `signInWithOAuth({ provider: 'google' })`
- Apple sign-in button with `signInWithOAuth({ provider: 'apple' })`
- Loading states for each provider
- Redirect to `/callback` after OAuth

### Step 3: Create Magic Link Form Component

**New file:** `components/ui/MagicLinkForm.tsx`

- Email input field
- "Send Magic Link" button using `signInWithOtp({ email })`
- Success state showing "Check your email" message
- Error handling

### Step 4: Update Login Page

**Modify:** `app/(auth)/login/LoginForm.tsx`

Replace password form with:

1. OAuth buttons (Google + Apple) at top
2. Divider ("or continue with email")
3. Magic Link form below

Remove:

- Password input field
- Password visibility toggle
- "Forgot password?" link
- Password-related state and validation

### Step 5: Update Signup Page

**Modify:** `app/(auth)/signup/page.tsx`

The signup page becomes nearly identical to login:

1. OAuth buttons
2. Divider
3. Magic Link form
4. Different heading ("Create your account" vs "Welcome back")

Remove:

- Full name input (not collecting names)
- Password input and validation
- Email confirmation success screen

### Step 6: Export New Components

**Modify:** `components/ui/index.ts`

Add exports for OAuthButtons and MagicLinkForm

### Step 7: Testing

Test all flows:

- [ ] Google OAuth (new user)
- [ ] Google OAuth (returning user)
- [ ] Apple OAuth (new user)
- [ ] Apple OAuth (returning user)
- [ ] Magic Link (new user)
- [ ] Magic Link (returning user)
- [ ] Callback route handles all three
- [ ] User profile created with OAuth avatar
- [ ] Stripe checkout works with OAuth users

---

## Files Summary

### Create

| File                              | Purpose                      |
| --------------------------------- | ---------------------------- |
| `components/ui/OAuthButtons.tsx`  | Google/Apple sign-in buttons |
| `components/ui/MagicLinkForm.tsx` | Email-only passwordless form |

### Modify

| File                             | Changes                                       |
| -------------------------------- | --------------------------------------------- |
| `app/(auth)/login/LoginForm.tsx` | Replace password form with OAuth + Magic Link |
| `app/(auth)/signup/page.tsx`     | Same as login, different heading              |
| `components/ui/index.ts`         | Export new components                         |

### Unchanged (Already Compatible)

| File                           | Reason                                               |
| ------------------------------ | ---------------------------------------------------- |
| `app/(auth)/callback/route.ts` | Already handles OAuth via `exchangeCodeForSession()` |
| `middleware.ts`                | Auth-method agnostic                                 |
| `stores/user-store.ts`         | Auth-method agnostic                                 |
| `lib/supabase/client.ts`       | No changes needed                                    |
| `lib/supabase/server.ts`       | No changes needed                                    |

---

## Edge Cases

1. **Same email, different providers:** Supabase handles this — links to existing account
2. **OAuth provider doesn't return name:** Fine — we're not collecting names
3. **Apple hides email:** Store the relay email Apple provides; works fine for auth

---

## User Stories (for Linear)

1. **Configure OAuth Providers** - Set up Google and Apple OAuth in Supabase Dashboard
2. **Create OAuth Buttons Component** - Build reusable Google/Apple sign-in buttons
3. **Create Magic Link Form** - Build passwordless email authentication form
4. **Update Login Page** - Replace password form with OAuth + Magic Link
5. **Update Signup Page** - Mirror login page with different heading
6. **Test Auth Flows** - Verify all 6 auth scenarios work correctly
