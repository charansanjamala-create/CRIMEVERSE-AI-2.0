"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/me', authenticate_1.authenticate, auth_controller_1.getMe);
router.put('/profile', authenticate_1.authenticate, auth_controller_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map