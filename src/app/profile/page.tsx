import { ResponseItem } from "../components/response-item";

const responses = [
  {
    id: 0,
    name: "",
    email: "",
    message: "",
  },
];

export default function ResponsesPage() {
  return (
    <div className="flex flex-col justify-center items-center border-2 gap-5 rounded-md p-6">
      <h2 className="text-2xl font-bold text-center">Responses</h2>
      {responses.length > 0 ? (
        <ul className="space-y-4">
          {responses.map(response => (
            <ResponseItem response={response} key={response.id} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">No responses yet.</p>
      )}
    </div>
  );
}
