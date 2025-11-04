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
exports.InvoiceResponse = exports.InvoiceTypes = exports.InvoiceMetadata = exports.InvoiceItem = void 0;
const type_graphql_1 = require("type-graphql");
const Order_1 = require("../entities/Order");
const Company_1 = require("../entities/Company");
const Invoice_1 = require("../entities/Invoice");
let InvoiceItem = class InvoiceItem {
};
exports.InvoiceItem = InvoiceItem;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], InvoiceItem.prototype, "product", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "quantity", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "price", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "total", void 0);
exports.InvoiceItem = InvoiceItem = __decorate([
    (0, type_graphql_1.ObjectType)()
], InvoiceItem);
let InvoiceMetadata = class InvoiceMetadata {
};
exports.InvoiceMetadata = InvoiceMetadata;
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceMetadata.prototype, "orderDate", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], InvoiceMetadata.prototype, "customer", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], InvoiceMetadata.prototype, "discounts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], InvoiceMetadata.prototype, "tax", void 0);
exports.InvoiceMetadata = InvoiceMetadata = __decorate([
    (0, type_graphql_1.ObjectType)()
], InvoiceMetadata);
let InvoiceTypes = class InvoiceTypes {
};
exports.InvoiceTypes = InvoiceTypes;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    __metadata("design:type", String)
], InvoiceTypes.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], InvoiceTypes.prototype, "invoiceNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceTypes.prototype, "sequentialNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Order_1.Order),
    __metadata("design:type", Order_1.Order)
], InvoiceTypes.prototype, "order", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], InvoiceTypes.prototype, "seller", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceTypes.prototype, "totalAmount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], InvoiceTypes.prototype, "currency", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], InvoiceTypes.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceTypes.prototype, "downloadCount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], InvoiceTypes.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], InvoiceTypes.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceTypes.prototype, "issuedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceTypes.prototype, "sentAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceTypes.prototype, "paidAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [InvoiceItem], { nullable: true }),
    __metadata("design:type", Array)
], InvoiceTypes.prototype, "items", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => InvoiceMetadata, { nullable: true }),
    __metadata("design:type", InvoiceMetadata)
], InvoiceTypes.prototype, "metadata", void 0);
exports.InvoiceTypes = InvoiceTypes = __decorate([
    (0, type_graphql_1.ObjectType)()
], InvoiceTypes);
let InvoiceResponse = class InvoiceResponse {
};
exports.InvoiceResponse = InvoiceResponse;
__decorate([
    (0, type_graphql_1.Field)(() => [Invoice_1.Invoice]),
    __metadata("design:type", Array)
], InvoiceResponse.prototype, "invoices", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceResponse.prototype, "total", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceResponse.prototype, "page", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceResponse.prototype, "totalPages", void 0);
exports.InvoiceResponse = InvoiceResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], InvoiceResponse);
//# sourceMappingURL=InvoiceTypes.js.map