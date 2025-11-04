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
exports.DiscountCouponResolver = void 0;
const type_graphql_1 = require("type-graphql");
const DiscountCoupon_1 = require("../entities/DiscountCoupon");
const Company_1 = require("../entities/Company");
const CodeInput_1 = require("../inputs/CodeInput");
let DiscountCouponResolver = class DiscountCouponResolver {
    async createCoupon(discountPercentage, isPublic, validityDays, usageLimit, code, { em, req }) {
        const company = await em.findOneOrFail(Company_1.Company, { id: req.session.companyId });
        let finalCode = code === null || code === void 0 ? void 0 : code.trim();
        if (finalCode) {
            const hasSpecialChar = /[^A-Za-z0-9]/.test(finalCode);
            if (finalCode.length > 15 || !hasSpecialChar) {
                throw new Error("Custom coupon code must be ≤ 15 characters and include at least one special character.");
            }
            const existing = await em.findOne(DiscountCoupon_1.DiscountCoupon, { code: finalCode });
            if (existing) {
                throw new Error("Coupon code already exists. Please choose a different one.");
            }
        }
        else {
            finalCode = await this.generateCouponCode(company.cname, em);
        }
        const coupon = new DiscountCoupon_1.DiscountCoupon(finalCode, discountPercentage, isPublic, new Date(), new Date(Date.now() + validityDays * 86400000), usageLimit, company);
        await em.persistAndFlush(coupon);
        return coupon;
    }
    async createCustomCoupon(input, { em, req }) {
        var _a;
        const company = await em.findOneOrFail(Company_1.Company, { id: req.session.companyId });
        if (!company)
            throw new Error("Not authenticated");
        let finalCode = (_a = input.code) === null || _a === void 0 ? void 0 : _a.trim();
        if (finalCode) {
            const existing = await em.findOne(DiscountCoupon_1.DiscountCoupon, { code: finalCode });
            if (existing)
                throw new Error("Coupon code already exists.");
        }
        else {
            finalCode = await this.generateCouponCode(company.cname, em);
        }
        const now = new Date();
        const validity = input.usageLimit || 30;
        const manualCode = em.create(DiscountCoupon_1.DiscountCoupon, {
            code: finalCode,
            discountPercentage: input.discountPercentage || 0,
            isPublic: false,
            startDate: now,
            endDate: new Date(now.getTime() + validity * 86400000),
            usageLimit: input.usageLimit || 0,
            currentUsage: input.currentUsage || 0,
            company,
            createdAt: now,
            updatedAt: now,
        });
        await em.persistAndFlush(manualCode);
        return manualCode;
    }
    async validateCoupon(code, { em }) {
        const coupon = await em.findOne(DiscountCoupon_1.DiscountCoupon, { code });
        if (!coupon)
            return false;
        const now = new Date();
        return (coupon.currentUsage < coupon.usageLimit &&
            now >= coupon.startDate &&
            now <= coupon.endDate);
    }
    async applyCoupon(code, cartId, { em, req }) {
        const coupon = await em.findOne(DiscountCoupon_1.DiscountCoupon, { code });
        if (!coupon)
            throw new Error("Invalid coupon");
        coupon.currentUsage += 1;
        em.persist(new DiscountCoupon_1.DiscountUsage(coupon, req.session.userId, cartId));
        await em.flush();
        return true;
    }
    async getCompanyCoupons({ em, req }) {
        return em.find(DiscountCoupon_1.DiscountCoupon, {
            company: req.session.companyId
        }, {
            populate: ['usages']
        });
    }
    async generateCouponCode(companyName, em, options = {}) {
        var _a, _b;
        let code;
        let attempts = 0;
        do {
            const base = companyName
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 4);
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const parts = [
                (_a = options.prefix) === null || _a === void 0 ? void 0 : _a.toUpperCase().substring(0, 3),
                base,
                randomNum,
                (_b = options.suffix) === null || _b === void 0 ? void 0 : _b.toUpperCase().substring(0, 3)
            ].filter(Boolean);
            code = parts.join('-FJ#');
            attempts++;
            if (attempts > 5)
                throw new Error("Couldn't generate a unique coupon code.");
        } while (await em.findOne(DiscountCoupon_1.DiscountCoupon, { code }));
        return code;
    }
};
exports.DiscountCouponResolver = DiscountCouponResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => DiscountCoupon_1.DiscountCoupon),
    __param(0, (0, type_graphql_1.Arg)('discountPercentage')),
    __param(1, (0, type_graphql_1.Arg)('isPublic')),
    __param(2, (0, type_graphql_1.Arg)('validityDays')),
    __param(3, (0, type_graphql_1.Arg)('usageLimit')),
    __param(4, (0, type_graphql_1.Arg)('code', () => String, { nullable: true })),
    __param(5, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean, Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], DiscountCouponResolver.prototype, "createCoupon", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => DiscountCoupon_1.DiscountCoupon),
    __param(0, (0, type_graphql_1.Arg)("input", () => CodeInput_1.ManualCodeInput)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CodeInput_1.ManualCodeInput, Object]),
    __metadata("design:returntype", Promise)
], DiscountCouponResolver.prototype, "createCustomCoupon", null);
__decorate([
    (0, type_graphql_1.Query)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('code')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountCouponResolver.prototype, "validateCoupon", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('code')),
    __param(1, (0, type_graphql_1.Arg)('cartId')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DiscountCouponResolver.prototype, "applyCoupon", null);
__decorate([
    (0, type_graphql_1.Query)(() => [DiscountCoupon_1.DiscountCoupon]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscountCouponResolver.prototype, "getCompanyCoupons", null);
exports.DiscountCouponResolver = DiscountCouponResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => DiscountCoupon_1.DiscountCoupon)
], DiscountCouponResolver);
//# sourceMappingURL=discountCoupon.js.map