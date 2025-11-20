// frontend/src/pages/Leads.jsx
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/authedFetch";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchLeads() {
      setLoading(true);
      setError("");

      try {
        const res = await authedFetch("/admin/leads");
        const body = await res.json();

        if (!res.ok) {
          throw new Error(body.error || `Request failed (${res.status})`);
        }

        if (!active) return;
        setLeads(body.leads || []);
      } catch (err) {
        console.error("Failed to load leads:", err);
        if (active) setError(err.message || "Failed to load leads");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLeads();
    return () => {
      active = false;
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "—";

    if (value._seconds) {
      return new Date(value._seconds * 1000).toLocaleString();
    }

    return new Date(value).toLocaleString();
  };

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
        <p className="text-gray-500">No leads found.</p>
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
                    {formatDate(lead.createdAt)}
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
