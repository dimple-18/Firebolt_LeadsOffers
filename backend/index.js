// Import required packages
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // loads backend/.env

// Create an Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ----- Cloudinary config -----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: keep file in memory (we stream it to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Simple test route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running fine!" });
});

// ----- Upload route -----
// Send multipart/form-data with field name "file"
// Optional: ?folder=my/custom/folder to override default
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file provided" });

    const folder = req.query.folder || process.env.CLOUDINARY_FOLDER || "firebolt/uploads";

    // Stream buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" }, // allows images, pdf, etc.
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    return res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format,
      width: result.width || null,
      height: result.height || null,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

// Run the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
