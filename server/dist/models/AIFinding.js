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
exports.AIFinding = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AIFindingSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    findingId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    finding: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    supportingEvidence: [{ type: String }],
    contradictingEvidence: [{ type: String }],
    missingInformation: [{ type: String }],
    potentialAssumptions: [{ type: String }],
    alternativeExplanations: [{ type: String }],
    recommendedVerifications: [{ type: String }],
    criticalQuestions: [
        {
            question: { type: String, required: true },
            answer: { type: String },
            category: { type: String, enum: ['EVIDENCE', 'ASSUMPTION', 'CONTRADICTION', 'ALTERNATIVE'], default: 'EVIDENCE' },
            status: { type: String, enum: ['PENDING', 'ADDRESSED', 'FLAGGED'], default: 'PENDING' },
        },
    ],
    verificationStatus: {
        type: String,
        enum: ['AI_INFERRED', 'VERIFIED', 'CONTRADICTED', 'REQUIRES_HUMAN_REVIEW', 'UNDER_CHALLENGE'],
        default: 'AI_INFERRED',
        index: true,
    },
    humanReviews: [
        {
            reviewerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            reviewerName: { type: String },
            verdict: { type: String, enum: ['CONFIRMED', 'DISPUTED', 'INCONCLUSIVE', 'REQUIRES_MORE_EVIDENCE'] },
            comment: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    category: { type: String, default: 'CRIME_INTELLIGENCE' },
    isUnderReview: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
AIFindingSchema.index({ caseId: 1, confidence: -1 });
exports.AIFinding = mongoose_1.default.model('AIFinding', AIFindingSchema);
//# sourceMappingURL=AIFinding.js.map