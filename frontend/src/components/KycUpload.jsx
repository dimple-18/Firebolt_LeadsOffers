// src/components/KycUpload.jsx
import { useState } from "react";

export default function KycUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");

  function handleFileChange(e) {
    const selected = e.target.files?.[0];

    setMessage("");
    setFile(selected || null);

    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    // Step 1: just a placeholder – no real upload yet.
    console.log("Ready to upload file:", file);
    setMessage(`Ready to upload: ${file.name} (${Math.round(file.size / 1024)} KB)`);
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">
        KYC / Brand Logo
      </h2>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 max-w-xl">
        <p className="text-sm text-slate-600 mb-4">
          Upload a logo or KYC document image. In the next step, this will be
          sent securely to the backend & Cloudinary.
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
              <p className="text-xs text-slate-500 mb-1">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="h-32 rounded-md border border-slate-200 object-contain bg-slate-50"
              />
            </div>
          )}

          {message && (
            <p className="text-sm mt-1 text-slate-700">{message}</p>
          )}

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-md
                       bg-slate-900 text-white text-sm font-medium
                       hover:bg-slate-800"
          >
            Save (Step 1 – dry run)
          </button>
        </form>
      </div>
    </section>
  );
}
