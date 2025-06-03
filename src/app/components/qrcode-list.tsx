import type { QrcodeSelect } from "@/db/schema";
import { removeQrcode } from "../actions";

interface QrcodelistProps {
  qrdata: QrcodeSelect;
}

export function QrcodeList({ qrdata }: QrcodelistProps) {
  const removeQrcodeWithId = removeQrcode.bind(null, qrdata.id)

  return (
    <li className="bg-gray-50 border border-gray-300 rounded relative">
      <div className="p-4">
        <p className="font-semibold mb-1">{qrdata.userid}</p>
        <p className="text-gray-600 text-sm mb-2">{qrdata.points}</p>
        <p className="text-gray-600 text-sm mb-2">{qrdata.paytype}</p>
        <p className="text-gray-600 text-sm mb-2">{qrdata.jsondata}</p>
        <p className="text-gray-800">{qrdata.reference}</p>
      </div>
      <form action={removeQrcodeWithId}>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 font-bold"
        aria-label="Remove response"
      >
        &#x2715;
      </button>
      </form>
    </li>
  );
}
