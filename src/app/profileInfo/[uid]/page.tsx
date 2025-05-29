import { db } from "@/db";
import { ProfileItem } from "../../components/profile-item";
import { responses } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

export default async function ProfileItemPage({ params }: { params: { uid?: string } }) {
  const userid = typeof params.uid === "string" ? params.uid : "";
  const resps = userid ? await getResponses(userid) : [];
  console.log("User ID:", userid);

  return (
    <div>
      <main>
    <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-2xl font-bold text-center">Profile Information</h2>
      {resps.length > 0 ? (
        <ul className="space-y-4">
          {resps.map(resp => (
            <ProfileItem response={resp} key={resp.id} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">Profile Not found.</p>
      )}
      <Link
        className="text-center underline font-semibold text-lg"
        href="/"
      >
        Logout
      </Link>
            <Link
        className="text-center underline font-semibold text-lg"
        href="/profileEdit"
      >
        Edit Profile
      </Link>
    </div>
    </main>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/pay"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/pay.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Scan to Pay
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/collect"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/collect.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Scan to Collect
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href={`/qrcode/${userid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/qrcode.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Generate QR Codes →
        </a>
      </footer>
    </div>   
  );
}

async function getResponses(userid: string) {
  return await db.select().from(responses).where(eq(responses.userid, userid));
}