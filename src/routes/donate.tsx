import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageLayout } from "@/components/PageLayout";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay.functions";
import { loadRazorpay } from "@/lib/razorpay-checkout";

const RECEIPT_KEY = "gsc_last_receipt";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
  head: () => ({
    meta: [
      { title: "Donate — GullyStrayCare" },
      {
        name: "description",
        content:
          "Make a secure donation. 80G tax-exempt. Every rupee goes to medical care and food.",
      },
    ],
  }),
});

const AMOUNTS = [25, 50, 100, 200, 500, 1000];

function DonatePage() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<"monthly" | "one-time">("one-time");
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [tax80g, setTax80g] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const createOrder = useServerFn(createRazorpayOrder);
  const verifyPayment = useServerFn(verifyRazorpayPayment);

  const finalAmount = custom ? Number(custom) : amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");
    if (!finalAmount || finalAmount < 10) {
      setErrMsg("Please enter an amount of at least ₹10.");
      return;
    }
    if (!form.name || !form.email || !form.phone) {
      setErrMsg("Please fill in your name, email and phone.");
      return;
    }
    setStatus("loading");

    try {
      // 1. Create the order on the server
      const order = await createOrder({
        data: {
          amount: finalAmount,
          currency: "INR",
          receipt: `don_${Date.now()}`.slice(0, 40),
          notes: { frequency, tax80g: String(tax80g) },
        },
      });

      // 2. Load Razorpay Checkout
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay failed to initialise");

      // 3. Open the checkout modal
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "GullyStrayCare",
        description: `${frequency === "monthly" ? "Monthly" : "One-time"} donation`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#b85a2e" },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setErrMsg("Payment cancelled.");
          },
        },
        handler: async (resp) => {
          try {
            // 4. Verify signature on the server and persist securely
            const v = await verifyPayment({
              data: {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                pan: null,
                amount: finalAmount,
                frequency,
                tax80g,
              },
            });
            if (!v.verified) {
              setStatus("error");
              setErrMsg("Payment could not be verified. If you were charged, contact us.");
              return;
            }
            const receiptData = {
              paymentId: v.paymentId,
              orderId: v.orderId,
              amount: finalAmount,
              name: form.name,
              email: form.email,
              frequency,
              tax80g,
              at: Date.now(),
            };
            try {
              sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receiptData));
            } catch {
              /* ignore */
            }
            setStatus("idle");
            navigate({ to: "/receipt" });
          } catch (err) {
            console.error(err);
            setStatus("error");
            setErrMsg(
              "We received your payment but failed to record it. Please email us your payment ID.",
            );
          }
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <PageLayout>
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">
          Make a donation
        </p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-8 max-w-4xl">
          Help us save{" "}
          <span className="font-display italic font-normal text-primary">street animals</span>.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Every donation funds rescue, treatment, and rehoming. 80G tax-exempt with instant receipt.
        </p>
      </section>

      <section className="px-6 pb-32 max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 bg-card p-10 rounded-[2rem] border border-border space-y-8"
        >
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-3">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["monthly", "one-time"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-3 rounded-xl font-medium border transition-colors ${
                    frequency === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {f === "monthly" ? "Monthly" : "One-Time"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-3">
              Amount (₹)
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {AMOUNTS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                  className={`py-4 rounded-xl font-mono text-lg border transition-colors ${
                    !custom && amount === a
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  ₹{a}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={10}
              placeholder="Enter custom amount"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-4">
            <input
              required
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
            <input
              required
              placeholder="Phone *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-5 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={tax80g}
              onChange={(e) => setTax80g(e.target.checked)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <strong>Claim 80G Tax Exemption</strong>
              <span className="block text-muted-foreground">
                Get tax benefits up to 50% under Section 80G.
              </span>
            </span>
          </label>

          {errMsg && <p className="text-destructive text-sm">{errMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-5 bg-foreground text-background rounded-2xl font-bold text-lg hover:bg-primary transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Opening Razorpay..." : `Donate ₹${finalAmount || 0} Securely`}
          </button>
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
            SSL Encrypted • Secured by Razorpay
          </p>
        </form>

        <aside className="lg:col-span-2 space-y-8">
          <div className="bg-accent p-8 rounded-2xl">
            <h3 className="font-bold mb-4 uppercase tracking-widest text-xs">Your Impact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <strong>₹100</strong> — Feeds 5 street dogs nutritious meals.
              </li>
              <li>
                <strong>₹500</strong> — Basic medical care including vaccines.
              </li>
              <li>
                <strong>₹2500</strong> — Life-saving emergency surgery.
              </li>
            </ul>
          </div>
          <div className="bg-accent p-8 rounded-2xl">
            <h3 className="font-bold mb-4 uppercase tracking-widest text-xs">Tax Benefits</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your donation qualifies under 80G Income Tax Act.
            </p>
            <ul className="text-sm space-y-1">
              <li>✓ 80G Tax Certificate</li>
              <li>✓ Instant Receipt</li>
            </ul>
          </div>
          <div className="bg-accent p-8 rounded-2xl">
            <h3 className="font-bold mb-4 uppercase tracking-widest text-xs">Security Promise</h3>
            <ul className="text-sm space-y-1">
              <li>✓ SSL Encryption</li>
              <li>✓ Signature Verified</li>
              <li>✓ No Card Stored</li>
            </ul>
          </div>
        </aside>
      </section>
    </PageLayout>
  );
}
