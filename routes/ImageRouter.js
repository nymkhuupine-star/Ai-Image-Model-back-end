
// const express = require("express");
// const multer = require("multer");
// const { imageToText } = require("../controllers/imageToTextController");

// const router = express.Router();

// // Memory storage ашиглах (файл дискэнд хадгалахгүй)
// const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
// });

// router.post("/describe-image", upload.single("image"), imageToText);

// module.exports = router;

const express = require("express");
const { upload } = require("../multerConfig");
const { imageToText } = require("../controllers/imageToTextController");

const router = express.Router();

router.post("/upload", upload.single("image"), imageToText);

module.exports = router;