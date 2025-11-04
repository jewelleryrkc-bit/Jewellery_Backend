"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalResolver = void 0;
const type_graphql_1 = require("type-graphql");
const PaypalService_1 = require("../services/PaypalService");
const PaymentOrder_1 = require("../entities/PaymentOrder");
let PayPalResolver = class PayPalResolver {
    constructor() {
        this.paypalService = new PaypalService_1.PayPalService();
    }
    async createPayPalCheckout(amount, orderId, currency) {
        const result = await this.paypalService.createCheckout(amount, orderId, currency);
        return result.approvalUrl;
    }
    async capturePayPalPayment(paypalOrderId) {
        await this.paypalService.capturePayment(paypalOrderId);
        return true;
    }
    async getPayPalOrderStatus(paypalOrderId) {
        const order = await this.paypalService.getOrderStatus(paypalOrderId);
        return order.status;
    }
};
exports.PayPalResolver = PayPalResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => String),
    __param(0, (0, type_graphql_1.Arg)("amount")),
    __param(1, (0, type_graphql_1.Arg)("orderId")),
    __param(2, (0, type_graphql_1.Arg)("currency", { defaultValue: 'USD' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], PayPalResolver.prototype, "createPayPalCheckout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("paypalOrderId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayPalResolver.prototype, "capturePayPalPayment", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __param(0, (0, type_graphql_1.Arg)("paypalOrderId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayPalResolver.prototype, "getPayPalOrderStatus", null);
exports.PayPalResolver = PayPalResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => PaymentOrder_1.PayPalPayment)
], PayPalResolver);
//# sourceMappingURL=paymentorder.js.map