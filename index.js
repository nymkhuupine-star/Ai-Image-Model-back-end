const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use("/uploads", express.static("uploads"));

// HuggingFace Inference API шууд дуудах (ШИНЭ URL!)
async function queryHuggingFace(imageBuffer) {
  try {
    // Base64 руу хөрвүүлэх
    const base64Image = imageBuffer.toString('base64');
    
    const response = await axios.post(
      "https://api.novita.ai/v3/openai/chat/completions",
      {
        model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in one positive sentence highlighting the most beautiful things you can see. Use a friendly tone."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 150
      },
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HuggingFace API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

app.post(
  "/describe-image",
  upload.single("image"),
  async (req, res) => {
    console.log("📥 Image upload request received");
    
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log("✅ File received:", req.file.filename);

    try {
      const imagePath = path.join(__dirname, req.file.path);
      const imageBuffer = fs.readFileSync(imagePath);

      if (!process.env.HF_TOKEN) {
        console.error("❌ HF_TOKEN missing in .env");
        return res.status(500).json({ message: "Server configuration error" });
      }

      console.log("🔑 Token configured: YES ✅");
      console.log("🤖 Sending to HuggingFace Inference API...");

      // API дуудах
      const result = await queryHuggingFace(imageBuffer);
      
      console.log("📦 Raw result:", result);

      // Response format шалгах (Vision модель)
      let description = "Unable to generate description";
      
      if (result.choices && result.choices[0]) {
        const message = result.choices[0].message;
        if (message.content) {
          description = message.content;
        }
      }

      // Текстийг сайжруулах
      description = description.charAt(0).toUpperCase() + description.slice(1);
      if (!description.endsWith('.') && !description.endsWith('!')) {
        description += '.';
      }

      console.log("✅ Description generated:", description);

      // Файл устгах
      fs.unlinkSync(imagePath);

      res.status(200).json({ description });
    } catch (err) {
      console.error("❌ Error:", err.message);
      console.error("Full error:", err);
      
      // Файл устгах (алдаа гарсан ч гэсэн)
      if (req.file) {
        const imagePath = path.join(__dirname, req.file.path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Хэрэв модель loading байвал
      if (err.message.includes("loading") || err.message.includes("503")) {
        res.status(503).json({ 
          message: "Model is loading, please wait 20 seconds and try again",
          error: err.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to describe image",
          error: err.message 
        });
      }
    }
  }
);

app.get("/", (req, res) => {
  res.send("AI Image Description Server 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    tokenConfigured: !!process.env.HF_TOKEN
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 HF Token: ${process.env.HF_TOKEN ? "Configured ✅" : "Missing ❌"}`);
});



