import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  db,
  storage,
  handleFirestoreError,
  OperationType,
  shrinkAndConvertToBase64,
  uploadBytesWithTimeout,
} from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — Rescues in Action | GullyStrayCare" },
      {
        name: "description",
        content: "Photos from our rescues, treatments and adoptions across India.",
      },
    ],
  }),
});

type GalleryItem = {
  id: string;
  url: string;
  caption?: string;
  author?: string;
  createdAt?: { seconds: number };
};

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "gallery"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">) })));
        setLoading(false);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "gallery");
        } catch (wrappedErr) {
          console.error(wrappedErr);
        }
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return (
    <PageLayout>
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <p className="font-mono text-primary text-sm uppercase tracking-widest mb-6">Gallery</p>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-8 max-w-4xl">
          Lives we've <span className="font-display italic font-normal text-primary">touched</span>.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Every photograph here is a life turned around — by a rescuer, a vet, a neighbour. Add
          yours, or fuel the next rescue.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <button
            onClick={() => setOpen(true)}
            className="px-8 py-4 bg-foreground text-background rounded-full font-bold hover:bg-primary transition-colors"
          >
            Share your story
          </button>
          <Link
            to="/donate"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
          >
            Start your journey
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No photos yet — be the first to share your story.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {items.map((it) => (
              <figure
                key={it.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card group"
              >
                <img
                  src={it.url}
                  alt={it.caption || "Rescue photo"}
                  loading="lazy"
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {(it.caption || it.author) && (
                  <figcaption className="px-4 py-3 text-sm">
                    {it.caption && <p className="text-foreground">{it.caption}</p>}
                    {it.author && (
                      <p className="text-xs text-muted-foreground mt-1">— {it.author}</p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>

      {open && <ShareStoryDialog onClose={() => setOpen(false)} />}
    </PageLayout>
  );
}

function ShareStoryDialog({ onClose }: { onClose: () => void }) {
  const [author, setAuthor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!file) return setErr("Please choose a photo.");

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return setErr("Please choose a valid image file (JPEG, PNG, WEBP, or GIF).");
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return setErr("Invalid file extension. Only JPG, JPEG, PNG, WEBP, and GIF are allowed.");
    }

    if (file.name.includes("..") || file.name.split(".").length > 2) {
      return setErr("Invalid file name format (potential double extension attack blocked).");
    }

    if (file.size > 8 * 1024 * 1024) return setErr("Image must be under 8 MB.");
    setStatus("uploading");
    setProgress(20);
    const path = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const sref = storageRef(storage, path);

    // Try standard upload first. It will reject/timeout after 4s on CORS block/error.
    uploadBytesWithTimeout(sref, file, { contentType: file.type })
      .then(async (snapshot) => {
        setProgress(80);
        const url = await getDownloadURL(snapshot.ref);
        try {
          await addDoc(collection(db, "gallery"), {
            url,
            caption: caption.trim() || null,
            author: author.trim() || "Anonymous",
            storagePath: path,
            approved: false,
            createdAt: serverTimestamp(),
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, "gallery");
        }
        setProgress(100);
        setStatus("done");
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
              caption: caption.trim() || null,
              author: author.trim() || "Anonymous",
              storagePath: null,
              approved: false,
              createdAt: serverTimestamp(),
            });
          } catch (dbErr) {
            handleFirestoreError(dbErr, OperationType.CREATE, "gallery");
          }
          setProgress(100);
          setStatus("done");
        } catch (fallbackErr: unknown) {
          const errMessage =
            fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
          const origMessage = error instanceof Error ? error.message : String(error);
          console.error("Database fallback storage also failed:", fallbackErr);
          setStatus("error");
          setErr(
            `Failed to upload to cloud storage (${origMessage}) or fall back to database (${errMessage}).`,
          );
        }
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-card max-w-lg w-full rounded-3xl p-8 border border-border shadow-xl animate-scale-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-mono text-primary text-xs uppercase tracking-widest mb-2">
              Share your story
            </p>
            <h2 id="dialog-title" className="text-2xl font-bold tracking-tight">
              A rescue you're proud of
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground text-2xl leading-none px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ×
          </button>
        </div>

        {status === "done" ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-4" aria-hidden="true">
              🐾
            </p>
            <h3 className="text-xl font-bold mb-2">Thank you for sharing.</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your photo is queued for review and will appear in the gallery shortly.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              aria-label="Your name (optional)"
              placeholder="Your name (optional)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
            <textarea
              aria-label="Tell us about this rescue"
              placeholder="Tell us about this rescue…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Upload story photo"
              className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <p className="text-sm font-medium">{file ? file.name : "Tap to upload a photo"}</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, GIF · up to 8 MB</p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {status === "uploading" && (
              <div
                className="space-y-1"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">{progress}% uploaded</p>
              </div>
            )}
            {err && (
              <p className="text-destructive text-sm break-words" role="alert">
                {err}
              </p>
            )}
            <button
              disabled={status === "uploading"}
              className="w-full py-4 bg-foreground text-background rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {status === "uploading" ? `Uploading… ${progress}%` : "Share my story"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              By uploading you confirm the photo is yours to share.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
