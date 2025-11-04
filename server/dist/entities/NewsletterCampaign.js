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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterCampaign = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Company_1 = require("./Company");
let NewsletterCampaign = class NewsletterCampaign {
    constructor() {
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.recipients = [];
    }
};
exports.NewsletterCampaign = NewsletterCampaign;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "subject", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ columnType: "text" }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "content", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "schedule", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: "Draft" }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], NewsletterCampaign.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "lastSent", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String]),
    (0, core_1.Property)({ type: "json" }),
    __metadata("design:type", Array)
], NewsletterCampaign.prototype, "recipients", void 0);
exports.NewsletterCampaign = NewsletterCampaign = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], NewsletterCampaign);
//# sourceMappingURL=NewsletterCampaign.js.map