const AuditLog = require('../models/auditLog.model');
const { getPagination, buildPaginationData } = require('../utils/pagination');
const { AUDIT_MODULES, AUDIT_ACTIONS } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * SuperAdmin: View complete audit trail with filters & pagination
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { module, action, search } = req.query;

  const filter = {};

  if (module && Object.values(AUDIT_MODULES).includes(module)) {
    filter.module = module;
  }

  if (action) {
    filter.action = action;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { userName: regex },
      { description: regex },
      { ipAddress: regex }
    ];
  }

  const [logs, totalRecords] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter)
  ]);

  const pagination = buildPaginationData(totalRecords, page, limit);

  res.render('audit/index', {
    title: 'Audit Logs & Security Trail | SuperAdmin Portal',
    logs,
    pagination,
    modules: Object.values(AUDIT_MODULES),
    actions: Object.values(AUDIT_ACTIONS),
    query: req.query,
    currentUser: req.user
  });
});

module.exports = {
  listAuditLogs
};
