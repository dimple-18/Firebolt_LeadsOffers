import { auth } from "@/lib/firebase";

export async function authedFetch(url, options = {}) {
  let idToken = null;

  try {
    idToken = await auth.currentUser?.getIdToken();
  } catch (err) {
    console.error("getIdToken error:", err);
    // we'll still call the backend, just without token
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      "Content-Type": "application/json",
    },
  });
}
