import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getCaseLocations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createLocation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateLocation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteLocation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=locations.controller.d.ts.map