import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendMail } from "@/app/lib/sendMail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }
    const foundpin = await db.select({ pin: users.pin, userid: users.userid }).from(users).where(eq(users.email, email));
    if (foundpin.length > 0) {
      await sendMail({
        to: email,
        subject: "Forgot PIN",
        text: `Your PIN and ID are: ${foundpin[0].pin} , ${foundpin[0].userid}`,
      });
      return Response.json({ message: "An email with your PIN has been sent to your address." });
    } else {
      return Response.json({ error: "Your email address is not registered in our portal." }, { status: 404 });
    }
  } catch (e) {
    console.error("ForgotPin API error:", e);
    return Response.json({ error: "Failed to process your request." }, { status: 500 });
  }
}
