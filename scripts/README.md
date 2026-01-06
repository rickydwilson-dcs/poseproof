# Scripts

Utility scripts for Svolta development and testing.

## Grant Pro Access

Grant pro tier access to users for testing purposes.

### Usage

```bash
# Grant pro access to a single user
npx tsx scripts/grant-pro-access.ts user@example.com

# Grant pro access to multiple users
npx tsx scripts/grant-pro-access.ts user1@example.com user2@example.com user3@example.com
```

### What it does

1. Looks up the user by email in the `profiles` table
2. Updates their `subscription_tier` to `pro` and `subscription_status` to `active`
3. Creates or updates a subscription record with a 1-year validity period
4. Bypasses Row Level Security using the service role key

### Requirements

- `NEXT_PUBLIC_SUPABASE_URL` must be set in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` must be set in `.env.local`
- User must already exist in the database (they need to have signed up first)

### Example Output

```
🚀 Grant Pro Access Script
══════════════════════════════════════════════════

🔍 Looking up user: test@example.com
   ✓ Found user: 123e4567-e89b-12d3-a456-426614174000
   Current tier: free
   Current status: none
   ✓ Updated profile to pro tier
   ✓ Updated subscription record
   ✅ Successfully granted pro access to test@example.com
   Valid until: 1/4/2027

══════════════════════════════════════════════════
✅ Success: 1
══════════════════════════════════════════════════
```

### Troubleshooting

**Error: User not found**

- Make sure the user has signed up and exists in the database
- Check that the email is correct (case-sensitive)

**Error: Missing Supabase environment variables**

- Verify `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Make sure you're running from the project root directory

**Warning: Failed to update subscription**

- The profile was still updated to pro tier
- The subscription table might have conflicting data
- Check Supabase logs for more details
