import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
export declare const findCameraSafe: (idOrCode: string) => Promise<mongoose.Document<unknown, {}, import("../models/Camera").ICamera, {}, {}> & import("../models/Camera").ICamera & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const KNOWN_SUSPECTS: {
    id: string;
    name: string;
    alias: string;
    age: number;
    nationality: string;
    threatLevel: string;
    warrants: string[];
    caseIdTag: string;
    biometricSignature: string;
    photoUrl: string;
    description: string;
}[];
export declare const getCameras: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCameraById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePTZ: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const detectThreats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const matchFace: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const saveSnapshotEvidence: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cctv.controller.d.ts.map