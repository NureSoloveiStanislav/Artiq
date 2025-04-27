const itemService = require('../services/itemService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/items';
    // Створюємо директорію, якщо вона не існує
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Створюємо унікальне ім'я файлу
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Фільтр файлів
const fileFilter = (req, file, cb) => {
  // Приймаємо лише зображення
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // обмеження 5MB
  }
});

const addItem = async (req, res) => {
  try {
    const { title, description, startingPrice, category, userId } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const itemId = await itemService.createItem({
      title,
      description,
      startingPrice,
      category,
      userId,
      imagePath
    });

    const item = await itemService.getItemById(itemId);
    
    res.status(201).json({
      message: 'Item added successfully',
      item
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await itemService.getAllItems();
    
    // Перетворимо URL зображень на повні шляхи
    const itemsWithFullImageUrls = items.map(item => ({
      ...item,
      image_url: item.image_url 
        ? `${req.protocol}://${req.get('host')}/${item.image_url}`
        : null
    }));

    res.status(200).json({
      status: 'success',
      data: itemsWithFullImageUrls
    });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

module.exports = {
  addItem,
  upload,
  getItems
};