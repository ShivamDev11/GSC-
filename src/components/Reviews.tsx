import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { toast } from "sonner";

type Review = {
  id: string;
  name: string;
  role?: string;
  rating: number;
  message: string;
};

const SEED: Review[] = [
  {
    id: "s1",
    name: "Priya Sharma",
    role: "Dog Adopter",
    rating: 5,
    message:
      "GullyStrayCare helped me find my best friend, Bruno. The team was incredibly supportive throughout the adoption process. Bruno was well-cared for and healthy when I adopted him. It's been 2 years now, and he's the joy of my life!",
  },
  {
    id: "s2",
    name: "Dr. Amit Patel",
    role: "Veterinarian Partner",
    rating: 5,
    message:
      "Working with GullyStrayCare has been incredibly rewarding. Their dedication to animal welfare is unmatched. The professionalism and care they show towards every rescued animal is truly inspiring.",
  },
  {
    id: "s3",
    name: "Rajesh Kumar",
    role: "Monthly Donor",
    rating: 5,
    message:
      "I've been supporting GullyStrayCare for 3 years now. The transparency in their operations and regular updates about the impact of my donations gives me confidence that my money is making a real difference.",
  },
  {
    id: "s4",
    name: "Meera Singh",
    role: "Volunteer",
    rating: 5,
    message:
      "Volunteering with GullyStrayCare has been life-changing. The team is passionate, organized, and truly cares about every animal they rescue. Being part of this mission is incredibly fulfilling.",
  },
];

export function Reviews() {
  const [items, setItems] = useState<Review[]>(SEED);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  interface ReviewDoc {
    id: string;
    name?: string;
    role?: string;
    rating?: number;
    message?: string;
    approved?: boolean;
  }

  useEffect(() => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("approved", "==", true),
        orderBy("createdAt", "desc"),
        limit(20),
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const live: Review[] = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ReviewDoc, "id">) }))
            .map((r: ReviewDoc) => ({
              id: r.id,
              name: r.name || "Anonymous",
              role: r.role || "",
              rating: Number(r.rating) || 5,
              message: r.message || "",
            }));
          setItems(live.length ? [...live, ...SEED].slice(0, 12) : SEED);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, "reviews");
          } catch (wrappedErr) {
            console.error(wrappedErr);
          }
          setItems(SEED);
        },
      );
      return () => unsub();
    } catch {
      setItems(SEED);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please add your name and review");
      return;
    }
    setSubmitting(true);
    try {
      try {
        await addDoc(collection(db, "reviews"), {
          name: name.trim(),
          role: role.trim(),
          rating,
          message: message.trim(),
          approved: false,
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, "reviews");
      }
      toast.success("Thank you! Your review has been submitted for approval.");
      setName("");
      setRole("");
      setRating(5);
      setMessage("");
      setOpen(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-6 py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-primary text-sm uppercase tracking-widest mb-4">Voices</p>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Stories from Our Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from the amazing people who have been part of our journey to make a difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-accent/40 p-8 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <Quote className="size-6 text-primary/50 mb-4" />
              <p className="text-foreground/80 leading-relaxed italic mb-6">"{r.message}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  {r.role && <p className="text-sm text-muted-foreground">{r.role}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Write a review
            </button>
          ) : (
            <form
              onSubmit={submit}
              className="text-left max-w-2xl mx-auto rounded-3xl border border-border bg-card p-8 space-y-5"
            >
              <h3 className="text-2xl font-bold tracking-tight">Share your experience</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                />
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role (e.g. Donor, Adopter)"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    aria-label={`${n} star`}
                  >
                    <Star
                      className={`size-6 ${
                        n <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border px-6 py-3 font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
