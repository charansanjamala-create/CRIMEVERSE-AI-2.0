"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const signToken = (id, email, role, name) => jsonwebtoken_1.default.sign({ id, email, role, name }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return next((0, errorHandler_1.createError)('Name, email and password are required', 400));
        }
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing)
            return next((0, errorHandler_1.createError)('Email already registered', 409));
        const allowedRoles = ['INVESTIGATOR', 'ANALYST', 'VIEWER'];
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: allowedRoles.includes(role) ? role : 'ANALYST',
        });
        const token = signToken(user._id.toString(), user.email, user.role, user.name);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return next((0, errorHandler_1.createError)('Email and password are required', 400));
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !user.isActive)
            return next((0, errorHandler_1.createError)('Invalid credentials', 401));
        const match = await user.comparePassword(password);
        if (!match)
            return next((0, errorHandler_1.createError)('Invalid credentials', 401));
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        const token = signToken(user._id.toString(), user.email, user.role, user.name);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return next((0, errorHandler_1.createError)('User not found', 404));
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        const { name, preferences } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user.id, { ...(name && { name }), ...(preferences && { preferences }) }, { new: true, runValidators: true });
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.controller.js.map