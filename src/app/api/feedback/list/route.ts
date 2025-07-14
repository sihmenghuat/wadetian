import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { feedback } from "@/db/schema";
import { or, eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const itemid = searchParams.get("itemid");
  if (!user) {
    return NextResponse.json({ error: "Missing user param" }, { status: 400 });
  }
  // Get all feedback where fromid=user or toid=user, order by createdAt desc
  const rows = await db.select().from(feedback)
    .where(
      and(
        or(
          eq(feedback.fromid, user),
          eq(feedback.toid, user)
        ),
        itemid ? eq(feedback.itemId, Number(itemid)) : undefined
      )
    )
    .orderBy(desc(feedback.createdAt));
  return NextResponse.json(rows);
}
