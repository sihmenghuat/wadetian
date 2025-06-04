"use server";

import { db } from "@/db";
import { users, sessiondb, transdb, balancedb, qrcodedb } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { permanentRedirect } from "next/navigation";
import postgres from "postgres";
import { createSession, deleteSession } from "@/app/lib/session";

export async function contactUsAction(formData: FormData)  {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
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

export async function removeUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/responses");
    console.log("User deleted");
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.log(err.message);
    }
  }
}

export async function removeQrcode(id: number) {
  try {
    await db.delete(qrcodedb).where(eq(qrcodedb.id, id));
    revalidatePath("/qrcodelist");
    console.log("QR code deleted");
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
        id: users.id
      }) // Specify the columns you want to select
      .from(users)
      .where(and(
        eq(users.userid, userid),
        eq(users.pin, Number(formData.get("pin")))
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
  try {
    await Promise.all([
      deleteSession(),
      db
        .update(sessiondb)
        .set({
          logincount: sql`${sessiondb.logincount} - 1`,
          lastlogout: new Date(),
        })
        .where(eq(sessiondb.userid, userid))
    ]);
  } catch (err) {
    console.error("Logout failed:", err);
    throw err; // Optionally handle error UI here
  }
  console.log("User logged out successfully");
  redirect("/");
}

export async function getResponses(userid: string) {
  return await db.select().from(users).where(eq(users.userid, userid));
}

export async function qrcodeCollect(formData: FormData)  {
  console.log("Collect from merc:", formData.get("userid"),formData.get("mercid"),formData.get("points"));
  try {
    await db.transaction(async (tx) => {
      await tx.insert(transdb).values({
        userid: formData.get("userid") as string,
        xid: formData.get("mercid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")),
      });
      await tx.insert(transdb).values({
        userid: formData.get("mercid") as string,
        xid: formData.get("userid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points"))*-1,
      });
      const result = await tx
      .update(balancedb)
      .set ({
        balance: sql`${balancedb.balance} + ${Number(formData.get("points"))}`,
        lasttransdate: new Date()})
        .where(and(
          eq(balancedb.userid, formData.get("userid") as string),
          eq(balancedb.issuerid, formData.get("mercid") as string)
         ));
         console.log("Result:", result, result.count);
      if (result.count === 0) {
        await tx.insert(balancedb).values({
          userid: formData.get("userid") as string,
          issuerid: formData.get("mercid") as string,
          balance: Number(formData.get("points")),
          lasttransdate: new Date(),
        });
      }
      const result1 = await tx
      .update(balancedb)
      .set ({
        balance: sql`${balancedb.balance} - ${Number(formData.get("points"))}`,
        lasttransdate: new Date()})
        .where(and(
          eq(balancedb.userid, formData.get("mercid") as string),
          eq(balancedb.issuerid, formData.get("mercid") as string)
         ));
      if (result1.count === 0) {
        await tx.insert(balancedb).values({
          userid: formData.get("mercid") as string,
          issuerid: formData.get("mercid") as string,
          balance: Number(formData.get("points"))*-1,
          lasttransdate: new Date(),
        });
      }
    });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      // Optionally handle error UI here
      console.error("qrcodeCollect:",err.message);
    }
  }
  redirect("/responses");
  // Ensure the function returns void
}


export async function qrcodePay(formData: FormData)  {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(transdb).values({
        userid: formData.get("userid") as string,
        xid: formData.get("mercid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points"))*-1,
      });
      await tx.insert(transdb).values({
        userid: formData.get("mercid") as string,
        xid: formData.get("userid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")),
      });
      await tx.insert(balancedb).values({
        userid: formData.get("userid") as string,
        issuerid: formData.get("mercid") as string,
        balance: Number(formData.get("balance"))*-1,
        lasttransdate: new Date(),
      });
      await tx.insert(balancedb).values({
        userid: formData.get("mercid") as string,
        issuerid: formData.get("mercid") as string,
        balance: Number(formData.get("balance")),
        lasttransdate: new Date(),
      });
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

export async function qrcodeGen(formData: FormData)  {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(qrcodedb).values({
        userid: formData.get("mercid") as string,
        hashid: formData.get("qrhash") as string,
        points: Number(formData.get("points")),
        reference: formData.get("reference") as string,
        paytype: formData.get("payType") as string,
        jsondata: JSON.stringify({
          mercid: formData.get("mercid"),
          points: formData.get("points"),
          payType: formData.get("payType"),
          reference: formData.get("reference"),
        }),
      });
    });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      // Optionally handle error UI here
      console.error(err.message);
    }
  }
  redirect("/qrcodelist");
  // Ensure the function returns void
}
