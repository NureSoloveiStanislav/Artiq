const express = require('express');
const router = express.Router();
const { registerUser, login, checkSession, logout } = require('../controllers/userController');

// Регистрация нового пользователя
router.post('/register', registerUser);

// Авторизация пользователя
router.post('/login', login);

// Проверка активной сессии
router.get('/check-session', checkSession);

// Выход из системы
router.post('/logout', logout);

module.exports = router;