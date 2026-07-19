import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Soft atmospheric background */}
        <div className="absolute inset-0 bg-[#E8E1DA] -z-20"></div>
        
        {/* Decorative blur elements for the "woodsy light" feel */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#D4C3B3]/40 blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EFE8E2]/60 blur-3xl -z-10 mix-blend-overlay"></div>

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="max-w-2xl text-center lg:text-left pt-20 lg:pt-0">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-foreground mb-8">
              Movement,<br />
              <span className="text-primary italic font-light">Refined.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              An elevated boutique studio specializing in pole fitness, aerial arts, and dance. Find your strength in a space designed for grace.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/timetable">
                <Button size="lg" className="h-14 px-8 text-base font-medium rounded-full w-full sm:w-auto shadow-md">
                  View Schedule
                </Button>
              </Link>
              <Link href="/packages">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium rounded-full w-full sm:w-auto bg-transparent border-primary/20 hover:bg-primary/5">
                  Explore Packages
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            {/* Elegant overlapping image composition */}
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto z-10 rounded-t-full overflow-hidden shadow-2xl ring-1 ring-white/20">
              <img 
                src="https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=800" 
                alt="Studio interior" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 aspect-square w-64 rounded-full overflow-hidden border-4 border-background shadow-xl z-20">
              <img 
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=600" 
                alt="Pole fitness detail" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl mb-8">The Space</h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mb-10"></div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
              Lourde was born from a desire for something different—a fitness space that doesn't feel like a gym. 
              Flooded with natural light, accented with warm oak, and maintained with meticulous care, our studio 
              is your sanctuary for movement. We believe the environment you train in matters just as much as the training itself.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-card py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Studio in action
              </p>
              <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
                See the energy inside Lourde.
              </h2>
              <p className="mt-6 max-w-xl text-base font-light leading-8 text-muted-foreground md:text-lg">
                A closer look at the movement, music, and atmosphere that shape
                every class in the studio.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-primary/10 bg-background shadow-xl shadow-primary/10">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/y6120QOlsfU"
                  title="Lourde studio video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-10 shadow-sm border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
              <h3 className="font-serif text-2xl mb-4">Pole Fitness</h3>
              <p className="text-muted-foreground font-light mb-8">From foundational spins to elite inversions. Build incredible upper body and core strength.</p>
              <Link href="/timetable" className="text-primary font-medium text-sm tracking-wide uppercase flex items-center gap-2 hover:gap-3 transition-all">
                Book a class &rarr;
              </Link>
            </div>
            <div className="bg-background rounded-2xl p-10 shadow-sm border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
              <h3 className="font-serif text-2xl mb-4">Sensual Dance</h3>
              <p className="text-muted-foreground font-light mb-8">Connect with your body through fluid movement, musicality, and expressive choreography.</p>
              <Link href="/timetable" className="text-primary font-medium text-sm tracking-wide uppercase flex items-center gap-2 hover:gap-3 transition-all">
                Book a class &rarr;
              </Link>
            </div>
            <div className="bg-background rounded-2xl p-10 shadow-sm border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
              <h3 className="font-serif text-2xl mb-4">Private Rental</h3>
              <p className="text-muted-foreground font-light mb-8">Book the entire studio for private practice, content creation, or intimate workshops.</p>
              <Link href="/rental" className="text-primary font-medium text-sm tracking-wide uppercase flex items-center gap-2 hover:gap-3 transition-all">
                Request time &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
