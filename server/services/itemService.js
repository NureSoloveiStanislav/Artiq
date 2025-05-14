const pool = require('../MySQL/mysql.js');

/**
 * Create new item in database
 * @param {Object} itemData - Item data
 * @param {string} itemData.title - Item title
 * @param {string} itemData.description - Item description
 * @param {number} itemData.startingPrice - Starting price
 * @param {string} itemData.category - Item category
 * @param {number} itemData.userId - User ID who created the item
 * @param {string} itemData.imagePath - Path to item image
 * @returns {Promise<number>} Inserted item ID
 */
const createItem = async ({ title, description, startingPrice, category, userId, imagePath }) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO items (title,
                          description,
                          starting_price,
                          status,
                          category,
                          user_id,
                          image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        startingPrice,
        'active',      // status
        category,
        userId,
        imagePath     // image_url
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error('Database error during item creation:', error);
    throw error;
  }
};

// In itemService.js
const getItemById = async (itemId) => {
  try {
    const [items] = await pool.query(
      `SELECT i.*,
              u_seller.first_name AS seller_first_name,
              u_seller.last_name  AS seller_last_name,
              u_bidder.first_name AS bidder_first_name,
              u_bidder.last_name  AS bidder_last_name
       FROM items i
                LEFT JOIN users u_seller ON i.user_id = u_seller.user_id
                LEFT JOIN users u_bidder ON i.last_bidder_id = u_bidder.user_id
       WHERE i.item_id = ?`,
      [itemId]
    );

    if (items.length === 0) {
      return null;
    }

    const item = items[0];
    const sellerName = `${item.seller_first_name} ${item.seller_last_name}`;
    const bidderName = item.bidder_first_name && item.bidder_last_name
      ? `${item.bidder_first_name} ${item.bidder_last_name}`
      : null;

    return {
      id: item.item_id,
      title: item.title,
      description: item.description,
      startingPrice: item.starting_price,
      currentPrice: item.current_price,
      status: item.status,
      firstBidTime: item.first_bid_time,
      endTime: item.end_time,
      category: item.category,
      image: item.image_url,
      userId: item.user_id,
      sellerName: sellerName,
      lastBidderId: item.last_bidder_id,
      lastBidderName: bidderName
    };
  } catch (error) {
    console.error('Error retrieving item:', error);
    throw error;
  }
};

/**
 * Get all active items
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {number} filters.userId - Filter by user ID
 * @param {number} filters.limit - Limit number of items
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise<Array>} Array of items
 */
const getItems = async ({ category, userId, limit = 50, offset = 0 } = {}) => {
  try {
    let query = `
        SELECT i.*,
               u.first_name,
               u.last_name
        FROM items i
                 LEFT JOIN users u ON i.user_id = u.user_id
        WHERE 1 = 1
    `;
    const params = [];

    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    if (userId) {
      query += ' AND i.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY i.item_id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

/**
 * Update item
 * @param {number} itemId - Item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result of update operation
 */
const updateItem = async (itemId, updateData) => {
  const allowedFields = [
    'title', 'description', 'current_price',
    'status', 'category', 'end_time'
  ];
  const updates = [];
  const values = [];

  Object.entries(updateData).forEach(([key, value]) => {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      updates.push(`${dbField} = ?`);
      values.push(value);
    }
  });

  if (updates.length === 0) return null;

  values.push(itemId);
  const query = `UPDATE items
                 SET ${updates.join(', ')}
                 WHERE item_id = ?`;

  try {
    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

/**
 * Delete item
 * @param {number} itemId - Item ID
 * @returns {Promise<Object>} Result of delete operation
 */
const deleteItem = async (itemId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM items WHERE item_id = ?',
      [itemId]
    );
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

/**
 * Update item status
 * @param {number} itemId - Item ID
 * @param {string} status - New status ('active' or 'sold')
 * @returns {Promise<Object>} Result of update operation
 */
const updateItemStatus = async (itemId, status) => {
  try {
    const [result] = await pool.execute(
      'UPDATE items SET status = ? WHERE item_id = ?',
      [status, itemId]
    );
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getAllItems = async () => {
  try {
    const [items] = await pool.execute(`
        SELECT i.*,
               seller.first_name as seller_name,
               bidder.user_id as last_bidder_id,
               CONCAT(bidder.first_name, ' ', bidder.last_name) as last_bidder_name
        FROM items i
                 LEFT JOIN users seller ON i.user_id = seller.user_id
                 LEFT JOIN users bidder ON i.last_bidder_id = bidder.user_id
    `);

    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

const getWonItemsByUserId = async (userId) => {
  try {
    const [items] = await pool.query(`
        SELECT i.item_id,
               i.title,
               i.description,
               i.current_price                        AS final_price,
               i.image_url,
               i.end_time,
               i.category,
               CONCAT(u.first_name, ' ', u.last_name) AS seller_name
        FROM items i
                 JOIN
             users u ON i.user_id = u.user_id
        WHERE i.last_bidder_id = ?
          AND i.status = 'sold'
        ORDER BY i.end_time DESC
    `, [userId]);

    return items;
  } catch (error) {
    console.error('Error getting won items:', error);
    throw error;
  }
};

module.exports = {
  createItem,
  getItemById,
  getItems,
  updateItem,
  deleteItem,
  updateItemStatus,
  getAllItems,
  getWonItemsByUserId,
};