"use server";

import { db } from "@/db";
import { responses, sessiondb } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { permanentRedirect } from "next/navigation";
import postgres from "postgres";
import { createSession, deleteSession } from "@/app/lib/session";

export async function contactUsAction(formData: FormData)  {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(responses).values({
        userid: formData.get("userid") as string,
        pin: Number(formData.get("pin")) as number,
        contactno: formData.get("userid") as string,
        email: formData.get("email") as string,
        hobby: formData.get("hobby") as string,
      });
      await tx.insert(sessiondb).values({
        userid: formData.get("userid") as string,
        status: "active",
        logincount: +1,
      });
      await createSession(formData.get("userid") as string);   
    });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      // Optionally handle error UI here
      console.error(err.message);
    }
  }
  redirect("/responses");
  // Ensure the function returns void
}

export async function removeResponse(id: number) {
  try {
    await db.delete(responses).where(eq(responses.id, id));
    revalidatePath("/responses");
    console.log("User deleted");
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.log(err.message);
    }
  }
}

export async function loginAction(formData: FormData)   {
let shouldRedirectToProfile = false;
let shouldRedirectToResponses = false;
const userid = formData.get("userid") as string; // Moved declaration here
  try {
    const result = await db
      .select({
        id: responses.id
      }) // Specify the columns you want to select
      .from(responses)
      .where(and(
        eq(responses.userid, userid),
        eq(responses.pin, Number(formData.get("pin")))
      ));
      
    console.log(result.length < 1);
    
  if (result.length < 1) {
    shouldRedirectToProfile = true;
  } else {
    shouldRedirectToResponses = true;
  }

  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.log(err.message);
    }
  }
  // If you want to return a success message
  console.log(shouldRedirectToProfile,shouldRedirectToResponses);
  if (shouldRedirectToProfile) {
    permanentRedirect("/profileCreate");
  } else if (shouldRedirectToResponses) {
    await createSession(userid);
    await db
        .update(sessiondb)
        .set({
          logincount: sql`${sessiondb.logincount} + 1`,
          lastlogin: new Date(),
        })
        .where(eq(sessiondb.userid, userid));
    permanentRedirect(`/profileInfo/${userid}`);
  }
}

export async function logout(userid: string) {
  console.log("Logging out user:", userid);
  await deleteSession();
  await db
    .update(sessiondb)
    .set({
      logincount: sql`${sessiondb.logincount} - 1`,
      lastlogout: new Date(),
    })
    .where(eq(sessiondb.userid, userid));
  redirect("/");
}

export async function getResponses(userid: string) {
  return await db.select().from(responses).where(eq(responses.userid, userid));
}
