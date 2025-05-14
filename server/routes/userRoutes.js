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

// Регистрация нового пользователя
router.post('/register', registerUser);

// Авторизация пользователя
router.post('/login', login);

// Проверка активной сессии
router.get('/check-session', checkSession);

// Выход из системы
router.post('/logout', logout);

// Получить всех пользователей
router.get('/users', getAllUsers);

// Получить пользователя по ID
router.get('/users/:id', getUserById);

// Обновить пользователя
router.put('/users/:id', updateUser);

// Удалить пользователя
router.delete('/users/:id', deleteUser);

module.exports = router;