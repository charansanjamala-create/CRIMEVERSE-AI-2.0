import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getCases: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createCase: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCaseById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCase: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCase: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCaseEntities: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCaseEvidence: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCaseTimeline: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cases.controller.d.ts.map