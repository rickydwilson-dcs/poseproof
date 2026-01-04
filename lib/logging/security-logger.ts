/**
 * Security Event Logging System
 *
 * Purpose: Log security events for threat detection, incident response, and monitoring
 * Related: SECURITY_NEXT_STEPS.md P2-3
 *
 * Usage:
 * ```typescript
 * import { logSecurityEvent } from '@/lib/logging/security-logger';
 *
 * await logSecurityEvent({
 *   level: 'warning',
 *   event: 'auth.failed_login',
 *   userId: user.id,
 *   metadata: { email, reason: 'invalid_password' },
 *   ipAddress: request.headers.get('x-forwarded-for'),
 *   userAgent: request.headers.get('user-agent')
 * });
 * ```
 */

import { createClient } from '@/lib/supabase/server';

export type SecurityEventLevel = 'info' | 'warning' | 'critical';

export type SecurityEventType =
  | 'auth.failed_login'
  | 'auth.suspicious_activity'
  | 'auth.account_locked'
  | 'rate_limit.exceeded'
  | 'rate_limit.warning'
  | 'api.unauthorized_access'
  | 'api.invalid_request'
  | 'payment.fraud_detected'
  | 'payment.chargeback'
  | 'data.unauthorized_access'
  | 'data.export_anomaly'
  | 'system.configuration_change'
  | 'system.error';

export interface SecurityEvent {
  level: SecurityEventLevel;
  event: SecurityEventType | string;
  userId?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a security event to both console (for Vercel) and database
 *
 * @param event - The security event to log
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const timestamp = new Date().toISOString();

  // Format log message for structured logging
  const logMessage = JSON.stringify({
    type: 'SECURITY_EVENT',
    timestamp,
    level: event.level,
    event: event.event,
    userId: event.userId,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent?.substring(0, 200), // Truncate user agent
    metadata: event.metadata,
  });

  // Log to console (Vercel/production logging)
  if (event.level === 'critical') {
    console.error('[SECURITY] CRITICAL:', logMessage);
  } else if (event.level === 'warning') {
    console.warn('[SECURITY] WARNING:', logMessage);
  } else {
    console.info('[SECURITY] INFO:', logMessage);
  }

  // Store in database for analysis and alerting
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('security_events').insert({
      level: event.level,
      event: event.event,
      user_id: event.userId,
      metadata: event.metadata,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      created_at: timestamp
    });

    if (error) {
      console.error('[SecurityLogger] Failed to store security event:', error);
    }
  } catch (error) {
    // Fail gracefully - security logging should never break the main operation
    console.error('[SecurityLogger] Exception while logging security event:', error);
  }
}

/**
 * Log a failed authentication attempt
 *
 * @param email - The email used in the attempt
 * @param reason - Why the attempt failed
 * @param request - The HTTP request
 */
export async function logFailedLogin(
  email: string,
  reason: string,
  request: Request
): Promise<void> {
  await logSecurityEvent({
    level: 'warning',
    event: 'auth.failed_login',
    metadata: {
      email,
      reason,
      timestamp: new Date().toISOString()
    },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
}

/**
 * Log a rate limit violation
 *
 * @param identifier - The identifier being rate limited (user ID, IP, etc.)
 * @param endpoint - The endpoint being accessed
 * @param request - The HTTP request
 */
export async function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  request: Request
): Promise<void> {
  await logSecurityEvent({
    level: 'warning',
    event: 'rate_limit.exceeded',
    metadata: {
      identifier,
      endpoint,
      timestamp: new Date().toISOString()
    },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
}

/**
 * Log unauthorized access attempt
 *
 * @param userId - The user attempting unauthorized access (if known)
 * @param resource - The resource being accessed
 * @param request - The HTTP request
 */
export async function logUnauthorizedAccess(
  userId: string | undefined,
  resource: string,
  request: Request
): Promise<void> {
  await logSecurityEvent({
    level: 'critical',
    event: 'api.unauthorized_access',
    userId,
    metadata: {
      resource,
      timestamp: new Date().toISOString()
    },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
}

/**
 * Get recent critical security events (for monitoring dashboard)
 *
 * @param limit - Maximum number of events to return (default: 50)
 * @returns Array of critical security events
 */
export async function getCriticalSecurityEvents(
  limit: number = 50
): Promise<Array<{
  id: string;
  event: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('security_events')
      .select('id, event, user_id, metadata, ip_address, created_at')
      .eq('level', 'critical')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[SecurityLogger] Failed to fetch critical events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SecurityLogger] Exception while fetching critical events:', error);
    return [];
  }
}
