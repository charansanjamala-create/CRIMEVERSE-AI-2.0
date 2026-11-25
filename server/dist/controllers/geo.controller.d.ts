import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getIncidents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIncidentById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createIncident: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPatrolUnits: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePatrolStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSuspectTrail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=geo.controller.d.ts.map