import type { UserSelect } from "@/db/schema";

interface UserItemProps {
  user: UserSelect;
}

export function ProfileItem({ user }: UserItemProps) {
  
  return (
    <li className="bg-gray-50 border border-gray-300 rounded relative">
      <div className="p-4">
        <p className="font-semibold mb-1">User ID: {user.userid}</p>
        <p className="text-gray-600 text-sm mb-2">Contact No.:{user.contactno}</p>
        <p className="text-gray-600 text-sm mb-2">Email: {user.email}</p>
        <p className="text-gray-600">Name etc.: {user.hobby}</p>
        <p className="font-semibold mb-1">Balance: {user.points} points</p>
      </div>
    </li>
  );
}
