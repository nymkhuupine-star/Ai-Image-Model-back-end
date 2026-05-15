const { InferenceClient } = require("@huggingface/inference");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const client = new InferenceClient(process.env.HF_TOKEN);

const textToImage = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please provide a text prompt",
      });
    }

    console.log("Generating image for prompt:", prompt);

    // Hugging Face text-to-image model
    const imageBlob = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      parameters: {
        guidance_scale: 3.5,
        num_inference_steps: 8,
        width: 1024,
        height: 1024,
      },
    });

    // Blob-г Buffer болгох
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Зургийг хадгалах
    const fileName = `generated-${Date.now()}.png`;
    const uploadDir = path.join(__dirname, "..", "uploads");
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const PORT = process.env.PORT || 1000;
    const BACKEND_URL = "https://ai-image-model-back-end.onrender.com";
    const imageUrl = `${BACKEND_URL}/uploads/${fileName}`;

    res.status(200).json({
      success: true,
      imageUrl,
      fileName,
      prompt,
    });
  } catch (error) {
    console.error("Text to Image error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate image",
      details: error.message,
    });
  }
};

module.exports = { textToImage };
