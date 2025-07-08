"use server";

import { db } from "@/db";
import { users, sessiondb, transdb, balancedb, qrcodedb } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { createSession, deleteSession } from "@/app/lib/session";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";
import { error } from "console";

// Helper type for error return
export type ActionResult = { error: string } | void;

export async function contactUsAction(formData: FormData): Promise<ActionResult> {
  try {
    const userid = formData.get("userid") as string | null;
    const email = formData.get("email") as string | null;
    if (!userid) return { error: "User ID is required" };
    if (!email) return { error: "User Email is required" };
    const existing = await db.select().from(users).where(eq(users.userid, userid));
    if (existing.length > 0) {
      return { error: "User ID already exists" };
    }
    const existEmail = await db.select().from(users).where(eq(users.email, email));
    if (existEmail.length > 0) {
      return { error: "User Email not valid or used." };
    }
    await db.transaction(async (tx) => {
      const usertype = "user";
      await tx.insert(users).values({
        userid,
        pin: formData.get("pin") as string,
        contactno: userid,
        email: formData.get("email") as string,
        hobby: formData.get("hobby") as string,
        usertype: usertype,
      });
      await tx.insert(sessiondb).values({
        userid,
        status: "active",
        logincount: 1,
      });
      await createSession(userid, usertype);
    });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      return { error: err.message };
    }
    return { error: "Unknown error occurred" };
  }
  redirect("/profileInfo");
}

export async function contactEditAction(formData: FormData): Promise<ActionResult> {
  try {
    const userid = formData.get("userid") as string | null;
    if (!userid) return { error: "User ID is required" };
    const existing = await db.select().from(users).where(eq(users.userid, userid));
    if (existing.length === 0) {
      return { error: "User ID not exists" };
    }
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({
          pin: formData.get("pin") as string,
          contactno: formData.get("contact") as string,
          email: formData.get("email") as string,
          hobby: formData.get("hobby") as string,
        })
        .where(eq(users.userid, userid));
    });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      return { error: err.message };
    }
    return { error: "Unknown error occurred" };
  }
  redirect("/profileInfo");
}

export async function removeUser(id: number): Promise<void> {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/responses");
    // Optionally log: User deleted
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
    }
  }
}

export async function removeQrcode(id: number): Promise<void> {
  try {
    await db.update(qrcodedb)
    .set({  status: "deleted",
      updatedAt: new Date(),
     })
    .where(eq(qrcodedb.id, id));
    revalidatePath("/qrcodelist");
    // Optionally log: QR code deleted
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
    }
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  let shouldRedirectToProfile = false;
  let shouldRedirectToResponses = false;
  const userid = formData.get("userid") as string;
  let usertype = "user" as string;
  try {
    const result = await db
      .select({ id: users.id, usertype: users.usertype })
      .from(users)
      .where(and(
        eq(users.userid, userid),
        eq(users.pin, formData.get("pin") as string)
      ));
    if (result.length < 1) {
      shouldRedirectToProfile = true;
      return { error: "Invalid User ID or PIN." };
    } else {
      shouldRedirectToResponses = true;
      usertype = result[0].usertype;
    }

  if (shouldRedirectToProfile) {
     revalidatePath("/login");
  }
  if (shouldRedirectToResponses) {
    await db.transaction(async (tx) => {
      await createSession(userid, usertype);
      await tx
        .update(sessiondb)
        .set({
          logincount: sql`${sessiondb.logincount} + 1`,
          lastlogin: new Date(),
        })
        .where(eq(sessiondb.userid, userid));
    });
    }
  } 
  catch (err) {
    if (err instanceof postgres.PostgresError) {
      return { error: err.message };
    }
    return { error: "Unknown error occurred" };
    }
  }

export async function logout(userid: string): Promise<void> {
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
    throw err;
  }
  redirect("/");
}

export async function getResponses(userid: string) {
  return await db.select().from(users).where(eq(users.userid, userid));
}

