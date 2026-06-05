import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import aboutImg from "@/assets/about-rescued.jpg";
import { Reviews } from "@/components/Reviews";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — GullyStrayCare" },
      {
        name: "description",
        content: "Our mission: dignity, care, and a second chance for India's street animals.",
      },
    ],
  }),
});

function AboutPage() {
  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">About us</p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-12 max-w-4xl">
          We exist because{" "}
          <span className="font-display italic font-normal text-primary">every street soul</span>{" "}
          deserves to be seen.
        </h1>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <img
            src={aboutImg}
            alt="A rescued dog running joyfully"
            width={1280}
            height={896}
            className="w-full aspect-[4/3] object-cover rounded-3xl"
            loading="lazy"
          />
          <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
            <p>
              GullyStrayCare is an India-based animal welfare organization dedicated to the rescue,
              rehabilitation, and rehoming of street animals. From critical surgeries to community
              feeding drives, our work reaches the lives that the city has forgotten.
            </p>
            <p>
              Founded by a small group of volunteers in Mumbai, we now operate across 12+ cities
              with a network of veterinarians, foster homes, and on-ground responders available from
              9:00 AM to 9:00 PM, every day.
            </p>
            <p className="font-display italic text-2xl text-primary">
              "Every rescue is a victory against suffering." — Dr. Sarah
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-accent">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Medical Miracles",
              body: "Over 150+ medical procedures performed, giving critically injured animals a second chance.",
            },
            {
              title: "Community Partnerships",
              body: "Working with 10+ local partners and shelters to create a network of care across India.",
            },
            {
              title: "Education Impact",
              body: "500+ awareness programs reaching over 100,000 people with animal welfare education.",
            },
          ].map((c) => (
            <div key={c.title}>
              <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Reviews />
    </PageLayout>
  );
}
