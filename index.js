const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config(); // .env-д HF_TOKEN хадгалах
const { InferenceClient } = require("@huggingface/inference");

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

// Multer тохиргоо
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// Зураг upload endpoint
app.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  res.json({
    filename: req.file.filename,
    path: req.file.path,
  });
});

// Hugging Face description endpoint
app.post("/describe", async (req, res) => {
  const { filename } = req.body;
  if (!filename)
    return res.status(400).json({ message: "No filename provided" });

  const imageUrl = `http://localhost:${PORT}/uploads/${filename}`;
  const client = new InferenceClient(process.env.HF_TOKEN);

  try {
    const chatCompletion = await client.chatCompletion({
      model: "zai-org/GLM-4.6V-Flash:novita",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in one sentence." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const description = chatCompletion.choices[0].message.content[0].text;
    res.json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate description" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
