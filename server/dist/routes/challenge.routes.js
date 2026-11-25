"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challenge_controller_1 = require("../controllers/challenge.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/case/:caseId', challenge_controller_1.getCaseFindings);
router.post('/hypotheses', challenge_controller_1.generateHypotheses);
router.post('/findings/:id/challenge', challenge_controller_1.challengeFinding);
router.post('/findings/:id/alternative', challenge_controller_1.generateAlternativeExplanation);
router.post('/findings/:id/request-review', challenge_controller_1.requestHumanReview);
router.put('/findings/:id/review', challenge_controller_1.submitFindingReview);
router.put('/:id/review', challenge_controller_1.submitFindingReview);
exports.default = router;
//# sourceMappingURL=challenge.routes.js.map