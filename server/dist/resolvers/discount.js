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
exports.DiscountResolver = exports.DiscountInput = void 0;
const type_graphql_1 = require("type-graphql");
const Category_1 = require("../entities/Category");
const Company_1 = require("../entities/Company");
const Discount_1 = require("../entities/Discount");
const Products_1 = require("../entities/Products");
let DiscountInput = class DiscountInput {
};
exports.DiscountInput = DiscountInput;
__decorate([
    (0, type_graphql_1.Field)(() => Discount_1.DiscountType),
    __metadata("design:type", String)
], DiscountInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], DiscountInput.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], DiscountInput.prototype, "startDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DiscountInput.prototype, "endDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DiscountInput.prototype, "thresholdAmount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DiscountInput.prototype, "thresholdQuantity", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DiscountInput.prototype, "bogoBuy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DiscountInput.prototype, "bogoGet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DiscountInput.prototype, "bogoDiscount", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DiscountInput.prototype, "productId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DiscountInput.prototype, "categoryId", void 0);
exports.DiscountInput = DiscountInput = __decorate([
    (0, type_graphql_1.InputType)()
], DiscountInput);
const allowedStatuses = ['draft', 'active', 'expired', 'archived'];
let DiscountResolver = class DiscountResolver {
    async discounts({ em }) {
        return em.find(Discount_1.Discount, {}, {
            populate: ["company", "product", "category"]
        });
    }
    async discount(id, { em }) {
        return em.findOne(Discount_1.Discount, { id }, {
            populate: ["company", "product", "category"]
        });
    }
    async discountsByCompany(companyId, { em }) {
        return em.find(Discount_1.Discount, {
            company: { id: companyId }
        }, {
            populate: ["product", "category"]
        });
    }
    async getSellerDiscounts({ em, req }) {
        if (!req.session.companyId) {
            throw new Error("Not authenticated");
        }
        return em.find(Discount_1.Discount, {
            company: req.session.companyId
        }, {
            populate: ['category', 'product', 'company']
        });
    }
    async getAllDiscount({ em, req }) {
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        return await em.find(Discount_1.Discount, { company: req.session.companyId }, { populate: ['product'] });
    }
    async getCategoryDiscounts(categoryId, { em }) {
        return em.find(Discount_1.Discount, {
            category: categoryId,
            status: 'active',
            isActive: true,
            startDate: { $lte: new Date() },
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        });
    }
    async createDiscount(input, { em, req }) {
        const company = await em.findOneOrFail(Company_1.Company, { id: req.session.companyId });
        this.validateDiscountInput(input);
        if (input.type === Discount_1.DiscountType.PERCENTAGE && (input.value < 1 || input.value > 99)) {
            throw new Error("Percentage must be between 1-99");
        }
        if (input.type === Discount_1.DiscountType.FIXED_AMOUNT && (input.value < 10 || input.value > 50)) {
            throw new Error("Fixed amount must be between $10-$50");
        }
        if (input.endDate && new Date(input.endDate) <= new Date()) {
            throw new Error("End date must be in the future");
        }
        const discountData = {
            company,
            type: input.type,
            value: input.value,
            startDate: input.startDate,
            endDate: input.endDate || undefined,
            isActive: true,
            status: 'draft'
        };
        if (input.productId) {
            discountData.product = await em.findOneOrFail(Products_1.Product, { id: input.productId });
        }
        if (input.categoryId) {
            discountData.category = await em.findOneOrFail(Category_1.Category, { id: input.categoryId });
        }
        switch (input.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                discountData.thresholdAmount = input.thresholdAmount;
                break;
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                discountData.thresholdQuantity = input.thresholdQuantity;
                break;
            case Discount_1.DiscountType.BOGO:
                discountData.bogoBuy = input.bogoBuy;
                discountData.bogoGet = input.bogoGet;
                discountData.bogoDiscount = input.bogoDiscount || 100;
                break;
        }
        const discount = em.create(Discount_1.Discount, discountData);
        discount.checkStatus();
        await em.persistAndFlush(discount);
        return discount;
    }
    async updateDiscount(id, input, { em }) {
        const discount = await em.findOneOrFail(Discount_1.Discount, { id });
        this.validateDiscountInput(input);
        discount.type = input.type;
        discount.value = input.value;
        discount.startDate = input.startDate;
        discount.endDate = input.endDate || undefined;
        discount.thresholdAmount = undefined;
        discount.thresholdQuantity = undefined;
        discount.bogoBuy = undefined;
        discount.bogoGet = undefined;
        discount.bogoDiscount = undefined;
        switch (input.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                discount.thresholdAmount = input.thresholdAmount;
                break;
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                discount.thresholdQuantity = input.thresholdQuantity;
                break;
            case Discount_1.DiscountType.BOGO:
                discount.bogoBuy = input.bogoBuy;
                discount.bogoGet = input.bogoGet;
                discount.bogoDiscount = input.bogoDiscount || 100;
                break;
        }
        discount.checkStatus();
        await em.flush();
        return discount;
    }
    async updateDiscountStatus(id, status, { em }) {
        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid status value");
        }
        const discount = await em.findOne(Discount_1.Discount, { id });
        if (!discount)
            throw new Error("Discount not found");
        discount.status = status;
        discount.isActive = status === 'active';
        await em.persistAndFlush(discount);
        return discount;
    }
    async deleteDiscount(id, { em }) {
        try {
            const discount = await em.findOneOrFail(Discount_1.Discount, { id });
            await em.removeAndFlush(discount);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async activateDiscount(id, { em }) {
        const discount = await em.findOneOrFail(Discount_1.Discount, { id });
        discount.isActive = true;
        discount.status = "active";
        await em.flush();
        return discount;
    }
    async deactivateDiscount(id, { em }) {
        const discount = await em.findOneOrFail(Discount_1.Discount, { id });
        discount.isActive = false;
        discount.status = "draft";
        await em.flush();
        return discount;
    }
    async applyDiscount(productId, discountId, { em, req }) {
        const product = await em.findOne(Products_1.Product, {
            id: productId,
            company: req.session.companyId
        });
        if (!product)
            throw new Error("Product not found");
        const discount = await em.findOne(Discount_1.Discount, {
            id: discountId,
            company: req.session.companyId
        });
        if (!discount)
            throw new Error("Discount not found");
        this.validateDiscountApplication(discount);
        this.applyDiscountToProduct(product, discount);
        product.discount = discount;
        await em.persistAndFlush(product);
        return product;
    }
    async applyDiscountonCategory(discountId, categoryId, { em, req }) {
        const discount = await em.findOne(Discount_1.Discount, {
            id: discountId,
            company: req.session.companyId
        });
        if (!discount)
            throw new Error("Discount not found");
        const category = await em.findOne(Category_1.Category, { id: categoryId });
        if (!category)
            throw new Error("Category not found");
        this.validateDiscountApplication(discount);
        const products = await em.find(Products_1.Product, {
            category: categoryId,
            company: req.session.companyId,
            status: Products_1.ProductStatus.ACTIVE
        }, {
            populate: ['category', 'subcategory']
        });
        const updatedProducts = [];
        for (const product of products) {
            this.applyDiscountToProduct(product, discount);
            product.discount = discount;
            updatedProducts.push(product);
        }
        await em.persistAndFlush(updatedProducts);
        return updatedProducts;
    }
    validateDiscountInput(input) {
        switch (input.type) {
            case Discount_1.DiscountType.SPEND_THRESHOLD:
                if (!input.thresholdAmount) {
                    throw new Error("Threshold amount is required for spend threshold discounts");
                }
                break;
            case Discount_1.DiscountType.QUANTITY_THRESHOLD:
                if (!input.thresholdQuantity) {
                    throw new Error("Threshold quantity is required for quantity threshold discounts");
                }
                break;
            case Discount_1.DiscountType.BOGO:
                if (!input.bogoBuy || !input.bogoGet) {
                    throw new Error("Buy and Get quantities are required for BOGO discounts");
                }
                if (input.bogoDiscount && (input.bogoDiscount < 0 || input.bogoDiscount > 100)) {
                    throw new Error("BOGO discount must be between 0 and 100 percent");
                }
                break;
        }
    }
    validateDiscountApplication(discount) {
        if (discount.status !== 'active') {
            throw new Error("Discount is not active");
        }
        const now = new Date();
        if (now < discount.startDate) {
            throw new Error("Discount hasn't started yet");
        }
        if (discount.endDate && now > discount.endDate) {
            throw new Error("Discount has expired");
        }
        if ([Discount_1.DiscountType.SPEND_THRESHOLD, Discount_1.DiscountType.QUANTITY_THRESHOLD].includes(discount.type)) {
            throw new Error("Threshold-based discounts can only be applied during checkout");
        }
    }
    applyDiscountToProduct(product, discount) {
        if (discount.type === Discount_1.DiscountType.PERCENTAGE) {
            product.discountedPrice = product.price * (1 - discount.value / 100);
        }
        else if (discount.type === Discount_1.DiscountType.FIXED_AMOUNT) {
            product.discountedPrice = Math.max(0, product.price - discount.value);
        }
        else {
            product.discountedPrice = undefined;
        }
    }
};
exports.DiscountResolver = DiscountResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [Discount_1.Discount]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "discounts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Discount_1.Discount, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "discount", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Discount_1.Discount]),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "discountsByCompany", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Discount_1.Discount]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "getSellerDiscounts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Discount_1.Discount]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "getAllDiscount", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Discount_1.Discount]),
    __param(0, (0, type_graphql_1.Arg)("categoryId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "getCategoryDiscounts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Discount_1.Discount),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DiscountInput, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "createDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Discount_1.Discount),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DiscountInput, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "updateDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Discount_1.Discount),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("status")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "updateDiscountStatus", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "deleteDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Discount_1.Discount),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "activateDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Discount_1.Discount),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "deactivateDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("productId")),
    __param(1, (0, type_graphql_1.Arg)("discountId")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "applyDiscount", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("discountId")),
    __param(1, (0, type_graphql_1.Arg)("categoryId")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DiscountResolver.prototype, "applyDiscountonCategory", null);
exports.DiscountResolver = DiscountResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Discount_1.Discount)
], DiscountResolver);
//# sourceMappingURL=discount.js.map