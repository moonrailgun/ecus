import { uploadFile } from "@/server/s3/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      {
        error: "Need to login first",
      },
      {
        status: 402,
      },
    );
  }

  try {
    const urlParams = await params;
    const projectId = urlParams.projectId;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) ?? file.name;

    if (!name) {
      return NextResponse.json(
        { error: "No file name provide" },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const key = `iexpo/${projectId}/updates/${Date.now()}/${name}`;
    const res = await uploadFile(key, file);

    return NextResponse.json({
      message: "File uploaded successfully",
      key,
      etag: res.ETag,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 },
    );
  }
}
