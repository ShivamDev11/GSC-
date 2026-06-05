import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { ImpactStats } from "@/components/ImpactStats";

export const Route = createFileRoute("/impact")({
  component: ImpactPage,
  head: () => ({
    meta: [
      { title: "Impact — GullyStrayCare" },
      {
        name: "description",
        content: "Every number represents a life saved. See the impact of our community.",
      },
    ],
  }),
});

function ImpactPage() {
  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">Our impact</p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-6 max-w-4xl">
          Transforming lives,
          <br />
          <span className="font-display italic font-normal text-primary">one story</span> at a time.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Every number represents a life saved, a family completed, and a community made more
          compassionate.
        </p>
      </section>

      <ImpactStats />

      <section className="px-6 py-32 max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {[
          {
            title: "Medical Miracles",
            body: "Over 150+ medical procedures performed, giving critically injured animals a second chance at life.",
          },
          {
            title: "Community Partnerships",
            body: "Working with 10+ local partners, shelters, and volunteers to create a network of care across India.",
          },
          {
            title: "Education Impact",
            body: "Conducted 500+ awareness programs, reaching over 100,000 people with animal welfare education.",
          },
        ].map((c) => (
          <div key={c.title} className="border-t border-border pt-6">
            <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>
    </PageLayout>
  );
}
