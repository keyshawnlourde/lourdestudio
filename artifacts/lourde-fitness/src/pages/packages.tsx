import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isScheduleClassExpired,
  timetableDays,
  type ScheduleClass,
} from "@/data/timetable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClassOffering = {
  slug: string;
  title: string;
  eyebrow: string;
  price: string;
  image: string;
  images: string[];
  summary: string;
  description: string[];
  options: string[];
  times: Array<{
    day: string;
    time: string;
    instructor: string;
    level: string;
  }>;
};

type PackageOffering = {
  slug: string;
  title: string;
  eyebrow: string;
  price: string;
  image: string;
  images: string[];
  summary: string;
  description: string[];
  inclusions: string[];
  bestFor: string;
};

const classOfferings: ClassOffering[] = [
  {
    slug: "open-training",
    title: "Open Training",
    eyebrow: "Independent Practice",
    price: "PHP 300.00",
    image:
      "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Book studio time for self-led practice, conditioning, choreography clean-up, or content days.",
    description: [
      "Open Training gives you access to the studio outside a structured class format. Use the time to repeat combinations, polish transitions, or build confidence with equipment already available in the room.",
      "This session is best for students who already understand safe warm-ups and basic apparatus etiquette. Coaches may be present in the studio, but Open Training is not a taught class.",
    ],
    options: ["Single Open Training", "Five-Session Open Training Pack"],
    times: [
      { day: "Monday", time: "12:00 PM - 2:00 PM", instructor: "Studio Access", level: "Self-led" },
      { day: "Wednesday", time: "2:00 PM - 4:00 PM", instructor: "Studio Access", level: "Self-led" },
      { day: "Saturday", time: "11:00 AM - 1:00 PM", instructor: "Studio Access", level: "Self-led" },
    ],
  },
  {
    slug: "pole-classes",
    title: "Pole Classes",
    eyebrow: "Strength + Technique",
    price: "PHP 600.00",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1540206276207-3af25c08abc4?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Build pole foundations, spins, transitions, climbs, and inversions with precise coaching.",
    description: [
      "Pole Classes move from clean fundamentals into stronger transitions, longer combinations, and progressive conditioning. Each session balances technique, control, and confidence.",
      "Beginners can start with foundations and floor-to-pole flow, while experienced students can refine entries, exits, and shapes with instructor feedback.",
    ],
    options: ["Pole Foundations", "Pole Flow", "Spin Pole", "Inversions"],
    times: [
      { day: "Tuesday", time: "6:00 PM - 7:15 PM", instructor: "Allen", level: "Beginner" },
      { day: "Thursday", time: "7:30 PM - 8:45 PM", instructor: "Myk", level: "Mixed Level" },
      { day: "Sunday", time: "10:00 AM - 11:15 AM", instructor: "Liby", level: "Beginner" },
    ],
  },
  {
    slug: "dance-classes",
    title: "Dance Classes",
    eyebrow: "Flow + Performance",
    price: "From PHP 300.00",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1535525153412-5a42439a210d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Explore choreography, sensual movement, chair work, heels technique, and performance confidence.",
    description: [
      "Dance Classes are built for musicality, expression, and fluid transitions. Expect a focused warm-up, movement drills, then a combination that helps you connect details into performance.",
      "Choose the format that fits your mood: soft flow, chair, heels, or choreography-led sessions.",
    ],
    options: ["Sensual Flow", "Chair Dance", "Heels", "Choreography"],
    times: [
      { day: "Monday", time: "7:30 PM - 8:45 PM", instructor: "Myk", level: "Open Level" },
      { day: "Friday", time: "6:00 PM - 7:15 PM", instructor: "Anton", level: "Open Level" },
      { day: "Saturday", time: "3:00 PM - 4:15 PM", instructor: "Allen", level: "Performance" },
    ],
  },
  {
    slug: "aerial-classes",
    title: "Aerial Classes",
    eyebrow: "Hammock + Hoop + Silks",
    price: "PHP 600.00",
    image:
      "https://images.unsplash.com/photo-1616279969096-54b228c6173d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1616279969096-54b228c6173d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Learn aerial shapes, wraps, climbs, and transitions across hammock, hoop, and silks.",
    description: [
      "Aerial Classes focus on controlled strength, active flexibility, and clean pathways through the apparatus. Students learn how to enter, hold, and exit shapes safely.",
      "Whether you are a beginner or returning aerialist, these sessions offer a structured way to build confidence, coordination, and air awareness.",
    ],
    options: ["Hammock", "Hoop", "Silks", "Aerial Playground"],
    times: [
      { day: "Wednesday", time: "6:00 PM - 7:15 PM", instructor: "Liby", level: "Beginner" },
      { day: "Saturday", time: "1:30 PM - 2:45 PM", instructor: "Anton", level: "Mixed Level" },
      { day: "Sunday", time: "12:00 PM - 1:15 PM", instructor: "Allen", level: "Kids" },
    ],
  },
  {
    slug: "unli-aerial-pass",
    title: "Unli Aerial: 30-Day Class Pass",
    eyebrow: "Unlimited Training",
    price: "PHP 3,000.00",
    image:
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1616279969096-54b228c6173d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "A 30-day aerial pass for students ready to train consistently and progress faster.",
    description: [
      "The Unli Aerial pass is designed for students who want momentum. Attend eligible aerial sessions within a 30-day window and build repetition across hammock, hoop, and silks.",
      "This pass is ideal when you are preparing for a performance, returning to regular training, or committing to a focused month of progress.",
    ],
    options: ["30-Day Aerial Pass"],
    times: [
      { day: "Monday", time: "6:00 PM - 7:15 PM", instructor: "Liby", level: "Eligible" },
      { day: "Wednesday", time: "6:00 PM - 7:15 PM", instructor: "Liby", level: "Eligible" },
      { day: "Saturday", time: "1:30 PM - 2:45 PM", instructor: "Anton", level: "Eligible" },
    ],
  },
  {
    slug: "private-coaching",
    title: "Private Coaching",
    eyebrow: "One-on-One",
    price: "From PHP 1,200.00",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Personalized coaching for pole, aerial, dance, conditioning, and performance preparation.",
    description: [
      "Private Coaching gives you a tailored session plan based on your goals, current level, and preferred apparatus. It is the fastest way to refine details and work through sticking points.",
      "Use private sessions for skill progressions, routine cleaning, confidence building, or a quieter introduction before joining group classes.",
    ],
    options: ["Pole Private", "Aerial Private", "Dance Private", "Performance Prep"],
    times: [
      { day: "Tuesday", time: "1:00 PM - 4:00 PM", instructor: "By Request", level: "Private" },
      { day: "Thursday", time: "1:00 PM - 4:00 PM", instructor: "By Request", level: "Private" },
      { day: "Sunday", time: "2:00 PM - 5:00 PM", instructor: "By Request", level: "Private" },
    ],
  },
];

