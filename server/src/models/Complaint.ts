import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATION_STARTED'
  | 'EVIDENCE_REVIEW'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type ComplaintCategory =
  | 'FINANCIAL_FRAUD'
  | 'CYBER_HARASSMENT'
  | 'IDENTITY_THEFT'
  | 'BURGLARY_THEFT'
  | 'EXTORTION'
  | 'NARCOTICS'
  | 'ASSAULT'
  | 'MISSING_PERSON'
  | 'OTHER';

export interface IStatusHistoryItem {
  status: ComplaintStatus;
  updatedBy: string;
  notes?: string;
  timestamp: Date;
}

export interface IComplaintEvidence {
  fileName: string;
  filePath?: string;
  fileType: string;
  originalName: string;
  fileSize?: number;
  uploadedAt: Date;
}

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  incidentDateTime: Date;
  complainant: {
    name: string;
    phone: string;
    email: string;
    nationalId?: string;
    address?: string;
    isAnonymous: boolean;
  };
  suspectInfo: {
    name?: string;
    aliases?: string[];
    description?: string;
    contactNumber?: string;
    email?: string;
    additionalDetails?: string;
  };
  location: {
    fullAddress: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pinCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  relatedPersons: string[];
  relatedLocations: string[];
  relatedVehiclesDevices: string[];
  evidenceFiles: IComplaintEvidence[];
  supportingDocuments: string[];
  additionalNotes?: string;
  status: ComplaintStatus;
  statusHistory: IStatusHistoryItem[];
  assignedDepartment?: string;
  assignedOfficer?: mongoose.Types.ObjectId;
  linkedCaseId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
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
    assignedOfficer: { type: Schema.Types.ObjectId, ref: 'User' },
    linkedCaseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ 'complainant.email': 1 });
ComplaintSchema.index({ 'complainant.phone': 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
