// Import required packages
const express = require("express");
const cors = require("cors");

// Create an Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running fine!" });
});

// Run the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
