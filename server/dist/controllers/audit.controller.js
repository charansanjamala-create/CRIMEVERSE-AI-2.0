"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.recordAuditLog = void 0;
const AuditLog_1 = require("../models/AuditLog");
// Helper to log audit event
const recordAuditLog = async (req, action, resourceType, resourceId, details) => {
    try {
        const user = req.user;
        await AuditLog_1.AuditLog.create({
            userId: user?.id,
            userName: user?.name || 'Anonymous',
            userRole: user?.role || 'GUEST',
            action,
            resourceType,
            resourceId,
            details: details || {},
            ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown',
        });
    }
    catch (err) {
        // Non-blocking for audit logging errors
        console.error('Failed to log audit event:', err);
    }
};
exports.recordAuditLog = recordAuditLog;
// Get audit logs for Admin panel
const getAuditLogs = async (req, res, next) => {
    try {
        const { action, resourceType, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (action)
            filter.action = action;
        if (resourceType)
            filter.resourceType = resourceType;
        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            AuditLog_1.AuditLog.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=audit.controller.js.map