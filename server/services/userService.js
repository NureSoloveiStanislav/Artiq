const pool = require('../MySQL/mysql.js');
const bcrypt = require('bcrypt');

/**
 * Get user by email from database
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, email, password, first_name, last_name, phone, role, rating FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

/**
 * Create new user in database
 * @param {Object} userData - User data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - Hashed password
 * @param {string} userData.phone - User's phone
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.role - User's role
 * @returns {Promise<Object>} Result of insert operation
 */
const createUser = async ({ email, password, phone, firstName, lastName, role }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, phone, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, phone, firstName, lastName, role]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Database error during user creation:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('User with this email already exists');
    }
    throw error;
  }
};

/**
 * Update user data in database
 * @param {number} userId - User's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result of update operation
 */
const updateUser = async (userId, updateData) => {
  const allowedFields = ['phone', 'first_name', 'last_name', 'role', 'rating'];
  const updates = [];
  const values = [];

  // Filter and build update query
  Object.keys(updateData).forEach(key => {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert camelCase to snake_case
    if (allowedFields.includes(dbField)) {
      updates.push(`${dbField} = ?`);
      values.push(updateData[key]);
    }
  });

  if (updates.length === 0) {
    return null;
  }

  values.push(userId);
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  try {
    const [result] = await connection.promise().query(sql, values);
    return result;
  } catch (error) {
    console.error('Database error in updateUser:', error);
    throw new Error('Failed to update user');
  }
};

/**
 * Delete user from database
 * @param {number} userId - User's ID
 * @returns {Promise<Object>} Result of delete operation
 */
const deleteUser = async (userId) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  try {
    const [result] = await connection.promise().query(sql, [userId]);
    return result;
  } catch (error) {
    console.error('Database error in deleteUser:', error);
    throw new Error('Failed to delete user');
  }
};

/**
 * Get user by ID from database
 * @param {number} userId - User's ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserById = async (userId) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  try {
    const [rows] = await connection.promise().query(sql, [userId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getUserById:', error);
    throw new Error('Failed to get user by ID');
  }
};

module.exports = {
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUserById
};