-- Migration: Add RLS policies to usage table
--
-- Issue: usage table missing RLS policies, preventing client-side reads
-- and server-side upserts for authenticated users.
--
-- This migration:
-- 1. Enables RLS on usage table
-- 2. Creates policies for authenticated users to manage their own records

-- 1. ENABLE RLS
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- 2. CREATE RLS POLICIES

-- Policy: Users can read their own usage records
CREATE POLICY "Users can read own usage"
  ON public.usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own usage records
CREATE POLICY "Users can insert own usage"
  ON public.usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own usage records
CREATE POLICY "Users can update own usage"
  ON public.usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE public.usage IS 'Monthly export usage tracking per user. RLS enabled - users can only access their own records.';
