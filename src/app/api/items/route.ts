import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { desc, eq, or, and } from "drizzle-orm";
import { getUserSession } from "@/app/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mercid = searchParams.get("mercid");
  const session = await getUserSession();
  let data;
  if (mercid || session && session.userType === "merc") {
    data = await db
      .select()
      .from(items)
      .where(and(or(
        eq(items.mercid,mercid as string),
        eq(items.mercid,session.userId as string)
        ),
        eq(items.status,"active")
      ))
      .orderBy(desc(items.id));
  } else {
    data = await db.select().from(items)
    .where(eq(items.status,"active"))
    .orderBy(desc(items.id));
  }
  return NextResponse.json(data);
}
