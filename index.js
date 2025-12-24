require("dotenv").config();
console.log("🔑 HF_TOKEN:", process.env.HF_TOKEN ? "✓ Олдсон" : "✗ Олдсонгүй");

const express = require("express");
const cors = require("cors");
const path = require("path");
const imageRouter = require("./routes/ImageRouter");
const textRouter = require("./routes/TextRouter");
const textToTextRoutes = require("./routes/TextToText");

const app = express();
const PORT = process.env.PORT || 1000;

// app.use(
//   cors({
//     origin: ["https://ai-image-model-back-end.onrender.com"],
//     credentials: true,
//   })
// );

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", imageRouter);
app.use("/api/text-to-image", textRouter);
app.use("/api/text-to-text", textToTextRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
