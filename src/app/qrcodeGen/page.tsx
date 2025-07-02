"use client";

import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { permanentRedirect } from "next/navigation";

export default function QrCodeGenConfirm() {
  const [userSession, setUserSession] = React.useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });  
 
  const searchParams = useSearchParams();
  if (!userSession || userSession.userType !== "merc") {
    permanentRedirect(`/profileInfo`);
  }

useEffect(() => {
  fetch("/api/session")
    .then(res => res.json())
    .then(data => setUserSession(data));
}, []);

  //const mercid = searchParams.get("uid") || "";
  const mercid = userSession.userId || "";
  const points = searchParams.get("points") || "";
  const payType = searchParams.get("payType") || "";
  const reference = searchParams.get("reference") || "";
  const qrhash = searchParams.get("qrhash") || "";
  console.log(qrhash);
  //  const qrValue = JSON.stringify({ mercid, points, payType, reference, qrhash });
  const qrValue = JSON.stringify({ mercid, qrhash });

  return (
    <main>
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-lg font-bold">Generated QR Code</h2>
      <QRCodeSVG value={qrValue} size={200} />
      <div className="mt-4 text-sm text-gray-600 break-all">
        <div><b>Merchant ID:</b> {mercid}</div>
        <div><b>Points:</b> {points}</div>
        <div><b>Type:</b> {payType}</div>
        <div><b>Reference:</b> {reference}</div>
        <div><b>Hash:</b> {qrhash}</div>
      </div>
    </div>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <Link
        className="flex items-center gap-2 text-center underline font-semibold text-lg"
        href={`/qrcode`}
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
