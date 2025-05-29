
import { logout } from "../actions";

export function LogoutForm() {
  return (
    <form className="flex items-center flex-col gap-3" action={logout}>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Logout
      </button>
    </form>
  );
}
