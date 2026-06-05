import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — GullyStrayCare" },
      { name: "description", content: "Reach our emergency response team or send us a message." },
    ],
  }),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      if (isFirebaseConfigured) {
        try {
          await addDoc(collection(db, "messages"), { ...form, createdAt: serverTimestamp() });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, "messages");
        }
      } else {
        await new Promise((r) => setTimeout(r, 500));
        console.warn("Firebase not configured — message logged locally only.");
      }
      setStatus("ok");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">Contact us</p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-12 max-w-4xl">
          Let's talk about{" "}
          <span className="font-display italic font-normal text-primary">making a difference</span>.
        </h1>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Emergency Helpline
              </p>
              <a
                href="tel:+918425846304"
                className="text-2xl font-bold hover:text-primary transition-colors block"
              >
                +91 8425846304
              </a>
              <p className="text-sm text-muted-foreground mt-1">9:00 AM – 9:00 PM, every day</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Email
              </p>
              <a
                href="mailto:gullystrayc@gmail.com"
                className="text-2xl font-bold hover:text-primary transition-colors block"
              >
                gullystrayc@gmail.com
              </a>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Working across
              </p>
              <p className="text-lg">12+ cities in India</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-card p-10 rounded-[2rem] border border-border space-y-5"
          >
            <input
              required
              placeholder="Your name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
            <textarea
              required
              placeholder="Your message *"
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary resize-none"
            />
            {status === "ok" && (
              <p className="text-primary font-medium">Thanks — we'll get back to you soon.</p>
            )}
            {status === "error" && (
              <p className="text-destructive">Something went wrong. Try again.</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-5 bg-foreground text-background rounded-2xl font-bold text-lg hover:bg-primary transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
