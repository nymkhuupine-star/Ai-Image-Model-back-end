const { InferenceClient } = require("@huggingface/inference");
require("dotenv").config();

const client = new InferenceClient(process.env.HF_TOKEN);

const imageToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // memoryStorage ашиглаж байгаа тул req.file.buffer-аас шууд авна
    const result = await client.chatCompletion({
      provider: "novita",
      model: "Qwen/Qwen3-VL-8B-Instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in detail." },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    });

    res.status(200).json({
      success: true,
      description: result.choices[0].message.content,
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
