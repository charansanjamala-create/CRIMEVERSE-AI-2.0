import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const createComplaint: (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getComplaintByTrackingId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getComplaints: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateComplaintStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const promoteComplaintToCase: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=complaints.controller.d.ts.map