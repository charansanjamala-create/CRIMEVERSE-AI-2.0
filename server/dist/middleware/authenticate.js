"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required. Please provide a valid token.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'User not found or account is inactive.' });
            return;
        }
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid token.' });
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map