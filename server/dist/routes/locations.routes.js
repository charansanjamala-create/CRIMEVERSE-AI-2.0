"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const locations_controller_1 = require("../controllers/locations.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/case/:caseId', locations_controller_1.getCaseLocations);
router.post('/', locations_controller_1.createLocation);
router.put('/:id', locations_controller_1.updateLocation);
router.delete('/:id', locations_controller_1.deleteLocation);
exports.default = router;
//# sourceMappingURL=locations.routes.js.map