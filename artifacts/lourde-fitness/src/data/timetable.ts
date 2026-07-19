export type ScheduleClass = {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  packageSlug: string;
};

export type TimetableDay = {
  key: string;
  shortLabel: string;
  date: string;
  dateIso: string;
  fullLabel: string;
  classes: ScheduleClass[];
};

export const timetableDays: TimetableDay[] = [
  {
    key: "sat-18",
    shortLabel: "Today",
    date: "18",
    dateIso: "2026-07-18",
    fullLabel: "Saturday, 18 Jul",
    classes: [],
  },
  {
    key: "sun-19",
    shortLabel: "Sun",
    date: "19",
    dateIso: "2026-07-19",
    fullLabel: "Sunday, 19 Jul",
    classes: [
      {
        id: "sun-kids-1",
        time: "1:00 PM",
        duration: "90 mins",
        title: "Muay Thai Kids Level 1",
        location: "Lourde Grove Studio",
        packageSlug: "private-coaching",
      },
      {
        id: "sun-kids-2",
        time: "3:00 PM",
        duration: "90 mins",
        title: "Muay Thai Kids Level 2",
        location: "Lourde Grove Studio",
        packageSlug: "private-coaching",
      },
      {
        id: "sun-aerial",
        time: "5:00 PM",
        duration: "120 mins",
        title: "Aerial Hammock",
        location: "Lourde Grove Studio",
        packageSlug: "aerial-classes",
      },
      {
        id: "sun-pole",
        time: "7:30 PM",
        duration: "60 mins",
        title: "Pole Beginner",
        location: "Lourde Grove Studio",
        packageSlug: "pole-classes",
      },
    ],
  },
  {
    key: "mon-20",
    shortLabel: "Mon",
    date: "20",
    dateIso: "2026-07-20",
    fullLabel: "Monday, 20 Jul",
    classes: [
      {
        id: "mon-ladies",
        time: "4:00 PM",
        duration: "90 mins",
        title: "Muay Thai Ladies",
        location: "Lourde Grove Studio",
        packageSlug: "private-coaching",
      },
      {
        id: "mon-pole",
        time: "6:00 PM",
        duration: "60 mins",
        title: "Pole Beginner",
        location: "Lourde Grove Studio",
        packageSlug: "pole-classes",
      },
    ],
  },
  {
    key: "tue-21",
    shortLabel: "Tue",
    date: "21",
    dateIso: "2026-07-21",
    fullLabel: "Tuesday, 21 Jul",
    classes: [
      {
        id: "tue-flow",
        time: "1:00 PM",
        duration: "60 mins",
        title: "Sensual Flow",
        location: "Lourde Grove Studio",
        packageSlug: "dance-classes",
      },
      {
        id: "tue-open",
        time: "3:00 PM",
        duration: "90 mins",
        title: "Open Training",
        location: "Lourde Grove Studio",
        packageSlug: "open-training",
      },
      {
        id: "tue-spin",
        time: "7:30 PM",
        duration: "75 mins",
        title: "Spin Pole",
        location: "Lourde Grove Studio",
        packageSlug: "pole-classes",
      },
    ],
  },
  {
    key: "wed-22",
    shortLabel: "Wed",
    date: "22",
    dateIso: "2026-07-22",
    fullLabel: "Wednesday, 22 Jul",
    classes: [
      {
        id: "wed-hammock",
        time: "6:00 PM",
        duration: "75 mins",
        title: "Aerial Hammock",
        location: "Lourde Grove Studio",
        packageSlug: "aerial-classes",
      },
      {
        id: "wed-heels",
        time: "7:30 PM",
        duration: "75 mins",
        title: "Heels Choreography",
        location: "Lourde Grove Studio",
        packageSlug: "dance-classes",
      },
    ],
  },
  {
    key: "thu-23",
    shortLabel: "Thu",
    date: "23",
    dateIso: "2026-07-23",
    fullLabel: "Thursday, 23 Jul",
    classes: [
      {
        id: "thu-pole",
        time: "6:00 PM",
        duration: "60 mins",
        title: "Pole Beginner",
        location: "Lourde Grove Studio",
        packageSlug: "pole-classes",
      },
      {
        id: "thu-aerial-pass",
        time: "7:30 PM",
        duration: "90 mins",
        title: "Unli Aerial Pass Session",
        location: "Lourde Grove Studio",
        packageSlug: "unli-aerial-pass",
      },
    ],
  },
  {
    key: "fri-24",
    shortLabel: "Fri",
    date: "24",
    dateIso: "2026-07-24",
    fullLabel: "Friday, 24 Jul",
    classes: [
      {
        id: "fri-dance",
        time: "6:00 PM",
        duration: "75 mins",
        title: "Chair Dance",
        location: "Lourde Grove Studio",
        packageSlug: "dance-classes",
      },
    ],
  },
];

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