export async function updBalance(userid: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [{ sumbal }] = await tx
      .select({ sumbal: sql`COALESCE(SUM(${balancedb.balance}), 0)` })
      .from(balancedb)
      .where(eq(balancedb.userid, userid));
    await tx.update(users)
      .set({
        points: Number(sumbal),
      })
      .where(eq(users.userid, userid));
  });
}

export async function getCountTransdb(userid: string) {
  return await db
    .select({ count: sql`COUNT(*)` })
    .from(transdb)
    .where(eq(transdb.userid, userid));
}

export async function getTransdb(hashid: string, userid: string) {
  return await db
    .select()
    .from(transdb)
    .where(and(
      eq(transdb.hashid, hashid),
      eq(transdb.userid, userid)
    ))
    .orderBy(sql`${transdb.transdate} DESC`);
}

export async function getQrcode(hashid: string) {
  return await db
    .select({ points: qrcodedb.points, paytype: qrcodedb.paytype, reference: qrcodedb.reference, jsondata: qrcodedb.jsondata, mercid: qrcodedb.userid, status: qrcodedb.status, usage: qrcodedb.redeemtype })
    .from(qrcodedb)
    .where(eq(qrcodedb.hashid, hashid));
}

export async function qrcodeCollect(formData: FormData): Promise<ActionResult> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(transdb).values({
        userid: formData.get("userid") as string,
        xid: formData.get("mercid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")),
        hashid: formData.get("hashid") as string,
      });
      await tx.insert(transdb).values({
        userid: formData.get("mercid") as string,
        xid: formData.get("userid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")) * -1,
        hashid: formData.get("hashid") as string,
      });
      await tx.update(qrcodedb)
        .set({ redeemCnt: sql`${qrcodedb.redeemCnt} + 1`,
               updatedAt: new Date() })
        .where(and(
          eq(qrcodedb.userid, formData.get("mercid") as string),
          eq(qrcodedb.status, "active" as string),
      ));
      const result = await tx
        .update(balancedb)
        .set({
          balance: sql`${balancedb.balance} + ${Number(formData.get("points"))}`,
          lasttransdate: new Date()
        })
        .where(and(
          eq(balancedb.userid, formData.get("userid") as string),
          eq(balancedb.issuerid, formData.get("mercid") as string)
        ));
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
        .set({
          balance: sql`${balancedb.balance} - ${Number(formData.get("points"))}`,
          lasttransdate: new Date()
        })
        .where(and(
          eq(balancedb.userid, formData.get("mercid") as string),
          eq(balancedb.issuerid, formData.get("mercid") as string)
        ));
      if (result1.count === 0) {
        await tx.insert(balancedb).values({
          userid: formData.get("mercid") as string,
          issuerid: formData.get("mercid") as string,
          balance: Number(formData.get("points")) * -1,
          lasttransdate: new Date(),
        });
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
      return { error: err.message };
    }
    return { error: "Unknown error occurred" };
  }
  //redirect("/profileInfo");
}

