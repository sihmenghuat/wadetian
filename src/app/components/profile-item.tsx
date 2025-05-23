import type { ResponseSelect } from "@/db/schema";

interface ResponseItemProps {
  response: ResponseSelect;
}

export function ProfileItem({ response }: ResponseItemProps) {
  
  return (
    <li className="bg-gray-50 border border-gray-300 rounded relative">
      <div className="p-4">
        <p className="font-semibold mb-1">User ID: {response.userid}</p>
        <p className="text-gray-600 text-sm mb-2">PIN: {response.pin}</p>
        <p className="text-gray-600 text-sm mb-2">Contact No.:{response.contactno}</p>
        <p className="text-gray-600 text-sm mb-2">Email: {response.email}</p>
        <p className="text-gray-600">Hobby: {response.hobby}</p>
        <p></p>
        <p className="font-semibold mb-1">Galney Points: {response.points}</p>
      </div>
    </li>
  );
}
