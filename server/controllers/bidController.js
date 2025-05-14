const bidService = require('../services/bidService');

const placeBid = async (req, res) => {
  try {
    const { itemId, amount, userId } = req.body;
    
    console.log('Received bid request:', { itemId, amount, userId });
    
    // Validate required fields
    if (!itemId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing itemId' 
      });
    }
    
    if (!amount) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing amount' 
      });
    }
    
    if (!userId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing userId' 
      });
    }
    
    const result = await bidService.createBid({
      amount: parseFloat(amount),
      userId: parseInt(userId),
      itemId: parseInt(itemId)
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Bid placed successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Failed to place bid' 
    });
  }
};

const closeAuction = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const result = await bidService.closeAuction(itemId);
    
    res.json({
      status: 'success',
      message: 'Auction closed successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error closing auction:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Failed to close auction' 
    });
  }
};

const getBidsByItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const bids = await bidService.getBidsByItemId(itemId);
    
    res.json({
      status: 'success',
      data: bids
    });
    
  } catch (error) {
    console.error('Error getting bids:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch bids' 
    });
  }
};

module.exports = {
  placeBid,
  closeAuction,
  getBidsByItem
};