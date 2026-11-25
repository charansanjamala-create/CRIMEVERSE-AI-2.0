import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const analyzeEmailContent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEmailHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEmailAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map