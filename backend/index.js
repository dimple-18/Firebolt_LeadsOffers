const express = require("express");
const cors = require("cors");
const multer = require("multer");                 // ← add
const cloudinary = require("cloudinary").v2;      // ← add
require("dotenv").config();                       // ← add

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.get("/health", (_, res) => res.json({ ok: true, message: "API is up" }));

// NEW: Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file provided" });

    const folder = req.query.folder || process.env.CLOUDINARY_FOLDER || "firebolt/uploads";

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" }, // images, pdfs, etc.
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({
      ok: true,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      bytes: uploaded.bytes,
      format: uploaded.format,
    });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

// (optional) helpful root route
app.get("/", (_, res) => res.send("Backend is running. Try GET /health or POST /upload."));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
