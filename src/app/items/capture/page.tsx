"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import "./video.css";
import React from "react";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";

export default function ItemCapturePage() {
  const [userSession, setUserSession] = React.useState<{ userId: string | null, userType: string | null }>({ userId: null, userType: null });  
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    mercid: "",
    file: null as File | null,
    url: "",
    menuDescription: "",
    price: "",
    points: "",
    eventDetails: "",
    eventDateTime: "",
    eventLocation: "",
    qrhash: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => setUserSession(data));
  }, []);

  useEffect(() => {
    // Only redirect if session is loaded and user is not merc
    if (userSession.userId && userSession.userType !== "merc") {
      permanentRedirect(`/profileInfo`);
    }
  }, [userSession]);

  useEffect(() => {
    if (streaming) {
      console.log("Streaming is true, rendering video element");
    }
  }, [streaming]);

  useEffect(() => {
    if (streaming && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play();
      console.log("Camera stream assigned to video element");
    }
  }, [streaming]);

  if (userSession.userId === null && userSession.userType === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Checking session...</span>
      </div>
    );
  }
  
  async function startCamera(type: "image" | "video") {
    setMediaType(type);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    // Check if running in browser and mediaDevices is available
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setMessage("Camera access is not supported in this environment.");
      return;
    }
    const constraints = { video: true, audio: type === "video" };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaStreamRef.current = stream;
    setStreaming(true);
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setStreaming(false);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          setForm(f => ({ ...f, file: new File([blob], "capture.jpg", { type: blob.type }) }));
          setPreview(URL.createObjectURL(blob));
        }
      }, "image/jpeg");
    }
    stopCamera();
  }

  function startVideoRecording() {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStreamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setForm(f => ({ ...f, file: new File([blob], "capture.webm", { type: blob.type }) }));
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    };
    recorder.start();
  }

  function stopVideoRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
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
      data.append("menuDescription", form.menuDescription);
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
    if (result.success) setForm({ 
      name: "", 
      description: "", 
      type: "", 
      mercid: "", 
      file: null,
      url: "",
      menuDescription: "",
      price: "",
      points: "",
      eventDetails: "",
      eventDateTime: "",
      eventLocation: "",
      qrhash: ""
    });
    setPreview(null);
  }

  return (
    <div className="flex flex-col justify-center items-center p-5 min-h-screen bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Capture Media</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md bg-gray-50 p-6 rounded shadow">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="p-2 border rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="p-2 border rounded"
        />
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
              name="menuDescription"
              placeholder="Menu Item Description"
              value={form.menuDescription}
              onChange={e => setForm(f => ({ ...f, menuDescription: e.target.value }))}
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
        <input
          name="mercid"
          id="mercid"
          placeholder="Merchant ID"
          title="Merchant ID"
          value={userSession.userId ?? ""}
          disabled
          required
          className="p-2 border rounded"
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => startCamera("image")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Capture Photo</button>
          <button type="button" onClick={() => startCamera("video")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Capture Video</button>
        </div>
        {streaming && (
          <div className="flex flex-col items-center my-3">
            <video ref={videoRef} autoPlay playsInline className="video-preview mb-2 rounded shadow" width={320} height={240} />
            {mediaType === "image" ? (
              <button type="button" onClick={capturePhoto} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition mb-2">Take Photo</button>
            ) : (
              <>
                <button type="button" onClick={startVideoRecording} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition mb-2">Start Recording</button>
                <button type="button" onClick={stopVideoRecording} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition mb-2">Stop Recording</button>
              </>
            )}
            <button type="button" onClick={stopCamera} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600 transition">Stop Camera</button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />
        {preview && (
          <div className="flex flex-col items-center my-3">
            {mediaType === "image" ? (
              <Image src={preview} alt="Preview" width={320} height={240} className="rounded shadow" />
            ) : (
              <video src={preview} controls width={320} height={240} className="rounded shadow" />
            )}
          </div>
        )}
        <button type="submit" className="bg-blue-700 text-white p-2 rounded hover:bg-blue-900 transition">Submit</button>
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
