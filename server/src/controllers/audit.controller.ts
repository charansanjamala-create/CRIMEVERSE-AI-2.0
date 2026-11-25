import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { AuditLog } from '../models/AuditLog';

// Helper to log audit event
export const recordAuditLog = async (
  req: AuthRequest | Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
) => {
  try {
    const user = (req as AuthRequest).user;
    await AuditLog.create({
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
  } catch (err) {
    // Non-blocking for audit logging errors
    console.error('Failed to log audit event:', err);
  }
};

// Get audit logs for Admin panel
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, resourceType, page = 1, limit = 50 } = req.query;
    const filter: any = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter),
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
  } catch (err) {
    next(err);
  }
};
