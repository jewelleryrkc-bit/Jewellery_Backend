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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalPayment = exports.PayPalPaymentStatus = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Order_1 = require("./Order");
const User_1 = require("./User");
var PayPalPaymentStatus;
(function (PayPalPaymentStatus) {
    PayPalPaymentStatus["CREATED"] = "CREATED";
    PayPalPaymentStatus["APPROVED"] = "APPROVED";
    PayPalPaymentStatus["COMPLETED"] = "COMPLETED";
    PayPalPaymentStatus["FAILED"] = "FAILED";
    PayPalPaymentStatus["CANCELLED"] = "CANCELLED";
})(PayPalPaymentStatus || (exports.PayPalPaymentStatus = PayPalPaymentStatus = {}));
let PayPalPayment = class PayPalPayment {
    constructor() {
        this.id = crypto.randomUUID();
        this.status = PayPalPaymentStatus.CREATED;
        this.currency = 'USD';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.PayPalPayment = PayPalPayment;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], PayPalPayment.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], PayPalPayment.prototype, "paypalOrderId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], PayPalPayment.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float),
    (0, core_1.Property)({ type: "decimal" }),
    __metadata("design:type", Number)
], PayPalPayment.prototype, "amount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], PayPalPayment.prototype, "currency", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], PayPalPayment.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], PayPalPayment.prototype, "payerEmail", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], PayPalPayment.prototype, "payerName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], PayPalPayment.prototype, "approvalUrl", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], PayPalPayment.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], PayPalPayment.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Order_1.Order, { nullable: true }),
    (0, type_graphql_1.Field)(() => Order_1.Order, { nullable: true }),
    __metadata("design:type", Order_1.Order)
], PayPalPayment.prototype, "order", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], PayPalPayment.prototype, "user", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PayPalPayment.prototype, "paypalResponse", void 0);
exports.PayPalPayment = PayPalPayment = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], PayPalPayment);
//# sourceMappingURL=PaymentOrder.js.map