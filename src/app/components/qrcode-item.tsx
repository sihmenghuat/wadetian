"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";

export default function QrCodeForm() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid || ""; // Fallback to empty string if uid is not available
  console.log("UID from params:", params.uid);

  const [points, setPoints] = useState("");
  const [payType, setPayType] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can format the QR value as needed (JSON, URL, etc.)
    const value = JSON.stringify({ uid, points, payType });
    setQrValue(value);
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          className="border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          type="text"
          placeholder="User ID"
          value={uid}
          readOnly
          disabled
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Points"
          value={points}
          onChange={e => setPoints(e.target.value)}
          required
        />
        <select
          className="border p-2 rounded"
          value={payType}
          onChange={e => setPayType(e.target.value)}
          required
          title="Pay Type"
        >
          <option value="" disabled>Select Transaction Type</option>
          <option value="Pay">Pay</option>
          <option value="Collect">Collect</option>
        </select>
        <button className="bg-blue-600 text-white p-2 rounded" type="submit">Generate</button>
      </form>
      {qrValue && (
        <div className="mt-8 flex flex-col items-center">
          <QRCodeSVG value={qrValue} size={200} />
          <p className="mt-2 text-sm text-gray-600 break-all">{qrValue}</p>
        </div>
      )
      }
    </div>
  );
}
