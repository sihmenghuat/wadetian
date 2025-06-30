import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
//import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
 
export async function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  const response = NextResponse.next();
// const cookie = (await cookies()).get("session")?.value;
  //const cookie = request.cookies.get("session")?.value;
  const cookie = request.cookies.get("session")?.value;
  let session = null;
  try {
    session = await decrypt(cookie);
  } catch (err) {
    console.log(
      "Failed to verify session",
      new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
      err instanceof Error ? err.message : err
    );
  }
  if (!session || !session.userId) {
    console.log(
      "No session found",
      new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
    );
  } else {
    console.log(
      "Session found",
      session.userId,
      "at",
      new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
    );
  }
  return response
}

    //console.log("Cookie:", cookie);
    //const session = await decrypt(cookie);
    //console.log("Session:", session);
    //if (!session || !session.userId) {
    //    console.log("No session found",new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }));
    //    } else {
    //    console.log("Session found", session.userId, "at", new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }));
    //    };
    
  //const allCookies = request.cookies.getAll()
  //console.log(allCookies)
  //console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/' }

export const config = {
  matcher: [
    // Exclude API routes, _next (static files), and favicon
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
