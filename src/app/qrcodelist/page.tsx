import { db } from "@/db";
import { QrcodeList } from "@/app/components/qrcode-list";
import { qrcodedb } from "@/db/schema";

export default async function QrcodelistPage() {
  const resps = await getQrcode();

  return (
    <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-2xl font-bold text-center">QR Code List</h2>
      {resps.length > 0 ? (
        <ul className="space-y-4">
          {resps.map(resp => (
            <QrcodeList qrdata={resp} key={resp.id} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">No QR code yet.</p>
      )}
    </div>
  );
}

async function getQrcode() {
  return await db.select().from(qrcodedb);
}
