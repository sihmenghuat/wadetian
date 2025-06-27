"use server";

import { db } from "@/db";
import { users, sessiondb, transdb, balancedb, qrcodedb } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, permanentRedirect } from "next/navigation";
import postgres from "postgres";
import { createSession, deleteSession } from "@/app/lib/session";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

// Helper type for error return
export type ActionResult = { error: string } | void;

export async function contactUsAction(formData: FormData): Promise<ActionResult> {
  try {
    const userid = formData.get("userid") as string | null;
    if (!userid) return { error: "User ID is required" };
    const existing = await db.select().from(users).where(eq(users.userid, userid));
    if (existing.length > 0) {
      return { error: "User ID already exists" };
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
  redirect("/profileInfo/" + formData.get("userid"));
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
  redirect("/profileInfo/" + formData.get("userid"));
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
    await db.delete(qrcodedb).where(eq(qrcodedb.id, id));
    revalidatePath("/qrcodelist");
    // Optionally log: QR code deleted
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
    }
  }
}

export async function loginAction(formData: FormData): Promise<void> {
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
    } else {
      shouldRedirectToResponses = true;
      usertype = result[0].usertype;
    }
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
    }
  }
  if (shouldRedirectToProfile) {
    permanentRedirect("/profileCreate");
  } else if (shouldRedirectToResponses) {
    await createSession(userid, usertype);
    await db
      .update(sessiondb)
      .set({
        logincount: sql`${sessiondb.logincount} + 1`,
        lastlogin: new Date(),
      })
      .where(eq(sessiondb.userid, userid));
    permanentRedirect(`/`);
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

export async function getQrcode(hashid: string) {
  return await db
    .select({ points: qrcodedb.points, paytype: qrcodedb.paytype, reference: qrcodedb.reference, jsondata: qrcodedb.jsondata, mercid: qrcodedb.userid })
    .from(qrcodedb)
    .where(eq(qrcodedb.hashid, hashid));
}

export async function qrcodeCollect(formData: FormData): Promise<void> {
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
        transamt: Number(formData.get("points")) * -1,
      });
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
    if (err instanceof postgres.PostgresError) {
      console.error("qrcodeCollect:", err.message);
    }
  }
  redirect("/profileInfo/" + formData.get("userid"));
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
      });
      await tx.insert(transdb).values({
        userid: formData.get("mercid") as string,
        xid: formData.get("userid") as string,
        transdesc: formData.get("reference") as string,
        transamt: Number(formData.get("points")),
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    if (err instanceof postgres.PostgresError) {
      console.error(err.message);
    }
    return { error: "Unknown error occurred" };
  }
  redirect("/profileInfo/" + formData.get("userid"));
}

export async function qrcodeGen(formData: FormData): Promise<void> {
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
      console.error(err.message);
    }
  }
  redirect("/qrcodelist");
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
