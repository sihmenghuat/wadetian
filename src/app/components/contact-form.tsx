"use client"

import { contactUsAction } from "../actions";
import { useFormState } from "react-dom";

// Reducer wrapper for useFormState
async function contactUsReducer(_prevState: { error: string }, formData: FormData) {
  const result = await contactUsAction(formData);
  if (result && typeof result === "object" && "error" in result) {
    return { error: result.error };
  }
  return { error: "" };
}

// This component is used to create a new account by collecting user information through a form.
export function ContactForm() {
  const [state, formAction] = useFormState(contactUsReducer, { error: "" });

  return (
    <form className="flex items-center flex-col gap-3" action={formAction}>
      <h2 className="text-2xl font-semibold">Create New Account</h2>
      {state.error && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {state.error}
        </div>
      )}
      <input
        type="text"
        placeholder="ID / Phone Number - 7 to 12 Digits"
        name="userid"
        minLength={7} maxLength={12}
        pattern="\d{7,12}"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <input
        type="password"
        placeholder="PIN" required
        name="pin"
        maxLength={4}
        pattern="\d{4}"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <input
        type="password"
        placeholder="Retype PIN"
        name="temppin"
        maxLength={4}
        pattern="\d{4}"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email" maxLength={50}
        name="email"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <textarea
        placeholder="Short Name / Interests" maxLength={100}
        name="hobby"
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
