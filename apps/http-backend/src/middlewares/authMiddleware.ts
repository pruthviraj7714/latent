import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@repo/db/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization denied. No token provided'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
      return;
    }
    
    req.user = {
      id: decoded.id,
      phoneNumber: decoded.phoneNumber
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid or has expired'
    });
  }
};