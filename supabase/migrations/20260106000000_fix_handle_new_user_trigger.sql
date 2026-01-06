-- Migration: Fix handle_new_user trigger to match actual profiles table schema
-- Date: 2026-01-06
-- Issue: "Database error saving new user" on Google OAuth signup
--
-- Root cause: The handle_new_user trigger is trying to insert columns that don't exist
-- in the profiles table (subscription_tier, subscription_status, stripe_customer_id, etc.)
--
-- The actual profiles table only has: id, email, full_name, avatar_url, logo_url, created_at, updated_at
-- Subscription data is stored in a separate 'subscriptions' table

-- =============================================================================
-- 1. DROP AND RECREATE THE TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with only the columns that exist in the profiles table
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create a default free subscription for the new user
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (
    NEW.id,
    'free',
    'active'
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile or subscription already exists, that's fine
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. ENSURE THE TRIGGER EXISTS
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Ensure the function has access to insert into the tables
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT ALL ON public.subscriptions TO postgres, service_role;

-- =============================================================================
-- 4. ADD MISSING custom_background_url COLUMN TO PROFILES IF IT DOESN'T EXIST
-- =============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS custom_background_url TEXT;

COMMENT ON COLUMN public.profiles.custom_background_url IS 'URL to user uploaded custom background image for exports (Pro feature)';
