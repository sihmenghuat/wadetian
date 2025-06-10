import { logout } from "../actions";

export function LogoutForm({ userid }: { userid: string }) {
    const logoutWithId = logout.bind(null, userid)
  return (
    <form className="flex items-center flex-col gap-3" action={logoutWithId}>
      <button
        type="submit"
        className="text-lg w-full bg-blue-800 text-white rounded-md px-2.5 py-1 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-300 focus:outline-none"
      >
        Logout
      </button>
    </form>
  );
}
