"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPinPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgotPin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch {
      setError("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Forgot PIN</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm mb-4">
        <label htmlFor="email" className="font-medium">Enter your email address:</label>
        <input
          id="email"
          name="email"
          type="email"
          className="border rounded px-2 py-1 w-full"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-700 text-white rounded px-3 py-1" disabled={loading}>
          {loading ? "Sending..." : "Send PIN"}
        </button>
      </form>
      {message && <div className="p-2 border rounded bg-green-50 text-green-800 w-full max-w-sm text-center">{message}</div>}
      {error && <div className="p-2 border rounded bg-red-50 text-red-800 w-full max-w-sm text-center">{error}</div>}
      <div>
        <Link
        className="text-center underline font-semibold text-lg"
        href="/"
      >
        Back to Login
      </Link>
      </div>
    </div>
  );
}
