"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { qrcodePay } from "../actions";

export default function QrCodePay({ userid }: { userid: string }) {
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

  return (
    <div>
      <main>
        <div className="flex flex-col items-center justify-center border-2 gap-5 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-4">Scan QR Code to Pay</h1>
          {/* QR Code Reader Section */}
          <div className="my-4 w-full flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Scan a QR Code</h2>
            {!qrData && (
              <div
                id={qrRegionId}
                className="w-64 h-48 mb-2 bg-gray-200 rounded"
              />
            )}
            {qrData && formData && (() => {
              console.log("Parsed formData:", formData);
              if (formData.payType !== "Pay") {
                return (
                  <div className="p-2 bg-red-100 rounded text-sm w-full break-words mb-2 flex flex-col items-center">
                    <div className="text-red-600 font-semibold mb-2">Error: payType is not &#39;Pay&#39;.</div>
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
                );
              }
              return (
                <PayFormWithError parsed={formData} userid={userid} />
              );
            })()}
            {scanError && (
              <div className="text-red-500 text-xs mt-1">Please scan again!</div>
            )}
            {!formData && qrData && (
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
          </div>
        </div>
    </main>
    </div>
);
}

function PayFormWithError({ parsed, userid }: { parsed: Record<string, string>; userid: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="w-full flex flex-col items-center gap-2 mb-2"
      action={async () => {
        setError(null);
        startTransition(async () => {
          const merged = { ...parsed, userid };
          const fd = new FormData();
          Object.entries(merged).forEach(([key, value]) => {
            fd.append(key, value as string);
          });
          const result = await qrcodePay(fd);
          if (result && result.error) {
            setError(result.error);
          }
        });
      }}
    >
      {Object.entries(parsed).map(([key, value]) => (
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
      {!error && (
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-2"
        disabled={isPending}
      >
        {isPending ? "Processing..." : "Submit"}
      </button>
      )}
      {error && (
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      >
        Ok
      </button>
      )}
      {error && (
        <div className="text-red-600 font-semibold mt-2">{error}</div>
      )}
    </form>
  );
}