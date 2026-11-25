import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Alert } from '../models/Alert';
import { createError } from '../middleware/errorHandler';

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, severity, isRead, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    if (severity) filter.severity = severity;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Alert.countDocuments(filter),
    ]);
    res.json({ success: true, data: alerts, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

export const markAlertRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!alert) return next(createError('Alert not found', 404));
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) { next(err); }
};

export const acknowledgeAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, {
      isAcknowledged: true, acknowledgedBy: req.user!.id, acknowledgedAt: new Date(), isRead: true,
    }, { new: true });
    if (!alert) return next(createError('Alert not found', 404));
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};
