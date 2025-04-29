import { db } from "@/db";
import { ResponseItem } from "../components/response-item";
import { responses } from "@/db/schema";

export default async function ResponsesPage() {
  const resps = await getResponses();

  return (
    <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-2xl font-bold text-center">Responses</h2>
      {resps.length > 0 ? (
        <ul className="space-y-4">
          {resps.map(resp => (
            <ResponseItem response={resp} key={resp.id} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">No responses yet.</p>
      )}
    </div>
  );
}

async function getResponses() {
  return await db.select().from(responses);
}