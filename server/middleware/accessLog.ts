import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db";
import { accessLogs } from "@shared/schema";

// Middleware to log access to sensitive resources
export function logAccess(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next();
    }

    const user = req.user;
    const resourceId = req.params.id || req.params.childId || null;

    try {
      await db.insert(accessLogs).values({
        userId: user.id,
        action: `${req.method.toLowerCase()}_${resourceType}`,
        resourceType,
        resourceId: resourceId ? parseInt(resourceId) : null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get("user-agent") || null,
      });
    } catch (error) {
      // Log error but don't block the request
      console.error("Failed to log access:", error);
    }

    next();
  };
}
