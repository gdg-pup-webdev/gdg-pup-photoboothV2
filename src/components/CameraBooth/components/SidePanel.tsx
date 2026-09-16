import { CaptureButton, colors, FILTERS } from "../../ui";
import { STICKER_FILTERS } from "../utils/faceFilters";

interface SidePanelProps {
  currentFilter: string;
  currentSticker: string;
  currentFrameName: string | null;
  shots: (string | null)[];
  showReview: boolean;
  reshootIndex: number | null;
  countdown: number | null;
  onFilterClick: () => void;
  onStickerClick: () => void;
  onFrameClick: () => void;
  onStartSequence: () => void;
  onSnap: (index: number) => void;
  onRetakeAll: () => void;
  onOpenPreview: (index: number) => void;
}

/**
 * SidePanel Component
 * Camera body side panel with filter, sticker, frame, capture, and gallery buttons
 */
export default function SidePanel({
  currentFilter,
  currentSticker,
  currentFrameName,
  shots,
  showReview,
  reshootIndex,
  countdown,
  onFilterClick,
  onStickerClick,
  onFrameClick,
  onStartSequence,
  onSnap,
  onRetakeAll,
  onOpenPreview,
}: SidePanelProps) {
  const currentFilterObj =
    FILTERS.find((f) => f.value === currentFilter) || FILTERS[0];
  
  const currentStickerObj = 
    STICKER_FILTERS.find((s) => s.id === currentSticker);

  return (
    <div
      className="w-28 rounded-r-3xl flex flex-col items-center justify-center gap-2 py-8"
      style={{
        background: "linear-gradient(180deg, #1f1f35 0%, #151525 100%)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: `
          inset -10px 0 30px rgba(0, 0, 0, 0.3),
          0 25px 50px -12px rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="flex flex-col items-center gap-3 p-2 rounded-xl transition-all hover:scale-105 hover:bg-white/5 group"
      >
        <div
          className="w-14 h-14 rounded-full overflow-hidden transition-all group-hover:scale-110"
          style={{
            border: `2px solid ${currentFilterObj.color}`,
            boxShadow: `0 0 20px ${currentFilterObj.color}30`,
          }}
        >
          <img
            src="/sparky.webp"
            alt="Filter preview"
            className="w-full h-full object-cover"
            style={{ filter: currentFilter || "none" }}
          />
        </div>
        <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
          Filter
        </span>
      </button>

      {/* Sticker Button */}
      <button
        onClick={onStickerClick}
        className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all hover:scale-105 hover:bg-white/5 group"
      >
        <div
          className="w-14 h-14 rounded-full overflow-hidden transition-all group-hover:scale-110 flex items-center justify-center bg-zinc-800"
          style={{
            border: `2px solid ${currentSticker !== 'none' ? colors.cyan : 'rgba(255, 255, 255, 0.2)'}`,
            boxShadow: currentSticker !== 'none' ? `0 0 20px ${colors.cyan}30` : 'none',
          }}
        >
          {currentSticker !== 'none' ? (
             <span className="text-2xl">{currentStickerObj?.emoji}</span>
          ) : (
             <span className="text-2xl opacity-50">🙂</span>
          )}
        </div>
        <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
          Sticker
        </span>
      </button>

      {/* Main Capture Button */}
      <div className="my-4">
        {!showReview && reshootIndex === null && (
          <CaptureButton
            onClick={onStartSequence}
            disabled={countdown !== null}
            isCapturing={countdown !== null}
            label="CAPTURE"
          />
        )}

        {!showReview && reshootIndex !== null && (
          <CaptureButton
            onClick={() => onSnap(reshootIndex)}
            disabled={countdown !== null}
            isCapturing={countdown !== null}
            label={`SHOT ${reshootIndex + 1}`}
          />
        )}

        {showReview && (
          <button
            onClick={onRetakeAll}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #333, #222)",
              border: "3px solid #444",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)",
            }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-[10px] font-bold text-zinc-400">
              RESET
            </span>
          </button>
        )}
      </div>

      {/* Frame Button */}
      <button
        onClick={onFrameClick}
        className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all hover:scale-105 hover:bg-white/5 group"
      >
        <div
          className="w-14 h-14 rounded-full overflow-hidden transition-all group-hover:scale-110 flex items-center justify-center bg-zinc-800"
          style={{
            border: `2px solid ${colors.cyan}`,
            boxShadow: `0 0 20px ${colors.cyan}30`,
          }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: colors.cyan }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M8 4v16 M16 4v16"
            />
          </svg>
        </div>
        <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors text-center leading-tight">
          {currentFrameName ?? "Frame"}
        </span>
      </button>

      {/* Gallery/Shots Button */}
      <button
        className="flex flex-col items-center gap-2 p-2 mt-4 rounded-xl transition-all hover:scale-105 hover:bg-white/5 group"
        onClick={() => {
          if (shots.filter(Boolean).length > 0) {
            onOpenPreview(0);
          }
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-110"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
          }}
        >
          {shots.filter(Boolean).length > 0 ? (
            <>
              {shots[shots.filter(Boolean).length - 1] && (
                <img
                  src={shots[shots.filter(Boolean).length - 1]!}
                  className="w-full h-full object-cover"
                  alt="Last shot"
                />
              )}
              <div
                className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg flex items-center justify-center text-xs font-bold"
                style={{
                  background: colors.cyan,
                  color: "#fff",
                }}
              >
                {shots.filter(Boolean).length}
              </div>
            </>
          ) : (
            <svg
              className="w-6 h-6 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
          Gallery
        </span>
      </button>

      {/* Shot Counter Display */}
      <div
        className="mt-auto px-3 py-2 rounded-lg"
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex gap-1.5 justify-center">
          {shots.map((shot, i) => {
            const dotColor = [colors.cyan, colors.blue, "#A855F7"][i];
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: shot ? dotColor : "rgba(255,255,255,0.2)",
                  boxShadow: shot ? `0 0 8px ${dotColor}` : "none",
                }}
              />
            );
          })}
        </div>
        <div className="text-[10px] text-center text-zinc-500 mt-1 font-mono">
          {shots.filter(Boolean).length}/3
        </div>
      </div>
    </div>
  );
}
