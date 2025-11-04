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
exports.SellerCategoryResolver = void 0;
const Company_1 = require("../entities/Company");
const SellerCategories_1 = require("../entities/SellerCategories");
const slugify_1 = __importDefault(require("slugify"));
const sellerCategoryInput_1 = require("../inputs/sellerCategoryInput");
const ferror_1 = require("../shared/ferror");
const type_graphql_1 = require("type-graphql");
let SellerCategoryResponse = class SellerCategoryResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [ferror_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], SellerCategoryResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => SellerCategories_1.SellerCategories, { nullable: true }),
    __metadata("design:type", SellerCategories_1.SellerCategories)
], SellerCategoryResponse.prototype, "sellercategories", void 0);
SellerCategoryResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], SellerCategoryResponse);
let SellerCategoryResolver = class SellerCategoryResolver {
    async getsellerCategories({ em, req }) {
        if (!req.session.companyId) {
            throw new Error("Not authenticated");
        }
        return em.find(SellerCategories_1.SellerCategories, {
            company: req.session.companyId
        });
    }
    async createSellerCategory(input, { em, req }) {
        const company = await em.findOne(Company_1.Company, { id: req.session.companyId });
        if (!company)
            throw new Error("Company not found");
        const trimmedName = input.name.trim();
        let suffix = 1;
        let slug = (0, slugify_1.default)(trimmedName, { lower: true, strict: true });
        const originalSlug = slug;
        while (await em.findOne(SellerCategories_1.SellerCategories, { slug })) {
            slug = `${originalSlug}-${suffix++}`;
        }
        const sellercategories = em.create(SellerCategories_1.SellerCategories, Object.assign(Object.assign({}, input), { slug, createdAt: new Date(), company }));
        try {
            await em.persistAndFlush(sellercategories);
            const savedsellercategory = await em.findOneOrFail(SellerCategories_1.SellerCategories, { id: sellercategories.id });
            return { sellercategories: savedsellercategory };
        }
        catch (err) {
            console.log("Error creatinf category:", err);
            return {
                errors: [{
                        field: "general",
                        message: "Uknown error creating category",
                    }],
            };
        }
    }
};
exports.SellerCategoryResolver = SellerCategoryResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [SellerCategories_1.SellerCategories]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerCategoryResolver.prototype, "getsellerCategories", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => SellerCategoryResponse),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sellerCategoryInput_1.SellerCatInput, Object]),
    __metadata("design:returntype", Promise)
], SellerCategoryResolver.prototype, "createSellerCategory", null);
exports.SellerCategoryResolver = SellerCategoryResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], SellerCategoryResolver);
;
//# sourceMappingURL=sellerCategories.js.map