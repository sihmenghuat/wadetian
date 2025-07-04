import type { QrcodeSelect } from "@/db/schema";
import { removeQrcode } from "../actions";

interface QrcodelistProps {
  qrdata: QrcodeSelect;
}

export function QrcodeList({ qrdata }: QrcodelistProps) {
  const removeQrcodeWithId = removeQrcode.bind(null, qrdata.id)

  return (
    <thead className="relative">
      <tr className="text-center">
        <td className="border px-2 py-1">{qrdata.userid}</td>
        <td className="border px-2 py-1">{qrdata.hashid}</td>
        <td className="border px-2 py-1">{qrdata.points}</td>
        <td className="border px-2 py-1">{qrdata.reference}</td>
        <td className="border px-2 py-1">{qrdata.paytype}</td>
        <td className="border px-2 py-1">
          {qrdata.createdAt
            ? new Date(
                typeof qrdata.createdAt === 'string'
                  ? qrdata.createdAt + 'Z'
                  : qrdata.createdAt
              ).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
            : '-'}
        </td>
        <td className="border px-2 py-1">{qrdata.status ?? '-'}</td>
        <td className="border px-2 py-1">{qrdata.redeemCnt}</td>
      </tr>
      <form action={removeQrcodeWithId}>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 font-bold"
        aria-label="Remove response"
      >
        &#x2715;
      </button>
      </form>
    </thead>
  );
}
