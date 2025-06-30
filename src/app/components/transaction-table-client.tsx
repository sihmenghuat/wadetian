"use client";
import { useEffect, useState } from "react";
import { TransactionTable } from "@/app/components/transaction-table";

interface Transaction {
  id: number;
  xid: string;
  transdesc: string;
  transdate: string;
  transamt: number;
}

interface Props {
  userid: string;
  initialPage?: number;
  pageSize?: number;
}

export default function TransactionTableClient({ userid, initialPage = 1, pageSize = 10 }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.ceil(total / pageSize);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(true); // false = Hide by default

  useEffect(() => {
    setLoading(true);
    fetch(`/api/transactions?userid=${userid}&page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.records);
        setTotal(data.total);
        setLoading(false);
      });
  }, [userid, page, pageSize]);

  return (
    <div>
      <div className="flex items-center mb-2 gap-2">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button
          className="text-blue-600 underline text-sm"
          onClick={() => setShowTable(v => !v)}
        >
          {showTable ? "Hide" : "Show"}
        </button>
      </div>
      {showTable && (
        <>
          <TransactionTable
            transactions={transactions}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-2 py-1 border rounded ${page === i + 1 ? 'bg-blue-200' : ''}`}
                disabled={loading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {loading && <div className="text-center text-gray-500">Loading...</div>}
        </>
      )}
    </div>
  );
}
