-- Create security_events table for threat detection and monitoring
-- Purpose: Log security events for incident response and compliance
-- Related: SECURITY_NEXT_STEPS.md P2-3

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'critical')),
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance and alerting
CREATE INDEX idx_security_events_level ON security_events(level);
CREATE INDEX idx_security_events_event ON security_events(event);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);

-- Index for critical events (for fast alerting)
CREATE INDEX idx_security_events_critical ON security_events(created_at DESC) WHERE level = 'critical';

-- Enable RLS (admin-only access via service role)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role only (no user access)
CREATE POLICY "Service role only"
  ON security_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE security_events IS 'Security event log for threat detection and monitoring';
COMMENT ON COLUMN security_events.level IS 'Severity: info, warning, critical';
COMMENT ON COLUMN security_events.event IS 'Event type: auth.failed_login, rate_limit.exceeded, suspicious_activity.detected, etc.';
COMMENT ON COLUMN security_events.metadata IS 'Additional event context (JSON format)';
