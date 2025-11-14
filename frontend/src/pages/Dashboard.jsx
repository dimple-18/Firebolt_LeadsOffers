import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { authedFetch } from "@/lib/authedFetch";

export default function Dashboard() {
  // 🔥 TEST BACKEND WITH TOKEN AUTOMATICALLY
  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("http://localhost:3001/uploads");
        const data = await res.json();
        console.log("Backend response:", data);
      } catch (err) {
        console.error("Backend error:", err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="grid place-items-center py-24">
        <div className="bg-white p-10 rounded-2xl shadow w-full max-w-xl text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard (Protected)
          </h1>
          <p className="mt-3 text-slate-600">
            You are logged in. This page is protected by Firebase Auth.
          </p>
        </div>
      </main>
    </div>
  );
}
