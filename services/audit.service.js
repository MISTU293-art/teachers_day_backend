const AuditLog = require('../models/auditLog.model');

/**
 * Creates an audit log record
 */
const log = async ({
  user = null,
  userName = 'System',
  userRole = 'system',
  action,
  module,
  recordId = null,
  description,
  req = null,
  metadata = null
}) => {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown';

    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
      userAgent = req.headers['user-agent'] || 'Unknown';
      if (req.user) {
        user = user || req.user._id;
        userName = userName !== 'System' ? userName : req.user.name;
        userRole = userRole !== 'system' ? userRole : req.user.role;
      }
    }

    const auditEntry = new AuditLog({
      user,
      userName,
      userRole,
      action,
      module,
      recordId: recordId ? recordId.toString() : null,
      description,
      ipAddress,
      userAgent,
      metadata
    });

    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('[Audit Log Error] Failed to write audit trail:', error.message);
    return null;
  }
};

module.exports = {
  log
};
