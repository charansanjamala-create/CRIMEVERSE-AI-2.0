import mongoose, { Document } from 'mongoose';
export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INVESTIGATION_STARTED' | 'EVIDENCE_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
export type ComplaintCategory = 'FINANCIAL_FRAUD' | 'CYBER_HARASSMENT' | 'IDENTITY_THEFT' | 'BURGLARY_THEFT' | 'EXTORTION' | 'NARCOTICS' | 'ASSAULT' | 'MISSING_PERSON' | 'OTHER';
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
export declare const Complaint: mongoose.Model<IComplaint, {}, {}, {}, mongoose.Document<unknown, {}, IComplaint, {}, {}> & IComplaint & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Complaint.d.ts.map