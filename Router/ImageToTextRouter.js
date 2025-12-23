const express = require("express");

const ImageCreator = require("./controllers/ImageCreator");

const router = express.Router();

router.post("/text-to-image", ImageCreator);

module.exports = router;
