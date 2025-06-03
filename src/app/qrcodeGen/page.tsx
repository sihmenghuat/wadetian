"use client";

import { qrcodeGen } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export default function QrCodeGenConfirm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get("uid") || "";
  const points = searchParams.get("points") || "";
  const payType = searchParams.get("payType") || "";
  const reference = searchParams.get("reference") || "";
  const qrValue = JSON.stringify({ uid, points, payType, reference });

  const handleConfirm = async () => {
    setLoading(true);
    // Prepare FormData for server action
    const formData = new FormData();
    formData.append("userid", uid);
    formData.append("points", points);
    formData.append("payType", payType);
    formData.append("reference", reference);
    await qrcodeGen(formData);
    setLoading(false);
    // The server action will redirect, but fallback just in case
    router.push("/responses");
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-lg font-bold">Confirm Generated QR Code</h2>
      <QRCodeSVG value={qrValue} size={200} />
      <div className="mt-4 text-sm text-gray-600 break-all">
        <div><b>User ID:</b> {uid}</div>
        <div><b>Points:</b> {points}</div>
        <div><b>Type:</b> {payType}</div>
        <div><b>Reference:</b> {reference}</div>
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
