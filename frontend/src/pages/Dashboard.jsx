import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function Dashboard() {
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
            Welcome to your dashboard. From here you&apos;ll be able to manage your profile and offers.
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
        </main>
      </div>
    </div>
  );
}
