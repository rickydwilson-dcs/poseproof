-- Migration: Create exports analytics table
--
-- Purpose: Track every export event for conversion funnel analytics
-- - Captures all exports (anonymous, free, pro)
-- - Enables queries like: exports per day, conversion rates, user type breakdown
-- - Separate from 'usage' table which is for limit enforcement

-- =============================================================================
-- 1. CREATE EXPORTS TABLE
-- =============================================================================
CREATE TABLE public.exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (nullable for anonymous users)
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- User type at time of export
  user_type text NOT NULL CHECK (user_type IN ('anonymous', 'free', 'pro')),

  -- Anonymous user tracking (browser fingerprint or session ID)
  -- Allows counting unique anonymous users without identifying them
  anon_id text,

  -- Export metadata
  export_format text NOT NULL CHECK (export_format IN ('png', 'gif')),
  aspect_ratio text CHECK (aspect_ratio IN ('1:1', '4:5', '9:16')),

  -- Timestamps
  exported_at timestamptz NOT NULL DEFAULT now(),

  -- Optional: track if this led to a signup (can be updated later)
  converted_to_signup boolean DEFAULT false,
  converted_at timestamptz
);

-- =============================================================================
-- 2. CREATE INDEXES FOR ANALYTICS QUERIES
-- =============================================================================

-- Index for time-based queries (exports per day/week/month)
CREATE INDEX idx_exports_exported_at ON public.exports(exported_at DESC);

-- Index for user type breakdown
CREATE INDEX idx_exports_user_type ON public.exports(user_type);

-- Index for user-specific queries
CREATE INDEX idx_exports_user_id ON public.exports(user_id) WHERE user_id IS NOT NULL;

-- Index for anonymous user tracking
CREATE INDEX idx_exports_anon_id ON public.exports(anon_id) WHERE anon_id IS NOT NULL;

-- Composite index for common analytics query
CREATE INDEX idx_exports_analytics ON public.exports(exported_at DESC, user_type);

-- =============================================================================
-- 3. ENABLE RLS
-- =============================================================================
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from authenticated users and anonymous (via API)
-- The API will handle validation, RLS just needs to allow the insert
CREATE POLICY "Allow insert exports"
  ON public.exports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Users can read their own export history
CREATE POLICY "Users can read own exports"
  ON public.exports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Admin/analytics queries should use service role which bypasses RLS

-- =============================================================================
-- 4. ADD COMMENTS
-- =============================================================================
COMMENT ON TABLE public.exports IS 'Event log of all exports for analytics and conversion tracking. One row per export.';
COMMENT ON COLUMN public.exports.user_type IS 'User tier at time of export: anonymous (not logged in), free (logged in, free tier), pro (paid subscriber)';
COMMENT ON COLUMN public.exports.anon_id IS 'Browser fingerprint or session ID for anonymous users - enables counting unique anonymous users';
COMMENT ON COLUMN public.exports.converted_to_signup IS 'Set to true if this anonymous user later signed up (for conversion tracking)';
