// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const { addItem, getItems, upload } = require('../controllers/itemController');

router.get('/items', getItems);

router.post('/items', upload.single('image'), addItem);

module.exports = router;