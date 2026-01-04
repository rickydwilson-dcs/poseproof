-- Create rate_limits table for API rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint, window_start)
);

-- Create indexes for performance
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- Cleanup function for old entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function for atomic rate limit check/increment
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
) RETURNS JSON AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_remaining INTEGER;
  v_reset TIMESTAMPTZ;
BEGIN
  -- Calculate window start (truncate to window boundary)
  v_window_start := DATE_TRUNC('second', NOW()) -
    (EXTRACT(EPOCH FROM NOW())::INTEGER % p_window_seconds) * INTERVAL '1 second';

  v_reset := v_window_start + (p_window_seconds || ' seconds')::INTERVAL;

  -- Upsert and get current count
  INSERT INTO rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (p_user_id, p_endpoint, v_window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET
    request_count = rate_limits.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_count;

  v_remaining := GREATEST(0, p_max_requests - v_count);

  RETURN json_build_object(
    'success', v_count <= p_max_requests,
    'count', v_count,
    'limit', p_max_requests,
    'remaining', v_remaining,
    'reset', EXTRACT(EPOCH FROM v_reset)::INTEGER
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE rate_limits IS 'Stores rate limiting data per user per endpoint with sliding window';
COMMENT ON FUNCTION check_rate_limit IS 'Atomically checks and increments rate limit for a user on a specific endpoint';
COMMENT ON FUNCTION cleanup_old_rate_limits IS 'Removes rate limit entries older than 1 hour (should be run periodically)';
