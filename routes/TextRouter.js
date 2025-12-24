const express = require("express");
const { textToImage } = require("../controllers/textToImageController");

const router = express.Router();

router.post("/generate", textToImage);

module.exports = router;