import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getEvidence: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createEvidence: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvidenceById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEvidence: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=evidence.controller.d.ts.map