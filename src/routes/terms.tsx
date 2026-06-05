import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — GullyStrayCare" },
      {
        name: "description",
        content: "Terms and conditions for donations and use of GullyStrayCare services.",
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

function TermsPage() {
  return (
    <PageLayout>
      <article className="px-6 py-24 max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <p className="font-mono text-primary text-sm uppercase tracking-widest">
            Terms of Service
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
            Terms <span className="font-display italic font-normal text-primary">& conditions</span>
            .
          </h1>
          <p className="text-muted-foreground">
            Please read these terms carefully before using our services or making donations to
            GullyStrayCare.
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Last updated: December 2024
          </p>
        </header>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing our website, making donations, or using our services, you agree to be bound
            by these Terms of Service. If you do not agree with any part of these terms, please do
            not use our services.
          </p>
          <p>
            GullyStrayCare reserves the right to modify these terms at any time. Changes will be
            effective immediately upon posting on our website.
          </p>
        </Section>

        <Section title="2. About GullyStrayCare">
          <p>
            GullyStrayCare is a registered non-profit organization dedicated to the rescue,
            rehabilitation, and rehoming of street animals across India. We operate under the
            guidelines of animal welfare laws and maintain transparency in all our operations.
          </p>
          <p>
            Our services include emergency rescue, medical treatment, sterilization programs,
            adoption services, and community education.
          </p>
        </Section>

        <Section title="3. Donations and Payments">
          <p>
            <strong>Donation Policy:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>All donations are voluntary and made with the intent to support animal welfare</li>
            <li>Donations are processed securely through Razorpay payment gateway</li>
            <li>
              We accept donations via credit/debit cards, UPI, net banking, and digital wallets
            </li>
            <li>Minimum donation amount is ₹25</li>
            <li>All amounts are in Indian Rupees (INR)</li>
          </ul>
          <p>
            <strong>Tax Benefits:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Donations are eligible for 80G tax exemption under the Income Tax Act</li>
            <li>Tax certificates will be issued within 30 days of donation</li>
            <li>Valid PAN, Aadhaar, and address details are required for tax certificates</li>
          </ul>
        </Section>

        <Section title="4. Refund and Cancellation Policy">
          <p>
            <strong>General Policy.</strong> As donations are made voluntarily to support animal
            welfare, we generally do not provide refunds. However, we understand that exceptional
            circumstances may arise.
          </p>
          <p>
            <strong>Refund Eligibility:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Technical errors resulting in duplicate payments</li>
            <li>Unauthorized transactions (subject to verification)</li>
            <li>Payment processing errors by our payment gateway</li>
          </ul>
          <p>
            <strong>Refund Process:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refund requests must be made within 7 days of the transaction</li>
            <li>Contact us at gullystrayc@gmail.com with transaction details</li>
            <li>Refunds will be processed within 7–10 business days after approval</li>
            <li>Refunds will be credited to the original payment method</li>
            <li>Processing fees (if any) may be deducted from the refund amount</li>
          </ul>
          <p>
            <strong>Non-Refundable Situations:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Change of mind after successful donation</li>
            <li>Donations made more than 7 days ago</li>
            <li>Donations where tax certificates have been issued</li>
            <li>Donations used for immediate animal rescue operations</li>
          </ul>
        </Section>

        <Section title="5. Use of Services">
          <p>
            <strong>Permitted Use:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Making donations to support animal welfare</li>
            <li>Accessing information about our services and impact</li>
            <li>Contacting us for legitimate inquiries</li>
            <li>Sharing our content for awareness purposes</li>
          </ul>
          <p>
            <strong>Prohibited Activities:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Using false information for donations or tax certificates</li>
            <li>Attempting to hack or disrupt our website</li>
            <li>Using our services for illegal activities</li>
            <li>Misrepresenting our organization or services</li>
          </ul>
        </Section>

        <Section title="6. Liability and Disclaimers">
          <p>
            While we strive to provide accurate information and reliable services, GullyStrayCare
            makes no warranties regarding the completeness, accuracy, or availability of our website
            or services.
          </p>
          <p>
            We are not liable for any indirect, incidental, or consequential damages arising from
            the use of our services. Our liability is limited to the amount of your donation.
          </p>
          <p>
            We reserve the right to suspend or terminate services at any time without prior notice.
          </p>
        </Section>

        <Section title="7. Contact Information">
          <p>
            For questions about these Terms of Service, refund requests, or any other inquiries:
          </p>
          <p>
            <a className="text-primary hover:underline" href="mailto:gullystrayc@gmail.com">
              gullystrayc@gmail.com
            </a>
            <br />
            <a className="text-primary hover:underline" href="tel:+919323263322">
              +91 9323263322
            </a>
            <br />
            <span className="text-muted-foreground">
              G-2, Ground Floor, G Wing, KK Residency, Life Care Medical, Azad Nagar, Hill No. 4,
              Ghatkopar West, Mumbai — 400086
            </span>
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            These Terms of Service are governed by the laws of India. Any disputes will be subject
            to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </Section>
      </article>
    </PageLayout>
  );
}
