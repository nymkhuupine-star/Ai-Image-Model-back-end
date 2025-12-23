const express = require("express");
const multer = require("multer");
const TextCreator = require("../controllers/TextCreator");
const router = express.Router();
const upload = multer();
router.post("/image-to-text", upload.single("image"), TextCreator);
module.exports = router;
