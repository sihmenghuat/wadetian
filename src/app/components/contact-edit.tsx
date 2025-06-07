"use client"

import React from "react";
import { contactEditAction } from "../actions";
import { useActionState } from "react";
import type { UserSelect } from "@/db/schema";

interface UserEditProps {
  user: UserSelect;
}
// This component is used to edit account by collecting user information through a form.
export function ContactEdit({ user }: UserEditProps) {
  const [state, formAction] = useActionState(contactEditAction, { error: "" });
  // Add local state for pin and temppin
  const [pin, setPin] = React.useState("");
  const [temppin, setTemppin] = React.useState("");
  const [pinError, setPinError] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [showTempPin, setShowTempPin] = React.useState(false);
  // Custom submit handler to validate temppin === pin
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (pin !== temppin) {
      e.preventDefault();
      setPinError("PINs do not match");
      return;
    }
    setPinError("");
    // Let the form submit as normal
  };

  return (
    <form className="flex items-center flex-col gap-3" action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="userid" value={user.userid} />
      <h2 className="text-2xl font-semibold">Edit Profile</h2>
      {state.error && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {state.error}
        </div>
      )}
      {pinError && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {pinError}
        </div>
      )}
      <div className="w-full relative">
        <input
          type={showPin ? "text" : "password"}
          placeholder="PIN" required
          name="pin"
          defaultValue={user.pin ? user.pin : pin}
          onChange={e => setPin(e.target.value)}
          maxLength={4}
          pattern="\d{4}"
          className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none pr-16"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-700 underline bg-transparent border-none cursor-pointer"
          onClick={() => setShowPin(v => !v)}
        >
          {showPin ? "Hide" : "Show"}
        </button>
      </div>
      <div className="w-full relative">
        <input
          type={showTempPin ? "text" : "password"}
          placeholder="Retype PIN"
          name="temppin"
          defaultValue={user.pin ? user.pin : pin}
          onChange={e => setTemppin(e.target.value)}
          maxLength={4}
          pattern="\d{4}"
          className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none pr-16"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-700 underline bg-transparent border-none cursor-pointer"
          onClick={() => setShowTempPin(v => !v)}
        >
          {showTempPin ? "Hide" : "Show"}
        </button>
      </div>
      <input
        type="text"
        placeholder="Contact Number" maxLength={50}
        name="contact"
        defaultValue={user.contactno || ""}
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email" maxLength={50}
        name="email"
        defaultValue={user.email || ""}
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <textarea
        placeholder="Short Name / Interests" maxLength={100}
        name="hobby"
        defaultValue={user.hobby || ""}
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      ></textarea>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
}
