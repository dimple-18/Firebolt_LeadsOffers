import { useAuth } from "@/contexts/AuthContext";
import Topbar from "@/components/Topbar";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import KycUpload from "@/components/KycUpload";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Load profile data from Firestore on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [user]);

  // const handleSave = async () => {
  //   if (!user) return;
  //   setSaving(true);
  //   try {
  //     const ref = doc(db, "users", user.uid);
  //     await updateDoc(ref, { displayName });


  //     alert("Profile updated!");
  //   } catch (err) {
  //     console.error("Failed to update profile:", err);
  //     alert("Could not update profile, please try again.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
  if (!user) return;

  setSaving(true);
  console.log("[Profile] Saving displayName =", displayName);

  try {
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { displayName });
    console.log("[Profile] Firestore updated OK");
    alert("Profile updated!");
  } catch (err) {
    console.error("[Profile] Failed to update profile:", err);
    // Show a readable message
    alert(err.message || "Could not update profile, please try again.");
  } finally {
    // ✅ this ALWAYS runs, success or error
    setSaving(false);
  }
};


  if (!user) {
    return <div className="p-8">You must be logged in to view this page.</div>;
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Topbar />
        <main className="max-w-3xl mx-auto py-16 px-4">
          <p className="text-slate-600">Loading profile…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          My Profile
        </h1>

        <div className="bg-white shadow rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full mt-1 p-3 border rounded-lg bg-slate-100 text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Enter your name"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
         <KycUpload />
      </main>
    </div>
  );
}
