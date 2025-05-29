"use client";

import { useParams } from "next/navigation";

// Custom hook to get the user ID from route params
export function usePassUserid(): string {
  const params = useParams<{ uid: string }>();
  const uid = params.uid || ""; // Fallback to empty string if uid is not available
  console.log("UID from params:", params.uid);
  return uid;
}
