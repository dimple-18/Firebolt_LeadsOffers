import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { authedFetch } from "@/lib/authedFetch";

// Helper to format Firestore Timestamp or ISO string
function formatDate(createdAt) {
  if (!createdAt) return "";
  // If it’s a Firestore Timestamp object from backend
  if (createdAt.seconds) {
    return new Date(createdAt.seconds * 1000).toLocaleDateString();
  }
  // Fallback if backend ever sends an ISO string
  return new Date(createdAt).toLocaleDateString();
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  // Load offers on mount
  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        setLoading(true);
        setError("");

        const res = await authedFetch("http://localhost:3001/offers");
        const data = await res.json();

        if (cancelled) return;

        if (!data.ok) {
          setError(data.error || "Failed to load offers");
        } else {
          setOffers(data.offers || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load offers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOffers();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpdateStatus(id, action) {
    try {
      setActionId(id);
      setError("");

      const res = await authedFetch(
        `http://localhost:3001/offers/${id}/${action}`,
        { method: "POST" }
      );

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to update offer");
      }

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id ? { ...offer, status: data.status } : offer
        )
      );
    } catch (err) {
      alert("Could not update offer: " + (err.message || err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="px-8 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Offers
          </h1>
          <p className="text-slate-600 mb-6">
            View the offers assigned to you and accept or decline them.
          </p>

          {loading && <p className="text-slate-500">Loading offers…</p>}

          {!loading && error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {!loading && !error && offers.length === 0 && (
            <p className="text-slate-500">No offers assigned yet.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {offer.title || "Untitled offer"}
                  </h2>

                  {offer.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {offer.description}
                    </p>
                  )}

                  {/* Created date */}
                  <div className="mt-3 text-xs text-slate-500">
                    {offer.createdAt && (
                      <>Created: {formatDate(offer.createdAt)}</>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-1 text-xs text-slate-500">
                    Status:{" "}
                    <span
                      className={
                        offer.status === "accepted"
                          ? "text-green-600 font-semibold"
                          : offer.status === "declined"
                          ? "text-red-600 font-semibold"
                          : "text-orange-600 font-semibold"
                      }
                    >
                      {offer.status || "pending"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    disabled={
                      actionId === offer.id || offer.status === "accepted"
                    }
                    onClick={() => handleUpdateStatus(offer.id, "accept")}
                    className="flex-1 py-2 rounded-md text-sm font-medium
                      bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionId === offer.id ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    disabled={
                      actionId === offer.id || offer.status === "declined"
                    }
                    onClick={() => handleUpdateStatus(offer.id, "decline")}
                    className="flex-1 py-2 rounded-md text-sm font-medium
                      bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionId === offer.id ? "Updating…" : "Decline"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
