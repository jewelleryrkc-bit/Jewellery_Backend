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
exports.Company = exports.CompanyStatus = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Products_1 = require("./Products");
const ReviewCompany_1 = require("./ReviewCompany");
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["ACTIVE"] = "ACTIVE";
    CompanyStatus["WARNED"] = "WARNED";
    CompanyStatus["RESTRICTED"] = "RESTRICTED";
    CompanyStatus["BANNED"] = "BANNED";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
let Company = class Company {
    constructor() {
        this.id = crypto.randomUUID();
        this.status = CompanyStatus.ACTIVE;
        this.reviews = new core_1.Collection(this);
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.products = new Array();
    }
};
exports.Company = Company;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Company.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text", unique: true }),
    __metadata("design:type", String)
], Company.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text", unique: true }),
    __metadata("design:type", String)
], Company.prototype, "cname", void 0);
__decorate([
    (0, core_1.Property)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "smtpPassword", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "bigint", unique: true }),
    __metadata("design:type", Number)
], Company.prototype, "contact", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text", unique: true }),
    __metadata("design:type", String)
], Company.prototype, "email", void 0);
__decorate([
    (0, core_1.Property)({ type: "text" }),
    __metadata("design:type", String)
], Company.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text" }),
    __metadata("design:type", String)
], Company.prototype, "location", void 0);
__decorate([
    (0, core_1.Enum)(() => CompanyStatus),
    __metadata("design:type", String)
], Company.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: false }),
    __metadata("design:type", Boolean)
], Company.prototype, "isEmailVerified", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ReviewCompany_1.ReviewCompany]),
    (0, core_1.OneToMany)(() => ReviewCompany_1.ReviewCompany, (review) => review.company),
    __metadata("design:type", Object)
], Company.prototype, "reviews", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Company.prototype, "averageRating", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Number)
], Company.prototype, "reviewCount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Date)
], Company.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], Company.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Products_1.Product]),
    (0, core_1.OneToMany)(() => Products_1.Product, (product) => product.company),
    __metadata("design:type", Object)
], Company.prototype, "products", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, core_1.Property)({ default: 0 }),
    __metadata("design:type", Number)
], Company.prototype, "profileViews", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, core_1.Property)({ type: 'array', nullable: true }),
    __metadata("design:type", Array)
], Company.prototype, "recentViewerIds", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Company.prototype, "lastViewedAt", void 0);
exports.Company = Company = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], Company);
//# sourceMappingURL=Company.js.map