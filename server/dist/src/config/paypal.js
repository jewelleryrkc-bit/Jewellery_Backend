"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
require("dotenv").config();
exports.default = (0, config_1.registerAs)('paypal', () => ({
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_MODE || 'sandbox',
    apiUrl: process.env.PAYPAL_MODE === 'live'
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com',
}));
//# sourceMappingURL=paypal.js.map