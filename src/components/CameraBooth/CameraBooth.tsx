"use client";

import { useEffect, useState } from "react";
import {
  FilterModal,
  StickerModal,
  FrameModal,
  PreviewModal,
  GDGFooter,
} from "../ui";
import type { FrameRecord } from "@/lib/frames";
import Script from "next/script";
import { CAMERA_ANIMATIONS } from "./constants";
import { useCamera, useCapture, useEmail, useFaceMesh } from "./hooks";
import {
  Decorations,
  CameraPreview,
  SidePanel,
  ReviewSection,
  Instructions,
  Header,
} from "./components";

interface CameraBoothProps {
  // Future props can be added here
}

/**
 * CameraBooth Component
 * Main photobooth component with modular architecture
 */
export default function CameraBooth(_props: CameraBoothProps) {
  // State for filter selection
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [currentSticker, setCurrentSticker] = useState<string>("none");
  const [currentFrame, setCurrentFrame] = useState<FrameRecord | null>(null);

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Load whichever frame is marked default so the booth has a sane
  // starting choice without the guest having to open the picker first.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/frames")
      .then((res) => res.json())
      .then((data: { frames?: FrameRecord[] }) => {
        if (cancelled) return;
        const frames = data.frames ?? [];
        const defaultFrame = frames.find((f) => f.isDefault) ?? frames[0] ?? null;
        setCurrentFrame(defaultFrame);
      })
      .catch(() => {
        // No frames available yet (or offline) — generatePhotostrip falls
        // back to the built-in cosmic frame when frameImageUrl is null.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Custom hooks
  const {
    videoRef,
    playVideo,
    cameras,
    currentCameraId,
    setCurrentCameraId,
    cameraError,
  } = useCamera();

  // Face Mesh Hook (for Stickers)
  // We initialize it here so it runs alongside the camera
  const { canvasRef: faceMeshCanvasRef } = useFaceMesh(videoRef, currentSticker);

  const {
    shots,
    countdown,
    showReview,
    reshootIndex,
    snapCanvasRef,
    currentShotIndex,
    allShotsTaken,
    snap,
    startSequence,
    retake,
    retakeAll,
  } = useCapture({
    videoRef,
    currentFilter,
    playVideo,
    // We pass the face mesh canvas to capture hook to execute the composite drawing
    stickerCanvasRef: faceMeshCanvasRef,
  });

  const {
    email,
    sending,
    sent,
    emailError,
    setEmail,
    sendEmail,
    resetEmailState,
  } = useEmail();

  // Preview modal functions
  const openPreview = (index: number) => {
    setPreviewImageIndex(index);
    setShowPreviewModal(true);
  };

  // Handle retake all with email reset
  const handleRetakeAll = () => {
    retakeAll();
    resetEmailState();
  };

  // Handle single retake
  const handleRetake = (index: number) => {
    retake(index);
  };

  // Handle email send
  const handleSendEmail = () => {
    sendEmail(shots, currentFrame?.imageUrl);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* CSS Animations */}
      <style jsx global>{CAMERA_ANIMATIONS}</style>

      <Decorations />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilter={currentFilter}
        onSelectFilter={setCurrentFilter}
      />

      {/* Sticker Modal */}
      <StickerModal
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
        currentSticker={currentSticker}
        onSelectSticker={setCurrentSticker}
      />

      {/* Frame Modal */}
      <FrameModal
        isOpen={showFrameModal}
        onClose={() => setShowFrameModal(false)}
        currentFrameId={currentFrame?.id ?? null}
        onSelectFrame={setCurrentFrame}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        images={shots}
        initialIndex={previewImageIndex}
        onRetake={handleRetake}
      />

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[1fr,420px] gap-8">
          {/* Camera Body - Preview + Controls Side Panel */}
          <div className="flex gap-0">
            <CameraPreview
              videoRef={videoRef}
              faceMeshCanvasRef={faceMeshCanvasRef}
              currentFilter={currentFilter}
              countdown={countdown}
              shots={shots}
              currentShotIndex={currentShotIndex}
              showReview={showReview}
              allShotsTaken={allShotsTaken}
            />

            <SidePanel
              currentFilter={currentFilter}
              currentSticker={currentSticker}
              currentFrameName={currentFrame?.name ?? null}
              shots={shots}
              showReview={showReview}
              reshootIndex={reshootIndex}
              countdown={countdown}
              onFilterClick={() => setShowFilterModal(true)}
              onStickerClick={() => setShowStickerModal(true)}
              onFrameClick={() => setShowFrameModal(true)}
              onStartSequence={startSequence}
              onSnap={snap}
              onRetakeAll={handleRetakeAll}
              onOpenPreview={openPreview}
            />
          </div>

          {/* Sidebar - Info & Actions */}
          <div className="space-y-6">
            <Header
              currentFilter={currentFilter}
              currentShotIndex={currentShotIndex}
              onFilterClick={() => setShowFilterModal(true)}
              cameras={cameras}
              currentCameraId={currentCameraId}
              onCameraChange={setCurrentCameraId}
              cameraError={cameraError}
              cameraDisabled={countdown !== null}
            />

            {/* Review Section */}
            {showReview && (
              <ReviewSection
                shots={shots}
                frameImageUrl={currentFrame?.imageUrl ?? null}
                email={email}
                sending={sending}
                sent={sent}
                emailError={emailError}
                onEmailChange={setEmail}
                onSendEmail={handleSendEmail}
                onRetake={handleRetake}
                onRetakeAll={handleRetakeAll}
                onOpenPreview={openPreview}
              />
            )}

            {/* Instructions when not in review */}
            {!showReview && <Instructions />}

            <GDGFooter />
          </div>
        </div>

        {/* Hidden canvas for snapshots */}
        <canvas ref={snapCanvasRef} className="hidden" />
      </div>

      {/* Load MediaPipe FaceMesh Scripts reliably.
          Pinned to the installed npm version and loaded "afterInteractive"
          so it's ready well before a user can pick a sticker; "lazyOnload"
          was deferring this until the browser was idle, which could leave
          window.FaceMesh undefined long after the sticker picker was used. */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MediaPipe FaceMesh Script Loaded");
        }}
        onError={(e) => {
          console.error("MediaPipe FaceMesh Script failed to load", e);
        }}
      />

      {/* Load MediaPipe Hands Scripts for Sparky interaction */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MediaPipe Hands Script Loaded");
        }}
        onError={(e) => {
          console.error("MediaPipe Hands Script failed to load", e);
        }}
      />
    </div>
  );
}
