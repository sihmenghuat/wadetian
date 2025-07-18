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
  const url = form.get("url") as string | null;
  const itemDescription = form.get("itemDescription") as string | null;
  const price = parseFloat(form.get("price") as string) || 0;
  const points = parseInt(form.get("points") as string, 10) || 0;
  const eventDetails = form.get("eventDetails") as string | null;
  const eventDateTime = form.get("eventDateTime") as string | null;
  const eventLocation = form.get("eventLocation") as string | null;
  const qrhash = form.get("qrhash") as string | null;
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

  // Validate mercid and mediaUrl
  if (!mercid || !mediaUrl) {
    return NextResponse.json({ success: false, message: "Merchant ID and media file are required." }, { status: 400 });
  }

  await db.insert(items).values({
    name,
    description,
    type,
    url: type === "Url" ? url : null,
    itemDescription: type === "Menu" ? itemDescription : null,
    price: type === "Menu" ? price : 0,
    points: type === "Menu" ? points : 0,
    eventDetails: type === "Event" ? eventDetails : null,
    eventDate: type === "Event" ? new Date(eventDateTime || "") : null,
    eventLocation: type === "Event" ? eventLocation : null,
    qrhash,
    mercid,
    mediaUrl,
  });

  return NextResponse.json({ success: true, message: "Item uploaded successfully." });
}
