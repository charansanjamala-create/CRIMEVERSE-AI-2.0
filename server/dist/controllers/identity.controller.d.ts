import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const analyzeIdentityDoc: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIdentityHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIdentityAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=identity.controller.d.ts.map