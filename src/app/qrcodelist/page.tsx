import { db } from "@/db";
import { qrcodedb } from "@/db/schema";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import FilterToggle from "./FilterToggle";
import { DeleteQrcodeButton } from "./DeleteQrcodeButton";

function getDefaultDates() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const today = `${yyyy}-${mm}-${dd}`;
  const firstOfMonth = `${yyyy}-${mm}-01`;
  return { today, firstOfMonth };
}

export default async function QrcodelistPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const param = searchParams ? await searchParams : {};
  const filterType = param.type || "";
  const filterStatus = param.status || "active";
  const { today, firstOfMonth } = getDefaultDates();
  const filterFrom = param.from || firstOfMonth;
  const filterTo = param.to || today;
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  if (!session || session.userType !== "merc") {
    permanentRedirect(`/profileInfo`);
  }
  const userid = String(session.userId);

  console.log("Session userId:", userid, "Filter Type:", filterType, "Filter Status:", filterStatus, "From:", filterFrom, "To:", filterTo);
  const resps = await getQrcode(userid, filterType, filterStatus, filterFrom, filterTo);

  // This is a server component, so we need to use a client component for the filter toggle
  return (
    <main>
      <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center">QR Code List</h2>
        <FilterToggle
          filterType={filterType}
          filterStatus={filterStatus}
          filterFrom={filterFrom}
          filterTo={filterTo}
          today={today}
        />
        {resps.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">User Id</th>
                  <th className="px-2 py-1 border">Hash Id</th>
                  <th className="px-2 py-1 border">Points</th>
                  <th className="px-2 py-1 border">Reference</th>
                  <th className="px-2 py-1 border">Type</th>
                  <th className="px-2 py-1 border">Usage</th>
                  <th className="px-2 py-1 border">Created At</th>
                  <th className="px-2 py-1 border">Status</th>
                  <th className="px-2 py-1 border">Count</th>
                  <th className="px-2 py-1 border">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {resps.map(resp => (
                  <tr key={resp.id} className="text-center">
                    <td className="border px-2 py-1">{resp.userid}</td>
                    <td className="border px-2 py-1">
                      <a
                        href={`/qrcodeGen?uid=${encodeURIComponent(resp.userid)}&points=${encodeURIComponent(resp.points)}&payType=${encodeURIComponent(resp.paytype)}&reference=${encodeURIComponent(resp.reference)}&qrhash=${encodeURIComponent(resp.hashid)}&redeemType=${encodeURIComponent(resp.redeemtype)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {resp.hashid}
                      </a>
                    </td>
                    <td className="border px-2 py-1">{resp.points}</td>
                    <td className="border px-2 py-1">{resp.reference}</td>
                    <td className="border px-2 py-1">{resp.paytype}</td>
                    <td className="border px-2 py-1">{resp.redeemtype === "once" ? "Once" : "Daily"}</td>
                    <td className="border px-2 py-1">
                      {resp.createdAt
                        ? new Date(
                            typeof resp.createdAt === 'string'
                              ? resp.createdAt + 'Z'
                              : resp.createdAt
                          ).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
                        : '-'}
                    </td>
                    <td className="border px-2 py-1">{resp.status ?? '-'}</td>
                    <td className="border px-2 py-1">{resp.redeemCnt}</td>                    
                    <td className="border px-2 py-1">
                      {resp.status === "active" ? (
                        <DeleteQrcodeButton id={resp.id} />
                      ) : (
                          <span>
                            {new Date(
                              typeof resp.updatedAt === 'string'
                                ? resp.updatedAt + 'Z'
                                : resp.updatedAt
                            ).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}
                          </span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No QR code yet.</p>
        )}
      </div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 text-center underline font-semibold text-lg"
          href={`/profileInfo`}
        >
          <Image
          aria-hidden
          src="/arrow-left.svg"
          alt="Globe icon"
          width={16}
          height={16}
          />
          Back
        </Link>
      </footer>  
    </main>
  );
}

async function getQrcode(userid: string, type?: string, status?: string, from?: string, to?: string) {
  const whereClauses = [eq(qrcodedb.userid, userid)];
  if (type) {
    whereClauses.push(eq(qrcodedb.paytype, type));
  }
  if (status) {
    whereClauses.push(eq(qrcodedb.status, status));
  }
  if (from) {
    // Only compare date portion, ignore time
    whereClauses.push(gte(sql`DATE(${qrcodedb.createdAt})`, from));
  }
  if (to) {
    whereClauses.push(lte(sql`DATE(${qrcodedb.createdAt})`, to));
  }
  const query = db.select().from(qrcodedb).where(and(...whereClauses));
  return await query.orderBy(desc(qrcodedb.createdAt));
}
