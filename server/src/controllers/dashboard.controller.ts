import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Case } from '../models/Case';
import { Alert } from '../models/Alert';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import { EmailAnalysis } from '../models/EmailAnalysis';
import { IdentityAnalysis } from '../models/IdentityAnalysis';
import { BlockchainAnalysis } from '../models/BlockchainAnalysis';
import { Entity } from '../models/Entity';
import { User } from '../models/User';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const [
      totalCases, activeCases, highRiskCases, criticalAlerts,
      totalEntities, voiceAnalyses, emailAnalyses, identityAnalyses, blockchainAnalyses,
      recentAlerts, unreadAlerts, casesByStatus, casesByPriority,
      recentCases, totalUsers,
    ] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: { $in: ['OPEN', 'ACTIVE'] } }),
      Case.countDocuments({ riskScore: { $gte: 70 } }),
      Alert.countDocuments({ severity: 'CRITICAL', isRead: false }),
      Entity.countDocuments(),
      VoiceAnalysis.countDocuments(),
      EmailAnalysis.countDocuments(),
      IdentityAnalysis.countDocuments(),
      BlockchainAnalysis.countDocuments(),
      Alert.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).limit(10).select('title message severity category createdAt isRead'),
      Alert.countDocuments({ isRead: false }),
      Case.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Case.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Case.find().sort({ lastActivityAt: -1 }).limit(5).populate('assignedTo', 'name').select('caseId title status priority riskScore lastActivityAt'),
      User.countDocuments({ isActive: true }),
    ]);

    // Build trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const [cases, alerts] = await Promise.all([
        Case.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Alert.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      ]);
      trendData.push({ date: start.toISOString().split('T')[0], cases, alerts });
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalCases, activeCases, highRiskCases, criticalAlerts,
          totalEntities, unreadAlerts, totalUsers,
        },
        analyses: { voiceAnalyses, emailAnalyses, identityAnalyses, blockchainAnalyses },
        casesByStatus: Object.fromEntries(casesByStatus.map(s => [s._id, s.count])),
        casesByPriority: Object.fromEntries(casesByPriority.map(p => [p._id, p.count])),
        recentCases,
        recentAlerts,
        trendData,
      },
    });
  } catch (err) { next(err); }
};
