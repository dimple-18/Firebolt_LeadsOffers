import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/authedFetch";

export default function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    async function handleChangeRole(userId, nextRole) {
    if (!window.confirm(`Change this user's role to "${nextRole}"?`)) return;

    try {
      const res = await authedFetch(
        `/admin/users/${userId}/role`,
        {
          method: "POST",
          body: JSON.stringify({ role: nextRole }),
        }
      );

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: data.role, updatedAt: new Date().toISOString() } : u
        )
      );
    } catch (err) {
      alert("Could not update role: " + (err.message || err));
    }
  }


  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Admin access only
          </h1>
          <p className="text-slate-600 text-sm">
            You&apos;re logged in, but this page is restricted to admin
            accounts.
          </p>
        </div>
      </div>
    );
  }

  // Load users on mount
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const res = await authedFetch("/admin/users");
        const data = await res.json();

        if (cancelled) return;

        if (!data.ok) {
          setError(data.error || "Failed to load users");
        } else {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load users");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  function formatDate(isoString) {
    if (!isoString) return "-";
    // quick human readable format
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />
        <main className="p-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin – Users
          </h1>
          <p className="text-slate-600 mb-6">
            List of all users stored in the Firebolt platform.
          </p>

          {loading && (
            <p className="text-sm text-slate-500 mb-4">Loading users…</p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">
              No users found in Firestore &quot;users&quot; collection.
            </p>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-x-auto">
              <table className="min-w-full text-sm">
  <thead>
    <tr className="bg-slate-50 border-b border-slate-200">
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Name
      </th>
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Email
      </th>
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Role
      </th>
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Created
      </th>
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Updated
      </th>
      <th className="text-left px-4 py-2 font-semibold text-slate-700">
        Actions
      </th>
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr
        key={u.id}
        className="border-t border-slate-100 hover:bg-slate-50"
      >
        <td className="px-4 py-2 text-slate-900">
          {u.displayName || "-"}
        </td>
        <td className="px-4 py-2 text-slate-700">{u.email}</td>
        <td className="px-4 py-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              u.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {u.role}
          </span>
        </td>
        <td className="px-4 py-2 text-slate-500">
          {formatDate(u.createdAt)}
        </td>
        <td className="px-4 py-2 text-slate-500">
          {formatDate(u.updatedAt)}
        </td>
        <td className="px-4 py-2 text-slate-500">
          {u.role === "admin" ? (
            <button
              onClick={() => handleChangeRole(u.id, "user")}
              className="text-xs px-3 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Remove admin
            </button>
          ) : (
            <button
              onClick={() => handleChangeRole(u.id, "admin")}
              className="text-xs px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700"
            >
              Make admin
            </button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
