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
exports.Invoice = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const graphql_scalars_1 = require("graphql-scalars");
const Order_1 = require("./Order");
const Company_1 = require("./Company");
let Invoice = class Invoice {
    constructor() {
        this.id = crypto.randomUUID();
        this.status = 'draft';
        this.downloadCount = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.Invoice = Invoice;
__decorate([
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)(),
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, core_1.Property)(),
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Invoice.prototype, "sequentialNumber", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Order_1.Order),
    (0, type_graphql_1.Field)(() => Order_1.Order),
    __metadata("design:type", Order_1.Order)
], Invoice.prototype, "order", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Company_1.Company),
    (0, type_graphql_1.Field)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], Invoice.prototype, "seller", void 0);
__decorate([
    (0, core_1.Property)({ type: "decimal" }),
    (0, type_graphql_1.Field)(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, core_1.Property)(),
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, core_1.Property)(),
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, core_1.Property)({ type: "integer" }),
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Invoice.prototype, "downloadCount", void 0);
__decorate([
    (0, core_1.Property)({ onCreate: () => new Date() }),
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Invoice.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "issuedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "sentAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "paidAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json', nullable: true }),
    (0, type_graphql_1.Field)(() => graphql_scalars_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json', nullable: true }),
    (0, type_graphql_1.Field)(() => graphql_scalars_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "metadata", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "newField", void 0);
exports.Invoice = Invoice = __decorate([
    (0, core_1.Entity)(),
    (0, type_graphql_1.ObjectType)()
], Invoice);
//# sourceMappingURL=Invoice.js.map