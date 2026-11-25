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
exports.Relationship = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RelationshipSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true },
    sourceEntity: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Entity', required: true },
    targetEntity: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Entity', required: true },
    relationshipType: { type: String, required: true },
    strength: { type: Number, default: 50, min: 0, max: 100 },
    confidence: { type: Number, default: 50, min: 0, max: 100 },
    description: { type: String },
    evidenceIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Evidence' }],
    isConfirmed: { type: Boolean, default: false },
    requiresReview: { type: Boolean, default: true },
    discoveredAt: { type: Date, default: Date.now },
    lastSeen: { type: Date },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
RelationshipSchema.index({ caseId: 1 });
RelationshipSchema.index({ sourceEntity: 1, targetEntity: 1 });
exports.Relationship = mongoose_1.default.model('Relationship', RelationshipSchema);
//# sourceMappingURL=Relationship.js.map