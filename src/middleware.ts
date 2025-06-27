import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
//import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
 
export async function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
    const response = NextResponse.next();
  // const cookie = (await cookies()).get("session")?.value;
    const cookie = request.cookies.get("session")?.value;
    console.log("Cookie:", cookie);
    const session = await decrypt(cookie);
    console.log("Session:", session);
    if (!session || !session.userId) {
        console.log("No session found");
        } else {
        console.log("Session found");
        };

    
  //const allCookies = request.cookies.getAll()
  //console.log(allCookies)
  //console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/' }
  return response
  // Setting cookies on the response using the `ResponseCookies` API
}
