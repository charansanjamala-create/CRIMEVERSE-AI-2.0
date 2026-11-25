import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const recordAuditLog: (req: AuthRequest | Request, action: string, resourceType: string, resourceId?: string, details?: Record<string, any>) => Promise<void>;
export declare const getAuditLogs: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.controller.d.ts.map