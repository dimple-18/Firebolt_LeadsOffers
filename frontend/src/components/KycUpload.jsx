// src/components/KycUpload.jsx
import { useState } from "react";
import { authedFetch } from "@/lib/authedFetch";

export default function KycUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  function handleFileChange(e) {
    const selected = e.target.files?.[0];

    setMessage("");
    setUploadedUrl("");
    setFile(selected || null);

    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading…");
      setUploadedUrl("");

      // Build multipart/form-data
      const formData = new FormData();
      // "file" must match backend: upload.single("file")
      formData.append("file", file);

      const res = await authedFetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // If Cloudinary is configured, backend returns data.cloudinary.url
      if (data.cloudinary && data.cloudinary.url) {
        setUploadedUrl(data.cloudinary.url);
        setMessage("Upload successful! (stored on Cloudinary)");
      } else {
        setUploadedUrl("");
        setMessage(
          "Upload handled by backend. (No Cloudinary URL returned – maybe CLOUDINARY_URL not set.)"
        );
      }

      console.log("Upload response:", data);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">
        KYC / Brand Logo
      </h2>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 max-w-xl">
        <p className="text-sm text-slate-600 mb-4">
          Upload a logo or KYC document image. It will be sent securely to the
          backend and stored in Cloudinary (if configured).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Choose image file
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-slate-900 file:text-white
                         hover:file:bg-slate-800"
            />
          </div>

          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">Preview (local):</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="h-32 rounded-md border border-slate-200 object-contain bg-slate-50"
              />
            </div>
          )}

          {uploadedUrl && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-1">
                Uploaded URL (from backend):
              </p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          )}

          {message && (
            <p className="text-sm mt-1 text-slate-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 rounded-md
                       bg-slate-900 text-white text-sm font-medium
                       hover:bg-slate-800 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </form>
      </div>
    </section>
  );
}
