"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

type Item = {
  id: number;
  name: string;
  description: string;
  mediaUrl?: string;
  mercid?: string;
  url?: string;
  type: "Url" | "Menu" | "Event" | "QrCode";
  itemDescription: string;
  price: string;
  points: number;
  eventDetails: string;
  eventDateTime: string;
  eventLocation: string;
  qrhash?: string;
};

export default function ItemUpdatePage() {
  const [userSession, setUserSession] = useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    mercid: "",
    mediaUrl: "",
    url: "",
    itemDescription: "",
    price: "",
    points: "",
    eventDetails: "",
    eventDateTime: "",
    eventLocation: "",
    qrhash: "",
  });
  const [itemid, setItemid] = React.useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [item, setItemList] = React.useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  useEffect(() => {
    if (userSession.userId && userSession.userType !== "merc") {
      console.log("Redirecting to profile info");
      permanentRedirect(`/profileInfo`);
    }
  }, [userSession]);

  // SSR-safe: get itemid from window.location in useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      setItemid(url.searchParams.get("itemid") || "");
    }
  }, []);

  useEffect(() => {
    // Only fetch items after session and mercid are set
    if (userSession.userId && userSession.userType === "merc") {
      //console.log("are you here ........");
      fetch(`/api/items/getitem?itemid=${encodeURIComponent(itemid)}`)
        .then(res => res.json())
        .then(data => setItemList(data));
      //console.log("end ...,desc: ",item);
    } 
  }, [item, itemid, userSession.userId, userSession.userType]);
  
  if (userSession.userId === null && userSession.userType === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Checking session...</span>
      </div>
    );
  }

 // function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
 //   const { name, value, files } = e.target as never;
 //   if (name === "file" && files && files[0]) {
 //     setForm(f => ({ ...f, file: files[0] }));
 //     setPreview(URL.createObjectURL(files[0]));
 //   } else {
 //     setForm(f => ({ ...f, [name]: value }));
 //   }
 //   }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    // Validate qrhash if present
    if (form.qrhash) {
      // Try to fetch QR code record from backend API
      const qrRes = await fetch(`/api/qrcodedb?qrhash=${encodeURIComponent(form.qrhash)}`);
      if (!qrRes.ok) {
        setMessage("QR hash record not found.");
        setIsError(true);
        return;
      }
      const qrData = await qrRes.json();
      if (!qrData || !qrData.paytype || !qrData.status) {
        setMessage("QR hash record not found.");
        setIsError(true);
        return;
      }
      if (qrData.paytype !== "Pay" || qrData.status !== "active") {
        setMessage("QR hash not PAY type or Active.");
        setIsError(true);
        return;
      }
      if (qrData.userid !== userSession.userId) {
        setMessage("QR hash is invalid.");
        setIsError(true);
        return;
      }
    }
    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("type", form.type);
    data.append("mercid", form.mercid);
    if (form.mediaUrl) data.append("mediaUrl", form.mediaUrl);
    if (form.qrhash) data.append("qrhash", form.qrhash);
    if (form.type === "Url" && form.url) data.append("url", form.url);
    if (form.type === "Menu") {
      data.append("itemDescription", form.itemDescription);
      data.append("price", form.price);
      data.append("points", form.points);
    }
    if (form.type === "Event") {
      data.append("eventDetails", form.eventDetails);
      data.append("eventDateTime", form.eventDateTime);
      data.append("eventLocation", form.eventLocation);
    }
    const res = await fetch("/api/items/update", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setMessage(result.message || "");
    setIsError(!result.success);
    if (result.success) setForm({ name: "", description: "", type: "", mercid: "", mediaUrl: "", url: "", itemDescription: "", price: "", points: "", eventDetails: "", eventDateTime: "", eventLocation: "", qrhash: "" });
  }

  return (
    <div className="flex flex-col justify-center items-center p-5 min-h-screen bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md bg-gray-50 p-6 rounded shadow">
        <input name="name" placeholder="Name" defaultValue={form.name} required className="p-2 border rounded" />
        <textarea name="description" placeholder="Description" defaultValue={form.description} className="p-2 border rounded" />
        <input
          name="qrhash"
          placeholder="QR Hash ID (optional)"
          defaultValue={form.qrhash || ""}
          className="p-2 border rounded"
          type="text"
        />
        <label htmlFor="type-select" className="font-semibold">Type</label>
        <select
          id="type-select"
          name="type"
          defaultValue={form.type}
          required
          className="p-2 border rounded"
        >
          <option value="" disabled>Select Type</option>
          <option value="Adverts">Adverts</option>
          <option value="Url">Reroute</option>
          <option value="Menu">Menu Item</option>
          <option value="Event">Event</option>
        </select>
        {form.type === "Url" && (
          <input
            name="url"
            placeholder="Enter URL for reroute"
            defaultValue={form.url || ""}
            required
            className="p-2 border rounded"
            type="url"
            pattern="https?://.+"
            title="Please enter a valid URL starting with http:// or https://"
          />
        )}
        {form.type === "Menu" && (
          <>
            <input
              name="itemDescription"
              placeholder="Menu Item Description"
              defaultValue={form.itemDescription}
              required
              className="p-2 border rounded"
              type="text"
            />
            <input
              name="price"
              placeholder="Price (e.g. 9.99)"
              defaultValue={form.price}
              required
              className="p-2 border rounded"
              type="number"
              min="0"
              step="0.01"
            />
            <input
              name="points"
              placeholder="Redeem Points"
              defaultValue={form.points}
              required
              className="p-2 border rounded"
              type="number"
              min="0"
              step="1"
            />
          </>
        )}
        {form.type === "Event" && (
          <>
            <input
              name="eventDetails"
              placeholder="Event Details"
              defaultValue={form.eventDetails}
              required
              className="p-2 border rounded"
              type="text"
            />
            <input
              name="eventDateTime"
              placeholder="Event Date & Time"
              defaultValue={form.eventDateTime}
              required
              className="p-2 border rounded"
              type="datetime-local"
            />
            <input
              name="eventLocation"
              placeholder="Event Location"
              defaultValue={form.eventLocation}
              required
              className="p-2 border rounded"
              type="text"
            />
          </>
        )}
        <label htmlFor="mercid" className="font-semibold">Merchant ID</label>
        <input name="mercid" id="mercid" placeholder="Merchant ID" title="Merchant ID" value={userSession.userId ?? ""} readOnly required className="p-2 border rounded" />
        <label htmlFor="file-upload" className="font-semibold">Media File</label>
        {/*<input
          id="file-upload"
          name="file"
          type="file"
          accept="image/*,video/*"
          required
          className="p-2 border rounded"
          placeholder="Select an image or video"
          title="Select an image or video to upload"
        />*/}
        {form.mediaUrl && form.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={form.mediaUrl}
            /*controls*/
            playsInline
            className={styles.mediaVideo}
          />
        ) : form.mediaUrl ? (
          <Image
            src={form.mediaUrl}
            alt={form.name}
            width={260}
            height={180}
            className={styles.mediaImage}
            //priority={idx === 0} // LCP priority for first image
          />
        ) : (
          <div className={styles.noMedia}>No Media</div>
        )
        }        
        {/*{preview && (
          <div className="flex flex-col items-center my-3">
            {preview.match(/^data:video|\.mp4$|\.webm$|\.ogg$/i) ? (
              <video src={preview} controls className="max-w-full max-h-72 rounded shadow" width={400} height={300} />
            ) : (
              <Image
                src={preview}
                alt="preview"
                className="max-w-full max-h-72 rounded shadow"
                width={400}
                height={300}
              />
            )}
          </div>*/}
        <button type="submit" className="bg-blue-700 text-white p-2 rounded hover:bg-blue-900 transition">Update</button>
      </form>
      {message && (
        <p className={`mt-4 font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      )}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 text-center underline font-semibold text-lg"
          href={`/?itemId=${itemid}`}
        >
          <Image
          aria-hidden
          src="/arrow-left.svg"
          alt="Globe icon"
          width={16}
          height={16}
          />
          Back
        </Link>
    </footer>
    </div>
  );
}
