"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
require("dotenv").config();
class PayPalService {
    constructor(config) {
        this.clientId = (config === null || config === void 0 ? void 0 : config.clientId) || process.env.PAYPAL_CLIENT_ID;
        this.clientSecret = (config === null || config === void 0 ? void 0 : config.clientSecret) || process.env.PAYPAL_CLIENT_SECRET;
        const mode = (config === null || config === void 0 ? void 0 : config.mode) || process.env.PAYPAL_MODE || 'sandbox';
        this.frontendUrl = (config === null || config === void 0 ? void 0 : config.frontendUrl) || process.env.FRONTEND_URL || 'http://localhost:3000';
        this.baseUrl = mode === 'live'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com';
    }
    async getAccessToken() {
        var _a;
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        try {
            const res = await axios_1.default.post(`${this.baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return res.data.access_token;
        }
        catch (err) {
            console.error('PayPal auth error:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err);
            throw new common_1.BadRequestException('Could not authenticate with PayPal');
        }
    }
    async callPayPal(method, path, body) {
        var _a;
        const token = await this.getAccessToken();
        try {
            const res = await axios_1.default.request({
                method,
                url: `${this.baseUrl}${path}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: body,
            });
            return res.data;
        }
        catch (err) {
            console.error('PayPal API error:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err);
            throw new common_1.BadRequestException('PayPal API request failed');
        }
    }
    async createCheckout(amount, orderId, currency = 'USD') {
        var _a;
        const body = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: { currency_code: currency, value: amount.toFixed(2) },
                    reference_id: orderId,
                },
            ],
            application_context: {
                return_url: `${this.frontendUrl}/paypal/success`,
                cancel_url: `${this.frontendUrl}/paypal/cancel`,
                brand_name: process.env.APP_NAME || 'Your Store',
                user_action: 'PAY_NOW',
            },
        };
        const order = await this.callPayPal('POST', '/v2/checkout/orders', body);
        const approvalUrl = (_a = order.links.find((l) => l.rel === 'approve')) === null || _a === void 0 ? void 0 : _a.href;
        if (!approvalUrl) {
            throw new Error('No approval URL found in PayPal response');
        }
        return {
            approvalUrl,
            paypalOrderId: order.id,
        };
    }
    async capturePayment(paypalOrderId) {
        return this.callPayPal('POST', `/v2/checkout/orders/${paypalOrderId}/capture`);
    }
    async getOrderStatus(paypalOrderId) {
        return this.callPayPal('GET', `/v2/checkout/orders/${paypalOrderId}`);
    }
}
exports.PayPalService = PayPalService;
//# sourceMappingURL=PaypalService.js.map