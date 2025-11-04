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
exports.NewsletterSubscriber = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const uuid_1 = require("uuid");
let NewsletterSubscriber = class NewsletterSubscriber {
    constructor() {
        this.subscribedAt = new Date();
        this.isActive = true;
        this.unsubscribeToken = (0, uuid_1.v4)();
    }
};
exports.NewsletterSubscriber = NewsletterSubscriber;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], NewsletterSubscriber.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "subscribedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "unsubscribedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: true }),
    __metadata("design:type", Boolean)
], NewsletterSubscriber.prototype, "isActive", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "unsubscribeToken", void 0);
exports.NewsletterSubscriber = NewsletterSubscriber = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], NewsletterSubscriber);
//# sourceMappingURL=NewsletterSubscriber.js.map