import mongoose, { Document } from 'mongoose';
export interface IAlert extends Document {
    _id: mongoose.Types.ObjectId;
    caseId?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
    category: string;
    source: string;
    isRead: boolean;
    isAcknowledged: boolean;
    acknowledgedBy?: mongoose.Types.ObjectId;
    acknowledgedAt?: Date;
    relatedEntities: mongoose.Types.ObjectId[];
    metadata: Record<string, any>;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Alert: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, {}> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Alert.d.ts.map