import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const analyzeBlockchain: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBlockchainHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBlockchainAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=blockchain.controller.d.ts.map