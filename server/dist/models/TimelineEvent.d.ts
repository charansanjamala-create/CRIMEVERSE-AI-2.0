import mongoose, { Document } from 'mongoose';
export interface ITimelineEvent extends Document {
    _id: mongoose.Types.ObjectId;
    caseId: mongoose.Types.ObjectId;
    eventType: string;
    title: string;
    description: string;
    eventDate: Date;
    entities: mongoose.Types.ObjectId[];
    evidenceIds: mongoose.Types.ObjectId[];
    source: string;
    significance: string;
    isVerified: boolean;
    metadata: Record<string, any>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TimelineEvent: mongoose.Model<ITimelineEvent, {}, {}, {}, mongoose.Document<unknown, {}, ITimelineEvent, {}, {}> & ITimelineEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TimelineEvent.d.ts.map