-- Migration: Fix handle_new_user trigger (v2)
-- Run this in Supabase Dashboard SQL Editor
-- Make sure to run as postgres/superuser role

-- Step 1: Check what the current function looks like
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Step 2: Replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with only the columns that actually exist
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create a default free subscription
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (
    NEW.id,
    'free',
    'active'
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Already exists, that's fine
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Verify the trigger exists on auth.users
-- If not, you need to create it (requires superuser):
--
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();
