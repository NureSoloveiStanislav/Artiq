const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

const configureEnvironment = () => {
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
};

const client = () => {
  return new paypal.core.PayPalHttpClient(configureEnvironment());
};

module.exports = { client };