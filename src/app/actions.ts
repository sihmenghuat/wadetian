"use server";

import { db } from "@/db";
import { responses } from "@/db/schema";
import { SqliteError } from "better-sqlite3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function contactUsAction(formData: FormData): Promise<void | { success: boolean; error: string }>  {
  try {
    await db.insert(responses).values({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
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

export async function removeResponse(id: number): Promise<void | { success: boolean; error: string }>  {
  try {
    await db.delete(responses).where(eq(responses.id, id));
    revalidatePath("/responses");
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

