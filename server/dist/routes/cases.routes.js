"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cases_controller_1 = require("../controllers/cases.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', cases_controller_1.getCases);
router.post('/', cases_controller_1.createCase);
router.get('/:id', cases_controller_1.getCaseById);
router.put('/:id', cases_controller_1.updateCase);
router.delete('/:id', cases_controller_1.deleteCase);
router.get('/:id/entities', cases_controller_1.getCaseEntities);
router.get('/:id/evidence', cases_controller_1.getCaseEvidence);
router.get('/:id/timeline', cases_controller_1.getCaseTimeline);
exports.default = router;
//# sourceMappingURL=cases.routes.js.map