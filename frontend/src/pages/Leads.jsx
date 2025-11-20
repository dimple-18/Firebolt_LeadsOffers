import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/authedFetch";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "lost"];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // load leads list
  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    setError("");

    try {
      const res = await authedFetch("/admin/leads");
      const contentType = res.headers.get("content-type") || "";
      let body;

      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got: ${text.slice(0, 80)}`
        );
      }

      if (!res.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      setLeads(body.leads || []);
    } catch (err) {
      console.error("Failed to load leads:", err);
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setSource("");
    setStatus("new");
    setNotes("");
  }

  function startEdit(lead) {
    setEditingId(lead.id);
    setName(lead.name || "");
    setEmail(lead.email || "");
    setSource(lead.source || "");
    setStatus(lead.status || "new");
    setNotes(lead.notes || "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        email,
        source,
        status,
        notes,
      };

      const url = editingId
        ? `/admin/leads/${editingId}`
        : "/admin/leads";

      const method = editingId ? "PUT" : "POST";

      const res = await authedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let body = null;
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Expected JSON but got: ${text.slice(0, 80)}`);
      }

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      resetForm();
      await loadLeads();
    } catch (err) {
      console.error("Save lead failed:", err);
      setError(err.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this lead?")) return;

    setError("");

    try {
      const res = await authedFetch(`/admin/leads/${id}`, {
        method: "DELETE",
      });

      const contentType = res.headers.get("content-type") || "";
      let body = null;
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Expected JSON but got: ${text.slice(0, 80)}`);
      }

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      // reload list
      await loadLeads();
    } catch (err) {
      console.error("Delete lead failed:", err);
      setError(err.message || "Failed to delete lead");
    }
  }

  const formatDate = (value) => {
    if (!value) return "—";

    if (value._seconds) {
      return new Date(value._seconds * 1000).toLocaleString();
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Leads</h1>

      {/* error message */}
      {error && (
        <p className="text-red-600">
          Error: {error}
        </p>
      )}

      {/* create / edit form */}
      <form
        onSubmit={handleSubmit}
        className="border rounded-lg p-4 space-y-3 max-w-xl bg-white"
      >
        <h2 className="text-lg font-medium mb-1">
          {editingId ? "Edit Lead" : "Create New Lead"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lead name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Source
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="website, manual, referral..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="extra info about this lead..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
          >
            {saving
              ? editingId
                ? "Saving..."
                : "Creating..."
              : editingId
              ? "Save changes"
              : "Create lead"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-600 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {/* leads table */}
      {loading ? (
        <p className="text-gray-500">Loading leads…</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-500">No leads found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-4 py-2">
                    {lead.name || "—"}
                  </td>
                  <td className="px-4 py-2">{lead.email || "—"}</td>
                  <td className="px-4 py-2">{lead.source || "—"}</td>
                  <td className="px-4 py-2">
                    {(lead.status || "new").toString()}
                  </td>
                  <td className="px-4 py-2">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => startEdit(lead)}
                      className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                    >
                      Delete
                    </button>
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
