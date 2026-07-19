import { useMemo, useState } from "react";
import { Link, Redirect, useParams } from "wouter";
import { ArrowLeft, CalendarDays, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isScheduleClassExpired,
  timetableDays,
  type ScheduleClass,
} from "@/data/timetable";

type PassOption = {
  id: string;
  label: string;
  sessions: number;
  price: number;
  note?: string;
};

type ClassOffering = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  capacityText: string;
  image: string;
  passes: PassOption[];
};

type ScheduleSlot = {
  id: string;
  dayLabel: string;
  classItem: ScheduleClass;
};

export const classOfferings: ClassOffering[] = [
  {
    slug: "muay-thai",
    title: "Muay Thai",
    eyebrow: "Discipline + Strength",
    summary:
      "Ladies and kids classes focused on conditioning, technique, and confident movement.",
    capacityText: "Up to 10 students",
    image:
      "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    passes: [
      { id: "ladies-single", label: "Ladies - 1 Session", sessions: 1, price: 650 },
      { id: "ladies-3", label: "Ladies - 3 Sessions", sessions: 3, price: 1900 },
      { id: "ladies-5", label: "Ladies - 5 Sessions", sessions: 5, price: 3000 },
      { id: "kids-single", label: "Kids - 1 Session", sessions: 1, price: 550 },
      { id: "kids-3", label: "Kids - 3 Sessions", sessions: 3, price: 1600 },
      { id: "kids-5", label: "Kids - 5 Sessions", sessions: 5, price: 2600 },
    ],
  },
  {
    slug: "karate",
    title: "Kyokushinryu Karate",
    eyebrow: "Balance + Control",
    summary:
      "A strong technical class for discipline, posture, striking fundamentals, and focus.",
    capacityText: "Up to 12 students",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    passes: [
      { id: "single", label: "1 Session", sessions: 1, price: 500 },
      { id: "eight", label: "8 Sessions", sessions: 8, price: 3500 },
    ],
  },
  {
    slug: "reformer-pilates",
    title: "Reformer Pilates",
    eyebrow: "Stronger Body",
    summary:
      "Reformer sessions for postural work, strength, alignment, and controlled progression.",
    capacityText: "Private, duo, or max 4 group reformer",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    passes: [
      { id: "one-on-one-1", label: "One-on-One - 1 Session", sessions: 1, price: 1500 },
      { id: "one-on-one-5", label: "One-on-One - 5 Sessions", sessions: 5, price: 7000 },
      { id: "one-on-one-10", label: "One-on-One - 10 Sessions", sessions: 10, price: 13000 },
      { id: "duo-1", label: "Duo - 1 Session", sessions: 1, price: 1000 },
      { id: "duo-5", label: "Duo - 5 Sessions", sessions: 5, price: 4800 },
      { id: "duo-10", label: "Duo - 10 Sessions", sessions: 10, price: 9000 },
      { id: "group-1", label: "Group Reformer - 1 Session", sessions: 1, price: 850, note: "per person" },
      { id: "group-5", label: "Group Reformer - 5 Sessions", sessions: 5, price: 3800 },
      { id: "group-10", label: "Group Reformer - 10 Sessions", sessions: 10, price: 7000 },
    ],
  },
  {
    slug: "mat-pilates",
    title: "Mat Pilates",
    eyebrow: "Calmer Mind",
    summary:
      "Accessible mat sessions for core strength, mobility, balance, and clean movement patterns.",
    capacityText: "Up to 8 students",
    image:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    passes: [
      { id: "single", label: "1 Session", sessions: 1, price: 550 },
      { id: "three", label: "3 Sessions", sessions: 3, price: 1560 },
      { id: "five", label: "5 Sessions", sessions: 5, price: 2500 },
      { id: "ten", label: "10 Sessions", sessions: 10, price: 4500 },
    ],
  },
  {
    slug: "hammock",
    title: "Hammock",
    eyebrow: "Aerial Class",
    summary:
      "Small group aerial hammock sessions. Three students are needed for the class to proceed.",
    capacityText: "3 students needed to proceed",
    image:
      "https://images.unsplash.com/photo-1616279969096-54b228c6173d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    passes: [
      { id: "single", label: "1 Session", sessions: 1, price: 650 },
    ],
  },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOffering(slug: string | undefined) {
  return classOfferings.find((offering) => offering.slug === slug);
}

function getScheduleSlots(slug: string | undefined): ScheduleSlot[] {
  if (!slug) return [];

  return timetableDays.flatMap((day) =>
    day.classes
      .filter(
        (classItem) =>
          classItem.packageSlug === slug && !isScheduleClassExpired(day, classItem),
      )
      .map((classItem) => ({
        id: `${day.key}-${classItem.id}`,
        dayLabel: day.fullLabel,
        classItem,
      })),
  );
}

function buildCheckoutHref(
  params: Record<string, string | number | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return `/checkout?${searchParams.toString()}`;
}

