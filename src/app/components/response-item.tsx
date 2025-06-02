import type { UserSelect } from "@/db/schema";
import { removeUser } from "../actions";

interface UserItemProps {
  user: UserSelect;
}

export function ResponseItem({ user }: UserItemProps) {
  const removeResponseWithId = removeUser.bind(null, user.id)

  return (
    <li className="bg-gray-50 border border-gray-300 rounded relative">
      <div className="p-4">
        <p className="font-semibold mb-1">{user.userid}</p>
        <p className="text-gray-600 text-sm mb-2">{user.pin}</p>
        <p className="text-gray-600 text-sm mb-2">{user.contactno}</p>
        <p className="text-gray-600 text-sm mb-2">{user.email}</p>
        <p className="text-gray-800">{user.hobby}</p>
      </div>
      <form action={removeResponseWithId}>
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
