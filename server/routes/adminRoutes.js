const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

// Apply admin authentication middleware to all routes
router.use(isAdmin);

// Admin routes
router.get('/users', adminController.getAllUsers);
router.get('/items', adminController.getAllItems);
router.get('/bids', adminController.getAllBids);
router.get('/reviews', adminController.getAllReviews);

// Additional CRUD operations for each entity
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.put('/items/:id', adminController.updateItem);
router.delete('/items/:id', adminController.deleteItem);

router.put('/bids/:id', adminController.updateBid);
router.delete('/bids/:id', adminController.deleteBid);

router.put('/reviews/:id', adminController.updateReview);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;