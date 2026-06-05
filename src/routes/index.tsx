import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GullyStrayCare — Dignity for every street animal in India" },
      {
        name: "description",
        content:
          "GullyStrayCare provides medical aid, sterilization, and adoption services for India's street animals. Join us in restoring dignity to every life.",
      },
    ],
  }),
});

function MagneticButton({
  children,
  className = "",
  to,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  to?: string;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }

  const inner = (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
  const wrapperCls = "inline-block";
  if (to)
    return (
      <Link to={to} onMouseMove={onMove} onMouseLeave={onLeave} className={wrapperCls}>
        {inner}
      </Link>
    );
  return (
    <a href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={wrapperCls}>
      {inner}
    </a>
  );
}

function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Restart hero video from 0 on every mount / refresh
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
    } catch (err) {
      if (console.debug) console.debug("Video reset seek error: ", err);
    }
    v.play().catch(() => {});
  }, []);

  return (
    <PageLayout>
      <header className="relative overflow-hidden px-6 py-20 lg:py-32">
        {/* Floating ambient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.78 0.16 50 / 0.55), transparent 60%)",
            animation: "float-y 12s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -right-32 size-[26rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, oklch(0.7 0.12 30 / 0.5), transparent 60%)",
            animation: "float-y 14s ease-in-out infinite reverse",
          }}
        />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 animate-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/60 backdrop-blur-md mb-8 shadow-sm">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest">
                Compassion in Action
              </span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              Dignity for <br />
              <span
                className="font-display italic font-normal bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, var(--primary), oklch(0.72 0.16 40), var(--primary))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 6s linear infinite",
                }}
              >
                every
              </span>{" "}
              life.
            </h1>
            <p className="max-w-md text-xl text-muted-foreground leading-relaxed mb-10">
              Street animals are the soul of our cities. We provide medical aid, sterilization, and
              a second chance at belonging.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <MagneticButton to="/donate">
                <span className="relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-[0_10px_40px_-10px_oklch(0.595_0.142_45/0.7)] hover:shadow-[0_20px_60px_-12px_oklch(0.595_0.142_45/0.9)] transition-shadow">
                  Start a Donation
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </MagneticButton>
              <MagneticButton href="tel:+918425846304">
                <span className="flex items-center gap-3 px-6 py-4 border border-border rounded-full font-mono text-sm bg-background/60 backdrop-blur-md hover:bg-background transition-colors">
                  <span className="size-2 bg-green-500 rounded-full animate-pulse" />
                  Emergency: +91 8425846304
                </span>
              </MagneticButton>
            </div>
          </div>

          <div className="lg:col-span-6 animate-reveal [animation-delay:200ms]">
            <div className="relative group">
              {/* Glow */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[3rem] opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.595 0.142 45 / 0.5), oklch(0.78 0.16 50 / 0.4))",
                }}
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] outline-1 -outline-offset-1 outline-black/10 shadow-2xl">
                <video
                  ref={videoRef}
                  src="/preloader.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle cinematic vignette */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 50%, oklch(0.15 0.02 50 / 0.45))",
                  }}
                />
                {/* Glass caption */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md text-white">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Live impact
                    </span>
                  </div>
                  <span className="text-xs opacity-80">12+ cities · 550+ rescues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature triad — premium glass cards */}
      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div>
              <p className="font-mono text-primary text-sm uppercase tracking-widest mb-3">
                What we do
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter max-w-2xl">
                Care that reaches every corner.
              </h2>
            </div>
            <Link
              to="/services"
              className="story-link text-sm font-mono uppercase tracking-widest text-primary"
            >
              Explore services →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tag: "01 / Rescue",
                title: "Emergency response",
                body: "On-ground responders mobilize within minutes — every life is a priority.",
              },
              {
                tag: "02 / Heal",
                title: "Medical & sterilization",
                body: "Surgeries, vaccinations, and community sterilization to break the cycle of suffering.",
              },
              {
                tag: "03 / Home",
                title: "Adoption & fostering",
                body: "A nationwide network of foster homes that turns survival into belonging.",
              },
            ].map((c, i) => (
              <div
                key={c.tag}
                className="group relative rounded-3xl border border-border bg-background/60 backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-reveal"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div
                  aria-hidden
                  className="absolute -top-24 -right-24 size-64 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.595 0.142 45 / 0.4), transparent 70%)",
                  }}
                />
                <p className="font-mono text-xs text-primary uppercase tracking-widest mb-6">
                  {c.tag}
                </p>
                <h3 className="text-2xl font-bold tracking-tight mb-3">{c.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{c.body}</p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-6 pb-24">
        <div
          className="relative max-w-7xl mx-auto rounded-[2rem] p-10 lg:p-16 overflow-hidden text-background"
          style={{
            background: "linear-gradient(135deg, oklch(0.25 0.03 50), oklch(0.32 0.06 45))",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-32 -right-24 size-96 rounded-full opacity-50 blur-3xl"
            style={{
              background: "radial-gradient(circle, oklch(0.7 0.16 45 / 0.7), transparent 70%)",
              animation: "float-y 10s ease-in-out infinite",
            }}
          />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
                A small gift, a <span className="font-display italic">huge</span> ripple.
              </h2>
              <p className="text-background/70 max-w-md">
                ₹500 funds a sterilization. ₹2,000 funds a life-saving surgery. Every rupee is
                traceable.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <MagneticButton to="/donate">
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground rounded-full font-bold text-lg shadow-2xl">
                  Donate now →
                </span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
