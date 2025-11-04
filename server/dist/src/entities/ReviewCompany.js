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
exports.ReviewCompany = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("./User");
const type_graphql_1 = require("type-graphql");
const Company_1 = require("./Company");
let ReviewCompany = class ReviewCompany {
    constructor() {
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
    }
};
exports.ReviewCompany = ReviewCompany;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], ReviewCompany.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, core_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], ReviewCompany.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [type_graphql_1.Int], { nullable: true }),
    (0, core_1.Property)({ type: 'integer[]', nullable: true }),
    __metadata("design:type", Array)
], ReviewCompany.prototype, "ratingDistribution", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], ReviewCompany.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], ReviewCompany.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], ReviewCompany.prototype, "rating", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], ReviewCompany.prototype, "createdAt", void 0);
exports.ReviewCompany = ReviewCompany = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], ReviewCompany);
//# sourceMappingURL=ReviewCompany.js.map