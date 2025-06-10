const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  login, 
  checkSession, 
  logout,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/check-session', checkSession);
router.post('/logout', logout);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;