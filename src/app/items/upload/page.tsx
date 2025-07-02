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
    const res = await fetch("/api/items/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setMessage(result.message || "");
    if (result.success) setForm({ name: "", description: "", type: "", mercid: "", file: null });
  }

  return (
    <div className="flex flex-col justify-center items-center p-5 min-h-screen bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md bg-gray-50 p-6 rounded shadow">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-2 border rounded" />
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
          <option value="Reroute">Reroute</option>
          <option value="Feedback">Feedback</option>
        </select>
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
