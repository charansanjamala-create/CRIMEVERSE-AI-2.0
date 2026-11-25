"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeAlert = exports.markAllRead = exports.markAlertRead = exports.getAlerts = void 0;
const Alert_1 = require("../models/Alert");
const errorHandler_1 = require("../middleware/errorHandler");
const getAlerts = async (req, res, next) => {
    try {
        const { caseId, severity, isRead, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (caseId)
            filter.caseId = caseId;
        if (severity)
            filter.severity = severity;
        if (isRead !== undefined)
            filter.isRead = isRead === 'true';
        const skip = (Number(page) - 1) * Number(limit);
        const [alerts, total] = await Promise.all([
            Alert_1.Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Alert_1.Alert.countDocuments(filter),
        ]);
        res.json({ success: true, data: alerts, pagination: { total, page: Number(page), limit: Number(limit) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAlerts = getAlerts;
const markAlertRead = async (req, res, next) => {
    try {
        const alert = await Alert_1.Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!alert)
            return next((0, errorHandler_1.createError)('Alert not found', 404));
        res.json({ success: true, data: alert });
    }
    catch (err) {
        next(err);
    }
};
exports.markAlertRead = markAlertRead;
const markAllRead = async (req, res, next) => {
    try {
        await Alert_1.Alert.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All alerts marked as read' });
    }
    catch (err) {
        next(err);
    }
};
exports.markAllRead = markAllRead;
const acknowledgeAlert = async (req, res, next) => {
    try {
        const alert = await Alert_1.Alert.findByIdAndUpdate(req.params.id, {
            isAcknowledged: true, acknowledgedBy: req.user.id, acknowledgedAt: new Date(), isRead: true,
        }, { new: true });
        if (!alert)
            return next((0, errorHandler_1.createError)('Alert not found', 404));
        res.json({ success: true, data: alert });
    }
    catch (err) {
        next(err);
    }
};
exports.acknowledgeAlert = acknowledgeAlert;
//# sourceMappingURL=alerts.controller.js.map