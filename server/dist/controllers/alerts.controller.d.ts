import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getAlerts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAlertRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAllRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const acknowledgeAlert: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=alerts.controller.d.ts.map