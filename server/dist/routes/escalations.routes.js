"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const escalations_controller_1 = require("../controllers/escalations.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', escalations_controller_1.getEscalations);
router.post('/', escalations_controller_1.createEscalation);
router.put('/:id/status', escalations_controller_1.updateEscalationStatus);
router.put('/:id/respond', escalations_controller_1.updateEscalationStatus);
exports.default = router;
//# sourceMappingURL=escalations.routes.js.map