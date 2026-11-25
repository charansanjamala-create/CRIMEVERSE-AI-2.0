import mongoose, { Document } from 'mongoose';
export type CaseLocationType = 'CRIME_SCENE' | 'SUSPECT_LAST_KNOWN' | 'EVIDENCE_LOCATION' | 'WITNESS_LOCATION' | 'VEHICLE_LOCATION' | 'INVESTIGATION_SITE' | 'RELATED_LOCATION';
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
export declare const LocationRecord: mongoose.Model<ILocationRecord, {}, {}, {}, mongoose.Document<unknown, {}, ILocationRecord, {}, {}> & ILocationRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LocationRecord.d.ts.map