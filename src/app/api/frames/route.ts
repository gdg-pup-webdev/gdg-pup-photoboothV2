import { addFrame, readFrames } from "@/lib/frames";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function GET() {
  try {
    const frames = await readFrames();
    return Response.json({ frames });
  } catch (err) {
    console.error("Error listing frames:", err);
    return Response.json({ message: "Failed to load frames" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string | null)?.trim();
    const file = formData.get("file") as Blob | null;

    if (!name || !file) {
      return Response.json(
        { message: "Frame name and image file are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { message: "Frame must be a PNG, JPEG, or WebP image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return Response.json(
        { message: "Frame image must be 8MB or smaller" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const record = await addFrame(name, buffer, file.type);

    return Response.json({ frame: record }, { status: 201 });
  } catch (err) {
    console.error("Error uploading frame:", err);
    return Response.json({ message: "Failed to upload frame" }, { status: 500 });
  }
}
