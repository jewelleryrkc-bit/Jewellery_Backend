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
exports.CompanyReviewInput = exports.ReviewInput = void 0;
const Reviews_1 = require("../entities/Reviews");
const type_graphql_1 = require("type-graphql");
let ReviewInput = class ReviewInput {
};
exports.ReviewInput = ReviewInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ReviewInput.prototype, "productId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ReviewInput.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], ReviewInput.prototype, "rating", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Reviews_1.ReviewSentiment, { nullable: true }),
    __metadata("design:type", String)
], ReviewInput.prototype, "sentiment", void 0);
exports.ReviewInput = ReviewInput = __decorate([
    (0, type_graphql_1.InputType)()
], ReviewInput);
let CompanyReviewInput = class CompanyReviewInput {
};
exports.CompanyReviewInput = CompanyReviewInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CompanyReviewInput.prototype, "companyId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CompanyReviewInput.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], CompanyReviewInput.prototype, "rating", void 0);
exports.CompanyReviewInput = CompanyReviewInput = __decorate([
    (0, type_graphql_1.InputType)()
], CompanyReviewInput);
//# sourceMappingURL=ReviewInput.js.map