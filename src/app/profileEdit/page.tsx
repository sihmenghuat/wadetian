import Image from "next/image";
import {ContactEdit} from "@/app/components/contact-edit";
import Link from "next/link";
import { getResponses } from "@/app/actions";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { permanentRedirect } from "next/navigation";

export default async function ProfileEditPage() {
const cookie = (await cookies()).get("session")?.value;
const session = await decrypt(cookie);
console.log("Session:", session);
  if (!session || !session.userId) {
    permanentRedirect(`/`);
  }
  console.log("Session userId:", session.userId);
  const userid = session.userId.toString();
  const resps = userid ? await getResponses(userid) : [];
  console.log("User ID:", userid);

  return (
    <div className="grid items-center justify-items-center p-5 pb-5 gap-2 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/galney.png"
          alt="Galney logo"
          width={150}
          height={150}
          priority
        />
    <div className="flex flex-col justify-center items-center gap-5 border-2 rounded-md p-6">
      {resps.map(resp => (
        <ContactEdit user={resp} key={resp.id} />
      ))}
    </div>
      </main>
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
    </div>
  );
}
