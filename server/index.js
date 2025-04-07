const express = require('express');
const cors = require('cors');
const bcrypt = require("bcrypt");
const connection = require('./MySQL/mysql.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Привет от сервера!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
