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
exports.Discount = exports.DiscountType = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Category_1 = require("./Category");
const Company_1 = require("./Company");
const Products_1 = require("./Products");
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED_AMOUNT"] = "FIXED_AMOUNT";
    DiscountType["SPEND_THRESHOLD"] = "SPEND_THRESHOLD";
    DiscountType["QUANTITY_THRESHOLD"] = "QUANTITY_THRESHOLD";
    DiscountType["BOGO"] = "BOGO";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
(0, type_graphql_1.registerEnumType)(DiscountType, { name: "DiscountType" });
let Discount = class Discount {
    constructor() {
        this.id = crypto.randomUUID();
        this.startDate = new Date();
        this.isActive = false;
    }
    checkStatus() {
        const now = new Date();
        if (this.status === "archived")
            return;
        if (this.endDate && now > this.endDate) {
            this.status = "expired";
            this.isActive = false;
        }
        else if (now >= this.startDate && (!this.endDate || now <= this.endDate)) {
            this.status = "active";
            this.isActive = true;
        }
        else if (now < this.startDate) {
            this.status = "draft";
            this.isActive = false;
        }
    }
};
exports.Discount = Discount;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Discount.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], Discount.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Products_1.Product, { nullable: true }),
    (0, core_1.ManyToOne)(() => Products_1.Product, { nullable: true }),
    __metadata("design:type", Products_1.Product)
], Discount.prototype, "product", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Category_1.Category, { nullable: true }),
    (0, core_1.ManyToOne)(() => Category_1.Category, { nullable: true }),
    __metadata("design:type", Category_1.Category)
], Discount.prototype, "category", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "varchar", length: 20, default: "draft" }),
    __metadata("design:type", String)
], Discount.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => DiscountType),
    (0, core_1.Enum)(() => DiscountType),
    __metadata("design:type", String)
], Discount.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "integer" }),
    __metadata("design:type", Number)
], Discount.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Discount.prototype, "thresholdAmount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Discount.prototype, "thresholdQuantity", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Discount.prototype, "bogoBuy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Discount.prototype, "bogoGet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Discount.prototype, "bogoDiscount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], Discount.prototype, "startDate", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Discount.prototype, "endDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: false }),
    __metadata("design:type", Boolean)
], Discount.prototype, "isActive", void 0);
exports.Discount = Discount = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], Discount);
//# sourceMappingURL=Discount.js.map