import Image from "next/image";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";
import QrCodeScan from "@/app/components/qrcode-scan";
import Link from "next/link";

export default async function QRcodeScanPage() {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session || !session.userId || session.userType !== "user") {
      permanentRedirect(`/`);
    }
    const userid = session.userId.toString();
    return (
      <div>
        <main>
          <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
            <QrCodeScan userid={userid} />
          </div>
          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <Link
              className="flex items-center gap-2 text-center underline font-semibold text-lg"
              href="/"
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
  } catch (error) {
    // Let the global error boundary handle it
    throw error;
  }
}
