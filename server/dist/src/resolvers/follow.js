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
exports.FollowResolver = void 0;
const type_graphql_1 = require("type-graphql");
const UserCompanyFollow_1 = require("../entities/UserCompanyFollow");
const Company_1 = require("../entities/Company");
const User_1 = require("../entities/User");
let FollowResolver = class FollowResolver {
    async followCompany(companyId, { em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        const user = await em.findOne(User_1.User, { id: req.session.userId });
        const company = await em.findOne(Company_1.Company, { id: companyId });
        if (!company)
            throw new Error("Company not found");
        const existing = await em.findOne(UserCompanyFollow_1.UserCompanyFollow, { user, company });
        if (existing)
            return true;
        const follow = em.create(UserCompanyFollow_1.UserCompanyFollow, {
            company,
            user: req.session.userId,
            createdAt: new Date()
        });
        await em.persistAndFlush(follow);
        return true;
    }
    async unfollowCompany(companyId, { em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        const user = await em.findOne(User_1.User, { id: req.session.userId });
        const company = await em.findOne(Company_1.Company, { id: companyId });
        await em.nativeDelete(UserCompanyFollow_1.UserCompanyFollow, { user, company });
        return true;
    }
    async followedCompanies({ em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        const follows = await em.find(UserCompanyFollow_1.UserCompanyFollow, { user: req.session.userId }, { populate: ["company"] });
        return follows.map((f) => f.company);
    }
    async companyFollowers(companyId, { em }) {
        const follows = await em.find(UserCompanyFollow_1.UserCompanyFollow, { company: companyId }, { populate: ["user"] });
        return follows.map((f) => f.user);
    }
};
exports.FollowResolver = FollowResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followCompany", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "unfollowCompany", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Company_1.Company]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followedCompanies", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "companyFollowers", null);
exports.FollowResolver = FollowResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], FollowResolver);
//# sourceMappingURL=follow.js.map