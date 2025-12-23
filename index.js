const client = require("../huggingface-inference");
const TextCreator = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File alga",
      });
    }
    console.log("FILE INFO:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    const base64Image = req.file.buffer.toString("base64");
    const chatCompletion = await client.chatCompletion({
      model: "zai-org/GLM-4.6V-novita",
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
    });
    res.status(200).json({
      success: true,
      image: `data:${req.file.mimetype};base64,${base64Image}`,
      data: chatCompletion.choices[0].message.content,
    });
  } catch (err) {
    console.error("IMAGE TO TEXT ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Text uusgehad aldaa garlaa",
    });
  }
};
module.exports = TextCreator;
