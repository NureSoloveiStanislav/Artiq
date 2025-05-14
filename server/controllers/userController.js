const bcrypt = require('bcrypt');
const pool = require('../MySQL/mysql.js');
const { getUserByEmail, createUser } = require('../services/userService');

const registerUser = async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, role } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Користувач з такою електронною поштою вже існує' 
      });
    }

    const userId = await createUser({
      email,
      password,
      phone,
      firstName,
      lastName,
      role
    });

    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      role
    };

    req.session.user = user;

    return res.status(200).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      message: 'Помилка при реєстрації. Спробуйте пізніше' 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userResponse = {
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      phone: user.phone,
      lastName: user.last_name,
      role: user.role
    };

    req.session.user = userResponse;

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error logging in the user: ', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const checkSession = async (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.clearCookie('sessionId');
    res.status(200).json({ message: 'Successfully logged out' });
  });
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [users] = await pool.query(
      'SELECT user_id, first_name, last_name, email, role, phone FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    res.json({
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while retrieving user'
    });
  }
};

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

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, role } = req.body;
    
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?
       WHERE user_id = ?`,
      [firstName, lastName, email, phone, role, userId]
    );
    
    const [updatedUsers] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?',
      [userId]
    );
    
    const updatedUser = updatedUsers[0];
    
    res.json({
      id: updatedUser.user_id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
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

module.exports = {
  registerUser,
  login,
  checkSession,
  logout,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};