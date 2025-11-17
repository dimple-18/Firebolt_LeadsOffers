// src/lib/authedFetch.js
import { auth } from "@/lib/firebase";

export async function authedFetch(url, options = {}) {
  let idToken = null;

  try {
    // get Firebase ID token if logged in
    idToken = await auth.currentUser?.getIdToken();
  } catch (err) {
    console.error("getIdToken error:", err);
    // we will still call backend, just without token
  }

  const headersFromOptions = options.headers || {};
  const body = options.body;

  // If body is FormData, DO NOT set Content-Type (browser will do it)
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...headersFromOptions,
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
