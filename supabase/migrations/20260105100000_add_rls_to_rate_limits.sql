-- Migration: Add RLS to rate_limits table
-- Date: 2026-01-05
-- Issue: rate_limits table missing RLS policy
--
-- Note: The table is primarily accessed via SECURITY DEFINER functions
-- (check_rate_limit, cleanup_old_rate_limits), but RLS should still be
-- enabled as defense-in-depth to prevent direct table access.

-- =============================================================================
-- 1. ENABLE RLS
-- =============================================================================
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. CREATE RLS POLICIES
-- =============================================================================

-- Users can only view their own rate limit records
CREATE POLICY "Users can view own rate limits"
  ON public.rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own rate limit records
CREATE POLICY "Users can insert own rate limits"
  ON public.rate_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limit records
CREATE POLICY "Users can update own rate limits"
  ON public.rate_limits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rate limit records
CREATE POLICY "Users can delete own rate limits"
  ON public.rate_limits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- 3. SERVICE ROLE ACCESS
-- =============================================================================
-- The service role bypasses RLS by default, which is needed for:
-- - Backend cleanup jobs
-- - Admin operations

-- Add comment for documentation
COMMENT ON TABLE public.rate_limits IS 'Stores rate limiting data per user per endpoint with sliding window. RLS enabled - users can only access their own records.';
