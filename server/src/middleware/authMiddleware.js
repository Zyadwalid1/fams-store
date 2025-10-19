import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, no token', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      throw new AppError('Not authorized, token failed', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const admin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      throw new AppError('Not authorized as an admin', 403);
    }
  } catch (error) {
    next(error);
  }
};

export const support = (req, res, next) => {
  try {
    if (req.user && (req.user.role === 'support' || req.user.role === 'admin' || req.user.role === 'doctor')) {
      next();
    } else {
      throw new AppError('Not authorized as support staff', 403);
    }
  } catch (error) {
    next(error);
  }
}; 