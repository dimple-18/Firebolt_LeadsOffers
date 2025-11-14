import { useAuth } from "@/contexts/AuthContext";
import Topbar from "@/components/Topbar";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          My Profile
        </h1>

        <div className="bg-white shadow rounded-xl p-8 space-y-6">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full mt-1 p-3 border rounded-lg bg-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Display Name</label>
            <input
              type="text"
              placeholder="Enter name..."
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </div>

          <button className="bg-black text-white px-6 py-3 rounded-lg">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
