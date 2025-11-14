import { useAuth } from "@/contexts/AuthContext";

export default function AuthStatus() {
  const { user } = useAuth();
  return (
    <div className="fixed top-2 right-2 z-50 rounded bg-slate-900 text-white text-xs px-3 py-1 shadow">
      {user ? `signed in: ${user.email || user.uid}` : "signed out"}
    </div>
  );
}
