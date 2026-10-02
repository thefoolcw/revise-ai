import { getDb, schema } from '../db';

export type AuditAction =
  | 'PREMIUM_KEY_VERIFICATION' | 'PREMIUM_ENTITLEMENT_GRANTED' | 'PREMIUM_ENTITLEMENT_REVOKED'
  | 'ENTITLEMENT_MANUAL_GRANT' | 'MODEL_ENABLED' | 'MODEL_DISABLED' | 'MODEL_CATALOG_REFRESHED'
  | 'ROLE_CHANGED' | 'CONFIG_CHANGED' | 'ACCOUNT_DELETED' | 'USER_LOGIN' | 'USER_LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUESTED' | 'PASSWORD_RESET_COMPLETED' | 'FLAG_CHANGED'
  | 'DATA_EXPORTED' | 'SESSION_REVOKED';

/** Append-only privileged-action record. Metadata must already be secret-free. */
export async function audit(input: {
  actorId: string | null;
  action: AuditAction;
  target?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  ipHint?: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({
    actorId: input.actorId,
    action: input.action,
    target: input.target ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    ipHint: input.ipHint ?? null
  });
}
