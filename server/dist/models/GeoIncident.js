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
exports.PatrolUnit = exports.GeoIncident = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SuspectWaypointSchema = new mongoose_1.Schema({
    timestamp: { type: Date, required: true },
    locationName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    activity: { type: String, required: true },
    confirmedBy: { type: String, default: 'CCTV AI' },
}, { _id: false });
const GeoIncidentSchema = new mongoose_1.Schema({
    incidentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    crimeType: {
        type: String,
        enum: ['FINANCIAL_FRAUD', 'CYBER_HEIST', 'IDENTITY_THEFT', 'EXTORTION', 'NARCOTICS', 'ARMED_ROBBERY', 'SURVEILLANCE_FLAG'],
        required: true,
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    address: { type: String, required: true },
    sector: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'], default: 'ACTIVE' },
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    radiusMeters: { type: Number, default: 350 },
    threatScore: { type: Number, default: 75 },
    suspectTrail: [SuspectWaypointSchema],
    assignedUnits: [{ type: String }],
    reportedAt: { type: Date, default: Date.now },
}, { timestamps: true });
const PatrolUnitSchema = new mongoose_1.Schema({
    unitId: { type: String, required: true, unique: true },
    callSign: { type: String, required: true },
    vehicleType: {
        type: String,
        enum: ['INTERCEPTOR_CAR', 'TACTICAL_SWAT_VAN', 'SURVEILLANCE_DRONE', 'MOTOR_PATROL'],
        default: 'INTERCEPTOR_CAR',
    },
    officerInCharge: { type: String, required: true },
    badgeNumber: { type: String, required: true },
    contactRadio: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    heading: { type: Number, default: 0 },
    speedKmH: { type: Number, default: 45 },
    status: {
        type: String,
        enum: ['ON_PATROL', 'RESPONDING', 'PURSUIT', 'STANDBY', 'OFFLINE'],
        default: 'ON_PATROL',
    },
    assignedIncidentId: { type: String },
    sector: { type: String, required: true },
    batteryOrFuelPercent: { type: Number, default: 85 },
    lastPingAt: { type: Date, default: Date.now },
}, { timestamps: true });
GeoIncidentSchema.index({ severity: 1, status: 1 });
PatrolUnitSchema.index({ status: 1, sector: 1 });
exports.GeoIncident = mongoose_1.default.model('GeoIncident', GeoIncidentSchema);
exports.PatrolUnit = mongoose_1.default.model('PatrolUnit', PatrolUnitSchema);
//# sourceMappingURL=GeoIncident.js.map