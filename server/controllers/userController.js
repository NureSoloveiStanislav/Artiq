const bcrypt = require('bcrypt');
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
      role,
      rating: null
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
      role: user.role,
      rating: user.rating
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

module.exports = {
  registerUser,
  login,
  checkSession,
  logout
};