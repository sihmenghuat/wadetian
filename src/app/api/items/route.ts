import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(items).orderBy(desc(items.id));
  return NextResponse.json(data);
}
