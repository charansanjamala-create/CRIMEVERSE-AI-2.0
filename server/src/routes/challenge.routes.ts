import { Router } from 'express';
import {
  getCaseFindings,
  challengeFinding,
  generateAlternativeExplanation,
  requestHumanReview,
  generateHypotheses,
  submitFindingReview,
} from '../controllers/challenge.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/case/:caseId', getCaseFindings);
router.post('/hypotheses', generateHypotheses);
router.post('/findings/:id/challenge', challengeFinding);
router.post('/findings/:id/alternative', generateAlternativeExplanation);
router.post('/findings/:id/request-review', requestHumanReview);
router.put('/findings/:id/review', submitFindingReview);
router.put('/:id/review', submitFindingReview);

export default router;
