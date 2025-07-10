"use client"

import { contactUsAction } from "../actions";
import React from "react";

// Reducer wrapper for useActionState
async function contactUsReducer(_prevState: { error: string }, formData: FormData) {
  const result = await contactUsAction(formData);
  if (result && typeof result === "object" && "error" in result) {
    return { error: result.error };
  }
  return { error: "" };
}

// This component is used to create a new account by collecting user information through a form.
export function ContactForm() {
  const [state, formAction] = React.useActionState(contactUsReducer, { error: "" });
  //const [showKey, setShowKey] = React.useState(false);
  const [showKey, setShowKey] = React.useState(() => false);
  const keyInputRef = React.useRef<HTMLInputElement>(null);

  // Hide Key field after submit (success or error)

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
      <div className="flex items-center w-full mb-2">
        <input
          type="checkbox"
          id="terms"
          required
          className="mr-2"
        />
        <label htmlFor="terms" className="text-sm select-none">
          I agree to the{' '}
          <a
            href="/terms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-700 hover:text-blue-900"
          >
            Terms &amp; Conditions
          </a>
        </label>
      </div>
      {/* Merchant Account Option */}
      <div className="flex flex-col w-full mb-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="merchant"
            name="merchant"
            className="mr-2"
            onChange={e => {
              setShowKey(e.target.checked);
              if (!e.target.checked && keyInputRef.current) {
                keyInputRef.current.value = "";
              }
            }}
          />
          <label htmlFor="merchant" className="text-sm select-none">
            Create as{' '}
            <a
              href="/merchant.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 hover:text-blue-900"
            >
              Merchant Account
            </a>
          </label>
        </div>
        {showKey && (
          <input
            type="text"
            name="Key"
            ref={keyInputRef}
            placeholder="Enter Key"
            className="mt-2 p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
            required={showKey}
          />
        )}
      </div>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
}
