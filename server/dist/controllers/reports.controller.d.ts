import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const generateReport: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getReportsByCase: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getReport: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=reports.controller.d.ts.map