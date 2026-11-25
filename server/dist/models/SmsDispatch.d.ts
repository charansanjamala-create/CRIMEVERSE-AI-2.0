import mongoose, { Document } from 'mongoose';
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
export declare const SmsDispatch: mongoose.Model<ISmsDispatch, {}, {}, {}, mongoose.Document<unknown, {}, ISmsDispatch, {}, {}> & ISmsDispatch & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=SmsDispatch.d.ts.map