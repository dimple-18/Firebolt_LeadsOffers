import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function Profile() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />
        <main className="p-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Profile
          </h1>
          <p className="text-slate-600">
            Here we will show and edit your profile details.
          </p>
        </main>
      </div>
    </div>
  );
}
