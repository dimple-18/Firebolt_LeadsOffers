// admin-tool/src/pages/Leads.jsx
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/authedFetch"; // same helper you use elsewhere

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      setLoading(true);
      setError("");

      try {
        const res = await authedFetch("/admin/leads"); // calls backend
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }

        const body = await res.json();
        if (!isMounted) return;

        setLeads(body.leads || []);
      } catch (err) {
        console.error("Failed to load leads:", err);
        if (isMounted) setError(err.message || "Failed to load leads");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Leads</h1>

      {loading && <p className="text-gray-500">Loading leads…</p>}
      {error && (
        <p className="text-red-600 mb-4">
          Error loading leads: {error}
        </p>
      )}

      {!loading && !error && leads.length === 0 && (
        <p className="text-gray-500">No leads found yet.</p>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-4 py-2">
                    {lead.name || lead.fullName || "—"}
                  </td>
                  <td className="px-4 py-2">{lead.email || "—"}</td>
                  <td className="px-4 py-2">{lead.source || "—"}</td>
                  <td className="px-4 py-2">
                    {(lead.status || "new").toString()}
                  </td>
                  <td className="px-4 py-2">
                    {lead.createdAt
                      ? new Date(lead.createdAt._seconds
                          ? lead.createdAt._seconds * 1000
                          : lead.createdAt
                        ).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
