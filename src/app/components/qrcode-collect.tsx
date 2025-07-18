"use client";
import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";


export default function QrCodeCollect({ userid }: { userid: string }) {
  const [qrData, setQrData] = useState("");
  const [scanError, setScanError] = useState("");
  const [formData, setFormData] = useState<Record<string, string> | null>(null);
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

  useEffect(() => {
    if (!qrData) return;
    let parsed: Record<string, string> | null = null;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      // ignore parse error
    }
    if (parsed && typeof parsed === "object" && parsed.qrhash) {
      (async () => {
        const { getQrcode } = await import("../actions");
        const result = await getQrcode(parsed.qrhash);
        console.log("getQrcode result", result);
        // result is likely an array, get the first item
        const qr = Array.isArray(result) ? result[0] : result;
        if (qr) {
          const merged = {
            points: qr.points?.toString() ?? "",
            payType: qr.paytype ?? "",
            reference: qr.reference ?? "",
            mercid: qr.mercid ?? "",
            hashid: parsed.qrhash,
          };
          console.log("Setting formData", merged);
          setFormData(merged);
        } else {
          setFormData(null);
        }
      })();
    } else {
      setFormData(null);
    }
  }, [qrData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    // Call qrcodePay server action
    const { qrcodeCollect } = await import("../actions");
    const merged = { ...formData, userid };
    const fd = new FormData();
    Object.entries(merged).forEach(([key, value]) => {
      fd.append(key, value as string);
    });
    await qrcodeCollect(fd);
  };

  return (
    <div>
      <main>
        <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-4">Scan QR Code to Collect</h1>
          {/* QR Code Reader Section */}
          <div className="my-4 w-full flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Scan a QR Code</h2>
            {!qrData && (
              <div
                id={qrRegionId}
                className="w-64 h-48 mb-2 bg-gray-200 rounded"
              />
            )}
            { !formData && qrData && (
              <div className="p-2 bg-red-100 rounded text-sm w-full break-words mb-2 flex flex-col items-center">
              <div className="text-red-600 font-semibold mb-2">Error: QR code is &#39;Invalid&#39;.</div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => {
                  setQrData("");
                  setScanError("");
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              >
                Ok
              </button>
            </div>
            )}
            {qrData && formData && (
              <form
                className="w-full flex flex-col items-center gap-2 mb-2"
                onSubmit={handleSubmit}
              >
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="w-full flex flex-row items-center">
                    <label className="w-32 font-semibold text-right mr-2">{key}:</label>
                    <input
                      className="flex-1 p-1 rounded border bg-gray-50"
                      name={key}
                      value={value as string}
                      readOnly
                      aria-label={key}
                      title={key}
                      placeholder={key}
                    />
                  </div>
                ))}
                <input type="hidden" name="userid" value={userid} />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-2"
                >
                  Submit
                </button>
              </form>
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
