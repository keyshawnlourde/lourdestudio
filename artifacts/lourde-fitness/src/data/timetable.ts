export type ScheduleClass = {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  packageSlug: string;
  capacity: number;
  booked: number;
};

export type TimetableDay = {
  key: string;
  shortLabel: string;
  date: string;
  dateIso: string;
  fullLabel: string;
  classes: ScheduleClass[];
};

type WeeklyScheduleTemplate = Omit<ScheduleClass, "id">;

const TIMETABLE_WINDOW_DAYS = 8;

const WEEKDAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_FULL_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_SHORT_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weeklySchedule: Record<number, WeeklyScheduleTemplate[]> = {
  0: [
    {
      time: "1:00 PM",
      duration: "90 mins",
      title: "Muay Thai Kids",
      location: "Lourde Grove Studio",
      packageSlug: "muay-thai",
      capacity: 10,
      booked: 6,
    },
    {
      time: "3:00 PM",
      duration: "90 mins",
      title: "Muay Thai Kids",
      location: "Lourde Grove Studio",
      packageSlug: "muay-thai",
      capacity: 10,
      booked: 4,
    },
    {
      time: "5:00 PM",
      duration: "120 mins",
      title: "Hammock",
      location: "Lourde Grove Studio",
      packageSlug: "hammock",
      capacity: 3,
      booked: 1,
    },
    {
      time: "7:30 PM",
      duration: "60 mins",
      title: "Mat Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "mat-pilates",
      capacity: 8,
      booked: 3,
    },
  ],
  1: [
    {
      time: "4:00 PM",
      duration: "90 mins",
      title: "Muay Thai Ladies",
      location: "Lourde Grove Studio",
      packageSlug: "muay-thai",
      capacity: 10,
      booked: 7,
    },
    {
      time: "6:00 PM",
      duration: "60 mins",
      title: "Reformer Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "reformer-pilates",
      capacity: 4,
      booked: 2,
    },
  ],
  2: [
    {
      time: "1:00 PM",
      duration: "60 mins",
      title: "Mat Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "mat-pilates",
      capacity: 8,
      booked: 5,
    },
    {
      time: "3:00 PM",
      duration: "90 mins",
      title: "Kyokushinryu Karate",
      location: "Lourde Grove Studio",
      packageSlug: "karate",
      capacity: 12,
      booked: 8,
    },
    {
      time: "7:30 PM",
      duration: "75 mins",
      title: "Reformer Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "reformer-pilates",
      capacity: 4,
      booked: 3,
    },
  ],
  3: [
    {
      time: "6:00 PM",
      duration: "75 mins",
      title: "Hammock",
      location: "Lourde Grove Studio",
      packageSlug: "hammock",
      capacity: 3,
      booked: 2,
    },
    {
      time: "7:30 PM",
      duration: "75 mins",
      title: "Muay Thai Ladies",
      location: "Lourde Grove Studio",
      packageSlug: "muay-thai",
      capacity: 10,
      booked: 6,
    },
  ],
  4: [
    {
      time: "6:00 PM",
      duration: "60 mins",
      title: "Mat Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "mat-pilates",
      capacity: 8,
      booked: 2,
    },
    {
      time: "7:30 PM",
      duration: "90 mins",
      title: "Kyokushinryu Karate",
      location: "Lourde Grove Studio",
      packageSlug: "karate",
      capacity: 12,
      booked: 9,
    },
  ],
  5: [
    {
      time: "6:00 PM",
      duration: "75 mins",
      title: "Reformer Pilates",
      location: "Lourde Grove Studio",
      packageSlug: "reformer-pilates",
      capacity: 4,
      booked: 1,
    },
  ],
  6: [],
};

function startOfToday(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createTimetableDays(): TimetableDay[] {
  const today = startOfToday();

  return Array.from({ length: TIMETABLE_WINDOW_DAYS }, (_, offset) => {
    const date = addDays(today, offset);
    const weekday = date.getDay();
    const dateIso = toDateIso(date);
    const classes = weeklySchedule[weekday].map((classItem, index) => ({
      ...classItem,
      id: `${dateIso}-${index}-${classItem.packageSlug}`,
    }));

    return {
      key: dateIso,
      shortLabel: offset === 0 ? "Today" : WEEKDAY_SHORT_LABELS[weekday],
      date: String(date.getDate()),
      dateIso,
      fullLabel: `${WEEKDAY_FULL_LABELS[weekday]}, ${date.getDate()} ${
        MONTH_SHORT_LABELS[date.getMonth()]
      }`,
      classes,
    };
  });
}

export const timetableDays: TimetableDay[] = createTimetableDays();

function parseSessionStart(dateIso: string, time: string): Date {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);

  if (!match) {
    return new Date(`${dateIso}T00:00:00+08:00`);
  }

  const [, hourText, minuteText, period] = match;
  let hour = Number(hourText);

  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return new Date(
    `${dateIso}T${String(hour).padStart(2, "0")}:${minuteText}:00+08:00`,
  );
}

export function getSessionStartDate(
  day: TimetableDay,
  classItem: ScheduleClass,
): Date {
  return parseSessionStart(day.dateIso, classItem.time);
}

export function isScheduleClassExpired(
  day: TimetableDay,
  classItem: ScheduleClass,
  now = new Date(),
): boolean {
  return getSessionStartDate(day, classItem).getTime() < now.getTime();
}
