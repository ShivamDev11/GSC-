import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — GullyStrayCare" },
      {
        name: "description",
        content: "How GullyStrayCare collects, uses, and protects your personal information.",
      },
    ],
  }),
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 text-foreground/80 leading-relaxed">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <PageLayout>
      <article className="px-6 py-24 max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <p className="font-mono text-primary text-sm uppercase tracking-widest">Privacy Policy</p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
            Your privacy{" "}
            <span className="font-display italic font-normal text-primary">matters to us</span>.
          </h1>
          <p className="text-muted-foreground">
            At GullyStrayCare, we are committed to protecting your privacy and ensuring the security
            of your personal information.
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Last updated: December 2024
          </p>
        </header>

        <Section title="Information We Collect">
          <p>
            <strong>Personal Information.</strong> When you donate, volunteer, or contact us, we may
            collect:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, and phone number</li>
            <li>Donation amount and payment information</li>
            <li>PAN and Aadhaar details (for 80G tax exemption certificates)</li>
            <li>Address information for tax certificates</li>
            <li>Communication preferences</li>
          </ul>
          <p>
            <strong>Automatic Information.</strong> We may collect technical information such as IP
            address, browser type, and website usage patterns to improve our services.
          </p>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="list-disc pl-6 space-y-1">
            <li>Process donations and issue tax exemption certificates</li>
            <li>Send updates about our rescue operations and impact</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Coordinate volunteer activities and adoption processes</li>
            <li>Comply with legal requirements and tax regulations</li>
            <li>Improve our website and services</li>
          </ul>
        </Section>

        <Section title="Information Sharing and Security">
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
          <p>We may share information only in these circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>With payment processors (Razorpay) to complete donations</li>
            <li>With government authorities for tax compliance (80G certificates)</li>
            <li>With veterinary partners for animal care coordination</li>
            <li>When required by law or to protect our legal rights</li>
          </ul>
          <p>
            <strong>Security Measures.</strong> We implement industry-standard security measures
            including SSL encryption, secure payment processing, and restricted access to personal
            data.
          </p>
        </Section>

        <Section title="Your Rights">
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and review your personal information</li>
            <li>Request corrections to inaccurate information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request deletion of your data (subject to legal requirements)</li>
            <li>Receive a copy of your data in a portable format</li>
          </ul>
        </Section>

        <Section title="Cookies and Tracking">
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Remember your preferences and settings</li>
            <li>Analyze website traffic and user behavior</li>
            <li>Provide personalized content and advertisements</li>
            <li>Enable social media features</li>
          </ul>
          <p>You can control cookie settings through your browser preferences.</p>
        </Section>

        <Section title="Contact Us About Privacy">
          <p>
            If you have questions about this Privacy Policy or want to exercise your rights, please
            contact us:
          </p>
          <p>
            <a className="text-primary hover:underline" href="mailto:gullystrayc@gmail.com">
              gullystrayc@gmail.com
            </a>
            <br />
            <a className="text-primary hover:underline" href="tel:+919323263322">
              +91 9323263322
            </a>
          </p>
        </Section>

        <Section title="Policy Updates">
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant
            changes via email or website notice. Your continued use of our services after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>
      </article>
    </PageLayout>
  );
}
