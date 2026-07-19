import { clerkClient } from "@clerk/express";
import { eq, sql } from "drizzle-orm";
import { db, studentsTable, type Student } from "@workspace/db";
import { logger } from "./logger";

/**
 * Fetch the student row for a Clerk userId, JIT-provisioning it on first
 * sight. The very first student ever created becomes an admin so the studio
 * always has at least one admin account without a manual invite flow.
 */
export async function getOrCreateStudent(userId: string): Promise<Student> {
  const [existing] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, userId));

  if (existing) {
    return existing;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studentsTable);

  const role = count === 0 ? "admin" : "student";

  let name = "New Student";
  let email = "";
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    name = fullName || clerkUser.username || email || "New Student";
  } catch (error) {
    logger.warn(
      { err: error, userId },
      "Failed to fetch Clerk user profile during JIT provisioning",
    );
  }

  const [created] = await db
    .insert(studentsTable)
    .values({ userId, role, name, email })
    .returning();

  return created;
}
