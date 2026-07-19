import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, classesTable } from "@workspace/db";
import {
  CreateClassBody,
  CreateClassResponse,
  UpdateClassParams,
  UpdateClassBody,
  UpdateClassResponse,
  DeleteClassParams,
  ListClassesResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/classes", async (_req, res): Promise<void> => {
  const classes = await db
    .select()
    .from(classesTable)
    .orderBy(classesTable.dayOfWeek, classesTable.startTime);
  res.json(ListClassesResponse.parse(classes));
});

router.post("/classes", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(classesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateClassResponse.parse(created));
});

router.patch("/classes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(classesTable)
    .set(parsed.data)
    .where(eq(classesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  res.json(UpdateClassResponse.parse(updated));
});

router.delete(
  "/classes/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteClassParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(classesTable)
      .where(eq(classesTable.id, params.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
