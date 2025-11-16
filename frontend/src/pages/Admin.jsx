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
    return <p className="text-sm text-slate-500 mt-4">Loading admin stats…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 mt-4">{error}</p>;
  }

  if (!stats) return null;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <StatCard label="Total users" value={stats.usersCount} />
      <StatCard label="Total offers" value={stats.offersCount} />
      <StatCard label="Accepted" value={stats.acceptedCount} />
      <StatCard label="Pending / other" value={stats.pendingCount} />
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com"; // 👈 admin check

  if (!isAdmin) {
    // User is logged in (ProtectedRoute) but not admin
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
      {/* Left sidebar */}
      <Sidebar />

      {/* Right content */}
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />

        <main className="p-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2 mb-6">
            Overview of users and offers across the platform.
          </p>

          {/* Overview stats */}
          <AdminSummary />

          {/* Placeholder for future sections */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Coming next
            </h2>
            <p className="text-sm text-slate-600">
              Here we&apos;ll add admin-only tools like:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
              <li>Users list & roles</li>
              <li>All offers table</li>
              <li>Create & assign offers</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