export async function qrcodePay(formData: FormData): Promise<ActionResult> {
  try {
    await db.transaction(async (tx) => {
      const [{ sum }] = await tx
        .select({ sum: sql`COALESCE(SUM(${balancedb.balance}),0)` })
        .from(balancedb)
        .where(eq(balancedb.userid, formData.get("userid") as string));
      const sumNum = typeof sum === "bigint" ? Number(sum) : Number(sum ?? 0);
      const points = Number(formData.get("points"));
      if (sumNum < points) {
        throw new Error(`Points Not Enough - Balance= ${sumNum}`);
      }
      const balances = await tx
        .select()
        .from(balancedb)
        .where(eq(balancedb.userid, formData.get("userid") as string))
        .orderBy(sql`${balancedb.lasttransdate} DESC`);
      let remainingPoints = points;
      for (const bal of balances) {
        if (remainingPoints <= 0) break;
        const balValue = Number(bal.balance);
        if (balValue <= 0) continue;
        if (balValue <= remainingPoints) {
          await tx.update(balancedb)
            .set({ balance: 0, lasttransdate: new Date() })
            .where(and(
              eq(balancedb.userid, bal.userid),
              eq(balancedb.issuerid, bal.issuerid),
            ));
          const result = await tx
            .update(balancedb)
            .set({
              balance: sql`${balancedb.balance} + ${balValue}`,
              lasttransdate: new Date()
            })
            .where(and(
              eq(balancedb.userid, formData.get("mercid") as string),
              eq(balancedb.issuerid, bal.issuerid as string)
            ));
          if (result.count === 0) {
            await tx.insert(balancedb).values({
              userid: formData.get("mercid") as string,
              issuerid: bal.issuerid as string,
              balance: balValue,
              lasttransdate: new Date(),
            });
          }
          remainingPoints -= balValue;
        } else {
          await tx.update(balancedb)
            .set({ balance: balValue - remainingPoints, lasttransdate: new Date() })
            .where(and(
              eq(balancedb.userid, bal.userid),
              eq(balancedb.issuerid, bal.issuerid),
            ));
          const result1 = await tx
            .update(balancedb)
            .set({
              balance: sql`${balancedb.balance} + ${remainingPoints}`,
              lasttransdate: new Date()
            })
            .where(and(
              eq(balancedb.userid, formData.get("mercid") as string),
              eq(balancedb.issuerid, bal.issuerid as string)
            ));
          if (result1.count === 0) {
            await tx.insert(balancedb).values({
              userid: formData.get("mercid") as string,
              issuerid: bal.issuerid as string,
              balance: remainingPoints,
              lasttransdate: new Date(),
            });
          }
          remainingPoints = 0;
        }
      }
      await tx.insert(transdb).values({
        userid: formData.get("userid") as string,
        xid: formData.get("mercid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")) * -1,
        hashid: formData.get("hashid") as string,
      });
      await tx.insert(transdb).values({
        userid: formData.get("mercid") as string,
        xid: formData.get("userid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")),
        hashid: formData.get("hashid") as string,
      });
      await tx.update(qrcodedb)
        .set({ redeemCnt: sql`${qrcodedb.redeemCnt} + 1`,
               updatedAt: new Date() })
        .where(and(
          eq(qrcodedb.userid, formData.get("mercid") as string),
          eq(qrcodedb.status, "active" as string),
      ));
    });
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
      return { error: err.message };
    }
    return { error: "Unknown error occurred" };
  }
  //redirect("/profileInfo");
}

export async function qrcodeGen(formData: FormData): Promise<ActionResult> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(qrcodedb).values({
        userid: formData.get("mercid") as string,
        hashid: formData.get("qrhash") as string,
        points: Number(formData.get("points")),
        reference: formData.get("reference") as string,
        paytype: formData.get("payType") as string,
        redeemtype: (formData.get("redeemType") as string) || "once", // Store redeemType
        jsondata: JSON.stringify({
          mercid: formData.get("mercid"),
          points: formData.get("points"),
          payType: formData.get("payType"),
          reference: formData.get("reference"),
          redeemType: formData.get("redeemType") // Add to jsondata
        }),
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log("qrcodeGen ERROR: ",error(err.message));
      return { error: err.message };
    }
    if (err instanceof postgres.PostgresError) {
      console.log("DB ERROR",error(err.message));
      return { error: err.message };
    }
    console.log("Unknown error occurred");
    return { error: "Unknown error occurred" };
  }
  console.log("qrcodeGen: Success");//redirect("/qrcodelist");
}

export async function getUserSession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    if (!cookie) return { userId: null, userType: null };
    const session = await decrypt(cookie);
    return {
        userId: session?.userId ?? null,
        userType: session?.userType ?? null
    };
}
