const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { InferenceClient } = require("@huggingface/inference");

const env = require("dotenv");
env.config();

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

app.post("/describe-image", async (req, res) => {
  console.log("hello");
  res.send("hello");
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const imagePath = path.join(__dirname, req.file.path);
  const imageBuffer = fs.readFileSync(imagePath);

  const client = new InferenceClient(process.env.HF_TOKEN);

  try {
    const response = await client.chatCompletion({
      model: "zai-org/GLM-4.6V-Flash:novita",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe the image in one positive sentence highlighting the most beautiful things you can see. Use a friendly tone.",
            },
            {
              type: "image",
              image: imageBuffer,
            },
          ],
        },
      ],
    });

    const description = response.choices[0].message.content[0].text;
    res.json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to describe image" });
  }
});

app.get("/", (req, res) => {
  console.log(req);
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// const express = require("express");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 1000;

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("hello");
// });

// app.listen(PORT, () => {
//   console.log(`API beebeg on http://localhost:${PORT}`);
// });
