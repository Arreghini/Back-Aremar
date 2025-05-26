const express = require('express');
const multer = require('multer');
const uploadImageHandler= require('../handlers/image/imageUploadHandler');
const deleteImageHandler = require('../handlers/image/imageDeleteHandler');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), uploadImageHandler);
router.delete('/', deleteImageHandler);

module.exports = router;
