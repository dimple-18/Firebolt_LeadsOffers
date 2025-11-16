import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/authedFetch";

export default function AdminOffers() {
  const { user } = useAuth();
  const isAdmin = user?.email === "kumari18dimple@gmail.com";

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-2">Admin access only</h1>
          <p className="text-slate-600 text-sm">
            You are logged in, but not an admin.
          </p>
        </div>
      </div>
    );
  }

  // Helper to format dates
  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  }

  // Load offers + users on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setOffersLoading(true);
        setOffersError("");
        setUsersLoading(true);
        setUsersError("");

        // Load offers
        const offersRes = await authedFetch(
          "http://localhost:3001/admin/offers"
        );
        const offersData = await offersRes.json();

        if (!cancelled) {
          if (!offersData.ok)
            setOffersError(offersData.error || "Failed to load offers");
          else setOffers(offersData.offers || []);
        }

        // Load users for dropdown
        const usersRes = await authedFetch(
          "http://localhost:3001/admin/users"
        );
        const usersData = await usersRes.json();

        if (!cancelled) {
          if (!usersData.ok)
            setUsersError(usersData.error || "Failed to load users");
          else setUsers(usersData.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setOffersError(err.message || "Failed to load offers");
          setUsersError(err.message || "Failed to load users");
        }
      } finally {
        if (!cancelled) {
          setOffersLoading(false);
          setUsersLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadOffers() {
    try {
      setOffersLoading(true);
      setOffersError("");

      const res = await authedFetch("http://localhost:3001/admin/offers");
      const data = await res.json();

      if (!data.ok) {
        setOffersError(data.error || "Failed to load offers");
      } else {
        setOffers(data.offers || []);
      }
    } catch (err) {
      setOffersError(err.message || "Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  }

  async function handleCreateOffer(e) {
    e.preventDefault();
    setCreateError("");

    if (!selectedUserId || !title.trim()) {
      setCreateError("Please select a user and enter a title.");
      return;
    }

    try {
      setCreating(true);

      const res = await authedFetch("http://localhost:3001/admin/offers", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedUserId,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create offer");
      }

      // Refresh offers list
      await reloadOffers();

      // Reset and close modal
      setSelectedUserId("");
      setTitle("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      setCreateError(err.message || "Failed to create offer");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-slate-50">
        <Topbar />
        <main className="p-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin – All Offers
              </h1>
              <p className="text-slate-600">
                View all offers and create new ones for users.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              disabled={usersLoading || !!usersError}
            >
              + Create Offer
            </button>
          </div>

          {(offersLoading || usersLoading) && (
            <p className="text-sm text-slate-500 mb-2">Loading data…</p>
          )}

          {(offersError || usersError) && (
            <p className="text-sm text-red-600 mb-4">
              {offersError || usersError}
            </p>
          )}

          {!offersLoading && !offersError && offers.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">No offers found.</p>
          )}

          {!offersLoading && offers.length > 0 && (
            <div className="bg-white shadow rounded-xl border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">{o.userId}</td>
                      <td className="px-4 py-2 text-slate-900">{o.title}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            o.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : o.status === "declined"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {formatDate(o.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CREATE OFFER MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Create New Offer
                </h2>

                <form onSubmit={handleCreateOffer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assign to user
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={usersLoading || usersError}
                    >
                      <option value="">Select user…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.displayName || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Title
                    </label>
                    <input
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Offer title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description of this offer"
                    />
                  </div>

                  {createError && (
                    <p className="text-sm text-red-600">{createError}</p>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        if (!creating) {
                          setShowModal(false);
                          setCreateError("");
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {creating ? "Creating…" : "Create Offer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
