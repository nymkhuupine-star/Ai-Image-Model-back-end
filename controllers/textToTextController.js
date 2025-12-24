const axios = require("axios");

console.log("🔍 LibreTranslate API ашиглаж байна (Үнэгүй)");

exports.textToText = async (req, res) => {
  try {
    const { text, task } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Текст оруулна уу",
      });
    }

    console.log(`📝 Оролт: ${text.substring(0, 100)}...`);
    console.log(`🔄 Task: ${task}`);

    let generatedText = "";

    if (task === "translate") {
      // LibreTranslate API ашиглах (Англи -> Орос)
      try {
        const translateResponse = await axios.post(
          "https://libretranslate.com/translate",
          {
            q: text,
            source: "en",
            target: "ru",
            format: "text"
          },
          {
            headers: {
              "Content-Type": "application/json"
            },
            timeout: 30000
          }
        );

        generatedText = translateResponse.data.translatedText;
        console.log("✅ Орчуулга амжилттай:", generatedText.substring(0, 100));

      } catch (translateError) {
        console.error("❌ LibreTranslate алдаа:", translateError.message);
        
        // Fallback: MyMemory API (өөр үнэгүй API)
        try {
          console.log("🔄 MyMemory API ашиглаж байна...");
          const fallbackResponse = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`,
            { timeout: 30000 }
          );

          generatedText = fallbackResponse.data.responseData.translatedText;
          console.log("✅ MyMemory орчуулга амжилттай");

        } catch (fallbackError) {
          throw new Error("Орчуулга хийх боломжгүй байна. Дахин оролдоно уу.");
        }
      }

    } else if (task === "summarize") {
      // Summarize function (одоогоор дэмжихгүй)
      return res.status(501).json({
        success: false,
        message: "Summarize функц одоогоор дэмжигдэхгүй байна.",
      });

    } else {
      // General text generation (одоогоор дэмжихгүй)
      return res.status(501).json({
        success: false,
        message: "General text generation одоогоор дэмжигдэхгүй байна.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        generatedText: generatedText,
        model: "LibreTranslate (en→ru)",
        task: task,
      },
    });

  } catch (error) {
    console.error("❌ Алдаа:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Алдаа гарлаа",
      details: error.response?.data,
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