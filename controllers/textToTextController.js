const axios = require('axios');

// Hugging Face API key
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

// Hugging Face Inference API endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Text-to-Text функц
exports.textToText = async (req, res) => {
  try {
    const { text, task } = req.body;

    // Input шалгах
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Текст оруулна уу'
      });
    }

    // Model сонгох task-аас хамааран
    let model = 'google/flan-t5-base';
    let inputs = text;

    // Task-ын дагуу model тохируулах
    switch(task) {
      case 'summarize':
        model = 'facebook/bart-large-cnn';
        break;
      case 'translate':
        model = 'Helsinki-NLP/opus-mt-en-de'; // Англи -> Герман (Монгол модель байхгүй)
        break;
      case 'paraphrase':
        model = 'tuner007/pegasus_paraphrase';
        break;
      default:
        model = 'google/flan-t5-base';
    }

    // Hugging Face API руу хүсэлт илгээх
    const response = await axios.post(
      `${HF_API_URL}/${model}`,
      { 
        inputs: inputs,
        options: {
          wait_for_model: true // Модель ачаалагдах хүртэл хүлээх
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 120 секунд
      }
    );

    // Үр дүн буцаах
    let generatedText = '';
    
    if (Array.isArray(response.data) && response.data[0]) {
      generatedText = response.data[0].generated_text || 
                      response.data[0].summary_text ||
                      response.data[0].translation_text ||
                      response.data[0].text ||
                      JSON.stringify(response.data[0]);
    } else if (response.data.generated_text) {
      generatedText = response.data.generated_text;
    } else if (typeof response.data === 'string') {
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
        task: task || 'general'
      }
    });

  } catch (error) {
    console.error('Text-to-Text алдаа:', error.response?.data || error.message);
    
    // Алдааны мэдээлэл буцаах
    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'Модель ачаалагдаж байна. 20-30 секунд хүлээгээд дахин оролдоно уу.',
        error: error.response?.data
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Hugging Face API key буруу байна',
        error: error.response?.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Text-to-Text үүсгэхэд алдаа гарлаа',
      error: error.message || 'Unknown error'
    });
  }
};

// Олон төрлийн text-to-text үйлдлүүд
exports.summarizeText = async (req, res) => {
  req.body.task = 'summarize';
  return exports.textToText(req, res);
};

exports.translateText = async (req, res) => {
  req.body.task = 'translate';
  return exports.textToText(req, res);
};

exports.paraphraseText = async (req, res) => {
  req.body.task = 'paraphrase';
  return exports.textToText(req, res);
};