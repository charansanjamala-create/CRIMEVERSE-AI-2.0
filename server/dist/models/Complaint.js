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
exports.Complaint = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ComplaintSchema = new mongoose_1.Schema({
    complaintId: { type: String, required: true, unique: true, index: true },
    category: {
        type: String,
        enum: [
            'CYBER_FINANCIAL',
            'CYBERCRIME',
            'FINANCIAL_FRAUD',
            'CYBER_HARASSMENT',
            'IDENTITY_THEFT',
            'BURGLARY_THEFT',
            'EXTORTION',
            'NARCOTICS',
            'ASSAULT',
            'MISSING_PERSON',
            'OTHER',
        ],
        required: true,
        default: 'OTHER',
    },
    title: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, required: true, maxlength: 5000 },
    incidentDateTime: { type: Date, required: true, default: Date.now },
    complainant: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, default: 'citizen@anonymous.local' },
        nationalId: { type: String, trim: true },
        address: { type: String },
        isAnonymous: { type: Boolean, default: false },
    },
    suspectInfo: {
        name: { type: String, default: '' },
        aliases: [{ type: String }],
        description: { type: String, default: '' },
        contactNumber: { type: String, default: '' },
        email: { type: String, default: '' },
        additionalDetails: { type: String, default: '' },
    },
    location: {
        fullAddress: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, default: 'Central' },
        state: { type: String, default: 'Telangana' },
        country: { type: String, default: 'India' },
        pinCode: { type: String, default: '500001' },
        coordinates: {
            lat: { type: Number, default: 17.3850 },
            lng: { type: Number, default: 78.4867 },
        },
    },
    relatedPersons: [{ type: String }],
    relatedLocations: [{ type: String }],
    relatedVehiclesDevices: [{ type: String }],
    evidenceFiles: [
        {
            fileName: { type: String, required: true },
            filePath: { type: String },
            fileType: { type: String, required: true },
            originalName: { type: String, required: true },
            fileSize: { type: Number },
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    supportingDocuments: [{ type: String }],
    additionalNotes: { type: String },
    status: {
        type: String,
        enum: [
            'SUBMITTED',
            'UNDER_REVIEW',
            'INVESTIGATION_STARTED',
            'EVIDENCE_REVIEW',
            'ESCALATED',
            'RESOLVED',
            'CLOSED',
        ],
        default: 'SUBMITTED',
        index: true,
    },
    statusHistory: [
        {
            status: { type: String, required: true },
            updatedBy: { type: String, default: 'System' },
            notes: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    assignedDepartment: { type: String, default: 'Central Crime Branch' },
    assignedOfficer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    linkedCaseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ 'complainant.email': 1 });
ComplaintSchema.index({ 'complainant.phone': 1 });
exports.Complaint = mongoose_1.default.model('Complaint', ComplaintSchema);
//# sourceMappingURL=Complaint.js.map