import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getNetwork: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createRelationship: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createEntity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCaseTimeline: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=network.controller.d.ts.map