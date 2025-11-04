"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoneerService = void 0;
class PayoneerService {
    async createCheckout(order) {
        return `https://payoneer-mock.test/checkout?order=${order.id}`;
    }
    async capturePayment(providerOrderId) {
        return `PAYONEER-TXN-${providerOrderId}`;
    }
}
exports.PayoneerService = PayoneerService;
//# sourceMappingURL=PayoneerService.js.map