const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

app.post("/anime", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imagePath = req.file.path;
  const imageData = fs.readFileSync(imagePath);

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/hakurei/waifu-diffusion",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY`,
          "Content-Type": "application/octet-stream",
        },
        body: imageData,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outputPath = `uploads/anime-${req.file.filename}`;
    fs.writeFileSync(outputPath, buffer);

    res.json({ message: "Anime generated!", path: outputPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate anime" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
