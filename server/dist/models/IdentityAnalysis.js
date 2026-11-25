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
exports.IdentityAnalysis = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const IdentityAnalysisSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    documentType: { type: String, required: true },
    documentNumber: { type: String },
    subjectName: { type: String },
    dateOfBirth: { type: String },
    nationality: { type: String },
    issuingAuthority: { type: String },
    issueDate: { type: String },
    expiryDate: { type: String },
    fileName: { type: String },
    extractedFields: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    inconsistencies: [{ field: String, description: String, severity: String }],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    verificationStatus: { type: String, default: 'PENDING' },
    riskLevel: { type: String, default: 'UNKNOWN' },
    indicators: [{ name: String, description: String, severity: String }],
    ocrText: { type: String },
    metadataFlags: [{ type: String }],
    requiresHumanReview: { type: Boolean, default: true },
    disclaimer: { type: String, default: 'This analysis does not constitute legal verification. Human review is required before any official action.' },
    analyzedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
IdentityAnalysisSchema.index({ caseId: 1 });
IdentityAnalysisSchema.index({ riskScore: -1 });
exports.IdentityAnalysis = mongoose_1.default.model('IdentityAnalysis', IdentityAnalysisSchema);
//# sourceMappingURL=IdentityAnalysis.js.map