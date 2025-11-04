"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalModule = void 0;
const common_1 = require("@nestjs/common");
const paymentorder_1 = require("../resolvers/paymentorder");
const PaypalService_1 = require("../services/PaypalService");
const config_1 = require("@nestjs/config");
let PayPalModule = class PayPalModule {
};
exports.PayPalModule = PayPalModule;
exports.PayPalModule = PayPalModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [PaypalService_1.PayPalService, paymentorder_1.PayPalResolver],
        exports: [PaypalService_1.PayPalService],
    })
], PayPalModule);
//# sourceMappingURL=paypal.module.js.map