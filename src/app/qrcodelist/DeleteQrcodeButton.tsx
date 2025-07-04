"use client";
import { useState, useTransition } from "react";
import { removeQrcode } from "../actions";

export function DeleteQrcodeButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);
  return (
    <button
      type="button"
      disabled={pending || deleted}
      className="text-red-600 hover:text-red-800 font-bold px-2 py-1 disabled:opacity-50"
      onClick={() => {
        startTransition(async () => {
          await removeQrcode(id);
          setDeleted(true);
        });
      }}
      title="Delete QR code"
    >
      {deleted ? "Deleted" : "Delete"}
    </button>
  );
}
