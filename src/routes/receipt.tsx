import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Download, Printer } from "lucide-react";

export const Route = createFileRoute("/receipt")({
  component: ReceiptPage,
  head: () => ({
    meta: [{ title: "Donation Receipt — GullyStrayCare" }, { name: "robots", content: "noindex" }],
  }),
});

type Receipt = {
  paymentId: string;
  orderId: string;
  amount: number;
  name: string;
  email: string;
  frequency?: string;
  tax80g?: boolean;
  at?: number;
};

const KEY = "gsc_last_receipt";

function ReceiptPage() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setReceipt(JSON.parse(raw) as Receipt);
    } catch {
      /* ignore */
    }
  }, []);

  if (!receipt) {
    return (
      <PageLayout>
        <section className="px-6 py-32 max-w-3xl mx-auto text-center">
          <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">
            No receipt
          </p>
          <h1 className="text-4xl font-bold tracking-tighter mb-6">Nothing to show here yet.</h1>
          <p className="text-muted-foreground mb-10">
            Once you complete a donation, your verified receipt will appear on this page.
          </p>
          <Link
            to="/donate"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold"
          >
            Make a donation
          </Link>
        </section>
      </PageLayout>
    );
  }

  const date = receipt.at ? new Date(receipt.at) : new Date();

  function handleDownloadHTML() {
    if (!receipt) return;
    const dateObj = receipt.at ? new Date(receipt.at) : new Date();
    const dateStr = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt - GullyStrayCare</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #faf8f5;
      color: #2d2a26;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .receipt-card {
      background: #ffffff;
      border: 1px solid #e5dfd5;
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 550px;
      box-shadow: 0 10px 30px rgba(184, 90, 46, 0.04);
      box-sizing: border-box;
      position: relative;
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-weight: 600;
      font-size: 28px;
      color: #b85a2e;
      margin: 0 0 4px 0;
    }
    .subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #7c7267;
      margin: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f3ebe1;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #7c7267;
      line-height: 1.6;
    }
    .donor-message {
      text-align: center;
      margin-bottom: 32px;
    }
    .donor-message h2 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      margin: 0 0 8px 0;
      color: #2d2a26;
    }
    .donor-message p {
      font-size: 14px;
      color: #7c7267;
      margin: 0;
    }
    .receipt-details {
      margin-bottom: 32px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f9f5f0;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      color: #7c7267;
      font-weight: 500;
    }
    .value {
      color: #2d2a26;
      font-weight: 600;
      max-width: 60%;
      word-break: break-all;
      text-align: right;
    }
    .value.amount {
      color: #b85a2e;
      font-size: 18px;
      font-weight: 700;
    }
    .footer {
      border-top: 1px dashed #e6dbcc;
      padding-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #7c7267;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: #f1ebd9;
      color: #8c7355;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .print-button-container {
      margin-top: 32px;
      text-align: center;
    }
    .btn-print {
      background: #b85a2e;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(184, 90, 46, 0.2);
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .receipt-card {
        border: none;
        box-shadow: none;
        max-width: 100%;
        padding: 20px;
      }
      .print-button-container {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div>
        <h1 class="logo">GullyStrayCare</h1>
        <p class="subtitle">Official Donation Receipt</p>
      </div>
      <div class="header-right">
        <p style="margin: 0 0 4px 0;">Date: <strong>${dateStr}</strong></p>
        <p style="margin: 0;">Time: <strong>${timeStr}</strong></p>
      </div>
    </div>

    <div class="donor-message">
      <span class="badge">Verification: Successful</span>
      <h2>Thank you, ${receipt.name}!</h2>
      <p>Your contribution of ₹${receipt.amount.toLocaleString("en-IN")} helps us feed, treat, and protect street animals.</p>
    </div>

    <div class="receipt-details">
      <div class="detail-row">
        <span class="label">Donor Name</span>
        <span class="value">${receipt.name}</span>
      </div>
      <div class="detail-row">
        <span class="label">Email Address</span>
        <span class="value">${receipt.email}</span>
      </div>
      <div class="detail-row">
        <span class="label">Donated Amount</span>
        <span class="value amount">₹${receipt.amount.toLocaleString("en-IN")}</span>
      </div>
      <div class="detail-row">
        <span class="label">Frequency</span>
        <span class="value">${receipt.frequency || "One-Time"}</span>
      </div>
      <div class="detail-row">
        <span class="label">80G Benefit Claimed</span>
        <span class="value">${receipt.tax80g ? "Yes (Certificate is processing)" : "No"}</span>
      </div>
      <div class="detail-row">
        <span class="label">Transaction Reference</span>
        <span class="value" style="font-family: monospace; font-size: 13px;">${receipt.paymentId}</span>
      </div>
      <div class="detail-row">
        <span class="label">Order ID</span>
        <span class="value" style="font-family: monospace; font-size: 13px;">${receipt.orderId}</span>
      </div>
      <div class="detail-row">
        <span class="label">Payment Status</span>
        <span class="value" style="color: #2e7d32;">Verified Secured</span>
      </div>
    </div>

    <div class="footer">
      <p style="font-weight: 600; margin: 0 0 6px 0;">GullyStrayCare Foundation</p>
      <p style="margin: 0;">We protect the unloved & care for the ignored. Thank you for your kindness!</p>
      <p style="font-size: 10px; margin-top: 12px; color: #a0968a;">Tax Exemption Reference No. Under 80G: GSC-80G-DEL-2026</p>
    </div>

    <div class="print-button-container">
      <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GullyStrayCare_Receipt_${receipt.paymentId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6 text-center">
          ✓ Payment Verified
        </p>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-center flex items-center justify-center gap-2 flex-wrap">
          Thank you,{" "}
          <span className="font-display italic text-primary">{receipt.name.split(" ")[0]}</span>.
        </h1>
        <p className="text-xl text-muted-foreground mb-12 text-center">
          Your gift of ₹{receipt.amount} will help a street animal today.
        </p>

        <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
          <div className="flex justify-between items-start pb-6 mb-6 border-b border-border">
            <div>
              <p className="font-display italic text-2xl">GullyStrayCare</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                Official Donation Receipt
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground font-mono">
              <p>{date.toLocaleDateString()}</p>
              <p>{date.toLocaleTimeString()}</p>
            </div>
          </div>

          <dl className="font-mono text-sm space-y-3">
            <Row k="Donor" v={receipt.name} />
            <Row k="Email" v={receipt.email} />
            <Row k="Amount" v={`₹${receipt.amount.toLocaleString("en-IN")}`} mono />
            {receipt.frequency && <Row k="Frequency" v={receipt.frequency} />}
            <Row k="80G Exemption" v={receipt.tax80g ? "Requested" : "—"} />
            <Row k="Payment ID" v={receipt.paymentId} mono />
            <Row k="Order ID" v={receipt.orderId} mono />
            <Row k="Status" v="Verified" />
          </dl>

          <p className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            Keep this receipt for your records. A signed 80G certificate will be emailed within 3
            business days.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleDownloadHTML}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/95 transition-colors flex items-center gap-2"
          >
            <Download className="size-4" />
            Download receipt
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-border rounded-full hover:border-primary transition-colors flex items-center gap-2"
          >
            <Printer className="size-4" />
            Print receipt
          </button>
          <Link
            to="/donate"
            className="px-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-primary transition-colors"
          >
            Donate again
          </Link>
          <Link to="/" className="px-6 py-3 rounded-full hover:underline">
            Back to home
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={mono ? "font-mono break-all text-right" : "text-right"}>{v}</dd>
    </div>
  );
}
