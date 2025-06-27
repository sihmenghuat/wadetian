import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import QrCodeScan from "@/app/components/qrcode-scan";
import Link from "next/link";

export default async function QRcodeScanPage() {
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
      <QrCodeScan userid={userid} />
    </div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 text-center underline font-semibold text-lg"
          href="/profileInfo"
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
    </div>
  );
}
