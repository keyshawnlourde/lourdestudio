import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, rentalsTable } from "@workspace/db";
import {
  CreateRentalBody,
  CreateRentalResponse,
  ListRentalsQueryParams,
  ListRentalsResponse,
  ReviewRentalParams,
  ReviewRentalBody,
  ReviewRentalResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/rentals", requireAdmin, async (req, res): Promise<void> => {
  const query = ListRentalsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rentals = await db
    .select()
    .from(rentalsTable)
    .orderBy(rentalsTable.createdAt);

  const filtered = query.data.status
    ? rentals.filter((rental) => rental.status === query.data.status)
    : rentals;

  res.json(ListRentalsResponse.parse(filtered));
});

router.post("/rentals", async (req, res): Promise<void> => {
  const parsed = CreateRentalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(rentalsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateRentalResponse.parse(created));
});

router.patch(
  "/rentals/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = ReviewRentalParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = ReviewRentalBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(rentalsTable)
      .set(parsed.data)
      .where(eq(rentalsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Rental not found" });
      return;
    }

    res.json(ReviewRentalResponse.parse(updated));
  },
);

export default router;
