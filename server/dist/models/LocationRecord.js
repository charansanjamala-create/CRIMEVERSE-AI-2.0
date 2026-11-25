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
exports.LocationRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LocationRecordSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    complaintId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Complaint' },
    name: { type: String, required: true, trim: true },
    locationType: {
        type: String,
        enum: [
            'CRIME_SCENE',
            'SUSPECT_LAST_KNOWN',
            'EVIDENCE_LOCATION',
            'WITNESS_LOCATION',
            'VEHICLE_LOCATION',
            'INVESTIGATION_SITE',
            'RELATED_LOCATION',
        ],
        default: 'RELATED_LOCATION',
        required: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pinCode: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    verificationStatus: {
        type: String,
        enum: ['VERIFIED', 'REPORTED', 'AI_INFERRED', 'UNKNOWN'],
        default: 'REPORTED',
        required: true,
    },
    notes: { type: String },
    relatedEntities: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Entity' }],
    discoveredDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
LocationRecordSchema.index({ caseId: 1, locationType: 1 });
LocationRecordSchema.index({ verificationStatus: 1 });
exports.LocationRecord = mongoose_1.default.model('LocationRecord', LocationRecordSchema);
//# sourceMappingURL=LocationRecord.js.map