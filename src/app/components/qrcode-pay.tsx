"use client";
import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";

export default function QrCodePay({ userid }: { userid: string }) {
  const [qrData, setQrData] = useState("");
  const [scanError, setScanError] = useState("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = "qr-reader-region";
  console.log("User ID:", userid);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    if (typeof window !== "undefined") {
      import("html5-qrcode").then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;
        Html5Qrcode.getCameras().then((devices: { id: string }[]) => {
          if (devices && devices.length) {
            if (html5QrCode) {
              html5QrCode
                .start(
                  devices[0].id,
                  {
                    fps: 10,
                    qrbox: 256,
                  },
                  (decodedText: string) => {
                    setQrData(decodedText);
                    setScanError("");
                    html5QrCode?.stop();
                  },
                  (errorMessage: string) => {
                    console.warn("QR Code scan error:", errorMessage);
                    setScanError(errorMessage);
                  }
                )
                .catch((err: { message?: string }) => setScanError(err?.message || "Camera error"));
            }
          } else {
            setScanError("No camera found");
          }
        });
      });
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  return (
    <div>
      <main>
        <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-4">Scan QR Code to Pay</h1>
          {/* QR Code Reader Section */}
          <div className="my-4 w-full flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Scan a QR Code</h2>
            <div
              id={qrRegionId}
              className="w-64 h-48 mb-2 bg-gray-200 rounded"
            />
            {qrData && (
              <div className="p-2 bg-gray-100 rounded text-sm w-full break-words">
                <strong>QR Data:</strong> {qrData}
              </div>
            )}           
            {scanError && (
              <div className="text-red-500 text-xs mt-1">Please scan again!</div>
            )}
          </div>
        </div>
    </main>
    </div>
);
}