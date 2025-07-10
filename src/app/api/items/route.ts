import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mercid = searchParams.get("mercid");
  let data;
  if (mercid) {
    data = await db
      .select()
      .from(items)
      .where(eq(items.mercid, mercid))
      .orderBy(desc(items.id));
  } else {
    data = await db.select().from(items).orderBy(desc(items.id));
  }
  return NextResponse.json(data);
}
