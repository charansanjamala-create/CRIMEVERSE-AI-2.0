"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainAnalysis = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BlockchainAnalysisSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    walletAddress: { type: String, required: true },
    blockchain: { type: String, default: 'ETH' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, default: 'UNKNOWN' },
    transactionCount: { type: Number, default: 0 },
    totalValueUSD: { type: Number, default: 0 },
    suspiciousTransactions: { type: Number, default: 0 },
    indicators: [{ name: String, description: String, severity: String }],
    transactions: [
        {
            txHash: String,
            from: String,
            to: String,
            value: Number,
            timestamp: Date,
            isSuspicious: Boolean,
            suspicionReason: String,
        },
    ],
    relatedWallets: [{ address: String, relationship: String, riskScore: Number }],
    exchangeConnections: [
        {
            name: { type: String },
            type: { type: String },
            flagged: { type: Boolean },
        },
    ],
    patternAnalysis: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    investigationTimeline: [{ date: Date, event: String, details: String }],
    requiresHumanReview: { type: Boolean, default: true },
    disclaimer: { type: String, default: 'This analysis is based on synthetic/demo data. Blockchain analysis requires human review and does not constitute legal evidence.' },
    analyzedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
BlockchainAnalysisSchema.index({ caseId: 1 });
BlockchainAnalysisSchema.index({ walletAddress: 1 });
BlockchainAnalysisSchema.index({ riskScore: -1 });
exports.BlockchainAnalysis = mongoose_1.default.model('BlockchainAnalysis', BlockchainAnalysisSchema);
//# sourceMappingURL=BlockchainAnalysis.js.map