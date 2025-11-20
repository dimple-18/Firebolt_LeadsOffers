import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  // Simple admin check – same as Dashboard/Admin page
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

  const mainMenu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "My Offers", path: "/offers" },
  ];

  const adminMenu = [
    { name: "Admin Home", path: "/admin" },
    { name: "Admin Users", path: "/admin/users" },
    { name: "Admin Offers", path: "/admin/offers" },
    { name: "Admin Leads", path: "/admin/leads" }
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">Firebolt</h2>

      {/* Main user menu */}
      <nav className="flex flex-col gap-3">
        {mainMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block p-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Admin-only menu */}
      {isAdmin && (
        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Admin
          </div>
          <nav className="flex flex-col gap-2">
            {adminMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded-md mt-6 text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
