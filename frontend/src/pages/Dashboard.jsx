import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { authedFetch } from "@/lib/authedFetch";
import { useAuth } from "@/contexts/AuthContext";

// Small helper card for stats
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

// Admin-only summary area
function AdminSummary() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await authedFetch("http://localhost:3001/admin/summary");
        const data = await res.json();

        if (cancelled) return;

        if (!data.ok) {
          setError(data.error || "Failed to load admin stats");
        } else {
          setStats(data.stats);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load admin stats");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500 mt-2">Loading admin stats…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 mt-2">{error}</p>;
  }

  if (!stats) return null;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-4">
      <StatCard label="Total users" value={stats.usersCount} />
      <StatCard label="Total offers" value={stats.offersCount} />
      <StatCard label="Accepted" value={stats.acceptedCount} />
      <StatCard label="Pending / other" value={stats.pendingCount} />
    </div>
  );
}

// Already-working test button
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
      className="px-4 py-2 bg-purple-600 text-white rounded-lg mt-4 text-sm"
    >
      Test Admin API
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

  return (
    <div className="flex">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right content area */}
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />

        <main className="p-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Dashboard
          </h1>

          <p className="text-slate-600 mb-6">
            Welcome to your dashboard. From here you&apos;ll be able to manage
            your profile and offers.
          </p>

          {/* Normal user cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
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

          {/* Admin-only section */}
          {isAdmin && (
            <section className="bg-slate-900/5 border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Admin tools
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                This section is only visible to your admin account. Use it to
                quickly see platform stats and test admin APIs.
              </p>

              {/* summary cards */}
              <AdminSummary />

              {/* test button */}
              <AdminTestButton />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
