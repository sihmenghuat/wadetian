"use client";

import { qrcodeGen } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import crypto from 'crypto';

export function getRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export default function QrCodeGenConfirm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrhash, setQrhash] = useState("");

  useEffect(() => {
    setQrhash(getRandomString(16));
  }, []);

  const mercid = searchParams.get("uid") || "";
  const points = searchParams.get("points") || "";
  const payType = searchParams.get("payType") || "";
  const reference = searchParams.get("reference") || "";
  console.log(qrhash);
//  const qrValue = JSON.stringify({ mercid, points, payType, reference, qrhash });
    const qrValue = JSON.stringify({ mercid, qrhash });

  const handleConfirm = async () => {
    setLoading(true);
    // Prepare FormData for server action
    const formData = new FormData();
    formData.append("mercid", mercid);
    formData.append("points", points);
    formData.append("payType", payType);
    formData.append("reference", reference);
    formData.append("qrhash", qrhash);
    await qrcodeGen(formData);
    setLoading(false);
    // The server action will redirect, but fallback just in case
    router.push("/qrcodeGen/success");
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-lg font-bold">Confirm Generated QR Code</h2>
      <QRCodeSVG value={qrValue} size={200} />
      <div className="mt-4 text-sm text-gray-600 break-all">
        <div><b>Merchant ID:</b> {mercid}</div>
        <div><b>Points:</b> {points}</div>
        <div><b>Type:</b> {payType}</div>
        <div><b>Reference:</b> {reference}</div>
        <div><b>Hash:</b> {qrhash}</div>
      </div>
      <button
        className="bg-green-600 text-white p-2 rounded mt-4 disabled:opacity-50"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? "Confirming..." : "Confirm Generated QR code"}
      </button>
    </div>
  );
}
