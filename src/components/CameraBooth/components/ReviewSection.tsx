import { colors } from "../../ui";
import EmailForm from "./EmailForm";
import { downloadPhotostrip } from "../utils";

interface ReviewSectionProps {
  shots: (string | null)[];
  frameImageUrl: string | null;
  email: string;
  sending: boolean;
  sent: boolean;
  emailError: string;
  onEmailChange: (value: string) => void;
  onSendEmail: () => void;
  onRetake: (index: number) => void;
  onRetakeAll: () => void;
  onOpenPreview: (index: number) => void;
}

/**
 * ReviewSection Component
 * Review shots, download, and email functionality
 */
export default function ReviewSection({
  shots,
  frameImageUrl,
  email,
  sending,
  sent,
  emailError,
  onEmailChange,
  onSendEmail,
  onRetake,
  onRetakeAll,
  onOpenPreview,
}: ReviewSectionProps) {
  const shotColors = [colors.cyan, colors.blue, "#A855F7"];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-4xl font-black bg-clip-text text-transparent mb-2"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.cyan}, ${colors.blue})`,
          }}
        >
          Review
        </h2>
        <p className="text-zinc-400">Your three amazing shots</p>
      </div>

      {/* Shot Thumbnails */}
      <div className="space-y-4">
        {shots.map((s, i) => {
          const shotColor = shotColors[i];
          return (
            <div
              key={i}
              className="flex gap-4 items-center p-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${shotColor}30`,
              }}
            >
              <div
                className="relative w-28 h-20 rounded-lg overflow-hidden shadow-lg flex-shrink-0 cursor-pointer group"
                style={{
                  border: `2px solid ${shotColor}`,
                  boxShadow: `0 8px 20px ${shotColor}30`,
                }}
                onClick={() => s && onOpenPreview(i)}
              >
                {s && (
                  <>
                    <img
                      src={s}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt={`Shot ${i + 1}`}
                    />
                    {/* Preview overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1" style={{ color: shotColor }}>
                  Shot {i + 1}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => s && onOpenPreview(i)}
                    className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Preview
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    onClick={() => onRetake(i)}
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
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
                    Retake
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download & Email */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => downloadPhotostrip(shots, frameImageUrl)}
          className="w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${colors.cyan}, ${colors.blue})`,
            boxShadow: `0 15px 35px ${colors.cyan}40`,
            color: "#fff",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Photo Strip
        </button>

        <EmailForm
          email={email}
          sending={sending}
          sent={sent}
          emailError={emailError}
          onEmailChange={onEmailChange}
          onSend={onSendEmail}
        />

        <button
          onClick={onRetakeAll}
          className="w-full py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
        >
          <svg
            className="w-5 h-5"
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
          Start Over
        </button>
      </div>
    </div>
  );
}
