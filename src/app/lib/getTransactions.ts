import { db } from "@/db";
import { transdb } from "@/db/schema";
import { sql, eq, asc } from "drizzle-orm";

export async function getTransactionsByUserId(userid: string, page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  const [records, [{ count }]] = await Promise.all([
    db.select()
      .from(transdb)
      .where(eq(transdb.userid, userid))
      .orderBy(asc(transdb.transdate))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` })
      .from(transdb)
      .where(eq(transdb.userid, userid)),
  ]);
  return { records, total: Number(count) };
}
