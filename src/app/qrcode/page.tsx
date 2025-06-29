
import Image from "next/image";
import Link from "next/link";
import QrCodeForm from "@/app/components/qrcode-item";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";

export default async function QrCodePage() {
const cookie = (await cookies()).get("session")?.value;
const session = await decrypt(cookie);
console.log("Session:", session);
  if (!session || session && session.userType !== "merc") {
    permanentRedirect(`/`);
  }

  return (
    <div>
    <main>
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code</h1>
      <QrCodeForm/>
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
