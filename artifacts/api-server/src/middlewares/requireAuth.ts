import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { getOrCreateStudent } from "../lib/auth";
import type { Student } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      student?: Student;
    }
  }
}

/** Requires a signed-in Clerk session and attaches the student row to req.student. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.student = await getOrCreateStudent(auth.userId);
  next();
}

/** Requires a signed-in Clerk session belonging to an admin student. */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const student = await getOrCreateStudent(auth.userId);
  if (student.role !== "admin") {
    res.status(403).json({ error: "Admins only" });
    return;
  }

  req.student = student;
  next();
}
