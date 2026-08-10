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

      next();
    } catch (error) {
      res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
    return next();
  }

  // Fallback: the token may predate the user's promotion to admin (stale role claim).
  // Verify against the DB so legit admins are not locked out until re-login.
  try {
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select('role');
      if (user && user.role && user.role.toLowerCase() === 'admin') {
        return next();
      }
    }
  } catch (err) {
    console.error('adminOnly DB role check failed:', (err as Error).message);
  }

  res.status(403).json({ success: false, error: 'Admin access only' });
};
