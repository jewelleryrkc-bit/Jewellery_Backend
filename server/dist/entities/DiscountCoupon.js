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
exports.DiscountUsage = exports.DiscountCoupon = void 0;
const core_1 = require("@mikro-orm/core");
const Company_1 = require("./Company");
const type_graphql_1 = require("type-graphql");
let DiscountCoupon = class DiscountCoupon {
    constructor(code, discountPercentage, isPublic, startDate, endDate, usageLimit, company) {
        this.id = crypto.randomUUID();
        this.currentUsage = 0;
        this.usages = new core_1.Collection(this);
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.code = code;
        this.discountPercentage = discountPercentage;
        this.isPublic = isPublic;
        this.startDate = startDate;
        this.endDate = endDate;
        this.usageLimit = usageLimit;
        this.company = company;
    }
};
exports.DiscountCoupon = DiscountCoupon;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], DiscountCoupon.prototype, "code", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "discountPercentage", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Boolean)
], DiscountCoupon.prototype, "isPublic", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], DiscountCoupon.prototype, "startDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], DiscountCoupon.prototype, "endDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "usageLimit", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: 0 }),
    __metadata("design:type", Number)
], DiscountCoupon.prototype, "currentUsage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], DiscountCoupon.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DiscountUsage]),
    (0, core_1.OneToMany)(() => DiscountUsage, usage => usage.coupon),
    __metadata("design:type", Object)
], DiscountCoupon.prototype, "usages", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], DiscountCoupon.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], DiscountCoupon.prototype, "updatedAt", void 0);
exports.DiscountCoupon = DiscountCoupon = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [String, Number, Boolean, Date,
        Date, Number, Company_1.Company])
], DiscountCoupon);
let DiscountUsage = class DiscountUsage {
    constructor(coupon, userId, orderId) {
        this.id = crypto.randomUUID();
        this.usedAt = new Date();
        this.coupon = coupon;
        this.userId = userId;
        this.orderId = orderId;
    }
};
exports.DiscountUsage = DiscountUsage;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], DiscountUsage.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => DiscountCoupon),
    (0, core_1.ManyToOne)(() => DiscountCoupon),
    __metadata("design:type", DiscountCoupon)
], DiscountUsage.prototype, "coupon", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DiscountUsage.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], DiscountUsage.prototype, "usedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], DiscountUsage.prototype, "orderId", void 0);
exports.DiscountUsage = DiscountUsage = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [DiscountCoupon, String, String])
], DiscountUsage);
//# sourceMappingURL=DiscountCoupon.js.map