const packageOfferings: PackageOffering[] = [
  {
    slug: "intro-bundle",
    title: "Intro Bundle",
    eyebrow: "New Student",
    price: "PHP 1,500.00",
    image:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "A balanced starter pack for trying pole, aerial, and dance before committing to a routine.",
    description: [
      "The Intro Bundle gives new students room to explore the studio across a few formats. Use it to understand your preferred class style, coach energy, and training rhythm.",
      "After purchasing the bundle, choose your class dates from the Classes page. Credits can be used on eligible beginner and open-level sessions.",
    ],
    inclusions: ["3 class credits", "Valid for 30 days", "Beginner-friendly classes", "One-time purchase for new students"],
    bestFor: "Students trying Lourde for the first time.",
  },
  {
    slug: "monthly-8",
    title: "Monthly 8-Class Membership",
    eyebrow: "Most Flexible",
    price: "PHP 4,200.00 / month",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1535525153412-5a42439a210d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Eight monthly credits for students training twice a week across pole, dance, or aerial classes.",
    description: [
      "The Monthly 8-Class Membership supports consistent training without requiring you to attend every day. It is designed for students who want progress, flexibility, and access to multiple class styles.",
      "Use credits on eligible scheduled classes throughout the month. Book specific dates from the Classes page once the membership is active.",
    ],
    inclusions: ["8 class credits per month", "Pole, dance, and aerial eligibility", "Priority waitlist support", "Credits reset monthly"],
    bestFor: "Students training one to two times per week.",
  },
  {
    slug: "unlimited-monthly",
    title: "Unlimited Monthly Membership",
    eyebrow: "Highest Commitment",
    price: "PHP 7,500.00 / month",
    image:
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1616279969096-54b228c6173d?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Unlimited eligible group classes for students building momentum through regular training.",
    description: [
      "The Unlimited Monthly Membership is for students who want the freedom to train often. It works well when you are preparing for a performance, building strength, or making movement part of your weekly routine.",
      "Membership covers eligible group classes. Private coaching, rentals, and specialty workshops can remain separate add-ons.",
    ],
    inclusions: ["Unlimited eligible group classes", "Priority booking window", "Member-only studio updates", "Renews monthly"],
    bestFor: "Students training three or more times per week.",
  },
  {
    slug: "private-pack",
    title: "Private Coaching Pack",
    eyebrow: "One-on-One Bundle",
    price: "PHP 5,500.00",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    images: [
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
      "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=800",
    ],
    summary:
      "Five private session credits for focused technique, choreography, or confidence work.",
    description: [
      "The Private Coaching Pack is for students who want detailed feedback and a tailored plan. Use it for skill progressions, choreography cleaning, heels confidence, or aerial fundamentals.",
      "After purchasing, the studio team can confirm coach availability and place each private session on your calendar.",
    ],
    inclusions: ["5 private coaching credits", "Coach matching support", "Technique or routine focus", "Valid for 60 days"],
    bestFor: "Students who want focused individual support.",
  },
];

