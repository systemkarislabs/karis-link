import prisma from './prisma';
import { getRequestIp } from './rate-limit';

/**
 * Trilha de auditoria para eventos sensíveis.
 *
 * Tudo é fail-safe: se a tabela ainda não existir (migração não aplicada),
 * apenas loga no console e segue. Audit log nunca deve quebrar a operação principal.
 */

export type AuditEvent =
  | 'super_login_success'
  | 'super_login_failure'
  | 'super_logout'
  | 'super_credentials_update'
  | 'tenant_create'
  | 'tenant_toggle'
  | 'tenant_delete'
  | 'tenant_logo_update'
  | 'tenant_city_create'
  | 'tenant_city_toggle'
  | 'tenant_city_grouping_toggle'
  | 'tenant_password_update_by_super'
  | 'tenant_login_success'
  | 'tenant_login_failure'
  | 'tenant_password_recovery_request'
  | 'tenant_password_reset_success'
  | 'seller_create'
  | 'seller_update'
  | 'seller_delete'
  | 'qrcode_create'
  | 'qrcode_delete';

type LogParams = {
  event: AuditEvent;
  actor?: string | null;
  tenantId?: string | null;
  metadata?: Record<string, unknown>;
};

let auditAvailable: boolean | null = null;

export async function logAuditEvent({ event, actor, tenantId, metadata }: LogParams) {
  if (auditAvailable === false) {
    // Se já sabemos que não está disponível, só loga em console.
    console.info('[audit:fallback]', { event, actor, tenantId, metadata });
    return;
  }

  try {
    const ip = await getRequestIp().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).auditLog.create({
      data: {
        event,
        actor: actor ?? null,
        tenantId: tenantId ?? null,
        ip,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
    auditAvailable = true;
  } catch (error) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: string }).message)
        : '';

    const tableMissing =
      message.includes('audit_log') ||
      message.includes('AuditLog') ||
      message.includes('does not exist') ||
      message.includes('relation');

    if (tableMissing && auditAvailable === null) {
      console.warn('[audit] tabela AuditLog indisponível — eventos serão apenas logados em console.');
    }
    auditAvailable = false;
    console.info('[audit:fallback]', { event, actor, tenantId, metadata });
  }
}
