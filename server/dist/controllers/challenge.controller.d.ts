import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
export declare const findFindingSafe: (idOrCode: string) => Promise<mongoose.Document<unknown, {}, import("../models/AIFinding").IAIFinding, {}, {}> & import("../models/AIFinding").IAIFinding & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const formatFinding: (f: any) => any;
export declare const getCaseFindings: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const challengeFinding: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateAlternativeExplanation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requestHumanReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateHypotheses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitFindingReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=challenge.controller.d.ts.map