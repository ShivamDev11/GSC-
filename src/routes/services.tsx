import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — GullyStrayCare" },
      {
        name: "description",
        content:
          "Emergency rescue, medical treatment, sterilization, adoption, education, and volunteering.",
      },
    ],
  }),
});

const SERVICES = [
  {
    n: "01",
    title: "Emergency Rescue",
    body: "Emergency response team available 9:00 AM to 9:00 PM for guidance over call.",
  },
  {
    n: "02",
    title: "Medical Treatment",
    body: "Comprehensive veterinary care including surgeries and post-op treatments.",
  },
  {
    n: "03",
    title: "Sterilization",
    body: "Population control through humane sterilization and vaccination.",
  },
  {
    n: "04",
    title: "Adoption Services",
    body: "Finding loving forever homes for rescued and rehabilitated animals.",
  },
  {
    n: "05",
    title: "Community Education",
    body: "Awareness programs on responsible pet ownership and animal welfare.",
  },
  {
    n: "06",
    title: "Volunteer Programs",
    body: "Engaging volunteers in rescue operations and daily care activities.",
  },
];

function ServicesPage() {
  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">What we do</p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-6 max-w-4xl">
          Care that{" "}
          <span className="font-display italic font-normal text-primary">never sleeps</span>.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-16">
          Comprehensive programs designed to address every aspect of street animal welfare.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {SERVICES.map((s) => (
            <div
              key={s.n}
              className="bg-background p-10 hover:bg-accent transition-colors min-h-[260px]"
            >
              <span className="font-mono text-primary text-sm">{s.n}</span>
              <h3 className="text-2xl font-bold mt-4 mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto bg-foreground text-background rounded-[3rem] p-12 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <p className="font-mono text-primary text-sm uppercase tracking-widest mb-4">
              Need Help?
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Spotted an animal in distress?</h2>
            <p className="text-background/70 max-w-md">
              Our emergency response team is available 9:00 AM to 9:00 PM. Don't hesitate to reach
              out.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="tel:+918425846304"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-center"
            >
              Call +91 8425846304
            </a>
            <Link
              to="/contact"
              className="px-8 py-4 border border-background/20 rounded-full text-center"
            >
              Email Us
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
