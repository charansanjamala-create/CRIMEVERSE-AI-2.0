import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare const getSimulations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createSimulation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSimulationComparison: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSimulation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=simulation.controller.d.ts.map