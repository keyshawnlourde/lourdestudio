import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  GetStudentParams,
  GetStudentResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  UpdateStudentParams,
  UpdateStudentBody,
  UpdateStudentResponse,
  ListStudentsResponse,
  GetMyProfileResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/students/me", requireAuth, async (req, res): Promise<void> => {
  res.json(GetMyProfileResponse.parse(req.student));
});

router.patch(
  "/students/me",
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(studentsTable)
      .set(parsed.data)
      .where(eq(studentsTable.id, req.student!.id))
      .returning();

    res.json(UpdateMyProfileResponse.parse(updated));
  },
);

router.get("/students", requireAdmin, async (_req, res): Promise<void> => {
  const students = await db
    .select()
    .from(studentsTable)
    .orderBy(studentsTable.createdAt);
  res.json(ListStudentsResponse.parse(students));
});

router.get("/students/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(GetStudentResponse.parse(student));
});

router.patch(
  "/students/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateStudentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(studentsTable)
      .set(parsed.data)
      .where(eq(studentsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json(UpdateStudentResponse.parse(updated));
  },
);

export default router;
