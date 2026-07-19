import { Router, type IRouter } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import {
  db,
  studentsTable,
  purchasesTable,
  rentalsTable,
  classesTable,
} from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get(
  "/dashboard/summary",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const [{ totalStudents }] = await db
      .select({ totalStudents: sql<number>`count(*)::int` })
      .from(studentsTable);

    const [{ pendingPurchases }] = await db
      .select({ pendingPurchases: sql<number>`count(*)::int` })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "pending"));

    const [{ pendingRentals }] = await db
      .select({ pendingRentals: sql<number>`count(*)::int` })
      .from(rentalsTable)
      .where(eq(rentalsTable.status, "pending"));

    const [{ confirmedRevenue }] = await db
      .select({
        confirmedRevenue: sql<number>`coalesce(sum(${purchasesTable.amount}), 0)::float`,
      })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "confirmed"));

    const [{ upcomingClassCount }] = await db
      .select({ upcomingClassCount: sql<number>`count(*)::int` })
      .from(classesTable);

    res.json(
      GetDashboardSummaryResponse.parse({
        totalStudents,
        pendingPurchases,
        pendingRentals,
        confirmedRevenue,
        upcomingClassCount,
      }),
    );
  },
);

export default router;
