"use server";

import { db } from "@/db";
import { responses } from "@/db/schema";
import { SqliteError } from "better-sqlite3";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { permanentRedirect } from "next/navigation";

export async function contactUsAction(formData: FormData)  {
  try {
    await db.insert(responses).values({
      userid: formData.get("userid") as string,
      pin: Number(formData.get("pin")) as number,
      contactno: formData.get("contactno") as string,
      email: formData.get("email") as string,
      hobby: formData.get("hobby") as string,
    });
  } catch (err) {
    if (err instanceof SqliteError) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
  redirect("/responses");
}

export async function removeResponse(id: number) {
  try {
    await db.delete(responses).where(eq(responses.id, id));
    revalidatePath("/responses");
    console.log("User deleted");
  } catch (err) {
    if (err instanceof SqliteError) {
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
    if (err instanceof SqliteError) {
      console.log(err.message);
    }
  }
  // If you want to return a success message
  console.log(shouldRedirectToProfile,shouldRedirectToResponses);
  if (shouldRedirectToProfile) {
    permanentRedirect("/profileCreate");
  } else if (shouldRedirectToResponses) {
    permanentRedirect(`/profileInfo?userid=${userid}`);
  }
}
