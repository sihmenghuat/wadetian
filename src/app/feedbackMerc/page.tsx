"use client";
import { useState, useEffect } from "react";

type Feedback = {
  id: number;
  fromid: string;
  toid: string;
  message: string;
  itemId: string;
  createdAt: string;
};
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function FeedbackMerchantPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemid = searchParams.get("itemid") || "";
  const from = searchParams.get("from") || "";
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showAll, setShowAll] = useState(false); // false = current only (default)
  const [isReplyEnabled, setIsReplyEnabled] = useState(false);
  const [replyingToItemId, setReplyingToItemId] = useState("");

  // Fetch feedback list for this user (from or to), with or without itemid
  useEffect(() => {
    if (!from) return;
    setFeedbackLoading(true);
    const user = from || to;
    let url = `/api/feedback/list?user=${encodeURIComponent(user)}`;
    if (!showAll && itemid) {
      url += `&itemid=${encodeURIComponent(itemid)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setFeedbackList(Array.isArray(data) ? data : []))
      .finally(() => setFeedbackLoading(false));
  }, [from, to, itemid, showAll]);

  // Handle reply to feedback
  function handleReply(feedback: Feedback) {
    // Set the To field based on the logic: if feedback.toid !== from, then To = feedback.toid, else To = feedback.fromid
    const replyTo = feedback.toid !== from ? feedback.toid : feedback.fromid;
    setTo(replyTo);
    setReplyingToItemId(feedback.itemId);
    
    // Include the original message in the reply
    const replyMessage = `Original Message: "${feedback.message}"\n\nReply: `;
    setMessage(replyMessage);
    
    setIsReplyEnabled(true);
    setSubmitMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitMsg("");
    
    // Use the replying item ID if available, otherwise use the original itemid
    const submitItemId = replyingToItemId || itemid;
    
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemid: submitItemId, from, to, message }),
    });
    const result = await res.json();
    setLoading(false);
    setSubmitMsg(result.message || "");
    if (result.success) {
      // Reset form after successful submission
      setMessage("");
      setTo("");
      setIsReplyEnabled(false);
      setReplyingToItemId("");
      // Refresh feedback list
      const user = from || to;
      let url = `/api/feedback/list?user=${encodeURIComponent(user)}`;
      if (!showAll && itemid) {
        url += `&itemid=${encodeURIComponent(itemid)}`;
      }
      fetch(url)
        .then(res => res.json())
        .then(data => setFeedbackList(Array.isArray(data) ? data : []));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md bg-gray-50 p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Feedback Reply</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label className="font-semibold">From:</label>
            <input value={from} readOnly className="p-2 border rounded bg-gray-100" title="From" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold">To:</label>
            <input value={to} readOnly className="p-2 border rounded bg-gray-100" title="To" placeholder="To" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold">Message:</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              className="p-2 border rounded min-h-[100px]"
              title="Message"
              placeholder="Enter your feedback here"
            />
          </div>
          <button type="submit" className="bg-blue-700 text-white p-2 rounded hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !isReplyEnabled}>{loading ? "Submitting..." : "Reply Feedback"}</button>
        </form>
        {submitMsg && <p className="mt-4 text-green-600 font-semibold">{submitMsg}</p>}
      </div>
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
    <div className="w-full max-w-2xl mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Feedback History</h3>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded border text-sm font-semibold ${!showAll ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setShowAll(false)}
            disabled={!showAll}
            type="button"
          >
            Current
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm font-semibold ${showAll ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setShowAll(true)}
            disabled={showAll}
            type="button"
          >
            Show All
          </button>
        </div>
      </div>
      {feedbackLoading ? (
        <div className="text-gray-500">Loading feedback...</div>
      ) : feedbackList.length === 0 ? (
        <div className="text-gray-500">No feedback found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-2 py-1 border">From</th>
                <th className="px-2 py-1 border">To</th>
                <th className="px-2 py-1 border">Message</th>
                <th className="px-2 py-1 border">Media Id</th>
                <th className="px-2 py-1 border">Created</th>
                <th className="px-2 py-1 border">Reply</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map(fb => (
                <tr key={fb.id} className="even:bg-gray-50">
                  <td className="px-2 py-1 border">{fb.fromid}</td>
                  <td className="px-2 py-1 border">{fb.toid}</td>
                  <td className="px-2 py-1 border whitespace-pre-line max-w-xs break-words">{fb.message}</td>
                  <td className="px-2 py-1 border">
                    <Link href={`/?itemId=${fb.itemId}`} className="text-blue-700 underline hover:text-blue-900">
                      {fb.itemId}
                    </Link>
                  </td>
                  <td className="px-2 py-1 border">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}</td>
                  <td className="px-2 py-1 border">
                    <button
                      onClick={() => handleReply(fb)}
                      className="text-blue-700 underline hover:text-blue-900 cursor-pointer bg-transparent border-none"
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
}
