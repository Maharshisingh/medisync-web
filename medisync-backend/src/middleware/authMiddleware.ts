// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the shape of the data stored in our tokens
interface UserPayload {
  id: string;
  role: 'user' | 'admin';
}

interface PharmacyPayload {
  id: string;
  role: 'pharmacy';
}

interface DecodedToken {
  user?: UserPayload;
  pharmacy?: PharmacyPayload;
}

// Update our custom Request to use these specific types
export interface AuthRequest extends Request {
  user?: UserPayload;
  pharmacy?: PharmacyPayload;
}

// This is our main authentication middleware
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      if (decoded.user) {
        req.user = decoded.user;
      } else if (decoded.pharmacy) {
        req.pharmacy = decoded.pharmacy;
      }

      next();
    } catch (error) {
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// --- THIS IS THE NEW ADMIN MIDDLEWARE ---
// It should be used AFTER the 'protect' middleware on a route.
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if the user object exists and if their role is 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // If they are an admin, proceed to the next function
  } else {
    res.status(403).json({ msg: 'Not authorized as an admin' }); // 403 Forbidden
  }
};