interface ResponseItemProps {
  response: {
    name: string;
    email: string;
    message: string;
  };
}

export function ResponseItem({ response }: ResponseItemProps) {
  return (
    <li className="bg-gray-50 border border-gray-300 rounded relative">
      <div className="p-4">
        <p className="font-semibold mb-1">{response.name}</p>
        <p className="text-gray-600 text-sm mb-2">{response.email}</p>
        <p className="text-gray-800">{response.message}</p>
      </div>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 font-bold"
        aria-label="Remove response"
      >
        &#x2715;
      </button>
    </li>
  );
}
