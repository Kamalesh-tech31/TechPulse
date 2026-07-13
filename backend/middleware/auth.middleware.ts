import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';

// Extend Express Request type definition
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  const token = authHeader.substring(7);
  const decoded = JWTService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }

  req.user = decoded;
  next();
}
