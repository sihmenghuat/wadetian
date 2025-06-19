import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import DirectPay from "@/app/components/direct-pay";

export default async function DirectPayPage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  console.log("Session:", session);
  if (!session || !session.userId) {
    permanentRedirect(`/`);
  }
  if (session.userType !== "user") {
    permanentRedirect(`/profile/${session.userId}`);
  }
  console.log("Session Details:", session.userId, session.userType);
  const userid = session.userId.toString();

  return (
    <div>
      <main>
      <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <DirectPay userid={userid} />
      </div>
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
            href="/qrcode"
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
      </main>
    </div>
  );
}
