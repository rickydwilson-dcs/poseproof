-- Create audit_logs table for comprehensive audit logging
-- Purpose: Track user actions for compliance and security monitoring
-- Related: SECURITY_NEXT_STEPS.md P2-1

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE audit_logs IS 'Audit trail for user actions and security events';
COMMENT ON COLUMN audit_logs.action IS 'Action type: auth.signup, auth.login, auth.logout, account.delete, subscription.created, subscription.cancelled, export.created, export.failed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected: user, subscription, export';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action (JSON format)';
