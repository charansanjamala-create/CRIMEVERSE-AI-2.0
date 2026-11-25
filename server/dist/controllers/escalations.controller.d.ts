import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getEscalations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createEscalation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEscalationStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=escalations.controller.d.ts.map