import mongoose, { Document } from 'mongoose';
export type EntityType = 'PERSON' | 'ORGANIZATION' | 'EMAIL' | 'PHONE' | 'WALLET' | 'DEVICE' | 'IP' | 'DOMAIN' | 'DOCUMENT' | 'LOCATION' | 'VEHICLE' | 'TRANSACTION' | 'EVIDENCE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
export interface IEntity extends Document {
    _id: mongoose.Types.ObjectId;
    caseId: mongoose.Types.ObjectId;
    type: EntityType;
    name: string;
    identifier: string;
    riskLevel: RiskLevel;
    riskScore: number;
    description?: string;
    aliases: string[];
    attributes: Record<string, any>;
    connections: mongoose.Types.ObjectId[];
    evidenceIds: mongoose.Types.ObjectId[];
    isVerified: boolean;
    requiresReview: boolean;
    tags: string[];
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Entity: mongoose.Model<IEntity, {}, {}, {}, mongoose.Document<unknown, {}, IEntity, {}, {}> & IEntity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Entity.d.ts.map