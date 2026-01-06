-- Add RLS policy for subscriptions table
-- Users should be able to read their own subscription

-- Enable RLS if not already enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all subscriptions (for webhooks, admin scripts)
-- This is implicit as service role bypasses RLS, but we document it here

COMMENT ON TABLE public.subscriptions IS 'User subscription records with RLS - users can only read their own subscription';
