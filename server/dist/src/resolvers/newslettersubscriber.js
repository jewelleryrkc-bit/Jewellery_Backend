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
exports.NewsletterResolver = void 0;
const type_graphql_1 = require("type-graphql");
const NewsletterSubscriber_1 = require("../entities/NewsletterSubscriber");
let NewsletterResolver = class NewsletterResolver {
    async subscribeNewsletter(email, { em }) {
        const repo = em.getRepository(NewsletterSubscriber_1.NewsletterSubscriber);
        let sub = await repo.findOne({ email });
        if (sub && sub.isActive)
            return true;
        if (sub) {
            sub.isActive = true;
            sub.unsubscribedAt = new Date;
        }
        else {
            sub = repo.create({
                email,
                subscribedAt: new Date(),
                isActive: false,
                unsubscribeToken: ""
            });
            em.persist(sub);
        }
        await em.flush();
        return true;
    }
    async unsubscribeNewsletter(email, { em }) {
        const sub = await em.findOne(NewsletterSubscriber_1.NewsletterSubscriber, { email });
        if (!sub)
            return false;
        sub.isActive = false;
        sub.unsubscribedAt = new Date();
        await em.flush();
        return true;
    }
    async unsubscribeByToken(token, { em }) {
        const sub = await em.findOne(NewsletterSubscriber_1.NewsletterSubscriber, { unsubscribeToken: token });
        if (!sub)
            return false;
        sub.isActive = false;
        sub.unsubscribedAt = new Date();
        await em.flush();
        return true;
    }
    async getSubscribers({ em }) {
        return em.find(NewsletterSubscriber_1.NewsletterSubscriber, {});
    }
};
exports.NewsletterResolver = NewsletterResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NewsletterResolver.prototype, "subscribeNewsletter", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NewsletterResolver.prototype, "unsubscribeNewsletter", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("token")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NewsletterResolver.prototype, "unsubscribeByToken", null);
__decorate([
    (0, type_graphql_1.Query)(() => [NewsletterSubscriber_1.NewsletterSubscriber]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsletterResolver.prototype, "getSubscribers", null);
exports.NewsletterResolver = NewsletterResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], NewsletterResolver);
//# sourceMappingURL=newslettersubscriber.js.map