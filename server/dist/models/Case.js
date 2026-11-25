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
exports.Case = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CaseSchema = new mongoose_1.Schema({
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['OPEN', 'ACTIVE', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'], default: 'OPEN' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Complaint' },
    tags: [{ type: String }],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskConfidence: { type: Number, default: 75, min: 0, max: 100 },
    riskExplanation: { type: String, default: 'Initial baseline risk calculation based on case intelligence signals.' },
    riskFactors: {
        connectedEntitiesScore: { type: Number, default: 10 },
        unresolvedRelationshipsScore: { type: Number, default: 15 },
        evidenceGapsScore: { type: Number, default: 10 },
        suspiciousActivityScore: { type: Number, default: 15 },
        networkComplexityScore: { type: Number, default: 10 },
        locationInconsistenciesScore: { type: Number, default: 10 },
        contradictoryInfoScore: { type: Number, default: 5 },
    },
    entityCount: { type: Number, default: 0 },
    evidenceCount: { type: Number, default: 0 },
    alertCount: { type: Number, default: 0 },
    summary: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
CaseSchema.index({ caseId: 1 });
CaseSchema.index({ status: 1, priority: -1 });
CaseSchema.index({ assignedTo: 1 });
CaseSchema.index({ createdBy: 1 });
CaseSchema.index({ riskScore: -1 });
exports.Case = mongoose_1.default.model('Case', CaseSchema);
//# sourceMappingURL=Case.js.map