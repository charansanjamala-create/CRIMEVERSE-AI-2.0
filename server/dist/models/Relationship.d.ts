import mongoose, { Document } from 'mongoose';
export interface IRelationship extends Document {
    _id: mongoose.Types.ObjectId;
    caseId: mongoose.Types.ObjectId;
    sourceEntity: mongoose.Types.ObjectId;
    targetEntity: mongoose.Types.ObjectId;
    relationshipType: string;
    strength: number;
    confidence: number;
    description?: string;
    evidenceIds: mongoose.Types.ObjectId[];
    isConfirmed: boolean;
    requiresReview: boolean;
    discoveredAt: Date;
    lastSeen?: Date;
    metadata: Record<string, any>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Relationship: mongoose.Model<IRelationship, {}, {}, {}, mongoose.Document<unknown, {}, IRelationship, {}, {}> & IRelationship & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Relationship.d.ts.map