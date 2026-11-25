"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Case_1 = require("../models/Case");
const Alert_1 = require("../models/Alert");
const VoiceAnalysis_1 = require("../models/VoiceAnalysis");
const EmailAnalysis_1 = require("../models/EmailAnalysis");
const IdentityAnalysis_1 = require("../models/IdentityAnalysis");
const BlockchainAnalysis_1 = require("../models/BlockchainAnalysis");
const Entity_1 = require("../models/Entity");
const User_1 = require("../models/User");
const getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        const [totalCases, activeCases, highRiskCases, criticalAlerts, totalEntities, voiceAnalyses, emailAnalyses, identityAnalyses, blockchainAnalyses, recentAlerts, unreadAlerts, casesByStatus, casesByPriority, recentCases, totalUsers,] = await Promise.all([
            Case_1.Case.countDocuments(),
            Case_1.Case.countDocuments({ status: { $in: ['OPEN', 'ACTIVE'] } }),
            Case_1.Case.countDocuments({ riskScore: { $gte: 70 } }),
            Alert_1.Alert.countDocuments({ severity: 'CRITICAL', isRead: false }),
            Entity_1.Entity.countDocuments(),
            VoiceAnalysis_1.VoiceAnalysis.countDocuments(),
            EmailAnalysis_1.EmailAnalysis.countDocuments(),
            IdentityAnalysis_1.IdentityAnalysis.countDocuments(),
            BlockchainAnalysis_1.BlockchainAnalysis.countDocuments(),
            Alert_1.Alert.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).limit(10).select('title message severity category createdAt isRead'),
            Alert_1.Alert.countDocuments({ isRead: false }),
            Case_1.Case.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Case_1.Case.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Case_1.Case.find().sort({ lastActivityAt: -1 }).limit(5).populate('assignedTo', 'name').select('caseId title status priority riskScore lastActivityAt'),
            User_1.User.countDocuments({ isActive: true }),
        ]);
        // Build trend data (last 7 days)
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 3600 * 1000);
            const start = new Date(date.setHours(0, 0, 0, 0));
            const end = new Date(date.setHours(23, 59, 59, 999));
            const [cases, alerts] = await Promise.all([
                Case_1.Case.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                Alert_1.Alert.countDocuments({ createdAt: { $gte: start, $lte: end } }),
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
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboard.controller.js.map