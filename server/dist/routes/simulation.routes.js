"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulation_controller_1 = require("../controllers/simulation.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/case/:caseId', simulation_controller_1.getSimulations);
router.post('/', simulation_controller_1.createSimulation);
router.get('/:id/compare', simulation_controller_1.getSimulationComparison);
router.delete('/:id', simulation_controller_1.deleteSimulation);
exports.default = router;
//# sourceMappingURL=simulation.routes.js.map