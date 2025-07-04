"use client";
import { useState } from "react";

interface FilterToggleProps {
  filterType: string;
  filterStatus: string;
  filterFrom: string;
  filterTo: string;
  today: string;
}

export default function FilterToggle({ filterType, filterStatus, filterFrom, filterTo, today }: FilterToggleProps) {
  const [showFilter, setShowFilter] = useState(true);
  return (
    <div className="w-full max-w-xs mb-4">
      <button
        type="button"
        className="mb-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold w-full"
        onClick={() => setShowFilter((v) => !v)}
      >
        {showFilter ? "Hide Filter" : "Show Filter"}
      </button>
      {showFilter && (
        <form method="get" className="flex flex-col gap-2 items-start w-full">
          <label htmlFor="type-filter" className="font-semibold">Filter by Type:</label>
          <select
            id="type-filter"
            name="type"
            defaultValue={filterType || ""}
            className="p-2 border rounded w-full"
          >
            <option value="">All</option>
            <option value="Collect">Collect</option>
            <option value="Pay">Pay</option>
          </select>
          <label htmlFor="status-filter" className="font-semibold mt-2">Status:</label>
          <select
            id="status-filter"
            name="status"
            defaultValue={filterStatus || "active"}
            className="p-2 border rounded w-full"
          >
            <option value="active">Active</option>
            <option value="deleted">Deleted</option>
          </select>
          <label htmlFor="from-date" className="font-semibold mt-2">From (Date):</label>
          <input
            type="date"
            id="from-date"
            name="from"
            defaultValue={filterFrom}
            max={filterTo}
            className="p-2 border rounded w-full"
          />
          <label htmlFor="to-date" className="font-semibold mt-2">To (Date):</label>
          <input
            type="date"
            id="to-date"
            name="to"
            defaultValue={filterTo}
            min={filterFrom}
            max={today}
            className="p-2 border rounded w-full"
          />
          <button type="submit" className="mt-3 px-3 py-1 rounded bg-blue-600 text-white w-full">Apply</button>
        </form>
      )}
    </div>
  );
}
