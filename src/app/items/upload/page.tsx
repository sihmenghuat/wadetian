"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";

export default function ItemUploadPage() {
  const [userSession, setUserSession] = useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });  

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    mercid: "",
    file: null,
    url: "",
    itemDescription: "",
    price: "",
    points: "",
    eventDetails: "",
    eventDateTime: "",
    eventLocation: "",
    qrhash: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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

  if (userSession.userId === null && userSession.userType === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Checking session...</span>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, files } = e.target as never;
    if (name === "file" && files && files[0]) {
      setForm(f => ({ ...f, file: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("type", form.type);
    data.append("mercid", form.mercid);
    if (form.file) data.append("file", form.file);
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
    const res = await fetch("/api/items/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setMessage(result.message || "");
    if (result.success) setForm({ name: "", description: "", type: "", mercid: "", file: null, url: "", itemDescription: "", price: "", points: "", eventDetails: "", eventDateTime: "", eventLocation: "", qrhash: "" });
  }

  return (
    <div className="flex flex-col justify-center items-center p-5 min-h-screen bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md bg-gray-50 p-6 rounded shadow">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-2 border rounded" />
        <input
          name="qrhash"
          placeholder="QR Hash ID (optional)"
          value={form.qrhash || ""}
          onChange={e => setForm(f => ({ ...f, qrhash: e.target.value }))}
          className="p-2 border rounded"
          type="text"
        />
        <label htmlFor="type-select" className="font-semibold">Type</label>
        <select
          id="type-select"
          name="type"
          value={form.type}
          onChange={handleChange}
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
            value={form.url || ""}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
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
              value={form.itemDescription}
              onChange={e => setForm(f => ({ ...f, itemDescription: e.target.value }))}
              required
              className="p-2 border rounded"
              type="text"
            />
            <input
              name="price"
              placeholder="Price (e.g. 9.99)"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required
              className="p-2 border rounded"
              type="number"
              min="0"
              step="0.01"
            />
            <input
              name="points"
              placeholder="Redeem Points"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
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
              value={form.eventDetails}
              onChange={e => setForm(f => ({ ...f, eventDetails: e.target.value }))}
              required
              className="p-2 border rounded"
              type="text"
            />
            <input
              name="eventDateTime"
              placeholder="Event Date & Time"
              value={form.eventDateTime}
              onChange={e => setForm(f => ({ ...f, eventDateTime: e.target.value }))}
              required
              className="p-2 border rounded"
              type="datetime-local"
            />
            <input
              name="eventLocation"
              placeholder="Event Location"
              value={form.eventLocation}
              onChange={e => setForm(f => ({ ...f, eventLocation: e.target.value }))}
              required
              className="p-2 border rounded"
              type="text"
            />
          </>
        )}
        <label htmlFor="mercid" className="font-semibold">Merchant ID</label>
        <input name="mercid" id="mercid" placeholder="Merchant ID" title="Merchant ID" value={userSession.userId ?? ""} disabled required className="p-2 border rounded" />
        <label htmlFor="file-upload" className="font-semibold">Media File</label>
        <input
          id="file-upload"
          name="file"
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          required
          className="p-2 border rounded"
          placeholder="Select an image or video"
          title="Select an image or video to upload"
        />
        {preview && (
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
          </div>
        )}
        <button type="submit" className="bg-blue-700 text-white p-2 rounded hover:bg-blue-900 transition">Upload</button>
      </form>
      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 text-center underline font-semibold text-lg"
          href={`/profileInfo`}
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
