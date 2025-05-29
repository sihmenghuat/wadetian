import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";

const protectedRoutes = ["/qrcode", "/profileInfo", "/responses"];
//const publicRoutes = ["/","profileCreate"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
//  const isPublicRoute = publicRoutes.includes(path);
  console.log("Middleware path:", path);
  const cookiesStore = await cookies();
  const cookie = cookiesStore.get("session")?.value;
  const session = await decrypt(cookie);
  
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}
