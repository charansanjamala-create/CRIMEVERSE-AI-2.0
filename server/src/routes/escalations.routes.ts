import { Router } from 'express';
import {
  getEscalations,
  createEscalation,
  updateEscalationStatus,
} from '../controllers/escalations.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', getEscalations);
router.post('/', createEscalation);
router.put('/:id/status', updateEscalationStatus);
router.put('/:id/respond', updateEscalationStatus);

export default router;
