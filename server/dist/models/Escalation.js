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
exports.Escalation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EscalationSchema = new mongoose_1.Schema({
    escalationId: { type: String, required: true, unique: true, index: true },
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    reason: { type: String, required: true, maxlength: 2000 },
    trigger: {
        type: String,
        enum: [
            'LOW_CONFIDENCE',
            'CONTRADICTORY_EVIDENCE',
            'HIGH_RISK_SCORE',
            'MISSING_INFORMATION',
            'CHALLENGE_UNCERTAINTY',
            'HUMAN_REVIEW_REQUIRED',
            'OTHER',
        ],
        default: 'HUMAN_REVIEW_REQUIRED',
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'HIGH',
    },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'RETURNED', 'RESOLVED'],
        default: 'PENDING',
        index: true,
    },
    submittedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, required: true },
    supervisorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    supervisorName: { type: String },
    supervisorComments: { type: String },
    reviewNotes: [
        {
            note: { type: String, required: true },
            authorName: { type: String, required: true },
            authorRole: { type: String, required: true },
            authorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    dateSubmitted: { type: Date, default: Date.now },
    dateResolved: { type: Date },
}, { timestamps: true });
EscalationSchema.index({ status: 1, priority: -1 });
exports.Escalation = mongoose_1.default.model('Escalation', EscalationSchema);
//# sourceMappingURL=Escalation.js.map