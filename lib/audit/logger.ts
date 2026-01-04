/**
 * Audit Logging System
 *
 * Purpose: Track user actions for compliance, security monitoring, and debugging
 * Related: SECURITY_NEXT_STEPS.md P2-1
 *
 * Usage:
 * ```typescript
 * import { logAuditEvent } from '@/lib/audit/logger';
 *
 * await logAuditEvent(userId, {
 *   action: 'export.created',
 *   resourceType: 'export',
 *   resourceId: exportId,
 *   metadata: { format: 'png', hasWatermark: true }
 * }, request);
 * ```
 */

import { createClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'auth.signup'
  | 'auth.login'
  | 'auth.logout'
  | 'account.delete'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.updated'
  | 'export.created'
  | 'export.failed'
  | 'background.uploaded'
  | 'background.deleted'
  | 'usage.incremented';

export type AuditResourceType = 'user' | 'subscription' | 'export' | 'background' | 'usage';

export interface AuditEvent {
  action: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to the database
 *
 * @param userId - The user ID performing the action
 * @param event - The audit event details
 * @param request - The HTTP request (for IP and user agent)
 */
export async function logAuditEvent(
  userId: string,
  event: AuditEvent,
  request: Request
): Promise<void> {
  try {
    const supabase = await createClient();

    // Extract IP address (try multiple headers for proxy setups)
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      metadata: event.metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString()
    });

    if (error) {
      // Log error but don't fail the operation
      console.error('[AuditLogger] Failed to log audit event:', {
        error,
        userId,
        action: event.action,
      });
    }
  } catch (error) {
    // Fail gracefully - audit logging should never break the main operation
    console.error('[AuditLogger] Exception while logging audit event:', error);
  }
}

/**
 * Log multiple audit events in a single transaction (for bulk operations)
 *
 * @param userId - The user ID performing the actions
 * @param events - Array of audit events
 * @param request - The HTTP request
 */
export async function logAuditEvents(
  userId: string,
  events: AuditEvent[],
  request: Request
): Promise<void> {
  try {
    const supabase = await createClient();

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const timestamp = new Date().toISOString();

    const records = events.map(event => ({
      user_id: userId,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      metadata: event.metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: timestamp
    }));

    const { error } = await supabase.from('audit_logs').insert(records);

    if (error) {
      console.error('[AuditLogger] Failed to log bulk audit events:', {
        error,
        userId,
        eventCount: events.length,
      });
    }
  } catch (error) {
    console.error('[AuditLogger] Exception while logging bulk audit events:', error);
  }
}

/**
 * Get audit logs for a specific user (for settings page display)
 *
 * @param userId - The user ID to fetch logs for
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Array of audit log entries
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, resource_type, resource_id, metadata, ip_address, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[AuditLogger] Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[AuditLogger] Exception while fetching audit logs:', error);
    return [];
  }
}
