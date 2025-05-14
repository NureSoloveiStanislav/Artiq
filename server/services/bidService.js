// server/services/bidService.js
const pool = require('../MySQL/mysql.js');

/**
 * Create a new bid
 * @param {Object} bidData - Bid data
 * @param {number} bidData.amount - Bid amount
 * @param {number} bidData.userId - User ID who placed the bid
 * @param {number} bidData.itemId - Item ID the bid is for
 * @returns {Promise<Object>} Result of create operation
 */
// Modify the createBid function - the issue is here
const createBid = async ({ amount, userId, itemId }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Получаем информацию о товаре и блокируем строку для обновления
    const [items] = await connection.query(
      'SELECT * FROM items WHERE item_id = ? FOR UPDATE', // Добавляем FOR UPDATE для предотвращения гонок
      [itemId]
    );

    if (items.length === 0) {
      throw new Error('Item not found');
    }

    const item = items[0];
    const currentPrice = item.current_price ? parseFloat(item.current_price) : parseFloat(item.starting_price);

    // Проверка: сумма ставки должна быть числом и больше текущей цены
    if (isNaN(amount) || amount <= currentPrice) {
      // Возвращаем ошибку, которую контроллер должен обработать и вернуть клиенту (например, статус 400)
      throw new Error(`Bid amount (${amount}) must be greater than the current price (${currentPrice})`);
    }

    // Проверка: активен ли аукцион (например, статус 'new' или 'active')
    // Подставьте ваши реальные статусы
    if (item.status !== 'active') {
      throw new Error(`Auction for item ${itemId} is not active.`);
    }

    const now = new Date();

    // Insert the bid
    const [result] = await connection.execute(
      'INSERT INTO bids (amount, time, user_id, item_id) VALUES (?, ?, ?, ?)',
      [amount, now, userId, itemId]
    );

    // Update the item's current price and last bidder information
    await connection.execute(
      'UPDATE items SET current_price = ?, last_bidder_id = ? WHERE item_id = ?',
      [amount, userId, itemId]
    );

    // Всегда продлеваем таймер на 60 секунд от ТЕКУЩЕГО момента для КАЖДОЙ ставки
    const endTime = new Date(now.getTime() + 60000); // 1 минута после текущей ставки

    // Если это первая ставка, также устанавливаем first_bid_time и обновляем статус на 'active'
    if (!item.first_bid_time) {
      const newStatus = item.status === 'new' ? 'active' : item.status; // Меняем статус, если был 'new'
      await connection.execute(
        'UPDATE items SET first_bid_time = ?, end_time = ?, status = ? WHERE item_id = ?', // Добавляем обновление статуса
        [now, endTime, newStatus, itemId]
      );
    } else {
      // Для последующих ставок просто обновляем end_time
      await connection.execute(
        'UPDATE items SET end_time = ? WHERE item_id = ?',
        [endTime, itemId]
      );

      // Логируем продление таймера
      console.log(`Auction timer extended for item ${itemId}. New end time: ${endTime}`);
    }

    await connection.commit();

    // Получаем обновленный товар и включаем информацию о пользователе
    const [updatedItems] = await connection.query(
      `SELECT i.*,
              u.first_name as seller_first_name, u.last_name as seller_last_name,
              ub.first_name as bidder_first_name, ub.last_name as bidder_last_name
       FROM items i
                LEFT JOIN users u ON i.user_id = u.user_id
                LEFT JOIN users ub ON i.last_bidder_id = ub.user_id
       WHERE i.item_id = ?`,
      [itemId]
    );

    // Форматируем ответ с информацией о последнем ставившем
    const updatedItem = updatedItems[0];
    return {
      bidId: result.insertId,
      item: {
        id: updatedItem.item_id,
        title: updatedItem.title,
        description: updatedItem.description,
        startingPrice: parseFloat(updatedItem.starting_price),
        currentPrice: parseFloat(updatedItem.current_price),
        status: updatedItem.status,
        firstBidTime: updatedItem.first_bid_time,
        endTime: updatedItem.end_time, // Здесь будет новое продленное время
        category: updatedItem.category,
        // Добавляем протокол и хост к URL изображения в ответе
        image: updatedItem.image_url,
        userId: updatedItem.user_id,
        sellerName: updatedItem.seller_first_name && updatedItem.seller_last_name ?
          `${updatedItem.seller_first_name} ${updatedItem.seller_last_name}` : null,
        lastBidderId: updatedItem.last_bidder_id,
        lastBidderName: updatedItem.bidder_first_name && updatedItem.bidder_last_name ?
          `${updatedItem.bidder_first_name} ${updatedItem.bidder_last_name}` : null
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('Database error during bid creation:', error); // Оставляем логирование ошибки
    // Перебрасываем ошибку, чтобы контроллер мог отправить ответ 500 или 400
    // Можно добавить более специфическую обработку ошибок валидации
    if (error.message.startsWith('Bid amount') || error.message.startsWith('Auction for item')) {
      // Перебрасываем ошибку валидации как есть (контроллер должен вернуть 400 Bad Request)
      throw error;
    }
    // Для других ошибок бросаем общую ошибку сервера
    throw new Error('Failed to place bid due to a server error.');
  } finally {
    connection.release();
  }
};


/**
 * Close auction and determine winner
 * @param {number} itemId - Item ID
 * @returns {Promise<Object>} Result with winner information
 */
const closeAuction = async (itemId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get the item
    const [items] = await connection.query(
      'SELECT * FROM items WHERE item_id = ?',
      [itemId]
    );
    
    if (items.length === 0) {
      throw new Error('Item not found');
    }
    
    const item = items[0];
    
    // If already sold, don't do anything
    if (item.status === 'sold') {
      throw new Error('Auction already closed');
    }
    
    // Get the highest bid
    const [bids] = await connection.query(
      'SELECT b.*, u.first_name, u.last_name FROM bids b ' +
      'JOIN users u ON b.user_id = u.user_id ' +
      'WHERE b.item_id = ? ORDER BY b.amount DESC LIMIT 1',
      [itemId]
    );
    
    // Update the item status to 'sold'
    const [updateResult] = await connection.execute(
      'UPDATE items SET status = ? WHERE item_id = ?',
      ['sold', itemId]
    );
    
    // Check if the update was successful
    if (updateResult.affectedRows !== 1) {
      throw new Error('Failed to update item status');
    }
    
    await connection.commit();
    
    // Determine the winner (highest bidder)
    let winner = null;
    if (bids.length > 0) {
      const highestBid = bids[0];
      winner = {
        userId: highestBid.user_id,
        name: `${highestBid.first_name} ${highestBid.last_name}`,
        amount: highestBid.amount
      };
    }
    
    console.log(`Auction ${itemId} closed successfully. Status updated to 'sold'.`);
    
    return { 
      winner,
      status: 'sold' // Explicitly return the new status
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Database error during auction close:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get bids for an item
 * @param {number} itemId - Item ID
 * @returns {Promise<Array>} Array of bids
 */
const getBidsByItemId = async (itemId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        b.*,
        u.first_name, u.last_name
      FROM bids b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.item_id = ?
      ORDER BY b.amount DESC`,
      [itemId]
    );
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

module.exports = {
  createBid,
  closeAuction,
  getBidsByItemId
};