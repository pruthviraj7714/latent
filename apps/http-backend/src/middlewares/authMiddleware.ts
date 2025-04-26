import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@repo/db/client';
import { ADMIN_JWT_SECRET, USER_JWT_SECRET } from '../config';

interface UserAuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

interface AdminAuthenticatedRequest extends Request {
  admin?: {
    id: string;
    phoneNumber: string;
  };
}

export const userMiddleware = async (
  req: UserAuthenticatedRequest, 
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
      USER_JWT_SECRET!
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

export const adminMiddleware = async (
  req: AdminAuthenticatedRequest, 
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
      ADMIN_JWT_SECRET!
    ) as JwtPayload;
    
    const user = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
      return;
    }
    
    req.admin = {
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