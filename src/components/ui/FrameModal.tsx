"use client";

import React, { useEffect, useRef, useState } from "react";
import { colors } from "./GDGColors";
import { X, Check, Loader2 } from "lucide-react";
import type { FrameRecord } from "@/lib/frames";

interface FrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrameId: string | null;
  onSelectFrame: (frame: FrameRecord) => void;
}

export default function FrameModal({
  isOpen,
  onClose,
  currentFrameId,
  onSelectFrame,
}: FrameModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<FrameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setFrames(data.frames ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load frames. Check your connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1a1a2e, #0f0f0f)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 0 80px rgba(87,202,255,0.12)
          `,
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-2xl font-black bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.cyan}, ${colors.blue})`,
                }}
              >
                Choose Frame
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Pick the photostrip design for your shots
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10 text-zinc-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading frames…</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-400 py-10">{error}</p>
          )}

          {!loading && !error && frames.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-10">
              No frames available yet.
            </p>
          )}

          {!loading && !error && frames.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {frames.map((frame, index) => {
                const isSelected = currentFrameId
                  ? currentFrameId === frame.id
                  : frame.isDefault;

                return (
                  <button
                    key={frame.id}
                    onClick={() => {
                      onSelectFrame(frame);
                      onClose();
                    }}
                    className="relative group rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div
                      className="aspect-[1666/3000] rounded-2xl overflow-hidden relative bg-white/5"
                      style={{
                        border: isSelected
                          ? `3px solid ${colors.cyan}`
                          : "3px solid transparent",
                        boxShadow: isSelected
                          ? `0 0 20px ${colors.cyan}50`
                          : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={frame.imageUrl}
                        alt={frame.name}
                        className="w-full h-full object-cover"
                      />

                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${colors.cyan}40, ${colors.blue}20)`,
                        }}
                      >
                        {isSelected && (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: colors.cyan }}
                          >
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div
                          className="absolute z-[100] top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: colors.cyan }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {frame.isDefault && (
                        <div
                          className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                        >
                          Default
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <span
                        className="font-bold text-sm transition-colors"
                        style={{ color: isSelected ? colors.cyan : "#888" }}
                      >
                        {frame.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="p-4 border-t flex justify-between items-center"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span>{frames.length} frame{frames.length === 1 ? "" : "s"} available</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${colors.cyan}, ${colors.blue})`,
              color: "#fff",
              boxShadow: `0 10px 25px ${colors.cyan}40`,
            }}
          >
            Done
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
