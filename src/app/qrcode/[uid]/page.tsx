
import Image from "next/image";
import Link from "next/link";
import QrCodeForm from "@/app/components/qrcode-item";

export default function QrCodePage() {

  return (
    <div>
        <main>
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code</h1>
      <QrCodeForm/>
      <Link
        className="text-center underline font-semibold text-lg"
        href="/profileInfo"
      >
        Home
      </Link>
      <Link
        className="text-center underline font-semibold text-lg"
        href="/profileEdit"
      >
        Edit Profile
      </Link>
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
