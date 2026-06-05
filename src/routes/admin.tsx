import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  auth,
  db,
  storage,
  handleFirestoreError,
  OperationType,
  shrinkAndConvertToBase64,
  uploadBytesWithTimeout,
  logAuditTrail,
} from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — GullyStrayCare" }, { name: "robots", content: "noindex" }],
  }),
});

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setChecking(false);
      }),
    [],
  );

  if (checking)
    return (
      <PageLayout>
        <div className="px-6 py-24 max-w-7xl mx-auto">Loading…</div>
      </PageLayout>
    );

  return (
    <PageLayout>
      <section className="px-6 py-16 max-w-7xl mx-auto">
        {!user ? <LoginForm /> : <Dashboard user={user} />}
      </section>
    </PageLayout>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setInfo("Success! Accessing Admin Console...");
      await logAuditTrail(
        userCredential.user.uid,
        userCredential.user.email,
        "admin_login",
        "success",
        `Admin logged in successfully from panel`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      const code = (e as { code?: string })?.code ?? "";
      await logAuditTrail(
        null,
        email,
        "admin_login_failure",
        "failure",
        `Failed admin login attempt: Code: ${code}; Message: ${msg}`,
      );
      if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
        setErr("auth/operation-not-allowed");
      } else {
        setErr(msg.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <p className="font-mono text-primary text-sm uppercase tracking-widest mb-4">Admin</p>
      <h1 className="text-4xl font-bold tracking-tighter mb-8">Sign in</h1>
      <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-8">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
        />
        <input
          required
          type="password"
          placeholder="Password (min 6 chars)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
        />
        {err === "auth/operation-not-allowed" ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm space-y-3">
            <h3 className="font-bold text-red-500">Email/Password Sign-In is Disabled</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Firebase returned an{" "}
              <code className="bg-red-500/10 px-1 py-0.5 rounded text-red-500 text-[10px]">
                operation-not-allowed
              </code>{" "}
              error, which means you need to enable the <strong>Email/Password</strong> provider in
              your Firebase project:
            </p>
            <ol className="list-decimal pl-4 text-xs text-muted-foreground space-y-1">
              <li>Open your Firebase Project console.</li>
              <li>
                Go to <strong>Authentication</strong> → <strong>Sign-in method</strong>.
              </li>
              <li>
                Click <strong>Add new provider</strong> and choose <strong>Email/Password</strong>.
              </li>
              <li>
                Toggle "Email/Password" to <strong>Enable</strong> (leave "Email link" off), and
                click <strong>Save</strong>.
              </li>
            </ol>
            <a
              href={`https://console.firebase.google.com/project/${auth.app.options.projectId || "gen-lang-client-0072836188"}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition-colors"
            >
              Configure Authentication Console ↗
            </a>
          </div>
        ) : (
          err && <p className="text-destructive text-sm">{err}</p>
        )}
        {info && <p className="text-primary text-sm">{info}</p>}
        <button
          disabled={loading}
          className="w-full py-3 bg-foreground text-background rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-60"
        >
          {loading ? "Please wait…" : "Sign in"}
        </button>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Access is restricted strictly to authorized administrators. (Ensure Email/Password
          provider is enabled in Firebase Authentication console).
        </p>
      </form>
    </div>
  );
}

type Tab = "messages" | "donations" | "gallery";

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>("messages");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-primary text-xs uppercase tracking-widest mb-1">
            Admin Console
          </p>
          <h1 className="text-4xl font-bold tracking-tighter">Hello, {user.email}</h1>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
        {(["messages", "donations", "gallery"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "messages" && <MessagesTab />}
      {tab === "donations" && <DonationsTab />}
      {tab === "gallery" && <GalleryTab />}
    </div>
  );
}

function useCollection<T>(name: string, orderField = "createdAt") {
  const [items, setItems] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const q = query(collection(db, name), orderBy(orderField, "desc"), limit(150));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })));
        setLoading(false);
      },
      (e) => {
        try {
          handleFirestoreError(e, OperationType.LIST, name);
        } catch (wrappedErr: unknown) {
          const error = wrappedErr as { message?: string };
          setErr(error.message || String(wrappedErr));
        }
        setLoading(false);
      },
    );
    return () => unsub();
  }, [name, orderField]);
  return { items, loading, err };
}

function MessagesTab() {
  const { items, loading, err } = useCollection<{
    name: string;
    email: string;
    subject?: string;
    message: string;
    createdAt?: { seconds: number };
  }>("messages");
  if (loading) return <p>Loading…</p>;
  if (err) return <p className="text-destructive">{err}</p>;
  if (!items.length) return <p className="text-muted-foreground">No messages yet.</p>;
  return (
    <ul className="space-y-4">
      {items.map((m) => (
        <li key={m.id} className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            <div>
              <p className="font-bold">
                {m.name} <span className="text-muted-foreground font-normal">· {m.email}</span>
              </p>
              {m.subject && <p className="text-sm text-muted-foreground">{m.subject}</p>}
            </div>
            <p className="font-mono text-xs text-muted-foreground">{fmt(m.createdAt)}</p>
          </div>
          <p className="whitespace-pre-wrap text-foreground/90">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}

function DonationsTab() {
  const { items, loading, err } = useCollection<{
    amount?: number;
    name?: string;
    email?: string;
    paymentId?: string;
    orderId?: string;
    verified?: boolean;
    createdAt?: { seconds: number };
  }>("donations");
  if (loading) return <p>Loading…</p>;
  if (err) return <p className="text-destructive">{err}</p>;
  if (!items.length) return <p className="text-muted-foreground">No donations yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono uppercase tracking-widest text-xs text-muted-foreground">
            <th className="py-3 pr-4">When</th>
            <th className="pr-4">Donor</th>
            <th className="pr-4">Amount</th>
            <th className="pr-4">Payment ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-b border-border/50">
              <td className="py-3 pr-4 font-mono text-xs">{fmt(d.createdAt)}</td>
              <td className="pr-4">
                {d.name || "—"}
                <br />
                <span className="text-muted-foreground text-xs">{d.email}</span>
              </td>
              <td className="pr-4 font-bold">₹{d.amount?.toLocaleString() ?? "—"}</td>
              <td className="pr-4 font-mono text-xs">{d.paymentId || d.orderId || "—"}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-mono ${d.verified ? "bg-primary/15 text-primary" : "bg-muted/30"}`}
                >
                  {d.verified ? "verified" : "pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GalleryTab() {
  const { items, loading } = useCollection<{
    url: string;
    caption?: string;
    path?: string;
    storagePath?: string;
    author?: string;
    createdAt?: { seconds: number };
  }>("gallery");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      setErr("Please choose a valid image file (JPEG, PNG, WEBP, or GIF).");
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setErr("Invalid file extension. Only JPG, JPEG, PNG, WEBP, and GIF are allowed.");
      return;
    }

    if (file.name.includes("..") || file.name.split(".").length > 2) {
      setErr("Invalid file name format (potential double extension attack blocked).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErr("Image must be under 8 MB.");
      return;
    }
    setUploading(true);
    setErr(null);
    setProgress(20);

    const path = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const r = storageRef(storage, path);

    // Try standard upload first. It will reject/timeout after 4s on CORS block/error.
    uploadBytesWithTimeout(r, file, { contentType: file.type })
      .then(async (snapshot) => {
        setProgress(80);
        const url = await getDownloadURL(snapshot.ref);
        try {
          await addDoc(collection(db, "gallery"), {
            url,
            caption: caption || null,
            path,
            approved: true,
            createdAt: serverTimestamp(),
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, "gallery");
        }
        setProgress(100);
        setFile(null);
        setCaption("");
        const input = document.getElementById("gallery-file") as HTMLInputElement | null;
        if (input) input.value = "";
      })
      .catch(async (error) => {
        console.warn(
          "Storage upload failed. Falling back to client-compressed database storage...",
          error,
        );
        try {
          setProgress(50);
          const base64Url = await shrinkAndConvertToBase64(file);
          setProgress(80);
          try {
            await addDoc(collection(db, "gallery"), {
              url: base64Url,
              caption: caption || null,
              path: null,
              approved: true,
              createdAt: serverTimestamp(),
            });
            setFile(null);
            setCaption("");
            const input = document.getElementById("gallery-file") as HTMLInputElement | null;
            if (input) input.value = "";
          } catch (dbErr) {
            handleFirestoreError(dbErr, OperationType.CREATE, "gallery");
          }
          setProgress(100);
        } catch (fallbackErr: unknown) {
          const errMessage =
            fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
          const origMessage = error instanceof Error ? error.message : String(error);
          console.error("Database fallback storage also failed:", fallbackErr);
          setErr(
            `Failed to upload to cloud storage (${origMessage}) or fall back to database (${errMessage}).`,
          );
        }
      })
      .finally(() => {
        setTimeout(() => {
          setProgress(0);
          setUploading(false);
        }, 1000);
      });
  }

  async function remove(id: string, path?: string) {
    setDeleteError(null);
    try {
      try {
        await deleteDoc(doc(db, "gallery", id));
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.DELETE, `gallery/${id}`);
      }
      if (path) {
        await deleteObject(storageRef(storage, path)).catch((storageErr) => {
          console.warn(
            "Could not delete from storage (perhaps base64 or already deleted):",
            storageErr,
          );
        });
      }
      setConfirmingId(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("{") && msg.endsWith("}")) {
        try {
          const parsed = JSON.parse(msg);
          setDeleteError(`Error deleting photo: ${parsed.error || msg}`);
        } catch {
          setDeleteError(`Error deleting photo: ${msg}`);
        }
      } else {
        setDeleteError(`Error deleting photo: ${msg}`);
      }
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={upload} className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <h3 className="font-bold">Upload new photo</h3>
        <input
          id="gallery-file"
          required
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
        <input
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
        />
        {uploading && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{progress}% uploaded</p>
          </div>
        )}
        {err && <p className="text-destructive text-sm break-words">{err}</p>}
        <button
          disabled={uploading || !file}
          className="px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-60"
        >
          {uploading ? `Uploading… ${progress}%` : "Upload"}
        </button>
      </form>

      {deleteError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex justify-between items-center gap-4 animate-fade-in font-medium">
          <p className="flex-1 break-all">{deleteError}</p>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-xs uppercase font-mono tracking-wider hover:opacity-80 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((g) => (
            <div
              key={g.id}
              className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden bg-muted/20">
                <img
                  src={g.url}
                  alt={g.caption || "Gallery photo"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  {g.caption ? (
                    <p className="text-sm font-medium text-foreground">{g.caption}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No caption</p>
                  )}
                  {g.author && (
                    <p className="text-xs text-muted-foreground mt-1">Submitted by: {g.author}</p>
                  )}
                  <p className="font-mono text-[10px] text-muted-foreground pt-1">
                    {fmt(g.createdAt)}
                  </p>
                </div>
                <div>
                  {confirmingId === g.id ? (
                    <div className="flex gap-2 w-full animate-fade-in">
                      <button
                        type="button"
                        onClick={() => remove(g.id, g.path || g.storagePath)}
                        className="flex-1 py-2.5 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center transition-colors border border-destructive"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="flex-1 py-2.5 px-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center transition-colors border border-border"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(g.id)}
                      className="w-full py-2.5 px-4 bg-muted hover:bg-destructive hover:text-destructive-foreground text-destructive rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-border/40"
                      id={`delete-btn-${g.id}`}
                    >
                      <Trash2 className="size-3.5" />
                      Delete image
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(ts?: { seconds: number }) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleString();
}
