import { NextRequest, NextResponse } from "next/server";
import { items } from "@/db/schema";
import { db } from "@/db/index";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = form.get("name") as string;
  const description = form.get("description") as string;
  const type = form.get("type") as string;
  const mercid = form.get("mercid") as string;
  const file = form.get("file") as File | null;

  let mediaUrl = "";
  if (file) {
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    mediaUrl = `/uploads/${filename}`;
  }

  await db.insert(items).values({
    name,
    description,
    type,
    mercid,
    mediaUrl,
  });

  return NextResponse.json({ success: true, message: "Item uploaded successfully." });
}
