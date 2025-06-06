"use client"

import { contactUsAction } from "../actions";
import { useActionState } from "react";
import { useState } from "react";

// This component is used to create a new account by collecting user information through a form.
export function ContactForm() {
  const [state, formAction] = useActionState(contactUsAction, { error: "" });
  const [showPin, setShowPin] = useState(false);
  const [showTempPin, setShowTempPin] = useState(false);
  const [pin, setPin] = useState("");
  const [tempPin, setTempPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
    if (tempPin && e.target.value !== tempPin) {
      setPinError("PINs do not match");
    } else {
      setPinError("");
    }
  };

  const handleTempPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPin(e.target.value);
    if (pin && e.target.value !== pin) {
      setPinError("PINs do not match");
    } else {
      setPinError("");
    }
  };

  return (
    <form className="flex items-center flex-col gap-3" action={formAction}>
      <h2 className="text-2xl font-semibold">Create New Account</h2>
      {state.error && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {state.error}
        </div>
      )}
      <input
        type="number"
        placeholder="ID / Phone Number" required  min={1000000} max={999999999999}
        name="userid"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <div className="relative w-full flex items-center">
        <input
          type={showPin ? "text" : "password"}
          placeholder="PIN - 4 Digits"
          name="pin"
          value={pin}
          onChange={handlePinChange}
          maxLength={4}
          pattern="\d{4}"
          className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none pr-16"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 text-sm text-blue-700 underline bg-transparent"
          onClick={() => setShowPin((v) => !v)}
        >
          {showPin ? "Hide" : "Show"}
        </button>
      </div>
      <div className="relative w-full flex items-center">
        <input
          type={showTempPin ? "text" : "password"}
          placeholder="Retype PIN"
          name="temppin"
          value={tempPin}
          onChange={handleTempPinChange}
          maxLength={4}
          pattern="\d{4}"
          className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none pr-16"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 text-sm text-blue-700 underline bg-transparent"
          onClick={() => setShowTempPin((v) => !v)}
        >
          {showTempPin ? "Hide" : "Show"}
        </button>
      </div>
      {pinError && (
        <div className="w-full text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mb-2">
          {pinError}
        </div>
      )}
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
      <div className="flex items-center w-full gap-2">
        <input id="terms" name="terms" type="checkbox" required className="accent-blue-800" />
        <label htmlFor="terms" className="text-sm select-none">
          I agree to the{' '}
          <a href="/terms.txt" target="_blank" rel="noopener noreferrer" className="underline text-blue-800 hover:text-blue-600">Terms and Conditions</a>
        </label>
      </div>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
        disabled={!!pinError}
      >
        Submit
      </button>
    </form>
  );
}
