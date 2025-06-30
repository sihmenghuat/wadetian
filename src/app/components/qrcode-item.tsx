"use client";

import { useState, useEffect } from "react";
import React from "react";
import crypto from 'crypto';
import { qrcodeGen } from "../actions";

export function getRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export default function QrCodeForm() {
  const [userSession, setUserSession] = React.useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });  
  //const params = useParams<{ uid: string }>();
  const uid = userSession.userId || ""; // Fallback to empty string if uid is not available

  const [points, setPoints] = useState("");
  const [payType, setPayType] = useState("");
  const [reference, setRefence] = useState("");

  const [loading, setLoading] = useState(false);
  const [qrhash, setQrhash] = useState("");

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  useEffect(() => {
    const storedHash = localStorage.getItem("qrhash");
    if (storedHash) {
      setQrhash(storedHash);
    } else {
      const newHash = getRandomString(20);
      setQrhash(newHash);
      localStorage.setItem("qrhash", newHash);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Prepare FormData for server action
    const formData = new FormData();
    formData.append("mercid", uid);
    formData.append("points", points);
    formData.append("payType", payType);
    formData.append("reference", reference);
    formData.append("qrhash", qrhash);
    qrcodeGen(formData)
      .then((result) => {
        if (result && result.error) {
          setLoading(false);
          alert(result.error); // or set an error state
          return;
        }
        setLoading(false);
        localStorage.removeItem("qrhash");
        // Redirect to /qrcodeGen with form data as query params
        const params = new URLSearchParams({ uid, points, payType, reference, qrhash }).toString();
        window.location.href = `/qrcodeGen?${params}`;
        //router.push(`/qrcodeGen?${params}`);
      })
      .catch(err => {
        console.error("Error generating QR code:", err);
        setLoading(false);
        window.location.href = `/qrcode`;
        //router.push("/qrcode");
      });
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
        <button className="bg-blue-600 text-white p-2 rounded" disabled={loading} type="submit"
        >
        {loading ? "Generating..." : "Submit"}
        </button>
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