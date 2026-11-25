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
exports.Entity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EntitySchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true },
    type: {
        type: String,
        enum: [
            'PERSON',
            'ORGANIZATION',
            'EMAIL',
            'PHONE',
            'WALLET',
            'DEVICE',
            'IP',
            'DOMAIN',
            'DOCUMENT',
            'LOCATION',
            'VEHICLE',
            'TRANSACTION',
            'EVIDENCE',
        ],
        required: true,
    },
    name: { type: String, required: true, trim: true },
    identifier: { type: String, required: true },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'], default: 'UNKNOWN' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    aliases: [{ type: String }],
    attributes: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    connections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Entity' }],
    evidenceIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Evidence' }],
    isVerified: { type: Boolean, default: false },
    requiresReview: { type: Boolean, default: true },
    tags: [{ type: String }],
    notes: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
EntitySchema.index({ caseId: 1, type: 1 });
EntitySchema.index({ identifier: 1 });
EntitySchema.index({ riskScore: -1 });
exports.Entity = mongoose_1.default.model('Entity', EntitySchema);
//# sourceMappingURL=Entity.js.map