import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentMethodsTable } from "@workspace/db";
import {
  CreatePaymentMethodBody,
  CreatePaymentMethodResponse,
  UpdatePaymentMethodParams,
  UpdatePaymentMethodBody,
  UpdatePaymentMethodResponse,
  DeletePaymentMethodParams,
  ListPaymentMethodsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/payment-methods", async (_req, res): Promise<void> => {
  const methods = await db
    .select()
    .from(paymentMethodsTable)
    .where(eq(paymentMethodsTable.active, true))
    .orderBy(paymentMethodsTable.createdAt);
  res.json(ListPaymentMethodsResponse.parse(methods));
});

router.post(
  "/payment-methods",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = CreatePaymentMethodBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [created] = await db
      .insert(paymentMethodsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(CreatePaymentMethodResponse.parse(created));
  },
);

router.patch(
  "/payment-methods/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdatePaymentMethodParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdatePaymentMethodBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(paymentMethodsTable)
      .set(parsed.data)
      .where(eq(paymentMethodsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Payment method not found" });
      return;
    }

    res.json(UpdatePaymentMethodResponse.parse(updated));
  },
);

router.delete(
  "/payment-methods/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeletePaymentMethodParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(paymentMethodsTable)
      .where(eq(paymentMethodsTable.id, params.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Payment method not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
