"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import Link from "next/link";

export default function QrCodePage() {
  const [userid, setUserid] = useState("");
  const [points, setPoints] = useState("");
  const [payType, setPayType] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can format the QR value as needed (JSON, URL, etc.)
    const value = JSON.stringify({ userid, points, payType });
    setQrValue(value);
  };

  return (
    <div>
        <main>
    <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="User ID"
          value={userid}
          onChange={e => setUserid(e.target.value)}
          required
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
