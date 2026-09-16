import { deleteFrame, setDefaultFrame } from "@/lib/frames";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteFrame(id);
    return Response.json({ message: "Frame deleted" });
  } catch (err) {
    console.error("Error deleting frame:", err);
    return Response.json({ message: "Failed to delete frame" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (body?.isDefault !== true) {
      return Response.json(
        { message: "Only setting isDefault: true is supported" },
        { status: 400 }
      );
    }

    const frames = await setDefaultFrame(id);
    return Response.json({ frames });
  } catch (err) {
    console.error("Error updating frame:", err);
    return Response.json({ message: "Failed to update frame" }, { status: 500 });
  }
}
