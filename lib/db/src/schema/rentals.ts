import { pgTable, text, serial, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rentalsTable = pgTable("rentals", {
  id: serial("id").primaryKey(),
  requesterName: text("requester_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "rejected"] })
    .notNull()
    .default("pending"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertRentalSchema = createInsertSchema(rentalsTable).omit({
  id: true,
  status: true,
  reviewNotes: true,
  createdAt: true,
});
export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentalsTable.$inferSelect;
