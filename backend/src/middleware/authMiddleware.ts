import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tokenRole = (req.user?.role || '').toLowerCase();
  if (tokenRole === 'admin') {
    return next();
  }

  // Fallback: verify against the DB so legit admins or selva@gmail.com demo admin are not locked out
  try {
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select('role email');
      if (user && (user.role?.toLowerCase() === 'admin' || user.email?.toLowerCase() === 'selva@gmail.com')) {
        req.user.role = 'admin';
        return next();
      }
    }
  } catch (err) {
    console.error('adminOnly DB role check failed:', (err as Error).message);
  }

  // Return clean JSON error with HTTP 200/400 instead of 403 to prevent browser resource load failure logs
  return res.status(200).json({ success: false, error: 'Admin access required' });
};
