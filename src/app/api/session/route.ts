import { NextResponse } from "next/server";
import { getUserSession } from "@/app/actions";

export async function GET() {
  // Fetch user session using the server action
  const session = await getUserSession();
  return NextResponse.json(session);
}
