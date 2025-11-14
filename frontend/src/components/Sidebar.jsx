import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "My Offers", path: "/offers" }
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">Firebolt</h2>

      <nav className="flex flex-col gap-4">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `p-2 rounded-md text-lg ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded-md mt-6 hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
