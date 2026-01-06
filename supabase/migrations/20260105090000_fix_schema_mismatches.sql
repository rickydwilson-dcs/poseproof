-- Migration: Fix schema mismatches between database and application code
-- Date: 2026-01-05
-- Issue: Code expects 'tier' column in subscriptions and 'month'/'last_export_at' in usage table
--
-- Current schema vs Expected schema:
-- subscriptions: 'plan' -> 'tier'
-- usage: 'period_start' -> 'month', add 'last_export_at'

-- =============================================================================
-- 1. FIX SUBSCRIPTIONS TABLE
-- =============================================================================
-- Rename 'plan' column to 'tier' to match TypeScript types
ALTER TABLE public.subscriptions
RENAME COLUMN plan TO tier;

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.tier IS 'Subscription tier: free or pro';

-- =============================================================================
-- 2. FIX USAGE TABLE
-- =============================================================================
-- Rename 'period_start' to 'month' (stored as varchar YYYY-MM format)
-- First, we need to change the data type since period_start is likely a date
-- and month should be a varchar like '2026-01'

-- Step 2a: Add new 'month' column
ALTER TABLE public.usage
ADD COLUMN month VARCHAR(7);

-- Step 2b: Migrate existing data (convert date to YYYY-MM format)
UPDATE public.usage
SET month = TO_CHAR(period_start, 'YYYY-MM')
WHERE period_start IS NOT NULL;

-- Step 2c: Make month NOT NULL (after data migration)
ALTER TABLE public.usage
ALTER COLUMN month SET NOT NULL;

-- Step 2d: Drop old period_start column
ALTER TABLE public.usage
DROP COLUMN period_start;

-- Step 2e: Add 'last_export_at' column
ALTER TABLE public.usage
ADD COLUMN last_export_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.usage.month IS 'Billing period in YYYY-MM format';
COMMENT ON COLUMN public.usage.last_export_at IS 'Timestamp of last export in this period';

-- =============================================================================
-- 3. UPDATE UNIQUE CONSTRAINT FOR USAGE TABLE
-- =============================================================================
-- The upsert uses (user_id, month) as conflict target
-- Check if constraint exists and recreate it

-- Drop existing constraint if it uses period_start
DO $$
BEGIN
  -- Try to drop the old constraint (may fail if doesn't exist)
  ALTER TABLE public.usage DROP CONSTRAINT IF EXISTS usage_user_id_period_start_key;
  ALTER TABLE public.usage DROP CONSTRAINT IF EXISTS usage_user_period_unique;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Constraint doesn't exist, that's fine
END $$;

-- Create new unique constraint on (user_id, month)
ALTER TABLE public.usage
ADD CONSTRAINT usage_user_month_unique UNIQUE (user_id, month);

-- =============================================================================
-- 4. VERIFICATION QUERIES (run manually to verify)
-- =============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'subscriptions' AND table_schema = 'public';
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'usage' AND table_schema = 'public';
