"use client";
import { useState } from "react";
import Image from "next/image";

export default function ItemUploadPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    mercid: "",
    file: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
    <div className="item-upload-container">
      <h2>Upload or Capture Item Media</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="type" placeholder="Type" value={form.type} onChange={handleChange} required />
        <input name="mercid" placeholder="Merchant ID" value={form.mercid} onChange={handleChange} required />
        <label htmlFor="file-upload">Media File</label>
        <input
          id="file-upload"
          name="file"
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          required
          placeholder="Select an image or video"
          title="Select an image or video to upload"
        />
        {preview && (
          <div className="item-upload-preview">
            {preview.match(/^data:video|\.mp4$|\.webm$|\.ogg$/i) ? (
              <video src={preview} controls className="item-upload-media item-upload-media-contain" width={400} height={300} />
            ) : (
              <Image
                src={preview}
                alt="preview"
                className="item-upload-media item-upload-media-contain"
                width={400}
                height={300}
              />
            )}
          </div>
        )}
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
