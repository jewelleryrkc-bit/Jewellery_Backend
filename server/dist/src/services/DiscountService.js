"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountService = void 0;
const Discount_1 = require("../entities/Discount");
const DiscountCoupon_1 = require("../entities/DiscountCoupon");
class DiscountService {
    constructor(em) {
        this.em = em;
    }
    static applyDiscounts(cartItems, discounts) {
        let totalDiscount = 0;
        const discountBreakdown = [];
        const appliedDiscounts = new Set();
        const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountTypesOrder = [
            Discount_1.DiscountType.BOGO,
            Discount_1.DiscountType.PERCENTAGE,
            Discount_1.DiscountType.FIXED_AMOUNT,
            Discount_1.DiscountType.QUANTITY_THRESHOLD,
            Discount_1.DiscountType.SPEND_THRESHOLD
        ];
        for (const discountType of discountTypesOrder) {
            const typeDiscounts = discounts.filter(d => d.type === discountType && !appliedDiscounts.has(d.id));
            for (const discount of typeDiscounts) {
                if (this.isDiscountApplicable(discount, cartItems)) {
                    const discountAmount = this.applySingleDiscount(cartItems, discount, totalDiscount, originalSubtotal);
                    if (discountAmount > 0) {
                        totalDiscount += discountAmount;
                        appliedDiscounts.add(discount.id);
                        discountBreakdown.push({
                            discountId: discount.id,
                            amount: discountAmount,
                            type: discount.type,
                            name: this.getDiscountName(discount),
                            appliedTo: discount.product ? 'product' : discount.category ? 'category' : 'cart'
                        });
                        if (totalDiscount > originalSubtotal) {
                            totalDiscount = originalSubtotal;
                            break;
                        }
                    }
                }
            }
        }
        return { totalDiscount, discountBreakdown };
    }
    static isDiscountApplicable(discount, cartItems) {
        if (!discount.isActive)
            return false;
        const now = new Date();
        if (now < discount.startDate)
            return false;
        if (discount.endDate && now > discount.endDate)
            return false;
        if (discount.product) {
            return cartItems.some(item => item.productId === discount.product.id);
        }
        if (discount.category) {
            return cartItems.some(item => item.categoryId === discount.category.id);
        }
        switch (discount.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return subtotal >= (discount.thresholdAmount || 0);
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                return totalQuantity >= (discount.thresholdQuantity || 0);
            default:
                return true;
        }
    }
    static applySingleDiscount(cartItems, discount, currentTotalDiscount, originalSubtotal) {
        const remainingBudget = originalSubtotal - currentTotalDiscount;
        if (remainingBudget <= 0)
            return 0;
        switch (discount.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                return this.applySpendThresholdDiscount(cartItems, discount, remainingBudget);
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                return this.applyQuantityThresholdDiscount(cartItems, discount, remainingBudget);
            case Discount_1.DiscountType.BOGO:
                return this.applyBogoDiscount(cartItems, discount, remainingBudget);
            case Discount_1.DiscountType.PERCENTAGE:
                return this.applyPercentageDiscount(cartItems, discount, remainingBudget);
            case Discount_1.DiscountType.FIXED_AMOUNT:
                return this.applyFixedAmountDiscount(cartItems, discount, remainingBudget);
            default:
                return 0;
        }
    }
    static applySpendThresholdDiscount(cartItems, discount, remainingBudget) {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (subtotal >= discount.thresholdAmount) {
            const discountAmount = discount.value <= 100
                ? subtotal * (discount.value / 100)
                : discount.value;
            return Math.min(discountAmount, remainingBudget);
        }
        return 0;
    }
    static applyQuantityThresholdDiscount(cartItems, discount, remainingBudget) {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity >= discount.thresholdQuantity) {
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = discount.value <= 100
                ? subtotal * (discount.value / 100)
                : discount.value;
            return Math.min(discountAmount, remainingBudget);
        }
        return 0;
    }
    static applyBogoDiscount(cartItems, discount, remainingBudget) {
        let totalDiscount = 0;
        const buy = discount.bogoBuy || 1;
        const get = discount.bogoGet || 1;
        const discountPercent = discount.bogoDiscount || 100;
        for (const item of cartItems) {
            if (discount.product && item.productId !== discount.product.id)
                continue;
            if (discount.category && item.categoryId !== discount.category.id)
                continue;
            const sets = Math.floor(item.quantity / (buy + get));
            const freeItems = sets * get;
            const itemDiscount = freeItems * item.price * (discountPercent / 100);
            totalDiscount += Math.min(itemDiscount, remainingBudget - totalDiscount);
            if (totalDiscount >= remainingBudget) {
                totalDiscount = remainingBudget;
                break;
            }
        }
        return totalDiscount;
    }
    static applyPercentageDiscount(cartItems, discount, remainingBudget) {
        let applicableItemsTotal = 0;
        for (const item of cartItems) {
            if (discount.product && item.productId !== discount.product.id)
                continue;
            if (discount.category && item.categoryId !== discount.category.id)
                continue;
            applicableItemsTotal += item.price * item.quantity;
        }
        const discountAmount = applicableItemsTotal * (discount.value / 100);
        return Math.min(discountAmount, remainingBudget);
    }
    static applyFixedAmountDiscount(cartItems, discount, remainingBudget) {
        let applicableItemsTotal = 0;
        for (const item of cartItems) {
            if (discount.product && item.productId !== discount.product.id)
                continue;
            if (discount.category && item.categoryId !== discount.category.id)
                continue;
            applicableItemsTotal += item.price * item.quantity;
        }
        if (discount.product || discount.category) {
            const totalSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const proportion = applicableItemsTotal / totalSubtotal;
            const proportionalDiscount = discount.value * proportion;
            return Math.min(proportionalDiscount, remainingBudget);
        }
        return Math.min(discount.value, remainingBudget);
    }
    static getDiscountName(discount) {
        switch (discount.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                return `Spend $${discount.thresholdAmount}, get ${discount.value}% off`;
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                return `Buy ${discount.thresholdQuantity} items, get ${discount.value}% off`;
            case Discount_1.DiscountType.BOGO:
                return `Buy ${discount.bogoBuy}, get ${discount.bogoGet} ${discount.bogoDiscount === 100 ? 'free' : `at ${discount.bogoDiscount}% off`}`;
            case Discount_1.DiscountType.PERCENTAGE:
                return `${discount.value}% off ${discount.product ? 'product' : discount.category ? 'category' : ''}`;
            case Discount_1.DiscountType.FIXED_AMOUNT:
                return `$${discount.value} off ${discount.product ? 'product' : discount.category ? 'category' : ''}`;
            default:
                return `${discount.value}% off`;
        }
    }
    async generateCoupon(company, discountPercentage, isPublic, validityDays, usageLimit) {
        const code = this.generateCouponCode(company.cname);
        const endDate = new Date(Date.now() + validityDays * 86400000);
        const coupon = new DiscountCoupon_1.DiscountCoupon(code, discountPercentage, isPublic, new Date(), endDate, usageLimit, company);
        await this.em.persistAndFlush(coupon);
        return coupon;
    }
    generateCouponCode(companyName) {
        const base = companyName
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 4);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${base}-${randomNum}`;
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
//# sourceMappingURL=DiscountService.js.map