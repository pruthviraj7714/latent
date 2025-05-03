import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
  };
}

export const verifyAuth = (allowedRoles: ("USER" | "ADMIN" | "SUPERADMIN")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) : void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: "USER" | "ADMIN" | "SUPERADMIN";
      };

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: "Forbidden: Access denied" });
        return;
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
};
