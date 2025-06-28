import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";  
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";

import { QRCodeSVG } from "qrcode.react";

export default async function MyQrcodePage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  console.log("Session:", session);
  if (!session || !session.userId) {
    permanentRedirect(`/`);
  }
  console.log("Session userId:", session.userId);
  const userid = session.userId.toString();
  const qrValue = JSON.stringify({ userid });

  return (
        <div>
          <main>
          <div className="flex items-center justify-center gap-2 p-5">
          <Image
            className="dark:invert"
            src="/galney.png"
            alt="Galney logo"
            width={150}
            height={150}
            priority
          />
          </div>
          <div className="flex flex-col items-center justify-center border-2 gap-10 rounded-md p-5 pb-10">
          <h2 className="text-lg font-bold">My QR Code</h2>
            <QRCodeSVG value={qrValue} size={200} />
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
        </div>
  );
}
