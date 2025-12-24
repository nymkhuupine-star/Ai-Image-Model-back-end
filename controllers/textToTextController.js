const axios = require("axios");

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

const HF_API_URL = "https://api-inference.huggingface.co/models";
exports.textToText = async (req, res) => {
  try {
    const { text, task } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Текст оруулна уу",
      });
    }

    let model = "google/flan-t5-base";
    let inputs = text;

    switch (task) {
      case "summarize":
        model = "facebook/bart-large-cnn";
        break;
      case "translate":
        model = "Helsinki-NLP/opus-mt-en-de";
        break;
      case "paraphrase":
        model = "tuner007/pegasus_paraphrase";
        break;
      default:
        model = "google/flan-t5-base";
    }

    const response = await axios.post(
      `${HF_API_URL}/${model}`,
      {
        inputs: inputs,
        options: {
          wait_for_model: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );

    let generatedText = "";

    if (Array.isArray(response.data) && response.data[0]) {
      generatedText =
        response.data[0].generated_text ||
        response.data[0].summary_text ||
        response.data[0].translation_text ||
        response.data[0].text ||
        JSON.stringify(response.data[0]);
    } else if (response.data.generated_text) {
      generatedText = response.data.generated_text;
    } else if (typeof response.data === "string") {
      generatedText = response.data;
    } else {
      generatedText = JSON.stringify(response.data);
    }

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        generatedText: generatedText,
        model: model,
        task: task || "general",
      },
    });
  } catch (error) {
    console.error("Text-to-Text алдаа:", error.response?.data || error.message);

    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "Модель ачаалагдаж байна. 20-30 секунд хүлээгээд дахин оролдоно уу.",
        error: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Hugging Face API key буруу байна",
        error: error.response?.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Text-to-Text үүсгэхэд алдаа гарлаа",
      error: error.message || "Unknown error",
    });
  }
};

exports.summarizeText = async (req, res) => {
  req.body.task = "summarize";
  return exports.textToText(req, res);
};

exports.translateText = async (req, res) => {
  req.body.task = "translate";
  return exports.textToText(req, res);
};

exports.paraphraseText = async (req, res) => {
  req.body.task = "paraphrase";
  return exports.textToText(req, res);
};
