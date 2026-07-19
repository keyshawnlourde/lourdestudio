import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, purchasesTable, packagesTable } from "@workspace/db";
import {
  CreatePurchaseBody,
  CreatePurchaseResponse,
  ListMyPurchasesResponse,
  ListPurchasesQueryParams,
  ListPurchasesResponse,
  ReviewPurchaseParams,
  ReviewPurchaseBody,
  ReviewPurchaseResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

function toResponseShape(
  purchase: typeof purchasesTable.$inferSelect,
  packageName: string,
) {
  return { ...purchase, packageName };
}

router.get(
  "/purchases/me",
  requireAuth,
  async (req, res): Promise<void> => {
    const rows = await db
      .select({
        purchase: purchasesTable,
        packageName: packagesTable.name,
      })
      .from(purchasesTable)
      .innerJoin(packagesTable, eq(purchasesTable.packageId, packagesTable.id))
      .where(eq(purchasesTable.studentId, req.student!.id))
      .orderBy(purchasesTable.submittedAt);

    res.json(
      ListMyPurchasesResponse.parse(
        rows.map((row) => toResponseShape(row.purchase, row.packageName)),
      ),
    );
  },
);

router.post(
  "/purchases/me",
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = CreatePurchaseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [pkg] = await db
      .select()
      .from(packagesTable)
      .where(eq(packagesTable.id, parsed.data.packageId));

    if (!pkg) {
      res.status(400).json({ error: "Package not found" });
      return;
    }

    const [created] = await db
      .insert(purchasesTable)
      .values({ ...parsed.data, studentId: req.student!.id })
      .returning();

    res
      .status(201)
      .json(CreatePurchaseResponse.parse(toResponseShape(created, pkg.name)));
  },
);

router.get("/purchases", requireAdmin, async (req, res): Promise<void> => {
  const query = ListPurchasesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      purchase: purchasesTable,
      packageName: packagesTable.name,
    })
    .from(purchasesTable)
    .innerJoin(packagesTable, eq(purchasesTable.packageId, packagesTable.id))
    .orderBy(purchasesTable.submittedAt);

  const filtered = query.data.status
    ? rows.filter((row) => row.purchase.status === query.data.status)
    : rows;

  res.json(
    ListPurchasesResponse.parse(
      filtered.map((row) => toResponseShape(row.purchase, row.packageName)),
    ),
  );
});

router.patch(
  "/purchases/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = ReviewPurchaseParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = ReviewPurchaseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(purchasesTable)
      .set({ ...parsed.data, reviewedAt: new Date() })
      .where(eq(purchasesTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Purchase not found" });
      return;
    }

    const [pkg] = await db
      .select()
      .from(packagesTable)
      .where(eq(packagesTable.id, updated.packageId));

    res.json(
      ReviewPurchaseResponse.parse(
        toResponseShape(updated, pkg?.name ?? "Unknown package"),
      ),
    );
  },
);

export default router;
