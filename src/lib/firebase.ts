// Firebase client config using the provisioned Google AI Studio applet credentials.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";
import {
  getStorage,
  uploadBytes,
  StorageReference,
  UploadMetadata,
  UploadResult,
} from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const isFirebaseConfigured = true;

// Firebase App Check implementation
export let appCheck: AppCheck | null = null;
if (typeof window !== "undefined") {
  try {
    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider("6Lc5P-IoAAAAALv6P0Ww5S4O1_tN6C4S-bLOnv1C"),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("App Check initialization skipped or failed:", e);
  }
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Compresses an image client-side to a max of 1000px width/height and JPEG format
 * to ensure it fits comfortably within Firestore's 1MB document limit.
 */
export function shrinkAndConvertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve((e.target?.result as string) || "");
          return;
        }

        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality to target ~50KB to 150KB
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error("Document reader result is empty"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Wraps uploadBytes in a Promise that rejects after a given timeout (e.g. 4 seconds)
 * to ensure we fall back to client-compressed Base64 database storage quickly.
 */
export function uploadBytesWithTimeout(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
  timeoutMs: number = 4000,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firebase Storage upload timed out. Moving to local fallback database."));
    }, timeoutMs);

    uploadBytes(ref, data, metadata)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Global audit logger. Logs security actions, admin events, failures, and access tracking.
 */
export async function logAuditTrail(
  userId: string | null,
  email: string | null,
  action: string,
  status: "success" | "failure" | "info" | "warning",
  details: string,
) {
  try {
    await addDoc(collection(db, "audit_logs"), {
      userId,
      email,
      action,
      status,
      details,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to write audit trail log:", err);
  }
}
