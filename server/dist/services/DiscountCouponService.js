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
exports.DiscountService = void 0;
const DiscountCoupon_1 = require("../entities/DiscountCoupon");
const Company_1 = require("../entities/Company");
const typedi_1 = require("typedi");
class DiscountService {
    constructor(em) {
        this.em = em;
    }
    async generateCoupon(company, discountPercentage, isPublic, validityDays, usageLimit) {
        const code = this.generateCouponCode(company.cname);
        const endDate = new Date(Date.now() + validityDays * 86400000);
        const coupon = new DiscountCoupon_1.DiscountCoupon(code, discountPercentage, isPublic, new Date(), endDate, usageLimit, company);
        await this.em.persistAndFlush(coupon);
        return coupon;
    }
    generateCouponCode(companyName, options) {
        var _a, _b;
        const base = companyName
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 4);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const parts = [
            (_a = options === null || options === void 0 ? void 0 : options.prefix) === null || _a === void 0 ? void 0 : _a.toUpperCase().substring(0, 3),
            base,
            randomNum,
            (_b = options === null || options === void 0 ? void 0 : options.suffix) === null || _b === void 0 ? void 0 : _b.toUpperCase().substring(0, 3)
        ].filter(Boolean);
        return parts.join('-');
    }
    async validateCoupon(code) {
        const coupon = await this.em.findOne(DiscountCoupon_1.DiscountCoupon, { code });
        if (!coupon)
            return { valid: false, message: 'Invalid coupon code' };
        if (coupon.currentUsage >= coupon.usageLimit) {
            return { valid: false, message: 'Coupon usage limit reached' };
        }
        const now = new Date();
        if (now < coupon.startDate)
            return { valid: false, message: 'Coupon not yet valid' };
        if (now > coupon.endDate)
            return { valid: false, message: 'Coupon has expired' };
        return { valid: true, discount: coupon.discountPercentage };
    }
    async recordCouponUsage(code, userId, orderId) {
        const coupon = await this.em.findOne(DiscountCoupon_1.DiscountCoupon, { code });
        if (!coupon)
            throw new Error('Invalid coupon code');
        if (coupon.currentUsage >= coupon.usageLimit) {
            throw new Error('Coupon usage limit reached');
        }
        const usage = new DiscountCoupon_1.DiscountUsage(coupon, userId, orderId);
        coupon.currentUsage += 1;
        await this.em.persistAndFlush([usage, coupon]);
    }
    async getCompanyCoupons(companyId, includePrivate = false) {
        const where = { company: companyId };
        if (!includePrivate)
            where.isPublic = true;
        return this.em.find(DiscountCoupon_1.DiscountCoupon, where);
    }
}
exports.DiscountService = DiscountService;
__decorate([
    (0, typedi_1.Service)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Company_1.Company, Number, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], DiscountService.prototype, "generateCoupon", null);
//# sourceMappingURL=DiscountCouponService.js.map