/**
 * One-off seed script for demo/starter data. Run with:
 *   pnpm --filter @workspace/db exec tsx src/seed.ts
 * Safe to re-run: skips inserts if data already exists.
 */
import { db, classesTable, packagesTable } from "./index";

async function seed() {
  const existingClasses = await db.select().from(classesTable);
  if (existingClasses.length === 0) {
    await db.insert(classesTable).values([
      {
        title: "Pole Fundamentals",
        instructor: "Mia Santos",
        dayOfWeek: 1,
        startTime: "18:00",
        endTime: "19:00",
        level: "Beginner",
        capacity: 10,
        description:
          "An introduction to spins, holds, and safe conditioning for first-time pole students.",
      },
      {
        title: "Contemporary Flow",
        instructor: "Jade Reyes",
        dayOfWeek: 2,
        startTime: "19:00",
        endTime: "20:00",
        level: "All Levels",
        capacity: 14,
        description:
          "Expressive floorwork and choreography set to slow, moody tracks.",
      },
      {
        title: "Pole Intermediate",
        instructor: "Mia Santos",
        dayOfWeek: 3,
        startTime: "18:30",
        endTime: "19:45",
        level: "Intermediate",
        capacity: 10,
        description: "Inverts, climbs, and combo sequences for students past the basics.",
      },
      {
        title: "Aerial Hoop",
        instructor: "Camille Dela Cruz",
        dayOfWeek: 4,
        startTime: "19:00",
        endTime: "20:15",
        level: "Beginner",
        capacity: 8,
        description: "Foundational lyra work: mounts, poses, and simple transitions.",
      },
      {
        title: "Heels & Flow",
        instructor: "Jade Reyes",
        dayOfWeek: 5,
        startTime: "20:00",
        endTime: "21:00",
        level: "All Levels",
        capacity: 14,
        description: "Confidence-building choreography in heels, no pole work.",
      },
      {
        title: "Open Studio Practice",
        instructor: "Studio Staff",
        dayOfWeek: 6,
        startTime: "14:00",
        endTime: "16:00",
        level: "All Levels",
        capacity: 12,
        description: "Supervised open floor and pole time to drill your own combos.",
      },
    ]);
    console.log("Seeded classes");
  } else {
    console.log("Classes already present, skipping");
  }

  const existingPackages = await db.select().from(packagesTable);
  if (existingPackages.length === 0) {
    await db.insert(packagesTable).values([
      {
        name: "Drop-In Class",
        description: "Try a single class, any level, any style.",
        category: "Single Class",
        price: 15,
        sessionCount: 1,
        validityDays: 14,
        isPromo: false,
        active: true,
      },
      {
        name: "5-Class Pack",
        description: "Five classes to use across pole, aerial, or dance.",
        category: "Pack",
        price: 65,
        sessionCount: 5,
        validityDays: 60,
        isPromo: false,
        active: true,
      },
      {
        name: "Founding Member Monthly",
        description: "Unlimited classes for a month, launch pricing.",
        category: "Membership",
        price: 89,
        originalPrice: 120,
        sessionCount: 999,
        validityDays: 30,
        isPromo: true,
        active: true,
      },
      {
        name: "New Student Trial Promo",
        description: "First three classes at a special new-student rate.",
        category: "Promo",
        price: 30,
        originalPrice: 45,
        sessionCount: 3,
        validityDays: 30,
        isPromo: true,
        active: true,
      },
    ]);
    console.log("Seeded packages");
  } else {
    console.log("Packages already present, skipping");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
