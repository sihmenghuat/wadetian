import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserSession } from "@/app/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemid = searchParams.get("itemid");
  const session = await getUserSession();
  let data;
  console.log("I am here ~ ", itemid)
  if (itemid && session && session.userType === "merc") {
    data = await db
      .select()
      .from(items)
      .where(and(eq(items.id,Number(itemid)), eq(items.mercid,session.userId as string)));
  } else {
    console.log("Invalid request or item.");
    return NextResponse.json({ success: false, message: "Invalid request or item." }, { status: 400 });
  }
  console.log("Valid request: ",data);
  return NextResponse.json(data);
}
