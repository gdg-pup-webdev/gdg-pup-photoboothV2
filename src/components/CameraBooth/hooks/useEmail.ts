import { useState, useCallback } from "react";
import { generatePhotostrip } from "../utils";

interface UseEmailResult {
  email: string;
  sending: boolean;
  sent: boolean;
  emailError: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  sendEmail: (
    shots: (string | null)[],
    frameImageUrl?: string | null
  ) => Promise<void>;
  resetEmailState: () => void;
}

/**
 * Custom hook for email sending functionality
 */
export function useEmail(): UseEmailResult {
  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");

  const sendEmail = useCallback(async (
    shots: (string | null)[],
    frameImageUrl?: string | null
  ) => {
    setSending(true);
    setEmailError("");

    try {
      const dataUrl = await generatePhotostrip(shots, frameImageUrl);
      const blob = await (await fetch(dataUrl)).blob();

      console.log("Generated blob:", {
        size: blob.size,
        type: blob.type,
      });

      if (blob.size === 0) {
        throw new Error("Generated image is empty");
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("file", blob, "photostrip.jpg");

      const response = await fetch("/api/sendEmail", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setEmailError(
          data.message || "Failed to send email. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      setEmailError(
        "Failed to send email. Please check your connection and try again."
      );
    } finally {
      setSending(false);
    }
  }, [email]);

  const resetEmailState = useCallback(() => {
    setEmail("");
    setSent(false);
    setEmailError("");
  }, []);

  return {
    email,
    sending,
    sent,
    emailError,
    setEmail,
    sendEmail,
    resetEmailState,
  };
}
