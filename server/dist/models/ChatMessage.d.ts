import mongoose, { Document } from 'mongoose';
export interface IChatMessage extends Document {
    _id: mongoose.Types.ObjectId;
    sessionId: string;
    caseId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: string[];
    confidence?: number;
    isAIGenerated: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatMessage: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage, {}, {}> & IChatMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatMessage.d.ts.map