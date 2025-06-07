import { NextRequest } from "next/server";
import { getTransactionsByUserId } from "@/app/lib/getTransactions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userid = searchParams.get("userid") || "";
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  if (!userid) {
    return new Response(JSON.stringify({ records: [], total: 0 }), { status: 400 });
  }
  const { records, total } = await getTransactionsByUserId(userid, page, pageSize);
  // Convert Date to string for client
  const txs = records.map(tx => ({ ...tx, transdate: tx.transdate instanceof Date ? tx.transdate.toISOString() : tx.transdate }));
  return new Response(JSON.stringify({ records: txs, total }), {
    headers: { "Content-Type": "application/json" },
  });
}
