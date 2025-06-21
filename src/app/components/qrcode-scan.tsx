"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Html5Qrcode } from "html5-qrcode";


export default function QrCodeScan({ userid }: { userid: string }) {
  const [qrData, setQrData] = useState("");
  const [scanError, setScanError] = useState("");
  const [formData, setFormData] = useState<Record<string, string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    setIsProcessing(true);
    let parsed: Record<string, string> | null = null;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      // ignore parse error
    }
    if (parsed && parsed.userid === userid) {
      console.log("Both ID cannot be the same...");
      setError("Both ID cannot be the same...");
      setQrData("");
    } else if (parsed && typeof parsed === "object" && parsed.qrhash) {
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
        setIsProcessing(false);
      })();
    } else if (parsed && typeof parsed === "object" && parsed.userid) {
      (async () => {
        const { getResponses } = await import("../actions");
        const result = await getResponses(parsed.userid);
        console.log("getResponses result", result);
        // result is likely an array, get the first item
        const qr = Array.isArray(result) ? result[0] : result;
        if (qr) {
          const merged = {
            points: "0",
            payType: "Pay",
            reference: "",
            mercid: qr.userid ?? "",
            hashid: "",
          };
          console.log("Setting formData", merged);
          setFormData(merged);
        } else {
          setFormData(null);
        }
        setIsProcessing(false); // NEW
      })();
    } else {
      setFormData(null);
      setIsProcessing(false); 
    }
  }, [qrData, userid]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setError(null);
    startTransition(async () => {
      const { qrcodeCollect, qrcodePay } = await import("../actions");
      const merged = { ...formData, userid };
      const fd = new FormData();
      Object.entries(merged).forEach(([key, value]) => {
        fd.append(key, value as string);
      });
      if (formData.payType === "Collect") {
        await qrcodeCollect(fd);
      };
      if (formData.payType === "Pay") {
        const result = await qrcodePay(fd);
        if (result && result.error) {
          setError(result.error);
          }
      };
    });
  }

  return (
    <div>
      <main>
        <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
          {/* QR Code Reader Section */}
          <div className="my-4 w-full flex flex-col items-center">
            {formData?.payType && (
              <h2 className="text-xl font-bold mb-3 uppercase">{formData.payType}</h2>
            )}
            {!qrData && (
              <div
                id={qrRegionId}
                className="w-64 h-48 mb-2 bg-gray-200 rounded"
              />
            )}
            {qrData && isProcessing && (
              <div className="text-blue-600 text-sm mb-2">Processing QR code...</div>
            )}
            { !formData && qrData && !isProcessing && (
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
            <input
              className="border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              type="text"
              placeholder="User ID"
              value={formData.mercid}
              title="User/Merchant ID"
              readOnly
              disabled
            />
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Points"
              value={formData.points}
              title="Points"
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              required
              disabled={!!formData.hashid}
            />
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Reference"
              value={formData.reference}
              title="Reference"
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              required
              pattern="^[a-zA-Z0-9-_ ]*$"
              disabled={!!formData.hashid}
            />
            <input type="hidden" name="userid" value={userid} />
            <div className="flex flex-row w-full justify-center gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Submit"}
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              onClick={() => {
                setQrData("");
                setScanError("");
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
            >
              Cancel
            </button>
            </div>
            {error && (
              <div className="text-red-600 font-semibold mt-2">{error}</div>
            )}
            </form>
            )}
            {scanError && (
              <div className="text-red-500 text-xs mt-1">Please scan again!</div>
            )}
            {error && (

              <div className="flex flex-row w-full justify-center gap-2 text-red-600 font-semibold mt-2">{error}
              <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => {
                setQrData("");
                setScanError("");
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
            >
              Scan Again!
            </button>
            </div>
            )}
          </div>
        </div>
    </main>
    </div>
);
}
