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
exports.BoughtProductResolver = void 0;
const Company_1 = require("../entities/Company");
const BoughtProduct_1 = require("../entities/BoughtProduct");
const Products_1 = require("../entities/Products");
const type_graphql_1 = require("type-graphql");
let BoughtProductResolver = class BoughtProductResolver {
    async hasUserBoughtProduct(productId, { em, req }) {
        const userId = req.session.userId;
        if (!userId)
            throw new Error("Not authenticated");
        const boughtRecord = await em.findOne(BoughtProduct_1.BoughtProduct, {
            user: userId,
            product: productId,
        });
        return !!boughtRecord;
    }
    async getBoughtProducts({ em, req }) {
        const userId = req.session.userId;
        if (!userId)
            throw new Error("Not authenticated");
        const boughtRecords = await em.find(BoughtProduct_1.BoughtProduct, {
            user: userId
        }, {
            populate: ['product', 'product.company'],
            orderBy: { boughtAt: 'DESC' }
        });
        return boughtRecords.map(r => r.product);
    }
    async getPurchaseHistory({ em, req }) {
        const userId = req.session.userId;
        if (!userId)
            throw new Error("Not authenticated");
        return await em.find(BoughtProduct_1.BoughtProduct, {
            user: userId
        }, {
            populate: ['product', 'product.company'],
            orderBy: { boughtAt: 'DESC' }
        });
    }
    async getProductPurchaseHistory(productId, { em, req }) {
        if (!req.session.companyId)
            throw new Error("Not authenticated as seller");
        const company = await em.findOneOrFail(Company_1.Company, { id: req.session.companyId });
        if (!company) {
            throw new Error("Company doesn't exist");
        }
        const product = await em.findOneOrFail(Products_1.Product, { id: productId, company });
        if (!product) {
            throw new Error(" Product not found ");
        }
        return await em.find(BoughtProduct_1.BoughtProduct, {
            product: productId
        }, {
            populate: ['user'],
            orderBy: { boughtAt: 'DESC' }
        });
    }
};
exports.BoughtProductResolver = BoughtProductResolver;
__decorate([
    (0, type_graphql_1.Query)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("productId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoughtProductResolver.prototype, "hasUserBoughtProduct", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoughtProductResolver.prototype, "getBoughtProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [BoughtProduct_1.BoughtProduct]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoughtProductResolver.prototype, "getPurchaseHistory", null);
__decorate([
    (0, type_graphql_1.Query)(() => [BoughtProduct_1.BoughtProduct]),
    __param(0, (0, type_graphql_1.Arg)("productId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoughtProductResolver.prototype, "getProductPurchaseHistory", null);
exports.BoughtProductResolver = BoughtProductResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], BoughtProductResolver);
//# sourceMappingURL=boughtproduct.js.map