import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function authHeader() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) {
    throw new Error(
      "Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET as environment variables.",
    );
  }
  return "Basic " + btoa(`${id}:${secret}`);
}

/** Create a Razorpay order on the server. Returns order_id + amount. */
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().int().min(10).max(10_000_000), // paise-conversion done here
      currency: z.string().default("INR"),
      receipt: z.string().max(40).optional(),
      notes: z.record(z.string(), z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${RAZORPAY_API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify({
        amount: data.amount * 100, // rupees -> paise
        currency: data.currency,
        receipt: data.receipt,
        notes: data.notes,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Razorpay order create failed", res.status, text);
      throw new Error("Could not create payment order. Please try again.");
    }
    const order = (await res.json()) as {
      id: string;
      amount: number;
      currency: string;
      status: string;
    };
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID!, // publishable id sent to client
    };
  });

/** Verify Razorpay payment signature and store securely in Firestore. */
export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
      name: z.string().min(1).max(100),
      email: z.string().email().max(150),
      phone: z.string().min(1).max(20),
      pan: z.string().max(20).optional().nullable(),
      amount: z.number().positive(),
      frequency: z.string().max(50),
      tax80g: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured.");

    const payload = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = expected === data.razorpay_signature;
    if (!valid) {
      return { verified: false, paymentId: null, orderId: null };
    }

    // Write verified donation document directly inside the secure server execution thread
    try {
      await addDoc(collection(db, "donations"), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        pan: data.pan || null,
        amount: data.amount,
        frequency: data.frequency,
        tax80g: data.tax80g,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        verified: true,
        trustToken: "gsc_trust_token_a6f7b198c2534f",
        createdAt: new Date(),
      });
    } catch (firestoreErr) {
      console.error("Secure Server-Side FireStore Donation write failed:", firestoreErr);
      throw new Error("Failed to record validated transaction into secure database.");
    }

    return {
      verified: true,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
    };
  });
