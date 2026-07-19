import { Link } from "wouter";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden py-20 md:py-28">
        {/* Soft atmospheric background */}
        <div className="absolute inset-0 bg-[#E8E1DA] -z-20"></div>

        {/* Decorative blur elements for the "woodsy light" feel */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#D4C3B3]/40 blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EFE8E2]/60 blur-3xl -z-10 mix-blend-overlay"></div>

        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto max-w-4xl pt-12 md:pt-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-primary">
              Boutique pole, aerial and dance studio
            </p>
            <h1 className="font-serif text-6xl leading-none tracking-tight text-foreground md:text-8xl lg:text-9xl">
              Lourde Studio
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl">
              An elevated space for strength, grace, and refined movement.
              Train pole, aerial, and dance in a studio designed to feel as good
              as it performs.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/timetable">
                <Button size="lg" className="h-14 px-8 text-base font-medium rounded-full w-full sm:w-auto shadow-md">
                  View Schedule
                </Button>
              </Link>
              <Link href="/classes">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium rounded-full w-full sm:w-auto bg-transparent border-primary/20 hover:bg-primary/5">
                  Explore Classes
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Story Section */}
      <section className="relative overflow-hidden bg-background py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl mb-8">The Space</h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mb-10"></div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
              Lourde was born from a desire for something different—a fitness space that doesn't feel like a gym. 
              Flooded with natural light, accented with warm oak, and maintained with meticulous care, our studio 
              is your sanctuary for movement. We believe the environment you train in matters just as much as the training itself.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-lg border border-primary/10 bg-card shadow-xl shadow-primary/10">
            <video
              className="aspect-video h-full w-full bg-foreground object-cover"
              controls
              playsInline
              preload="metadata"
            >
              <source
                src="https://videos.pexels.com/video-files/8956295/8956295-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Visit the studio
            </p>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Find us in the city.
            </h2>
          </div>

          <div className="grid overflow-hidden rounded-lg border border-primary/10 bg-card shadow-sm lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[360px] overflow-hidden bg-[#EEE8E1]">
              <div className="absolute left-[-8%] top-[18%] h-16 w-[120%] rotate-[-8deg] bg-background/80" />
              <div className="absolute left-[-12%] top-[62%] h-14 w-[126%] rotate-[11deg] bg-background/75" />
              <div className="absolute left-[32%] top-[-10%] h-[125%] w-16 rotate-[4deg] bg-background/85" />
              <div className="absolute left-[65%] top-[-10%] h-[125%] w-12 rotate-[-2deg] bg-background/70" />
              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_10px_rgba(169,125,80,0.18)]" />
              <div className="absolute left-1/2 top-1/2 mt-7 w-56 -translate-x-1/2 rounded-lg border border-primary/10 bg-background/95 p-4 text-center shadow-xl">
                <p className="font-serif text-xl text-foreground">
                  Lourde Grove Studio
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bonifacio Global City
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="font-serif text-3xl text-foreground">
                Lourde Grove Studio
              </h3>
              <div className="mt-6 space-y-5 text-sm leading-6 text-muted-foreground">
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      123 Movement Way, Bonifacio Global City
                    </p>
                    <p>Taguig, Metro Manila 1634</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Studio hours</p>
                    <p>Monday to Sunday, 10:00 AM - 10:00 PM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p>+63 912 345 6789</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p>hello@lourdegrove.studio</p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Bonifacio+Global+City+Taguig"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