export function ClassesPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-14">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Lourde Price List
          </p>
          <h1 className="font-serif text-5xl text-foreground md:text-7xl">
            Classes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Buy a single class or a multi-session pass. Every class pass expires
            30 days after purchase, and dates can be booked from available
            timetable slots.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {classOfferings.map((offering) => {
            const startingPrice = Math.min(
              ...offering.passes.map((pass) => pass.price),
            );

            return (
              <Link
                key={offering.slug}
                href={`/classes/${offering.slug}`}
                className="group block"
              >
                <article className="h-full overflow-hidden rounded-lg border border-primary/10 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={offering.image}
                      alt={offering.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {offering.eyebrow}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl text-foreground">
                      {offering.title}
                    </h2>
                    <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                      {offering.summary}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <span className="text-sm text-muted-foreground">
                        From{" "}
                        <span className="font-semibold text-foreground">
                          {formatMoney(startingPrice)}
                        </span>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        View passes
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function ClassDetail() {
  const { slug } = useParams<{ slug: string }>();
  const offering = getOffering(slug);
  const [selectedPassId, setSelectedPassId] = useState(
    offering?.passes[0]?.id ?? "",
  );

  const scheduleSlots = useMemo(() => getScheduleSlots(offering?.slug), [offering]);
  const selectedPass =
    offering?.passes.find((pass) => pass.id === selectedPassId) ??
    offering?.passes[0];

  if (!offering || !selectedPass) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="mb-4 font-serif text-4xl">Class not found</h1>
          <p className="mb-8 text-muted-foreground">
            This class is not in the current Lourde catalogue.
          </p>
          <Link href="/classes">
            <Button className="rounded-full px-8">Back to Classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkoutHref = buildCheckoutHref({
    type: "class-pass",
    title: offering.title,
    option: selectedPass.label,
    credits: selectedPass.sessions,
    bookedSlots: 0,
    quantity: 1,
    amount: selectedPass.price,
    returnTo: `/classes/${offering.slug}`,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <Link
          href="/classes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-primary/10 bg-card shadow-sm lg:sticky lg:top-28">
            <img
              src={offering.image}
              alt={offering.title}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="border-t bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Class pass
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Buy credits now, then book your preferred dates from your
                customer portal. Credits expire 30 days after purchase.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              {offering.eyebrow}
            </p>
            <h1 className="font-serif text-5xl text-foreground md:text-7xl">
              {offering.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              {offering.summary}
            </p>

            <div className="mt-8 grid gap-3 rounded-lg border border-primary/10 bg-card p-4 shadow-sm sm:grid-cols-3">
              <div>
                <Users className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Capacity
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {offering.capacityText}
                </p>
              </div>
              <div>
                <CalendarDays className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Validity
                </p>
                <p className="mt-1 font-medium text-foreground">30 days</p>
              </div>
              <div>
                <Clock className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Booking
                </p>
                <p className="mt-1 font-medium text-foreground">
                  Advance booking required
                </p>
              </div>
            </div>

            <div className="mt-9">
              <h2 className="font-serif text-3xl text-foreground">
                Choose a pass
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Select the number of credits you want to add to your account.
              </p>
              <div className="mt-5 grid gap-3">
                {offering.passes.map((pass) => {
                  const active = selectedPass.id === pass.id;

                  return (
                    <button
                      key={pass.id}
                      type="button"
                      onClick={() => setSelectedPassId(pass.id)}
                      className={`grid gap-4 rounded-lg border p-4 text-left transition sm:grid-cols-[1fr_auto] sm:items-center ${
                        active
                          ? "border-foreground bg-background shadow-sm ring-1 ring-foreground/5"
                          : "border-primary/10 bg-card hover:border-primary/40"
                      }`}
                    >
                      <span>
                        <span className="block font-medium text-foreground">
                          {pass.label}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {pass.sessions} credit{pass.sessions === 1 ? "" : "s"}
                          {" · "}Expires after 30 days
                          {pass.note ? ` · ${pass.note}` : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-3 sm:justify-end">
                        <span className="font-serif text-2xl text-primary">
                          {formatMoney(pass.price)}
                        </span>
                        <span
                          className={`h-3 w-3 rounded-full border ${
                            active
                              ? "border-primary bg-primary"
                              : "border-primary/40"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-primary/10 bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Selected pass
                  </p>
                  <p className="mt-2 font-serif text-3xl text-foreground">
                    {selectedPass.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPass.sessions} credit
                    {selectedPass.sessions === 1 ? "" : "s"} · valid for 30
                    days
                  </p>
                </div>
                <p className="font-serif text-4xl text-primary">
                  {formatMoney(selectedPass.price)}
                </p>
              </div>
            </div>

            <Link href={checkoutHref} className="mt-8 block">
              <Button className="h-14 w-full rounded-full bg-foreground text-base text-background hover:bg-foreground/90">
                Buy Credits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y bg-card py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Upcoming timetable
              </p>
              <h2 className="font-serif text-4xl text-foreground md:text-5xl">
                Available {offering.title} times
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              These are the next sessions for this class. Purchase credits first,
              then choose your dates from your customer portal.
            </p>
          </div>

          {scheduleSlots.length === 0 ? (
            <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
              No upcoming timetable slots are currently available.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scheduleSlots.map((slot) => {
                const remaining = Math.max(
                  0,
                  slot.classItem.capacity - slot.classItem.booked,
                );

                return (
                  <article
                    key={slot.id}
                    className="rounded-lg border border-primary/10 bg-background p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                          {slot.dayLabel}
                        </p>
                        <p className="mt-3 font-serif text-3xl text-foreground">
                          {slot.classItem.time}
                        </p>
                      </div>
                      <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                        {remaining} remaining
                      </span>
                    </div>
                    <div className="mt-5 border-t pt-4">
                      <p className="font-medium text-foreground">
                        {slot.classItem.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {slot.classItem.duration} · Lourde Grove Studio
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function Packages() {
  return <Redirect to="/classes" />;
}

export function PackageDetail() {
  return <Redirect to="/classes" />;
}
