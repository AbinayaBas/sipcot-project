const AuditLog = require('../models/AuditLog');

async function logAudit({
  actorId,
  actorRole,
  action,
  summary,
  entityType,
  entityId,
  industryId,
  metadata,
}) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole,
      action,
      summary,
      entityType,
      entityId,
      industry: industryId || undefined,
      metadata: metadata || undefined,
    });
  } catch (e) {
    console.error('AuditLog write failed:', e.message);
  }
}

module.exports = { logAudit };
