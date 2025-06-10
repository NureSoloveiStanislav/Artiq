const express = require('express');
const router = express.Router();
const { placeBid, closeAuction, getBidsByItem } = require('../controllers/bidController');

// Place a bid
router.post('/bids', placeBid);

// Get bids for an item
router.get('/items/:id/bids', getBidsByItem);

// Close an auction
router.put('/items/:id/close', closeAuction);

module.exports = router;