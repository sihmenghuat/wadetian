import { getResponses } from "@/app/actions";
import { updBalance } from "@/app/actions";
import { LogoutForm } from "@/app/components/contact-logout";
import { ProfileItem } from "../../components/profile-item";
import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import TransactionTableClient from "@/app/components/transaction-table-client";

export default async function ProfileItemPage({ searchParams }: { searchParams?: { page?: string } }) {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  console.log("Session:", session);
  if (!session || !session.userId) {
    permanentRedirect(`/`);
  }
  console.log("Session userId:", session.userId);
  const userid = session.userId.toString();

  // Update balance if needed
  await updBalance(userid);

  const resps = userid ? await getResponses(userid) : [];
  console.log("User ID:", userid);
  const page = Number(searchParams?.page) || 1;
  const pageSize = 10;

  return (
    <div>
      <main>
    <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-2xl font-bold text-center">User Profile Information</h2>
      {resps.length > 0 ? (
        <ul className="space-y-4">
          {resps.map(resp => (
            <ProfileItem user={resp} key={resp.id} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">Profile Not found.</p>
      )}
      {/* Transaction Table Client Component */}
      <div className="w-full my-4">
        <TransactionTableClient userid={userid} initialPage={page} pageSize={pageSize} />
      </div>
      <LogoutForm userid={userid} />
    </div>
    </main>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/qrcodePay"
//          target="_blank"
//          rel="noopener noreferrer"
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
          href="/qrcodeCollect"
//          target="_blank"
//          rel="noopener noreferrer"
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
//          target="_blank"
//          rel="noopener noreferrer"
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
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href={`/profileEdit`}
//          target="_blank"
//          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/qrcode.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Edit Profile       
          </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href={`/myQrcode`}
//          target="_blank"
//          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/qrcode.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          My QR Code      
          </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href={`/directPay`}
//          target="_blank"
//          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/qrcode.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Direct Pay      
          </a>           
      </footer>
    </div>   
  );
}
