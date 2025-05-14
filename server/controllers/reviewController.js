const reviewService = require('../services/reviewService');

class ReviewController {
  async createReview(req, res) {
    try {
      const { reviewerId, revieweeId, rating, comment } = req.body;
      
      // Validate request
      if (!reviewerId || !revieweeId || !rating) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: reviewerId, revieweeId, and rating are required'
        });
      }
      
      // Create review
      const review = await reviewService.createReview({
        reviewerId,
        revieweeId,
        rating,
        comment
      });
      
      // Return success response
      return res.status(201).json({
        status: 'success',
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create review'
      });
    }
  }

  async getReviewsByUser(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }
      
      // Get reviews
      const reviews = await reviewService.getReviewsByUser(userId);
      
      // Return reviews
      return res.status(200).json({
        status: 'success',
        data: reviews
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch reviews'
      });
    }
  }
  
  async getUserRatingSummary(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }
      
      // Get rating summary
      const ratingSummary = await reviewService.getAverageRating(userId);
      
      // Return summary
      return res.status(200).json({
        status: 'success',
        data: ratingSummary
      });
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch user rating'
      });
    }
  }
}

module.exports = new ReviewController();