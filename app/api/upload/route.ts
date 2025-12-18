import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Check authentication - only admins can upload
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop();
      const filename = `${timestamp}-${randomStr}.${extension}`;
      const filepath = join(uploadDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Return URL path (accessible from /uploads/filename)
      uploadedUrls.push(`/uploads/${filename}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid image files uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload files" },
      { status: 500 }
    );
  }
}