function formatSlug(slug: string | undefined): ClassOffering | undefined {
  return classOfferings.find((offering) => offering.slug === slug);
}

function formatPackageSlug(slug: string | undefined): PackageOffering | undefined {
  return packageOfferings.find((offering) => offering.slug === slug);
}

function getPriceAmount(price: string): number {
  const match = price.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildCheckoutHref(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return `/checkout?${searchParams.toString()}`;
}

type ScheduleSlot = {
  id: string;
  dayKey: string;
  dayLabel: string;
  classItem: ScheduleClass;
};

function getScheduleSlots(packageSlug: string | undefined): ScheduleSlot[] {
  if (!packageSlug) return [];

  return timetableDays.flatMap((day) =>
    day.classes
      .filter(
        (classItem) =>
          classItem.packageSlug === packageSlug &&
          !isScheduleClassExpired(day, classItem),
      )
      .map((classItem) => ({
        id: `${day.key}-${classItem.id}`,
        dayKey: day.key,
        dayLabel: day.fullLabel,
        classItem,
      })),
  );
}

export function ClassesPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">
            Lourde Classes
          </p>
          <h1 className="mb-5 font-serif text-4xl text-foreground md:text-5xl">
            Book a Class
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground font-light leading-relaxed">
            Browse studio formats, compare single-class pricing, and choose the
            date you want to attend.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classOfferings.map((offering, index) => (
            <Link
              key={offering.slug}
              href={`/classes/${offering.slug}`}
              className="group block"
            >
              <article className="h-full rounded-2xl border border-primary/10 bg-card p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div
                  className={`relative aspect-[16/11] overflow-hidden rounded-xl ${
                    index === 0 || index === 4 ? "bg-muted" : "bg-card"
                  }`}
                >
                  <img
                    src={offering.image}
                    alt={offering.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
                  <div className="absolute left-5 top-5 rounded-full bg-background/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground">
                    {offering.eyebrow}
                  </div>
                </div>

                <div className="px-1 pt-5">
                  <h2 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
                    {offering.title}
                  </h2>
                  <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-muted-foreground">
                    {offering.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="font-medium text-lg">{offering.price}</span>
                    <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                      View Class
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ClassDetail() {
  const { slug } = useParams<{ slug: string }>();
  const offering = formatSlug(slug);
  const [selectedOption, setSelectedOption] = useState(
    offering?.options[0] ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(offering?.images[0] ?? "");
  const [selectedScheduleSlotId, setSelectedScheduleSlotId] = useState("");

  const scheduleSlots = useMemo(
    () => getScheduleSlots(offering?.slug),
    [offering?.slug],
  );

  useEffect(() => {
    setSelectedScheduleSlotId(scheduleSlots[0]?.id ?? "");
  }, [scheduleSlots]);

  const relatedClasses = useMemo(
    () =>
      classOfferings
        .filter((item) => item.slug !== offering?.slug)
        .slice(0, 3),
    [offering],
  );
  const selectedScheduleSlot =
    scheduleSlots.find((slot) => slot.id === selectedScheduleSlotId) ??
    scheduleSlots[0];
  const checkoutHref = selectedScheduleSlot && offering
    ? buildCheckoutHref({
        type: "class",
        title: offering.title,
        option: selectedOption,
        slot: `${selectedScheduleSlot.dayLabel} · ${selectedScheduleSlot.classItem.time} · ${selectedScheduleSlot.classItem.title}`,
        quantity,
        amount: getPriceAmount(offering.price) * quantity,
        returnTo: `/classes/${offering.slug}`,
      })
    : "";

  if (!offering) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-4xl mb-4">Class not found</h1>
          <p className="text-muted-foreground mb-8">
            The class you are looking for is not in the current catalogue.
          </p>
          <Link href="/classes">
            <Button className="rounded-full px-8">Back to Classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Link
          href="/classes"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          <div>
            <div className="aspect-[5/4] overflow-hidden bg-muted">
              <img
                src={selectedImage}
                alt={offering.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5 grid grid-cols-4 gap-4 sm:grid-cols-5">
              {offering.images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden border ${
                    selectedImage === image ? "border-foreground" : "border-transparent"
                  }`}
                  aria-label={`View ${offering.title} image`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-2">
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">
              PXA Dance Studio
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              {offering.title}
            </h1>
            <div className="mb-8 text-2xl font-medium text-foreground">
              {offering.price}
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Classes
                </label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="h-14 rounded-none border-2 border-foreground bg-background px-5 text-base shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {offering.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Quantity
                </label>
                <div className="inline-grid h-14 grid-cols-3 border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex w-16 items-center justify-center hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex w-16 items-center justify-center text-lg">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex w-16 items-center justify-center hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Available Date & Time
                </label>
                {scheduleSlots.length > 0 ? (
                  <Select
                    value={selectedScheduleSlotId}
                    onValueChange={setSelectedScheduleSlotId}
                  >
                    <SelectTrigger className="h-14 rounded-none border-2 border-foreground bg-background px-5 text-base shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.dayLabel} · {slot.classItem.time} · {slot.classItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="border bg-muted px-5 py-4 text-sm text-muted-foreground">
                    No scheduled times are currently listed for this class.
                  </div>
                )}
                {selectedScheduleSlot && (
                  <div className="mt-3 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {selectedScheduleSlot.dayLabel},{" "}
                      {selectedScheduleSlot.classItem.time} ·{" "}
                      {selectedScheduleSlot.classItem.title}
                    </span>
                  </div>
                )}
              </div>

              {selectedScheduleSlot ? (
                <Link href={checkoutHref} className="block">
                  <Button className="h-14 w-full rounded-none bg-foreground text-base text-background hover:bg-foreground/90">
                    Book Selected Time
                  </Button>
                </Link>
              ) : (
                <Button
                  className="h-14 w-full rounded-none bg-foreground text-base text-background hover:bg-foreground/90"
                  disabled
                >
                  Book Selected Time
                </Button>
              )}
            </div>

            <div className="mt-10 space-y-6 text-lg leading-9 text-muted-foreground">
              {offering.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl text-foreground mb-8">
          More Classes
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedClasses.map((item) => (
            <Link
              key={item.slug}
              href={`/classes/${item.slug}`}
              className="group block border bg-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  {item.eyebrow}
                </p>
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function Packages() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">
            Lourde Packages
          </p>
          <h1 className="mb-5 font-serif text-4xl text-foreground md:text-5xl">
            Memberships & Bundles
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground font-light leading-relaxed">
            Choose a monthly membership or credit bundle, then book your class
            dates from the Classes page when you are ready to train.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packageOfferings.map((offering) => (
            <Link
              key={offering.slug}
              href={`/packages/${offering.slug}`}
              className="group block"
            >
              <article className="h-full rounded-2xl border border-primary/10 bg-card p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-card">
                  <img
                    src={offering.image}
                    alt={offering.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
                  <div className="absolute left-5 top-5 rounded-full bg-background/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground">
                    {offering.eyebrow}
                  </div>
                </div>

                <div className="px-1 pt-5">
                  <h2 className="font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
                    {offering.title}
                  </h2>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                    {offering.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="font-medium text-lg">{offering.price}</span>
                    <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                      View Package
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const offering = formatPackageSlug(slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(offering?.images[0] ?? "");

  const relatedPackages = useMemo(
    () =>
      packageOfferings
        .filter((item) => item.slug !== offering?.slug)
        .slice(0, 3),
    [offering],
  );
  const checkoutHref = offering
    ? buildCheckoutHref({
        type: "package",
        title: offering.title,
        quantity,
        amount: getPriceAmount(offering.price) * quantity,
        returnTo: `/packages/${offering.slug}`,
      })
    : "";

  if (!offering) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-4xl mb-4">Package not found</h1>
          <p className="text-muted-foreground mb-8">
            The package you are looking for is not in the current catalogue.
          </p>
          <Link href="/packages">
            <Button className="rounded-full px-8">Back to Packages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Link
          href="/packages"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          <div>
            <div className="aspect-[5/4] overflow-hidden bg-muted">
              <img
                src={selectedImage}
                alt={offering.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5 grid grid-cols-4 gap-4 sm:grid-cols-5">
              {offering.images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden border ${
                    selectedImage === image ? "border-foreground" : "border-transparent"
                  }`}
                  aria-label={`View ${offering.title} image`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-2">
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">
              Lourde Package
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              {offering.title}
            </h1>
            <div className="mb-8 text-2xl font-medium text-foreground">
              {offering.price}
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Quantity
                </label>
                <div className="inline-grid h-14 grid-cols-3 border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex w-16 items-center justify-center hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex w-16 items-center justify-center text-lg">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex w-16 items-center justify-center hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Link href={checkoutHref} className="block">
                <Button className="h-14 w-full rounded-none bg-foreground text-base text-background hover:bg-foreground/90">
                  Purchase Package
                </Button>
              </Link>
            </div>

            <div className="mt-10 space-y-6 text-lg leading-9 text-muted-foreground">
              {offering.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-primary mb-3">
              Included
            </p>
            <h2 className="font-serif text-4xl text-foreground">
              What You Get
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {offering.bestFor}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {offering.inclusions.map((inclusion) => (
              <article key={inclusion} className="border bg-background p-6">
                <p className="font-medium text-foreground">{inclusion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl text-foreground mb-8">
          More Packages
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedPackages.map((item) => (
            <Link
              key={item.slug}
              href={`/packages/${item.slug}`}
              className="group block border bg-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  {item.eyebrow}
                </p>
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
