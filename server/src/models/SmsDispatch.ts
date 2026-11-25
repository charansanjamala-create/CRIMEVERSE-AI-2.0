import mongoose, { Schema, Document } from 'mongoose';

export interface ISmsDispatch extends Document {
  _id: mongoose.Types.ObjectId;
  dispatchId: string;
  title: string;
  recipientGroup: 'TACTICAL_SWAT' | 'FIELD_PATROL' | 'CYBER_CELL' | 'CITIZEN_ALERT' | 'ALL_UNITS';
  phoneNumbers: string[];
  message: string;
  priority: 'ROUTINE' | 'HIGH' | 'CRITICAL_SOS';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'PARTIAL' | 'FAILED';
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  caseId?: mongoose.Types.ObjectId;
  carrierResponse?: {
    gateway: string;
    messageId: string;
    deliveryRatePercent: number;
    latencyMs: number;
  };
  sentBy: mongoose.Types.ObjectId;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SmsDispatchSchema = new Schema<ISmsDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    recipientGroup: {
      type: String,
      enum: ['TACTICAL_SWAT', 'FIELD_PATROL', 'CYBER_CELL', 'CITIZEN_ALERT', 'ALL_UNITS'],
      required: true,
    },
    phoneNumbers: [{ type: String }],
    message: { type: String, required: true },
    priority: { type: String, enum: ['ROUTINE', 'HIGH', 'CRITICAL_SOS'], default: 'HIGH' },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'PARTIAL', 'FAILED'],
      default: 'DELIVERED',
    },
    totalRecipients: { type: Number, required: true },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    carrierResponse: {
      gateway: { type: String, default: 'CRIMEVERSE-GOV-SMS-GATEWAY' },
      messageId: { type: String },
      deliveryRatePercent: { type: Number, default: 100 },
      latencyMs: { type: Number, default: 120 },
    },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SmsDispatchSchema.index({ priority: 1, sentAt: -1 });

export const SmsDispatch = mongoose.model<ISmsDispatch>('SmsDispatch', SmsDispatchSchema);
