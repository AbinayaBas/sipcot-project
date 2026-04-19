const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: ['admin', 'industry'], required: true },
    action: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    industry: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
