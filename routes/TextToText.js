const express = require('express');
const router = express.Router();
const textToTextController = require('../controllers/textToTextController');

/**
 * @route   POST /api/text-to-text
 * @desc    Текст дээр суурилсан текст үүсгэх
 * @access  Public
 */
router.post('/', textToTextController.textToText);

/**
 * @route   POST /api/text-to-text/summarize
 * @desc    Текстийг товчилж өгөх
 * @access  Public
 */
router.post('/summarize', textToTextController.summarizeText);

/**
 * @route   POST /api/text-to-text/translate
 * @desc    Текстийг орчуулах
 * @access  Public
 */
router.post('/translate', textToTextController.translateText);


module.exports = router;