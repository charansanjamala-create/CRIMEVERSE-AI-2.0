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
exports.EmailAnalysis = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EmailAnalysisSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    subject: { type: String },
    rawContent: { type: String, required: true },
    senderEmail: { type: String },
    senderName: { type: String },
    recipientEmails: [{ type: String }],
    replyTo: { type: String },
    extractedIPs: [{ ip: String, geolocation: mongoose_1.Schema.Types.Mixed, isSuspicious: Boolean }],
    extractedURLs: [{ url: String, domain: String, isSuspicious: Boolean, threat: String }],
    extractedDomains: [{ type: String }],
    extractedWallets: [{ type: String }],
    headers: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    threatScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, default: 'UNKNOWN' },
    threatCategories: [{ type: String }],
    indicators: [{ name: String, description: String, severity: String }],
    spfStatus: { type: String },
    dkimStatus: { type: String },
    dmarcStatus: { type: String },
    geolocations: [{ type: mongoose_1.Schema.Types.Mixed }],
    forensicSummary: { type: String, default: '' },
    requiresHumanReview: { type: Boolean, default: true },
    analyzedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
EmailAnalysisSchema.index({ caseId: 1 });
EmailAnalysisSchema.index({ threatScore: -1 });
exports.EmailAnalysis = mongoose_1.default.model('EmailAnalysis', EmailAnalysisSchema);
//# sourceMappingURL=EmailAnalysis.js.map