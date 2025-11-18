import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { authedFetch } from "@/lib/authedFetch";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await authedFetch("http://localhost:3001/admin/leads");
        const data = await res.json();

        if (!data.ok) throw new Error(data.error);
        setLeads(data.leads || []);
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />

        <main className="p-10">
          <h1 className="text-2xl font-bold mb-6">All Leads</h1>

          {loading && <p>Loading leads…</p>}

          {!loading && leads.length === 0 && (
            <p className="text-slate-500">No leads found.</p>
          )}

          {!loading && leads.length > 0 && (
            <table className="w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="p-3">{lead.id}</td>
                    <td className="p-3">{lead.name || "-"}</td>
                    <td className="p-3">{lead.email || "-"}</td>
                    <td className="p-3">
                      {lead.createdAt
                        ? new Date(
                            lead.createdAt.seconds * 1000
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}
