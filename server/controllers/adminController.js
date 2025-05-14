const pool = require('../MySQL/mysql.js');

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, email, first_name, last_name, role, phone FROM users'
    );

    const formattedUsers = users.map(user => ({
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while retrieving users'
    });
  }
};

// GET all items
const getAllItems = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT i.*, u.first_name, u.last_name 
      FROM items i
      LEFT JOIN users u ON i.user_id = u.user_id
    `);

    const formattedItems = items.map(item => ({
      item_id: item.item_id,
      title: item.title,
      description: item.description,
      starting_price: parseFloat(item.starting_price),
      current_price: parseFloat(item.current_price),
      category: item.category,
      status: item.status,
      image_url: item.image_url,
      user_id: item.user_id,
      seller_name: `${item.first_name} ${item.last_name}`,
      created_at: item.created_at,
      end_time: item.end_time
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while retrieving items'
    });
  }
};

// GET all bids
const getAllBids = async (req, res) => {
  try {
    const [bids] = await pool.query(`
      SELECT b.*, u.first_name, u.last_name, i.title as item_title
      FROM bids b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN items i ON b.item_id = i.item_id
      ORDER BY b.time DESC
    `);

    const formattedBids = bids.map(bid => ({
      bid_id: bid.bid_id,
      amount: parseFloat(bid.amount),
      time: bid.time,
      user_id: bid.user_id,
      item_id: bid.item_id,
      bidder_name: `${bid.first_name} ${bid.last_name}`,
      item_title: bid.item_title
    }));

    res.json(formattedBids);
  } catch (error) {
    console.error('Error retrieving bids:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while retrieving bids'
    });
  }
};

// GET all reviews
const getAllReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.*,
        reviewer.first_name as reviewer_first_name, 
        reviewer.last_name as reviewer_last_name,
        reviewee.first_name as reviewee_first_name, 
        reviewee.last_name as reviewee_last_name
      FROM reviews r
      LEFT JOIN users reviewer ON r.reviewer_id = reviewer.user_id
      LEFT JOIN users reviewee ON r.reviewee_id = reviewee.user_id
      ORDER BY r.created_at DESC
    `);

    const formattedReviews = reviews.map(review => ({
      review_id: review.review_id,
      reviewer_id: review.reviewer_id,
      reviewee_id: review.reviewee_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      reviewer_name: `${review.reviewer_first_name} ${review.reviewer_last_name}`,
      reviewee_name: `${review.reviewee_first_name} ${review.reviewee_last_name}`
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while retrieving reviews'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, role } = req.body;

    const [result] = await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?
       WHERE user_id = ?`,
      [firstName, lastName, email, phone, role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const [updatedUser] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?',
      [userId]
    );

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        id: updatedUser[0].user_id,
        firstName: updatedUser[0].first_name,
        lastName: updatedUser[0].last_name,
        email: updatedUser[0].email,
        phone: updatedUser[0].phone,
        role: updatedUser[0].role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting user'
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const {
      title,
      description,
      starting_price,
      current_price,
      category,
      status,
      image_url
    } = req.body;

    const [result] = await pool.query(
      `UPDATE items 
       SET title = ?, description = ?, starting_price = ?, 
           current_price = ?, category = ?, status = ?, image_url = ?
       WHERE item_id = ?`,
      [title, description, starting_price, current_price, category, status, image_url, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating item'
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    // First delete associated bids to avoid foreign key constraints
    await pool.query('DELETE FROM bids WHERE item_id = ?', [itemId]);

    const [result] = await pool.query('DELETE FROM items WHERE item_id = ?', [itemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting item'
    });
  }
};

// Update bid
const updateBid = async (req, res) => {
  try {
    const bidId = req.params.id;
    const { amount, time, user_id, item_id } = req.body;

    const [result] = await pool.query(
      `UPDATE bids 
       SET amount = ?, time = ?, user_id = ?, item_id = ?
       WHERE bid_id = ?`,
      [amount, time, user_id, item_id, bidId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bid not found'
      });
    }

    // Update the current price of the item
    await pool.query(
      'UPDATE items SET current_price = ? WHERE item_id = ?',
      [amount, item_id]
    );

    res.json({
      status: 'success',
      message: 'Bid updated successfully'
    });
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating bid'
    });
  }
};

// Delete bid
const deleteBid = async (req, res) => {
  try {
    const bidId = req.params.id;

    // First, get the bid to know which item needs price update
    const [bids] = await pool.query('SELECT item_id FROM bids WHERE bid_id = ?', [bidId]);

    if (bids.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bid not found'
      });
    }

    const itemId = bids[0].item_id;

    // Delete the bid
    await pool.query('DELETE FROM bids WHERE bid_id = ?', [bidId]);

    // Find the highest remaining bid for the item
    const [highestBid] = await pool.query(
      'SELECT MAX(amount) as highest_amount FROM bids WHERE item_id = ?',
      [itemId]
    );

    const newPrice = highestBid[0].highest_amount || 0;

    // Update the item's current price
    await pool.query(
      'UPDATE items SET current_price = ? WHERE item_id = ?',
      [newPrice, itemId]
    );

    res.json({
      status: 'success',
      message: 'Bid deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bid:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting bid'
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reviewer_id, reviewee_id, rating, comment } = req.body;

    const [result] = await pool.query(
      `UPDATE reviews 
       SET reviewer_id = ?, reviewee_id = ?, rating = ?, comment = ?
       WHERE review_id = ?`,
      [reviewer_id, reviewee_id, rating, comment, reviewId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating review'
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Get the reviewee_id first to update their rating after deletion
    const [reviews] = await pool.query(
      'SELECT reviewee_id FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    const revieweeId = reviews[0].reviewee_id;

    // Delete the review
    await pool.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting review'
    });
  }
};

module.exports = {
  getAllUsers,
  getAllItems,
  getAllBids,
  getAllReviews,
  updateUser,
  deleteUser,
  updateItem,
  deleteItem,
  updateBid,
  deleteBid,
  updateReview,
  deleteReview
};