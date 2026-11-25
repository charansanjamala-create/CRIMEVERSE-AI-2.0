import mongoose, { Schema, Document } from 'mongoose';

export type CaseLocationType =
  | 'CRIME_SCENE'
  | 'SUSPECT_LAST_KNOWN'
  | 'EVIDENCE_LOCATION'
  | 'WITNESS_LOCATION'
  | 'VEHICLE_LOCATION'
  | 'INVESTIGATION_SITE'
  | 'RELATED_LOCATION';

export type VerificationStatus = 'VERIFIED' | 'REPORTED' | 'AI_INFERRED' | 'UNKNOWN';

export interface ILocationRecord extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  name: string;
  locationType: CaseLocationType;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  verificationStatus: VerificationStatus;
  notes?: string;
  relatedEntities: mongoose.Types.ObjectId[];
  discoveredDate: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LocationRecordSchema = new Schema<ILocationRecord>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
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
    relatedEntities: [{ type: Schema.Types.ObjectId, ref: 'Entity' }],
    discoveredDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

LocationRecordSchema.index({ caseId: 1, locationType: 1 });
LocationRecordSchema.index({ verificationStatus: 1 });

export const LocationRecord = mongoose.model<ILocationRecord>('LocationRecord', LocationRecordSchema);
