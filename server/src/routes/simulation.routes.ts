import { Router } from 'express';
import {
  getSimulations,
  createSimulation,
  getSimulationComparison,
  deleteSimulation,
} from '../controllers/simulation.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/case/:caseId', getSimulations);
router.post('/', createSimulation);
router.get('/:id/compare', getSimulationComparison);
router.delete('/:id', deleteSimulation);

export default router;
