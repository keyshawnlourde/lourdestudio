import { useCallback, useRef, useState } from "react";
import { Link } from "wouter";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isScheduleClassExpired,
  timetableDays,
  type TimetableDay,
} from "@/data/timetable";

function classCountLabel(count: number) {
  return `${count} ${count === 1 ? "class" : "classes"}`;
}

function DateSelector({
  selectedDay,
  onSelect,
}: {
  selectedDay: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {timetableDays.map((day) => {
        const active = selectedDay === day.key;

        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onSelect(day.key)}
            className={`grid min-w-[64px] place-items-center rounded-lg border px-2.5 py-2.5 transition ${
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <span className="text-[11px] font-medium">{day.shortLabel}</span>
            <span className="mt-0.5 text-lg font-bold leading-none">{day.date}</span>
          </button>
        );
      })}
    </div>
  );
}

function DaySection({
  day,
  sectionRef,
}: {
  day: TimetableDay;
  sectionRef: (element: HTMLElement | null) => void;
}) {
  return (
    <section ref={sectionRef}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-y bg-card/95 px-4 py-2.5 backdrop-blur md:px-5">
        <h2 className="font-serif text-lg text-foreground">{day.fullLabel}</h2>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
          {classCountLabel(day.classes.length)}
        </span>
      </div>

      {day.classes.length === 0 ? (
        <div className="border-b bg-background px-4 py-4 text-sm text-muted-foreground md:px-5">
          <span>No classes scheduled.</span>
        </div>
      ) : (
        <div className="divide-y divide-border bg-background">
          {day.classes.map((classItem) => (
            (() => {
              const expired = isScheduleClassExpired(day, classItem);

              return (
                <article
                  key={classItem.id}
                  className={`grid gap-3 px-4 py-4 transition md:grid-cols-[132px_1fr_auto] md:items-center md:px-5 ${
                    expired ? "bg-muted/40 opacity-70" : "hover:bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3 md:block">
                    <div className="text-xl font-bold leading-none text-foreground md:text-2xl">
                      {classItem.time}
                    </div>
                    <div className="h-7 w-px bg-border md:hidden" />
                    <div className="text-xs font-semibold text-muted-foreground md:mt-1">
                      {classItem.duration}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground md:text-lg">
                      {classItem.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{classItem.location}, Studio</span>
                    </div>
                  </div>

                  {expired ? (
                    <Button
                      disabled
                      variant="outline"
                      className="h-10 w-full rounded-full px-6 text-sm font-medium md:w-auto"
                    >
                      Expired
                    </Button>
                  ) : (
                    <Link href={`/classes/${classItem.packageSlug}`}>
                      <Button className="h-10 w-full rounded-full px-6 text-sm font-medium md:w-auto">
                        Book Now
                      </Button>
                    </Link>
                  )}
                </article>
              );
            })()
          ))}
        </div>
      )}
    </section>
  );
}

export function Timetable() {
  const [selectedDay, setSelectedDay] = useState(timetableDays[0].key);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleSelectDay = useCallback((key: string) => {
    setSelectedDay(key);

    const container = scheduleRef.current;
    const section = dayRefs.current[key];

    if (!container || !section) return;

    container.scrollTo({
      top: section.offsetTop,
      behavior: "smooth",
    });
  }, []);

  const handleScheduleScroll = useCallback(() => {
    const container = scheduleRef.current;
    if (!container) return;

    const marker = container.getBoundingClientRect().top + 48;
    let activeDay = timetableDays[0].key;

    for (const day of timetableDays) {
      const section = dayRefs.current[day.key];
      if (!section) continue;

      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        activeDay = day.key;
        break;
      }

      if (rect.top <= marker) {
        activeDay = day.key;
      }
    }

    setSelectedDay((current) => (current === activeDay ? current : activeDay));
  }, []);

  return (
    <section className="bg-background px-4 py-10 md:py-14">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">
              Timetable
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Browse upcoming classes, choose a date, and book directly from the
              studio schedule.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-fit gap-2 rounded-full border-primary/30 bg-transparent px-4 text-sm hover:bg-primary/5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/10 bg-card shadow-sm">
          <div className="border-b bg-card px-4 py-3 md:px-5">
            <DateSelector selectedDay={selectedDay} onSelect={handleSelectDay} />
          </div>

          <div
            ref={scheduleRef}
            onScroll={handleScheduleScroll}
            className="max-h-[560px] overflow-y-auto bg-card"
          >
            {timetableDays.map((day) => (
              <DaySection
                key={day.key}
                day={day}
                sectionRef={(element) => {
                  dayRefs.current[day.key] = element;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
