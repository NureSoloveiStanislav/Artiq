const express = require('express');
const router = express.Router();
const { client } = require('../payments/paypal');
const paypal = require('@paypal/checkout-server-sdk');

router.post('/paypal/create-order', async (req, res) => {
  try {
    const { total } = req.body;
    
    if (!total || total <= 0) {
      return res.status(400).json({ 
        error: 'Invalid total amount' 
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: total.toString()
        }
      }]
    });

    const order = await client().execute(request);
    
    res.json({
      orderID: order.result.id
    });
    
  } catch (err) {
    console.error('Error creating PayPal order:', err);
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      details: err.message
    });
  }
});

router.post('/paypal/capture-order/:orderID', async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ 
        error: 'Order ID is required' 
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client().execute(request);
    
    res.json({
      status: capture.result.status,
      orderID: capture.result.id,
      payerID: capture.result.payer?.payer_id,
      captureID: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    });
    
  } catch (err) {
    console.error('Error capturing PayPal order:', err);
    res.status(500).json({ 
      error: 'Failed to capture PayPal order',
      details: err.message
    });
  }
});

module.exports = router;