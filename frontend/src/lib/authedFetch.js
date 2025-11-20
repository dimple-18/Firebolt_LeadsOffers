// src/lib/authedFetch.js
import { auth } from "@/lib/firebase";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

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
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...headersFromOptions,
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  // 👇 IMPORTANT: route relative URLs to backend (3001)
  const finalUrl = url.startsWith("http")
    ? url
    : `${API_BASE}${url}`;

  return fetch(finalUrl, {
    ...options,
    headers,
  });
}
