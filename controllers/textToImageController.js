const { InferenceClient } = require("@huggingface/inference");
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

    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    res.status(200).json({
      success: true,
      imageUrl,
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
