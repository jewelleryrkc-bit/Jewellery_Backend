// src/paypal/paypal.config.ts
import { registerAs } from '@nestjs/config';
require("dotenv").config();

export default registerAs('paypal', () => ({
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: process.env.PAYPAL_MODE || 'sandbox', // Using PAYPAL_MODE instead
  apiUrl: process.env.PAYPAL_MODE === 'live' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com',
}));