import { randomUUID } from "crypto";
import { BlobPreconditionFailedError, del, get, put } from "@vercel/blob";

export interface FrameRecord {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  isDefault: boolean;
}

const MANIFEST_PATHNAME = "frames/manifest.json";
const MAX_MUTATE_RETRIES = 6;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

interface ManifestSnapshot {
  frames: FrameRecord[];
  /** ETag of the manifest as read, or null if it doesn't exist yet. */
  etag: string | null;
}

async function readManifestSnapshot(): Promise<ManifestSnapshot> {
  // useCache: false bypasses the manifest's CDN cache (which, per Vercel
  // Blob's minimum cacheControlMaxAge of 1 minute, would otherwise serve a
  // stale list for up to a minute after an admin upload/delete/set-default —
  // it keys purely on pathname, so a cache-busting query string doesn't help).
  const result = await get(MANIFEST_PATHNAME, { access: "public", useCache: false });
  if (!result || result.statusCode !== 200) return { frames: [], etag: null };

  const text = await new Response(result.stream).text();
  const data = JSON.parse(text) as FrameRecord[];
  return { frames: Array.isArray(data) ? data : [], etag: result.blob.etag };
}

export async function readFrames(): Promise<FrameRecord[]> {
  return (await readManifestSnapshot()).frames;
}

/**
 * Read-modify-write against the manifest with optimistic concurrency: the
 * write is conditioned on the ETag we read, so a concurrent admin action
 * (upload/delete/set-default) can't silently stomp on this one. On a
 * conflict, re-read the latest state, re-apply the mutation, and retry.
 * Without this, two near-simultaneous requests each read the same snapshot
 * and the second write wins outright, discarding the first's change.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mutateFrames(
  mutate: (frames: FrameRecord[]) => FrameRecord[]
): Promise<FrameRecord[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_MUTATE_RETRIES; attempt++) {
    if (attempt > 0) {
      // Give the blob store a moment to finish propagating the previous
      // write before we re-read — retrying instantly just re-reads the same
      // not-yet-converged replica and fails the same way every time.
      await sleep(150 * attempt);
    }

    const { frames, etag } = await readManifestSnapshot();
    const nextFrames = mutate(frames);

    try {
      await put(MANIFEST_PATHNAME, JSON.stringify(nextFrames, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        // undefined when the manifest doesn't exist yet — allowOverwrite
        // covers that first-write case instead.
        ifMatch: etag ?? undefined,
      });
      return nextFrames;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError) {
        lastError = err;
        continue; // someone else wrote in between — retry against fresh state
      }
      throw err;
    }
  }

  throw lastError ?? new Error("Failed to update frame manifest after retries");
}

export async function addFrame(
  name: string,
  file: Buffer,
  contentType: string
): Promise<FrameRecord> {
  const id = randomUUID();
  const ext = EXTENSION_BY_CONTENT_TYPE[contentType] ?? "png";

  const blob = await put(`frames/${id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
    contentType,
    cacheControlMaxAge: 60,
  });

  const record: FrameRecord = {
    id,
    name,
    imageUrl: blob.url,
    createdAt: new Date().toISOString(),
    isDefault: false, // corrected below once we know whether this is the first frame
  };

  await mutateFrames((frames) => {
    record.isDefault = frames.length === 0; // first frame ever added becomes the default
    return [...frames, record];
  });

  return record;
}

export async function deleteFrame(id: string): Promise<void> {
  const frames = await readFrames();
  const target = frames.find((f) => f.id === id);
  if (!target) return;

  await del(target.imageUrl);

  await mutateFrames((current) => {
    const remaining = current.filter((f) => f.id !== id);
    if (target.isDefault && remaining.length > 0 && !remaining.some((f) => f.isDefault)) {
      remaining[0].isDefault = true;
    }
    return remaining;
  });
}

export async function setDefaultFrame(id: string): Promise<FrameRecord[]> {
  return mutateFrames((frames) =>
    frames.map((f) => ({ ...f, isDefault: f.id === id }))
  );
}
