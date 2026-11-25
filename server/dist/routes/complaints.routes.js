"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_controller_1 = require("../controllers/complaints.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Publicly accessible for citizen reporting and tracking without forcing prior login
router.post('/submit', complaints_controller_1.createComplaint);
router.get('/track/:complaintId', complaints_controller_1.getComplaintByTrackingId);
// Authenticated routes
router.use(authenticate_1.authenticate);
router.get('/', complaints_controller_1.getComplaints);
router.post('/', complaints_controller_1.createComplaint);
router.put('/:id/status', complaints_controller_1.updateComplaintStatus);
router.post('/:id/promote-case', complaints_controller_1.promoteComplaintToCase);
exports.default = router;
//# sourceMappingURL=complaints.routes.js.map