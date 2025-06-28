import Image from "next/image";
import {ContactForm} from "@/app/components/contact-form";
import Link from "next/link";

export default function Home() {
  return (
    <main>
    <div className="grid items-center justify-items-center p-5 pb-5 gap-16 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[25px] items-center sm:items-start">
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
      </div>
      </main>
  </div>
  <footer className="flex gap-[24px] flex-wrap items-center justify-center">
    <Link
      className="flex items-center gap-2 text-center underline font-semibold text-lg"
      href={`/login`}
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
  );
}
