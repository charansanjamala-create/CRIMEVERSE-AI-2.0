import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const chat: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const unifiedAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChatHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ai.controller.d.ts.map