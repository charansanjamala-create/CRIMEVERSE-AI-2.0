"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainAnalysis = exports.getBlockchainHistory = exports.analyzeBlockchain = void 0;
const BlockchainAnalysis_1 = require("../models/BlockchainAnalysis");
const Case_1 = require("../models/Case");
const Evidence_1 = require("../models/Evidence");
const Alert_1 = require("../models/Alert");
const blockchainTrace_1 = require("../ai/blockchainTrace");
const errorHandler_1 = require("../middleware/errorHandler");
const analyzeBlockchain = async (req, res, next) => {
    try {
        const { walletAddress, blockchain, caseId } = req.body;
        if (!walletAddress)
            return next((0, errorHandler_1.createError)('Wallet address is required', 400));
        const result = await (0, blockchainTrace_1.analyzeWallet)(walletAddress, blockchain || 'ETH');
        const analysis = await BlockchainAnalysis_1.BlockchainAnalysis.create({
            caseId: caseId || undefined,
            ...result,
            analyzedBy: req.user.id,
        });
        if (caseId) {
            await Evidence_1.Evidence.create({
                caseId, title: `Blockchain Analysis: ${walletAddress.slice(0, 10)}...`,
                type: 'BLOCKCHAIN', content: `Wallet: ${walletAddress}\nBlockchain: ${blockchain || 'ETH'}`,
                isProcessed: true, processingStatus: 'completed',
                uploadedBy: req.user.id,
            });
            await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
            if (result.riskScore >= 65) {
                await Alert_1.Alert.create({
                    caseId, title: 'High-Risk Wallet Activity Detected',
                    message: `Blockchain analysis of ${walletAddress.slice(0, 10)}... returned risk score: ${result.riskScore}/100. ${result.suspiciousTransactions} suspicious transaction(s) identified.`,
                    severity: result.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
                    category: 'blockchain', source: 'ChainTrace AI',
                });
                await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
            }
        }
        res.status(201).json({ success: true, data: analysis, message: 'Blockchain analysis complete' });
    }
    catch (err) {
        next(err);
    }
};
exports.analyzeBlockchain = analyzeBlockchain;
const getBlockchainHistory = async (req, res, next) => {
    try {
        const { caseId } = req.query;
        const filter = caseId ? { caseId } : {};
        const analyses = await BlockchainAnalysis_1.BlockchainAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: analyses });
    }
    catch (err) {
        next(err);
    }
};
exports.getBlockchainHistory = getBlockchainHistory;
const getBlockchainAnalysis = async (req, res, next) => {
    try {
        const analysis = await BlockchainAnalysis_1.BlockchainAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
        if (!analysis)
            return next((0, errorHandler_1.createError)('Blockchain analysis not found', 404));
        res.json({ success: true, data: analysis });
    }
    catch (err) {
        next(err);
    }
};
exports.getBlockchainAnalysis = getBlockchainAnalysis;
//# sourceMappingURL=blockchain.controller.js.map