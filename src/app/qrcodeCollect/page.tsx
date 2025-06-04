import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import QrCodeCollect from "@/app/components/qrcode-collect";
import { qrcodeCollect } from "../actions";

export default async function QRcodePayPage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
console.log("Session:", session);
  if (!session || !session.userId) {
    permanentRedirect(`/`);
  }
  console.log("Session userId:", session.userId);
  const userid = session.userId.toString();
  console.log("User ID:", userid);

  return (
    <div>
      <main>
      <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <QrCodeCollect userid={userid} />
      <form className="flex items-center flex-col gap-3" action={qrcodeCollect}>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Submit
      </button>
    </form>
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
