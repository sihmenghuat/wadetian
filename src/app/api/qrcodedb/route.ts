import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { qrcodedb } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qrhash = searchParams.get("qrhash");
  if (!qrhash) {
    return NextResponse.json({ error: "Missing qrhash" }, { status: 400 });
  }
  // Query qrcodedb for the record using hashid column
  const record = await db.select().from(qrcodedb).where(eq(qrcodedb.hashid, qrhash)).limit(1);
  if (!record || record.length === 0) {
    return NextResponse.json({ error: "QR hash not found" }, { status: 404 });
  }
  // Return the first record (should be unique)
  return NextResponse.json(record[0]);
}
