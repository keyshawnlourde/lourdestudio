import {
  pgTable,
  text,
  serial,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  packageId: integer("package_id").notNull(),
  amount: numeric("amount", { mode: "number" }).notNull(),
  screenshotObjectPath: text("screenshot_object_path").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "rejected"] })
    .notNull()
    .default("pending"),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({
  id: true,
  status: true,
  reviewNotes: true,
  submittedAt: true,
  reviewedAt: true,
});
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchasesTable.$inferSelect;
