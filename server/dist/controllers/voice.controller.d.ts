import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const analyzeVoiceFile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getVoiceHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getVoiceAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=voice.controller.d.ts.map