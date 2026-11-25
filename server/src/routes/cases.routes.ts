import { Router } from 'express';
import { getCases, createCase, getCaseById, updateCase, deleteCase, getCaseEntities, getCaseEvidence, getCaseTimeline } from '../controllers/cases.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', getCases);
router.post('/', createCase);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);
router.get('/:id/entities', getCaseEntities);
router.get('/:id/evidence', getCaseEvidence);
router.get('/:id/timeline', getCaseTimeline);

export default router;
