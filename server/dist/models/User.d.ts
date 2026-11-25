import mongoose, { Document } from 'mongoose';
export type UserRole = 'ADMIN' | 'INVESTIGATOR' | 'SUPERVISOR' | 'CITIZEN' | 'ANALYST' | 'VIEWER';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    preferences: {
        theme: string;
        notifications: boolean;
        dashboardLayout: string;
    };
    comparePassword(candidate: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map