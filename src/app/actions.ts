"use server";

import { db } from "@/db";
import { responses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { permanentRedirect } from "next/navigation";
import postgres from "postgres";
import { createSession, deleteSession } from "@/app/lib/session";

export async function contactUsAction(formData: FormData)  {
  try {
    await db.insert(responses).values({
      userid: formData.get("userid") as string,
      pin: Number(formData.get("pin")) as number,
      contactno: formData.get("userid") as string,
      email: formData.get("email") as string,
      hobby: formData.get("hobby") as string,
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
    permanentRedirect(`/profileInfo/${userid}`);
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function getResponses(userid: string) {
  return await db.select().from(responses).where(eq(responses.userid, userid));
}
