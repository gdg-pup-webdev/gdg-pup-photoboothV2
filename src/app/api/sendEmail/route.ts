import { getEmailTemplate } from "./emailTemplate";

// Sender address. Must be on a domain verified in Resend (e.g. gdgpup.org),
// otherwise Resend rejects the send. Override via the EMAIL_FROM env var so the
// verified address can change without a code change.
const FROM_ADDRESS =
  process.env.EMAIL_FROM || "GDG Photobooth <photobooth@gdgpup.org>";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const file = formData.get("file") as Blob;

    if (!email || !file) {
      return new Response(
        JSON.stringify({ message: "Email and file are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ message: "Email service is not configured properly" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("File details:", {
      size: buffer.length,
      type: file.type,
      hasContent: buffer.length > 0,
    });

    if (buffer.length === 0) {
      console.error("File buffer is empty");
      return new Response(
        JSON.stringify({ message: "The photo file is empty or invalid" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generate the HTML email template
    const htmlContent = getEmailTemplate(email);

    console.log("Sending email with attachment size:", buffer.length, "bytes");

    // Send via the Resend REST API (no SDK dependency; runs on the Node
    // runtime). The photostrip is attached as base64.
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject: "✨ Your GDG on Campus PUP Photostrip is Here!",
        text: "Hey Sparkmate! Your photostrip from GDG on Campus PUP is attached. Thanks for joining us!",
        html: htmlContent,
        attachments: [
          {
            filename: "gdg-photostrip.jpg",
            content: buffer.toString("base64"),
          },
        ],
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error("Error sending email:", resendResponse.status, detail);
      return new Response(
        JSON.stringify({
          message: "Failed to send email. Please try again later.",
          error:
            process.env.NODE_ENV === "development" ? detail : undefined,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = (await resendResponse.json()) as { id?: string };
    console.log("Email sent successfully:", data.id);

    return new Response(
      JSON.stringify({ message: "Email sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error sending email:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({
        message: "Failed to send email. Please try again later.",
        error:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
