import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { authedFetch } from "@/lib/authedFetch";
import { useAuth } from "@/contexts/AuthContext";

// Small helper card for stats
function StatCard({ label, value, accent = "default" }) {
  const accentClasses =
    accent === "green"
      ? "bg-green-80 text-green-800 border-green-100"
      : accent === "red"
      ? "bg-red-50 text-red-800 border-red-100"
      : accent === "orange"
      ? "bg-orange-50 text-orange-800 border-orange-100"
      : accent === "blue"
      ? "bg-blue-50 text-blue-800 border-blue-100"
      : accent === "purple"
      ? "bg-purple-50 text-purple-800 border-purple-100"
      : "bg-slate-50 text-slate-800 border-slate-100";

  return (
    <div className={`rounded-xl border ${accentClasses} p-4`}>
      <div className="text-xs uppercase tracking-wide font-semibold opacity-80">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
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

        const res = await authedFetch("/admin/summary");
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

  const {
    usersCount,
    offersCount,
    leadsCount,
    acceptedCount,
    declinedCount,
    pendingCount,
  } = stats;

    const acceptanceRate =
    offersCount > 0 ? ((acceptedCount / offersCount) * 100).toFixed(1) : 0;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-6">
      <StatCard label="Total users" value={usersCount} />
      <StatCard label="Total offers" value={offersCount} />
      <StatCard label="Total leads" value={leadsCount} accent="blue" />
      <StatCard label="Accepted" value={acceptedCount} accent="green" />
      <StatCard label="Declined" value={declinedCount} accent="red" />
      <StatCard label="Pending" value={pendingCount} accent="orange" />

      {/* NEW: Acceptance Rate */}
      <StatCard
        label="Acceptance Rate"
        value={`${acceptanceRate}%`}
        accent="purple"
      />
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com"; // frontend check

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
          <header className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                High-level overview of users, leads and offers across Firebolt.
              </p>
            </div>
          </header>

          {/* Overview stats */}
          <AdminSummary />

          {/* Quick admin actions */}
          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Manage users
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                View all registered users, check their roles, and promote or
                demote admins.
              </p>
              <a
                href="/admin/users"
                className="inline-flex items-center mt-4 text-sm font-medium text-slate-900 hover:underline"
              >
                Go to Users &rarr;
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Manage offers
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                See all offers across users, create new offers, or track
                accepted / declined states.
              </p>
              <a
                href="/admin/offers"
                className="inline-flex items-center mt-4 text-sm font-medium text-slate-900 hover:underline"
              >
                Go to Offers &rarr;
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Manage leads
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Create, edit, and track leads in one place for your sales
                pipeline.
              </p>
              <a
                href="/admin/leads"
                className="inline-flex items-center mt-4 text-sm font-medium text-slate-900 hover:underline"
              >
                Go to Leads &rarr;
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
