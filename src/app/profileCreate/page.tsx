import Image from "next/image";
import {ContactForm} from "@/app/components/contact-form";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-2 pb-20 gap-16 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/galney.png"
          alt="Galney logo"
          width={150}
          height={150}
          priority
        />
    <div className="flex flex-col justify-center items-center gap-5 border-2 rounded-md p-6">
      <ContactForm />
      <Link
        className="text-center underline font-semibold text-lg"
        href="/"
      >
        Back to Login
      </Link>
    </div>
      </main>
    </div>
  );
}
