const mongoose = require('mongoose');
const { AUDIT_MODULES, AUDIT_ACTIONS } = require('../config/constants');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userName: {
      type: String,
      default: 'System'
    },
    userRole: {
      type: String,
      default: 'system'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    module: {
      type: String,
      enum: Object.values(AUDIT_MODULES),
      required: true,
      index: true
    },
    recordId: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
