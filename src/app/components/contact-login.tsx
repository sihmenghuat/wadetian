"use client";

import React from "react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [pin, setPin] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  return (
    <form className="flex items-center flex-col gap-3" action={loginAction}>
      <h2 className="text-2xl font-semibold">Login Page</h2>
      <input
        type="number"
        placeholder="ID / Phone Number" required min={1000000} maxLength={999999999999}
        name="userid"
        className="p-2.5 text-lg w-full rounded-md focus:ring-2 focus:ring-blue-300 bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
      />
      <div className="w-full relative">
        <input
          type={showPin ? "text" : "password"}
          placeholder="PIN" required min={1000} max={9999}
          name="pin"
          value={pin}
          onChange={e => setPin(e.target.value)}
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
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Login
      </button>
    </form>
  );
}
