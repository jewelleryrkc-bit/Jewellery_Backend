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
exports.NewsletterCampaignResolver = void 0;
const type_graphql_1 = require("type-graphql");
const NewsletterCampaign_1 = require("../entities/NewsletterCampaign");
const Company_1 = require("../entities/Company");
const UserCompanyFollow_1 = require("../entities/UserCompanyFollow");
const MailService_1 = require("../services/MailService");
const PaginatedCampaigns_1 = require("../types/PaginatedCampaigns");
let NewsletterCampaignResolver = class NewsletterCampaignResolver {
    async createCampaign(name, type, subject, content, schedule, { em, req }) {
        const existing = await em.findOne(NewsletterCampaign_1.NewsletterCampaign, { name });
        if (existing)
            throw new Error("Campaign already exists");
        const company = await em.findOne(Company_1.Company, { id: req.session.companyId });
        if (!company)
            throw new Error("Not authenticated");
        const campaign = em.create(NewsletterCampaign_1.NewsletterCampaign, {
            name,
            type,
            subject,
            content,
            schedule,
            company,
            status: "Draft",
            createdAt: new Date(),
            updatedAt: new Date(),
            recipients: []
        });
        await em.persistAndFlush(campaign);
        return campaign;
    }
    async sendCampaign(campaignId, { em }) {
        const campaign = await em.findOne(NewsletterCampaign_1.NewsletterCampaign, { id: campaignId }, { populate: ["company"] });
        if (!campaign)
            throw new Error("Campaign not found");
        const follows = await em.find(UserCompanyFollow_1.UserCompanyFollow, { company: campaign.company }, { populate: ["user"] });
        const recipients = follows
            .map((f) => { var _a; return (_a = f.user) === null || _a === void 0 ? void 0 : _a.email; })
            .filter((email) => !!email);
        if (recipients.length === 0) {
            throw new Error("No followers to send campaign to");
        }
        console.log("📧 Campaign:", campaign.name);
        console.log("👥 Recipients:", recipients);
        const mailer = new MailService_1.MailService();
        try {
            await mailer.sendMail({
                fromName: campaign.company.cname,
                replyTo: campaign.company.email || "noreply@yourapp.com",
                to: recipients,
                subject: campaign.subject,
                html: campaign.content,
            });
            campaign.status = "Sent";
            await em.persistAndFlush(campaign);
            console.log("✅ Campaign sent successfully!");
            return true;
        }
        catch (error) {
            console.error("❌ Failed to send campaign:", error.message || error);
            throw new Error("Failed to send campaign: " + (error.message || error));
        }
    }
    async paginatedNewsletterCampaigns({ em, req }, offset, limit) {
        if (!req.session.companyId)
            throw new Error(" Not authenticated");
        const realLimit = Math.min(50, limit);
        const [campaign, total] = await Promise.all([
            em.find(NewsletterCampaign_1.NewsletterCampaign, { company: req.session.companyId }, {
                offset,
                limit: realLimit,
                orderBy: { createdAt: "DESC" }
            }),
            em.count(NewsletterCampaign_1.NewsletterCampaign, { company: req.session.companyId })
        ]);
        return {
            campaign,
            total,
        };
    }
    async getCampaigns({ em }) {
        return em.find(NewsletterCampaign_1.NewsletterCampaign, {});
    }
};
exports.NewsletterCampaignResolver = NewsletterCampaignResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => NewsletterCampaign_1.NewsletterCampaign),
    __param(0, (0, type_graphql_1.Arg)("name")),
    __param(1, (0, type_graphql_1.Arg)("type")),
    __param(2, (0, type_graphql_1.Arg)("subject")),
    __param(3, (0, type_graphql_1.Arg)("content")),
    __param(4, (0, type_graphql_1.Arg)("schedule")),
    __param(5, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], NewsletterCampaignResolver.prototype, "createCampaign", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("campaignId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NewsletterCampaignResolver.prototype, "sendCampaign", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedCampaigns_1.PaginatedCampaigns),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int, { defaultValue: 0 })),
    __param(2, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], NewsletterCampaignResolver.prototype, "paginatedNewsletterCampaigns", null);
__decorate([
    (0, type_graphql_1.Query)(() => [NewsletterCampaign_1.NewsletterCampaign]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsletterCampaignResolver.prototype, "getCampaigns", null);
exports.NewsletterCampaignResolver = NewsletterCampaignResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], NewsletterCampaignResolver);
//# sourceMappingURL=newsletterCampaign.js.map