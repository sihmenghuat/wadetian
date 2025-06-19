"use client"

import React from "react";
import { contactEditAction } from "../actions";
import { useFormState } from "react-dom";
import type { UserSelect } from "@/db/schema";

interface UserEditProps {
  user: UserSelect;
}
// This component is used to edit account by collecting user information through a form.
export function ContactEdit({ user }: UserEditProps) {
  // Reducer wrapper for useFormState
  async function contactEditReducer(_prevState: { error: string }, formData: FormData) {
    const result = await contactEditAction(formData);
    if (result && typeof result === "object" && "error" in result) {
      return { error: result.error };
    }
    return { error: "" };
  }

  const [state, formAction] = useFormState(contactEditReducer, { error: "" });

  return (
    <form className="flex items-center flex-col gap-3" action={formAction}>
      <input type="hidden" name="userid" value={user.userid} />
      <h2 className="text-2xl font-semibold">Edit Profile</h2>
      {state.error && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {state.error}
        </div>
      )}
      <input
        type="password"
        placeholder="PIN" required
        name="pin"
        defaultValue={user.pin || ""}
        maxLength={4}
        pattern="\d{4}"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <input
        type="password"
        placeholder="Retype PIN"
        name="temppin"
        defaultValue={user.pin || ""}
        maxLength={4}
        pattern="\d{4}"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
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
