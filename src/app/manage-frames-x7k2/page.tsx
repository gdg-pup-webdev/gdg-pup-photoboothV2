"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FrameRecord } from "@/lib/frames";
import { drawCosmicFrame } from "@/components/CameraBooth/utils/cosmicFrame";
import { PHOTOSTRIP_CONFIG } from "@/components/CameraBooth/constants";

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to encode canvas"));
    }, "image/png");
  });

export default function ManageFramesPage() {
  const [frames, setFrames] = useState<FrameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFrames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/frames");
      const data = await res.json();
      setFrames(data.frames ?? []);
    } catch {
      setError("Couldn't load frames.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFrames();
  }, [loadFrames]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      setError("Give the frame a name and pick an image file first.");
      return;
    }

    setUploading(true);
    setError("");
    setStatus("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);

      const res = await fetch("/api/frames", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed.");
        return;
      }

      setStatus(`"${data.frame.name}" uploaded.`);
      setName("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Apply the known result immediately rather than waiting on a re-fetch —
      // the manifest read can lag a freshly-confirmed write by a few seconds
      // (the blob store's own replication, independent of anything we control).
      setFrames((prev) => [...prev, data.frame as FrameRecord]);
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, frameName: string) => {
    if (!confirm(`Delete "${frameName}"? This can't be undone.`)) return;

    setError("");
    try {
      const res = await fetch(`/api/frames/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Delete failed.");
        return;
      }

      setFrames((prev) => {
        const target = prev.find((f) => f.id === id);
        const remaining = prev.filter((f) => f.id !== id);
        if (target?.isDefault && remaining.length > 0 && !remaining.some((f) => f.isDefault)) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
    } catch {
      setError("Delete failed — check your connection.");
    }
  };

  const handleSetDefault = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/frames/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Couldn't set default.");
        return;
      }

      setFrames((prev) => prev.map((f) => ({ ...f, isDefault: f.id === id })));
    } catch {
      setError("Couldn't set default — check your connection.");
    }
  };

  // One-click seed: renders the built-in cosmic Mission Patch design
  // (the same code path used before the frame library existed) to a flat
  // PNG and uploads it like any other frame.
  const handleGenerateCosmicFrame = async () => {
    setGenerating(true);
    setError("");
    setStatus("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = PHOTOSTRIP_CONFIG.width;
      canvas.height = PHOTOSTRIP_CONFIG.height;
      const ctx = canvas.getContext("2d")!;
      await drawCosmicFrame(ctx, canvas.width, canvas.height);

      const blob = await canvasToBlob(canvas);
      const formData = new FormData();
      formData.append("name", "Mission Patch");
      formData.append("file", blob, "mission-patch.png");

      const res = await fetch("/api/frames", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't generate the cosmic frame.");
        return;
      }

      setStatus('"Mission Patch" generated and uploaded.');
      await loadFrames();
    } catch (err) {
      console.error(err);
      setError("Couldn't generate the cosmic frame.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e8edf5", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Manage Photostrip Frames</h1>
        <p style={{ color: "#9aa3b2", marginBottom: 32, fontSize: 14 }}>
          Frames uploaded here appear in the guest-facing frame picker. Each image should be a
          1666×3000 PNG/JPEG/WebP with the safe zone for three photo slots left clear (see the
          slot geometry in <code>cameraSettings.ts</code>).
        </p>

        {error && (
          <div style={{ background: "rgba(220,50,50,0.15)", border: "1px solid rgba(220,50,50,0.4)", color: "#ff9b9b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        {status && (
          <div style={{ background: "rgba(50,180,120,0.15)", border: "1px solid rgba(50,180,120,0.4)", color: "#8de8c0", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {status}
          </div>
        )}

        <form onSubmit={handleUpload} style={{ background: "#10131c", border: "1px solid #232838", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Upload a new frame</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Frame name (e.g. Classic SparkFest)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: "#0a0e1a", border: "1px solid #2a3142", borderRadius: 8, padding: "10px 12px", color: "#e8edf5", fontSize: 14 }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 14 }}
            />
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: uploading ? "#2a3142" : "#57caff",
                color: uploading ? "#7a8296" : "#05070d",
                fontWeight: 700,
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                cursor: uploading ? "default" : "pointer",
                fontSize: 14,
              }}
            >
              {uploading ? "Uploading…" : "Upload Frame"}
            </button>
          </div>
        </form>

        <div style={{ marginBottom: 32 }}>
          <button
            onClick={handleGenerateCosmicFrame}
            disabled={generating}
            style={{
              background: "transparent",
              color: "#57caff",
              border: "1px solid #57caff",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: generating ? "default" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {generating ? "Generating…" : "Generate the built-in cosmic \"Mission Patch\" frame"}
          </button>
          <p style={{ color: "#5b6472", fontSize: 12, marginTop: 6 }}>
            One-click seed — renders the code-drawn cosmic design to a flat PNG and uploads it,
            same as uploading any other frame.
          </p>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          Current frames {loading ? "" : `(${frames.length})`}
        </h2>

        {loading && <p style={{ color: "#9aa3b2", fontSize: 14 }}>Loading…</p>}
        {!loading && frames.length === 0 && (
          <p style={{ color: "#9aa3b2", fontSize: 14 }}>No frames yet — upload one above.</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {frames.map((frame) => (
            <div key={frame.id} style={{ background: "#10131c", border: "1px solid #232838", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ aspectRatio: "1666 / 3000", background: "#05070d" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.imageUrl} alt={frame.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{frame.name}</p>
                {frame.isDefault ? (
                  <span style={{ fontSize: 11, color: "#57caff" }}>Default</span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(frame.id)}
                    style={{ fontSize: 11, color: "#9aa3b2", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(frame.id, frame.name)}
                  style={{ display: "block", marginTop: 8, fontSize: 11, color: "#ff9b9b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
