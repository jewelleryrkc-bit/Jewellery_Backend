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
exports.ReviewCompanyResolver = void 0;
const type_graphql_1 = require("type-graphql");
const ReviewCompany_1 = require("../entities/ReviewCompany");
const User_1 = require("../entities/User");
const ReviewInput_1 = require("../inputs/ReviewInput");
const Company_1 = require("../entities/Company");
let PaginatedCompanyReviews = class PaginatedCompanyReviews {
};
__decorate([
    (0, type_graphql_1.Field)(() => [ReviewCompany_1.ReviewCompany]),
    __metadata("design:type", Array)
], PaginatedCompanyReviews.prototype, "items", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedCompanyReviews.prototype, "total", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedCompanyReviews.prototype, "hasMore", void 0);
PaginatedCompanyReviews = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedCompanyReviews);
const MIN_RATING = 1;
const MAX_RATING = 5;
let ReviewCompanyResolver = class ReviewCompanyResolver {
    async createCompanyReview(input, { em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        if (!Number.isInteger(input.rating) || input.rating < MIN_RATING || input.rating > MAX_RATING) {
            throw new Error(`Rating must be an integer between ${MIN_RATING}-${MAX_RATING}`);
        }
        const [user, company] = await Promise.all([
            em.findOne(User_1.User, { id: req.session.userId }),
            em.findOne(Company_1.Company, { id: input.companyId })
        ]);
        if (!user || !company)
            throw new Error("User or company not found");
        const existingReview = await em.findOne(ReviewCompany_1.ReviewCompany, {
            user: user.id,
            company: company.id
        });
        if (existingReview)
            throw new Error("You already reviewed this company");
        if (company.averageRating === undefined)
            company.averageRating = 0;
        if (company.reviewCount === undefined)
            company.reviewCount = 0;
        const review = em.create(ReviewCompany_1.ReviewCompany, {
            user,
            comment: input.comment,
            rating: input.rating,
            createdAt: new Date(),
            company
        });
        company.reviewCount += 1;
        company.averageRating = parseFloat(((company.averageRating * (company.reviewCount - 1) + input.rating) / company.reviewCount).toFixed(2));
        await em.begin();
        try {
            await em.persistAndFlush([review, company]);
            await em.commit();
            return review;
        }
        catch (err) {
            await em.rollback();
            throw err;
        }
    }
    async deleteCompanyReview(companyreviewId, { em, req }) {
        if (!req.session.userId) {
            throw new Error("Not authenticated");
        }
        const review = await em.findOne(ReviewCompany_1.ReviewCompany, { id: companyreviewId }, { populate: ['company', 'user'] });
        if (!review)
            throw new Error("Review not found");
        if (review.user.id !== req.session.userId)
            throw new Error("Delete only your reviews");
        const company = review.company;
        if (company.reviewCount === undefined)
            company.reviewCount = 0;
        if (company.averageRating === undefined)
            company.averageRating = 0;
        await em.begin();
        try {
            await em.removeAndFlush(review);
            if (company.reviewCount > 0) {
                company.reviewCount -= 1;
                if (company.reviewCount === 0) {
                    company.averageRating = 0;
                }
                else {
                    company.averageRating = parseFloat(((company.averageRating * (company.reviewCount + 1) - review.rating) / company.reviewCount).toFixed(2));
                }
            }
            else {
                company.reviewCount = 0;
                company.averageRating = 0;
            }
            await em.persistAndFlush(company);
            await em.commit();
            return true;
        }
        catch (error) {
            await em.rollback();
            throw error;
        }
    }
    async companyReviews(id, limit, offset, { em }) {
        const company = await em.findOne(Company_1.Company, { id });
        if (!company)
            throw new Error("Company not found");
        const [reviews, total] = await em.findAndCount(ReviewCompany_1.ReviewCompany, { company: company.id }, {
            orderBy: { createdAt: 'DESC' },
            populate: ['user'],
            limit,
            offset
        });
        return {
            items: reviews,
            total,
            hasMore: offset + limit < total
        };
    }
    async getUserCompanyReviews({ em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        return em.find(ReviewCompany_1.ReviewCompany, { user: req.session.userId }, {
            populate: ['company']
        });
    }
};
exports.ReviewCompanyResolver = ReviewCompanyResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => ReviewCompany_1.ReviewCompany),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReviewInput_1.CompanyReviewInput, Object]),
    __metadata("design:returntype", Promise)
], ReviewCompanyResolver.prototype, "createCompanyReview", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("companyreviewId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewCompanyResolver.prototype, "deleteCompanyReview", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedCompanyReviews),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 10 })),
    __param(2, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int, { defaultValue: 0 })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewCompanyResolver.prototype, "companyReviews", null);
__decorate([
    (0, type_graphql_1.Query)(() => [ReviewCompany_1.ReviewCompany]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewCompanyResolver.prototype, "getUserCompanyReviews", null);
exports.ReviewCompanyResolver = ReviewCompanyResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => ReviewCompany_1.ReviewCompany)
], ReviewCompanyResolver);
//# sourceMappingURL=reviewcompany.js.map