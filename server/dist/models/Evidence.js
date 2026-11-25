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
exports.Evidence = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EvidenceSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['AUDIO', 'DOCUMENT', 'IMAGE', 'EMAIL', 'BLOCKCHAIN', 'NETWORK', 'TEXT', 'OTHER'], required: true },
    fileName: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    content: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    linkedEntities: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Entity' }],
    linkedAnalyses: [{ type: String }],
    relatedLocation: { type: String },
    verificationStatus: {
        type: String,
        enum: ['VERIFIED', 'REPORTED', 'AI_INFERRED', 'UNKNOWN'],
        default: 'REPORTED',
    },
    accessHistory: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String },
            action: { type: String, enum: ['VIEW', 'DOWNLOAD', 'VERIFY'], default: 'VIEW' },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    tags: [{ type: String }],
    isProcessed: { type: Boolean, default: false },
    processingStatus: { type: String, default: 'pending' },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
EvidenceSchema.index({ caseId: 1, type: 1 });
EvidenceSchema.index({ uploadedBy: 1 });
exports.Evidence = mongoose_1.default.model('Evidence', EvidenceSchema);
//# sourceMappingURL=Evidence.js.map