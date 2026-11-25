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
exports.Camera = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DetectionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['PERSON', 'WEAPON', 'VEHICLE', 'BAGGAGE', 'ANOMALY'], required: true },
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    bbox: [{ type: Number }],
    threatSeverity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    timestamp: { type: Date, default: Date.now },
    suspectMatch: {
        name: { type: String },
        alias: { type: String },
        similarity: { type: Number },
    },
}, { _id: false });
const CameraSchema = new mongoose_1.Schema({
    cameraId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sector: { type: String, required: true },
    locationName: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    streamUrl: { type: String, default: '' },
    status: { type: String, enum: ['ONLINE', 'ALERT', 'DEGRADED', 'OFFLINE'], default: 'ONLINE' },
    resolution: { type: String, default: '4K UHD (3840x2160)' },
    fps: { type: Number, default: 30 },
    bitrateMbps: { type: Number, default: 8.5 },
    ptzCapable: { type: Boolean, default: true },
    currentPan: { type: Number, default: 0 },
    currentTilt: { type: Number, default: 0 },
    currentZoom: { type: Number, default: 1 },
    nightVision: { type: Boolean, default: false },
    thermalMode: { type: Boolean, default: false },
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    activeDetections: [DetectionSchema],
    lastPingAt: { type: Date, default: Date.now },
}, { timestamps: true });
CameraSchema.index({ sector: 1, status: 1 });
exports.Camera = mongoose_1.default.model('Camera', CameraSchema);
//# sourceMappingURL=Camera.js.map