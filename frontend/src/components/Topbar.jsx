import { useAuth } from "@/contexts/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b">
      <div className="font-semibold">Firebolt</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{user?.email}</span>
        <button onClick={logout} className="rounded bg-slate-900 text-white text-sm px-3 py-1">
          Logout
        </button>
      </div>
    </header>
  );
}
