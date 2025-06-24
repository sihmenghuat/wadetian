"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import "./video.css";

export default function ItemCapturePage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    mercid: "",
    file: null as File | null,
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
    if (result.success) setForm({ 
      name: "", 
      description: "", 
      type: "", 
      mercid: "", 
      file: null 
    });
    setPreview(null);
  }

  return (
    <div>
      <h1>Capture Item</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Type"
        />
        <input
          name="mercid"
          value={form.mercid}
          onChange={handleChange}
          placeholder="Merchant ID"
        />
        <div>
          <button type="button" onClick={() => startCamera("image")}>
            Capture Photo
          </button>
          <button type="button" onClick={() => startCamera("video")}>
            Capture Video
          </button>
        </div>
        {streaming && (
          <div>
            <video ref={videoRef} autoPlay playsInline className="video-preview" />
            {mediaType === "image" ? (
              <button type="button" onClick={capturePhoto}>
                Take Photo
              </button>
            ) : (
              <>
                <button type="button" onClick={startVideoRecording}>
                  Start Recording
                </button>
                <button type="button" onClick={stopVideoRecording}>
                  Stop Recording
                </button>
              </>
            )}
            <button type="button" onClick={stopCamera}>
              Stop Camera
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />
        {preview && (
          <div>
            {mediaType === "image" ? (
              <Image src={preview} alt="Preview" width={320} height={240} />
            ) : (
              <video src={preview} controls width={320} height={240} />
            )}
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}