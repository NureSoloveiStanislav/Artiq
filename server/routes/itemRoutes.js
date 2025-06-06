const express = require('express');
const router = express.Router();
const { addItem, getWonItems, getItems, getItemById, upload } = require('../controllers/itemController');
const { closeAuction } = require('../controllers/bidController');

router.get('/items', getItems);
router.post('/items', upload.single('image'), addItem);
router.get('/items/:id', getItemById);
router.put('/items/:id/close', closeAuction);
router.get('/items/:id/won', getWonItems);

module.exports = router;