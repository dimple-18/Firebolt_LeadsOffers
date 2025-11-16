import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

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
            Here we&apos;ll show a table of all users with their roles and
            details.
          </p>

          <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
            <p className="text-sm text-slate-500">
              Coming soon: users table (name, email, role, createdAt).
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
