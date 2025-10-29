import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db";
import { childParents, staffGroupAssignments, children, staff } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Role-Based Access Control Middleware
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const user = req.user;
    if (!user || !user.currentRole) {
      return res.status(403).send("No role assigned");
    }

    if (!allowedRoles.includes(user.currentRole)) {
      return res.status(403).send("Insufficient permissions");
    }

    next();
  };
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Not authenticated");
  }
  next();
}

// Middleware to check if user has parent role and can access specific child
export async function canAccessChild(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Not authenticated");
  }

  const user = req.user;
  const childId = parseInt(req.params.childId || req.params.id);

  if (isNaN(childId)) {
    return res.status(400).json({ message: "Invalid child ID" });
  }

  // Network owners and admins can access all children
  if (user.currentRole === "network_owner" || user.currentRole === "admin") {
    return next();
  }

  // For parents, check if they have a relationship with this child
  if (user.currentRole === "parent") {
    const [parentChild] = await db
      .select()
      .from(childParents)
      .where(and(
        eq(childParents.childId, childId),
        eq(childParents.parentUserId, user.id)
      ))
      .limit(1);

    if (!parentChild) {
      return res.status(403).json({ message: "You do not have access to this child" });
    }
    
    return next();
  }

  // For teachers, check if they teach the group this child belongs to
  if (user.currentRole === "teacher") {
    const [child] = await db
      .select({ groupId: children.groupId })
      .from(children)
      .where(eq(children.id, childId))
      .limit(1);

    if (!child || !child.groupId) {
      return res.status(404).json({ message: "Child not found or not assigned to a group" });
    }

    // First get staff record for this user
    const [staffRecord] = await db
      .select()
      .from(staff)
      .where(eq(staff.userId, user.id))
      .limit(1);

    if (!staffRecord) {
      return res.status(403).json({ message: "Staff record not found" });
    }

    const [staffAssignment] = await db
      .select()
      .from(staffGroupAssignments)
      .where(and(
        eq(staffGroupAssignments.groupId, child.groupId),
        eq(staffGroupAssignments.staffId, staffRecord.id)
      ))
      .limit(1);

    if (!staffAssignment) {
      return res.status(403).json({ message: "You do not have access to this child" });
    }

    return next();
  }

  // Default deny
  return res.status(403).json({ message: "Insufficient permissions" });
}
