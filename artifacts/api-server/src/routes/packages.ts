import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, packagesTable } from "@workspace/db";
import {
  CreatePackageBody,
  CreatePackageResponse,
  UpdatePackageParams,
  UpdatePackageBody,
  UpdatePackageResponse,
  DeletePackageParams,
  ListPackagesQueryParams,
  ListPackagesResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const query = ListPackagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const packages = await db
    .select()
    .from(packagesTable)
    .orderBy(packagesTable.createdAt);

  const filtered = query.data.activeOnly
    ? packages.filter((pkg) => pkg.active)
    : packages;

  res.json(ListPackagesResponse.parse(filtered));
});

router.post("/packages", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(packagesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreatePackageResponse.parse(created));
});

router.patch(
  "/packages/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdatePackageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdatePackageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(packagesTable)
      .set(parsed.data)
      .where(eq(packagesTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    res.json(UpdatePackageResponse.parse(updated));
  },
);

router.delete(
  "/packages/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeletePackageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(packagesTable)
      .where(eq(packagesTable.id, params.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
