import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { createError } from '../middleware/errorHandler';

const signToken = (id: string, email: string, role: string, name: string) =>
  jwt.sign({ id, email, role, name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return next(createError('Name, email and password are required', 400));
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return next(createError('Email already registered', 409));

    const allowedRoles = ['INVESTIGATOR', 'ANALYST', 'VIEWER'];
    const user = await User.create({
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
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(createError('Email and password are required', 400));

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) return next(createError('Invalid credentials', 401));

    const match = await user.comparePassword(password);
    if (!match) return next(createError('Invalid credentials', 401));

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id.toString(), user.email, user.role, user.name);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(preferences && { preferences }) },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
