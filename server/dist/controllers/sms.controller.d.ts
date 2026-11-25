import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const sendSmsDispatch: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const triggerEmergencySos: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDispatchHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTemplates: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getContacts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=sms.controller.d.ts.map