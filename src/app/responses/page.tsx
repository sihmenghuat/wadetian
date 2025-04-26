import { ResponseItem } from "../components/response-item";
import Link from "next/link";

const responses = [
  {
    id: 1,
    name: "John",
    email: "john@example.com",
    message: "Why do we fall? So we can learn to pick ourselves up.",
  },
  {
    id: 2,
    name: "Mark",
    email: "mark@example.com",
    message:
      "How can you move faster than possible, fight longer than possible without the most powerful impulse of the spirit: the fear of death?",
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
      <Link
        className="text-center underline font-semibold text-lg"
        href="/profile"
      >
        View Profile
      </Link>
    </div>
  );
}
