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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Products_1 = require("../entities/Products");
const ProductInput_1 = require("../inputs/ProductInput");
const Category_1 = require("../entities/Category");
const Company_1 = require("../entities/Company");
const ProductVar_1 = require("../entities/ProductVar");
const slugify_1 = __importDefault(require("slugify"));
const Reviews_1 = require("../entities/Reviews");
const PaginatedProducts_1 = require("../types/PaginatedProducts");
const uuid_1 = require("uuid");
const cache_1 = require("../utils/cache");
const Discount_1 = require("../entities/Discount");
let ProductResolver = class ProductResolver {
    async product(id, { em }) {
        const key = `product.id:${id}`;
        const index = `product:${id}`;
        return (0, cache_1.getOrSetCache)(() => {
            return em.findOne(Products_1.Product, { id, status: Products_1.ProductStatus.ACTIVE }, { populate: ['variations', 'category', 'reviews.user', 'company'] });
        }, {
            key,
            ttl: 300,
            index,
            validate: (data) => !!data && !!data.id
        });
    }
    async myProducts({ em, req }) {
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        return await em.find(Products_1.Product, { company: req.session.companyId }, {
            populate: ['reviews', 'variations']
        });
    }
    async sellerProduct(id, { em, req }) {
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        return await em.findOne(Products_1.Product, { id, company: req.session.companyId }, {
            populate: ['variations', 'category', 'reviews.user', 'company']
        });
    }
    async getSimilarProducts(category, productId, { em }) {
        const categoryEntity = await em.findOne(Category_1.Category, { name: category });
        if (!categoryEntity)
            throw new Error(`Category "${category}" not found.`);
        return await em.find(Products_1.Product, {
            category: categoryEntity.id,
            id: { $ne: productId },
            status: Products_1.ProductStatus.ACTIVE
        }, {
            populate: ['variations']
        });
    }
    async allProductsforadmin({ em }, categoryId, sentiment, minPrice, maxPrice, material) {
        const filters = Object.assign(Object.assign(Object.assign(Object.assign({}, (categoryId && { category: categoryId })), (material && { material })), (sentiment && { sentiment })), ((minPrice !== undefined || maxPrice !== undefined) && {
            price: Object.assign(Object.assign({}, (minPrice !== undefined && { $gte: minPrice })), (maxPrice !== undefined && { $lte: maxPrice })),
        }));
        return await em.find(Products_1.Product, filters, { populate: ["reviews", "variations", "category"] });
    }
    async allProducts({ em }, categoryId, minPrice, maxPrice, material) {
        const filters = Object.assign(Object.assign(Object.assign({ status: Products_1.ProductStatus.ACTIVE }, (categoryId && { category: categoryId })), (material && { material })), ((minPrice !== undefined || maxPrice !== undefined) && {
            price: Object.assign(Object.assign({}, (minPrice !== undefined && { $gte: minPrice })), (maxPrice !== undefined && { $lte: maxPrice })),
        }));
        return await em.find(Products_1.Product, filters, { populate: ["variations", "category", "discount", "discountedPrice"] });
    }
    async getMaterials({ em }, material) {
        const filters = { status: Products_1.ProductStatus.ACTIVE };
        if (material)
            filters.material = material;
        return em.find(Products_1.Product, filters, { populate: ["variations"] });
    }
    async filteredProducts(search, categoryIds, material, minRating, maxRating, minPrice, maxPrice, { em }) {
        const filters = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ status: Products_1.ProductStatus.ACTIVE }, (search && { name: { $ilike: `%${search}%` } })), (categoryIds && { category: { $in: categoryIds } })), (material && { material })), ((minPrice !== undefined || maxPrice !== undefined) && {
            price: Object.assign(Object.assign({}, (minPrice !== undefined && { $gte: minPrice })), (maxPrice !== undefined && { $lte: maxPrice })),
        })), ((minRating !== undefined || maxRating !== undefined) && {
            averageRating: Object.assign(Object.assign({}, (minRating !== undefined && { $gte: minRating })), (maxRating !== undefined && { $lte: maxRating })),
        }));
        return await em.find(Products_1.Product, filters, {
            populate: ["category", 'variations'],
            orderBy: { averageRating: "DESC" },
        });
    }
    async topRatedProducts(limit, { em }) {
        const key = `product:top-rated:${limit}`;
        return (0, cache_1.getOrSetCache)(() => {
            return em.find(Products_1.Product, { status: Products_1.ProductStatus.ACTIVE }, {
                orderBy: { averageRating: "DESC" },
                limit,
                populate: ["reviews", "variations", "category"]
            });
        }, {
            key,
            ttl: 300,
            index: 'product:top-rated'
        });
    }
    async createProduct(input, { em, req }) {
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        const company = await em.findOne(Company_1.Company, { id: req.session.companyId });
        if (!company)
            throw new Error("Company not found");
        const category = await em.findOne(Category_1.Category, { id: input.category });
        if (!category)
            throw new Error("Category not found");
        const baseSlug = (0, slugify_1.default)(input.name, { lower: true, strict: true });
        const uuidSuffix = (0, uuid_1.v4)().split("-")[0];
        const finalSlug = `${baseSlug}-${uuidSuffix}`;
        const product = em.create(Products_1.Product, Object.assign(Object.assign({}, input), { category,
            company, slug: finalSlug, averageRating: 0, soldCount: 0, reviewCount: 0, variations: [], createdAt: new Date(), updatedAt: new Date(), status: Products_1.ProductStatus.ACTIVE, discountedPrice: 0 }));
        if (input.category) {
            const activeDiscounts = await em.find(Discount_1.Discount, {
                category: input.category,
                status: 'active',
                isActive: true,
                startDate: { $lte: new Date() },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: new Date() } }
                ]
            });
            if (activeDiscounts.length > 0) {
                const discount = activeDiscounts[0];
                product.discount = discount;
                if (discount.type === Discount_1.DiscountType.PERCENTAGE) {
                    product.discountedPrice = product.price * (1 - discount.value / 100);
                }
                else {
                    product.discountedPrice = Math.max(0, product.price - discount.value);
                }
            }
        }
        await em.persistAndFlush(product);
        if (input.variations) {
            for (const variationInput of input.variations) {
                const variationSlug = (0, slugify_1.default)(`${product.slug}-${variationInput.size}-${variationInput.color}-${(0, uuid_1.v4)().split("-")[0]}`, { lower: true, strict: true });
                const variation = em.create(ProductVar_1.ProductVariation, Object.assign(Object.assign({}, variationInput), { product, createdAt: new Date(), updatedAt: new Date(), productId: product.id, slug: variationSlug, name: product.name, description: product.description, material: product.material }));
                await em.persistAndFlush(variation);
            }
        }
        return product;
    }
    async updateProducts(id, input, { em, req }) {
        var _a;
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        const product = await em.findOne(Products_1.Product, { id }, { populate: ['variations'] });
        if (!product)
            throw new Error("Product not found");
        if (input.name && input.name !== product.name) {
            const baseSlug = (0, slugify_1.default)(input.name, { lower: true, strict: true });
            const uuidSuffix = (0, uuid_1.v4)().split("-")[0];
            product.slug = `${baseSlug}-${uuidSuffix}`;
            for (const variation of product.variations) {
                const variationSuffix = (0, uuid_1.v4)().split("-")[0];
                variation.slug = (0, slugify_1.default)(`${product.slug}-${variation.size}-${variation.color}-${variationSuffix}`, { lower: true, strict: true });
                variation.name = input.name;
            }
        }
        em.assign(product, input);
        await em.persistAndFlush(product);
        await (0, cache_1.invalidateProductData)(product.id, product.slug, (_a = product.category) === null || _a === void 0 ? void 0 : _a.id);
        return product;
    }
    async deleteProduct(id, { em }) {
        const product = await em.findOne(Products_1.Product, { id });
        if (!product)
            throw new Error("Product not found");
        await em.removeAndFlush(product);
        return product;
    }
    async toggleProductStatus(productId, status, { em }) {
        const product = await em.findOne(Products_1.Product, { id: productId });
        if (!product)
            throw new Error("Product not found");
        product.status = status;
        await em.flush();
        return true;
    }
    async reviews(product, { em }) {
        await em.populate(product, ["reviews"]);
        return product.reviews;
    }
    async productBySlug(slug, { em }) {
        console.log(`🔍 [RESOLVER] ProductBySlug called with slug: ${slug}`);
        const key = `product:slug:${slug}`;
        const index = `product:${slug}`;
        return (0, cache_1.getOrSetCache)(() => {
            console.log(`📦 [RESOLVER] Fetching product from DB for slug: ${slug}`);
            return em.findOne(Products_1.Product, { slug, status: Products_1.ProductStatus.ACTIVE }, { populate: ['variations', 'category', 'company', "reviews", "discount", "discountedPrice"] });
        }, {
            key,
            ttl: 300,
            index,
            validate: (data) => !!data && !!data.id,
        });
    }
    async productsByCategory(name, { em }) {
        const key = `product:ByCategory:${name}`;
        const category = await em.findOne(Category_1.Category, { name });
        if (!category)
            throw new Error("Category not found");
        return (0, cache_1.getOrSetCache)(() => {
            return em.find(Products_1.Product, { category: category.id, status: Products_1.ProductStatus.ACTIVE }, { populate: ["variations", "category"] });
        }, {
            key,
            ttl: 300,
            index: 'products:ByCategory'
        });
    }
    async paginatedProducts({ em }, limit, cursor) {
        const realLimit = Math.min(50, limit);
        const fetchLimit = realLimit + 1;
        const filters = { status: Products_1.ProductStatus.ACTIVE };
        if (cursor)
            filters.createdAt = { $lt: new Date(parseInt(cursor)) };
        const products = await em.find(Products_1.Product, filters, {
            orderBy: { createdAt: "DESC" },
            limit: fetchLimit,
            populate: ["category", "variations", "reviews"]
        });
        const hasMore = products.length === fetchLimit;
        const trimmed = products.slice(0, realLimit);
        return {
            products: trimmed,
            hasMore,
            nextCursor: hasMore
                ? String(new Date(trimmed[trimmed.length - 1].createdAt).getTime())
                : null,
        };
    }
    async paginatedMyProducts({ em, req }, offset, limit) {
        if (!req.session.companyId)
            throw new Error("Not authenticated");
        const realLimit = Math.min(50, limit);
        const [products, total] = await Promise.all([
            em.find(Products_1.Product, { company: req.session.companyId }, {
                offset,
                limit: realLimit,
                orderBy: { createdAt: "DESC" },
                populate: ["category", "variations", "reviews"],
            }),
            em.count(Products_1.Product, { company: req.session.companyId })
        ]);
        return {
            products,
            total,
        };
    }
};
exports.ProductResolver = ProductResolver;
__decorate([
    (0, type_graphql_1.Query)(() => Products_1.Product, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "product", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "myProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Products_1.Product, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "sellerProduct", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("category")),
    __param(1, (0, type_graphql_1.Arg)("productId")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getSimilarProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("category", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("sentiment", () => Reviews_1.ReviewSentiment, { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("minPrice", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("maxPrice", { nullable: true })),
    __param(5, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "allProductsforadmin", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("category", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("minPrice", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("maxPrice", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "allProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getMaterials", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("search", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("category", () => [String], { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("minRating", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("maxRating", { nullable: true })),
    __param(5, (0, type_graphql_1.Arg)("minPrice", { nullable: true })),
    __param(6, (0, type_graphql_1.Arg)("maxPrice", { nullable: true })),
    __param(7, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, Number, Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "filteredProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 5 })),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "topRatedProducts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("input", () => ProductInput_1.ProductInput)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductInput_1.ProductInput, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "createProduct", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("input", () => ProductInput_1.UpdateProductFields)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ProductInput_1.UpdateProductFields, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProducts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProduct", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("productId")),
    __param(1, (0, type_graphql_1.Arg)("status", () => Products_1.ProductStatus)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "toggleProductStatus", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Reviews_1.Review]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Products_1.Product, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "reviews", null);
__decorate([
    (0, type_graphql_1.Query)(() => Products_1.Product, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("slug")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productBySlug", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("name")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productsByCategory", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedProducts_1.PaginatedProducts),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)("cursor", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "paginatedProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedProducts_1.PaginatedProducts),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int, { defaultValue: 0 })),
    __param(2, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "paginatedMyProducts", null);
exports.ProductResolver = ProductResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Products_1.Product)
], ProductResolver);
//# sourceMappingURL=products.js.map