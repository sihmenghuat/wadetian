import React from "react";

interface Transaction {
  id: number;
  xid: string;
  transdesc: string;
  transdate: string;
  transamt: number;
}

interface Props {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TransactionTable({ transactions, total, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="w-full">
      {/*<h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>*/}
      <table className="min-w-full border text-sm mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Reference</th>
            <th className="border px-2 py-1">Points</th>
            <th className="border px-2 py-1">XID</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-2">No transactions found.</td></tr>
          ) : (
            transactions.map(tx => (
              <tr key={tx.id}>
                <td className="border px-2 py-1">{new Date(tx.transdate).toLocaleString()}</td>
                <td className="border px-2 py-1">{tx.transdesc}</td>
                <td className="border px-2 py-1 text-right">{tx.transamt}</td>
                <td className="border px-2 py-1">{tx.xid}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages || totalPages === 0} onClick={() => onPageChange(page + 1)} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
