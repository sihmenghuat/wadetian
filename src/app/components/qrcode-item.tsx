"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function QrCodeForm() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid || ""; // Fallback to empty string if uid is not available
  console.log("UID from params:", params.uid);

  const [points, setPoints] = useState("");
  const [payType, setPayType] = useState("");
  const [reference, setRefence] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Redirect to /qrcodeGen with form data as query params
    const params = new URLSearchParams({ uid, points, payType, reference }).toString();
    window.location.href = `/qrcodeGen?${params}`;
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
          <option value="Pay">To Receive Points</option>
          <option value="Collect">To Give Out Points</option>
        </select>
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Reference"
          value={reference}
          onChange={e => setRefence(e.target.value)}
          required
          pattern="^[a-zA-Z0-9-_ ]*$"
        />
        <button className="bg-blue-600 text-white p-2 rounded" type="submit">Generate</button>
      </form>
    </div>
  );
}
// This component generates a QR code based on user input and displays it.
//      {qrValue && (
//      <div className="mt-8 flex flex-col items-center">
//       <QRCodeSVG value={qrValue} size={200} />
//       <p className="mt-2 text-sm text-gray-600 break-all">{qrValue}</p>
//      </div>
//      )}