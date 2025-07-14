import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { feedback } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { itemid, from, to, message } = await req.json();
  if (!itemid || !from || !to || !message) {
    return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
  }
  await db.insert(feedback).values({
    itemId: Number(itemid),
    fromid: from,
    toid: to,
    message,
    createdAt: new Date(),
  });
  return NextResponse.json({ success: true, message: "Feedback submitted successfully." });
}
