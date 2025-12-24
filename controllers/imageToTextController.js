const { InferenceClient } = require("@huggingface/inference");
const fs = require("fs").promises;
require("dotenv").config();

const client = new InferenceClient(process.env.HF_TOKEN);

const imageToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded" 
      });
    }

    const PORT = process.env.PORT || 1000;
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  
    const fileBuffer = await fs.readFile(req.file.path);
    const base64Image = fileBuffer.toString("base64");
   
    const chatCompletion = await client.chatCompletion({
      model: "Qwen/Qwen2.5-VL-7B-Instruct", 
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image in one sentence.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });
    res.status(200).json({
      success: true,
      description: chatCompletion.choices[0].message.content,
      imageUrl,
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate description",
      details: error.message,
    });
  }
};

module.exports = { imageToText };