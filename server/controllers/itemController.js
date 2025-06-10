const pool = require('../MySQL/mysql.js');
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

    const itemWithFullImageUrl = {
      ...item,
      image: item.image
        ? `${req.protocol}://${req.get('host')}/${item.image}`
        : null
    };

    res.status(201).json({
      status: 'success',
      message: 'Item added successfully',
      data: itemWithFullImageUrl
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding item',
      error: error.message
    });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await itemService.getAllItems();

    // Transform database model to frontend model
    const transformedItems = items.map(item => ({
      id: item.item_id,
      title: item.title,
      description: item.description,
      startingPrice: parseFloat(item.starting_price),
      currentPrice: item.current_price ? parseFloat(item.current_price) : null,
      status: item.status,
      firstBidTime: item.first_bid_time,
      category: item.category,
      endTime: item.end_time,
      image: item.image_url
        ? `${req.protocol}://${req.get('host')}/${item.image_url}`
        : null,
      userId: item.user_id,
      sellerName: item.seller_name,
      lastBidderId: item.last_bidder_id,
      lastBidderName: item.last_bidder_name
    }));

    res.status(200).json({
      status: 'success',
      data: transformedItems
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

const getItemById = async (req, res) => {
  // console.log(`getItemById called for ID: ${req.params.id}. Request details: Method=${req.method}, URL=${req.originalUrl}, IP=${req.ip}`);
  try {
    const itemId = req.params.id;

    // Validate itemId
    if (!itemId || isNaN(parseInt(itemId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid item ID'
      });
    }

    const item = await itemService.getItemById(itemId); // Предполагаем, что возвращает объект строки БД

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Transform to frontend model format, ensuring numeric values are numbers
    const transformedItem = {
      id: parseInt(item.id),
      title: item.title,
      description: item.description,
      startingPrice: parseFloat(item.startingPrice) || 0,
      currentPrice: item.currentPrice ? parseFloat(item.currentPrice) || 0 : null,
      status: item.status,
      firstBidTime: item.firstBidTime,
      category: item.category,
      endTime: item.endTime,
      image: item.image
        ? `${req.protocol}://${req.get('host')}/${item.image_url}`
        : null,
      userId: parseInt(item.userId),
      sellerName: item.sellerName,
      lastBidderId: item.lastBidderId ? parseInt(item.lastBidderId) : null,
      lastBidderName: item.lastBidderName
    };

    res.status(200).json(transformedItem);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch item details'
    });
  }
};

// Extract a function to format item data with full image URL
const formatItemWithFullImageUrl = (item, req) => {
  const fullImageUrl = item.image_url
    ? `${req.protocol}://${req.get('host')}/${item.image_url}`
    : null;

  return {
    item_id: item.item_id,
    title: item.title,
    description: item.description,
    final_price: item.final_price,
    end_time: item.end_time,
    category: item.category,
    seller_name: item.seller_name,
    image_url: fullImageUrl
  };
};

const getWonItems = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    const items = await itemService.getWonItemsByUserId(userId);
    const updatedItems = items.map(item => formatItemWithFullImageUrl(item, req));

    res.json({
      status: 'success',
      data: updatedItems
    });
  } catch (error) {
    console.error('Error getting won items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch won items'
    });
  }
};

module.exports = {
  addItem,
  upload,
  getItems,
  getItemById,
  getWonItems
};