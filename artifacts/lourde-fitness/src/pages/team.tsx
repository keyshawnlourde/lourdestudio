const coaches = [
  {
    name: "Allen",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    alt: "Allen, Lourde instructor",
    bio: "A powerhouse performer with fierce stage presence and precision-led technique. Allen brings high energy, clean lines, and the kind of confidence that helps every student find their inner diva.",
    focus: ["Performance", "Heels", "Confidence"],
  },
  {
    name: "Anton",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    alt: "Anton, Lourde instructor",
    bio: "Anton blends strength training, musicality, and grounded coaching for students who want to build control from the inside out. Expect sharp foundations, patient cues, and plenty of fire.",
    focus: ["Strength", "Technique", "Flow"],
  },
  {
    name: "Liby",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    alt: "Liby, Lourde instructor",
    bio: "Out goes the doctor, and in comes the pole dance princess. When Liby is not at her clinic, you will catch her teaching pole dancing for beginners and curious first-timers.",
    focus: ["Beginners", "Pole", "Foundations"],
  },
  {
    name: "Myk",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&q=85&w=1200",
    alt: "Myk, Lourde instructor",
    bio: "Ready to unleash your inner fire? Myk explores fluidity and expression in a supportive, empowering environment, with a signature blend of strength, sensuality, and flow.",
    focus: ["Fluidity", "Expression", "Sensual Flow"],
  },
];

export function Team() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-card/80 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Lourde Coaches
          </p>
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
              Meet the team behind every stronger line.
            </h1>
            <p className="max-w-2xl text-base font-light leading-8 text-muted-foreground md:text-lg">
              Our coaches bring performance experience, technical discipline,
              and an encouraging teaching style to pole, dance, aerial, and
              private training.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((coach) => (
            <article
              key={coach.name}
              className="overflow-hidden rounded-lg border border-primary/10 bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={coach.image}
                  alt={coach.alt}
                  className="h-full w-full object-cover grayscale-[12%]"
                />
              </div>
              <div className="space-y-5 p-5">
                <div>
                  <h2 className="font-serif text-3xl text-foreground">
                    {coach.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coach.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-primary/15 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-light leading-7 text-muted-foreground">
                  {coach.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
