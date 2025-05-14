const pool = require('../MySQL/mysql.js');

class ReviewService {
  async createReview({ reviewerId, revieweeId, rating, comment }) {
    const connection = await pool.getConnection();
    
    try {
      // Validate inputs
      if (!reviewerId || !revieweeId || !rating) {
        throw new Error('Missing required fields: reviewerId, revieweeId, and rating are required');
      }
      
      // Ensure rating is within valid range (1-5)
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      // Set default comment if none provided
      const reviewComment = comment || '';
      
      // Get current timestamp
      const now = new Date();
      
      // Insert the review into the database
      const [result] = await connection.execute(
        'INSERT INTO reviews (reviewer_id, reviewee_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)',
        [reviewerId, revieweeId, rating, reviewComment, now]
      );
      
      // Return the review ID and other data
      return {
        reviewId: result.insertId,
        reviewerId,
        revieweeId,
        rating,
        comment: reviewComment,
        createdAt: now
      };
    } catch (error) {
      console.error('Database error during review creation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getReviewsByUser(userId) {
    const connection = await pool.getConnection();
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Get reviews where this user is the reviewee (i.e., reviews about this user)
      const [reviews] = await connection.query(
        `SELECT r.*, 
                u.first_name as reviewer_first_name, 
                u.last_name as reviewer_last_name
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.user_id
         WHERE r.reviewee_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      
      // Transform database results to a clean format
      return reviews.map(review => ({
        id: review.review_id,
        reviewerId: review.reviewer_id,
        revieweeId: review.reviewee_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        reviewerName: `${review.reviewer_first_name} ${review.reviewer_last_name}`
      }));
    } catch (error) {
      console.error('Database error fetching reviews:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  async getAverageRating(userId) {
    const connection = await pool.getConnection();
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Get average rating for this user
      const [result] = await connection.query(
        `SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating
         FROM reviews
         WHERE reviewee_id = ?`,
        [userId]
      );
      
      return {
        totalReviews: result[0].total_reviews || 0,
        averageRating: result[0].average_rating || 0
      };
    } catch (error) {
      console.error('Database error fetching average rating:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ReviewService();