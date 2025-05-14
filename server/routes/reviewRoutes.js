const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get reviews for a specific user
router.get('/users/:userId/reviews', reviewController.getReviewsByUser);

// Get user's average rating
router.get('/users/:userId/rating', reviewController.getUserRatingSummary);

// Create a new review
router.post('/reviews', reviewController.createReview);

module.exports = router;