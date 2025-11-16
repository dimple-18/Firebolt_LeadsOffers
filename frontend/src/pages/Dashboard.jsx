import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { authedFetch } from "@/lib/authedFetch";
import { useAuth } from "@/contexts/AuthContext";

function AdminTestButton() {
  async function handleClick() {
    try {
      const res = await authedFetch("http://localhost:3001/admin/test");
      const data = await res.json();
      console.log("Admin test:", data);
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Admin test failed:", err);
      alert("Admin test failed: " + (err.message || err));
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
    >
      Test Admin API
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // simple admin check – you can later change this to check Firestore role
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

  return (
    <div className="flex">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right content area */}
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />

        <main className="p-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Dashboard</h1>

          <p className="text-slate-600 mb-6">
            Welcome to your dashboard. From here you&apos;ll be able to manage
            your profile and offers.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-slate-800">Profile</h2>
              <p className="text-sm text-slate-600 mt-1">
                View and edit your account details.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-slate-800">My Offers</h2>
              <p className="text-sm text-slate-600 mt-1">
                See offers assigned to you and accept/decline them.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-slate-800">Activity</h2>
              <p className="text-sm text-slate-600 mt-1">
                Coming soon: recent actions and notifications.
              </p>
            </div>
          </div>

          {/* Admin-only tools */}
          {isAdmin && (
            <section className="mt-10 bg-white rounded-xl shadow p-5 border border-purple-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Admin tools
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                This section is only visible to your admin account. Use it to
                quickly test admin-only APIs.
              </p>
              <AdminTestButton />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
