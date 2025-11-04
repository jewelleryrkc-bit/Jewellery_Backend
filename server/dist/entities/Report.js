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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = exports.ReportStatus = exports.ReportReason = void 0;
const core_1 = require("@mikro-orm/core");
const Products_1 = require("./Products");
const Company_1 = require("./Company");
const User_1 = require("./User");
const crypto_1 = __importDefault(require("crypto"));
const type_graphql_1 = require("type-graphql");
var ReportReason;
(function (ReportReason) {
    ReportReason["FAKE_PRODUCT"] = "FAKE_PRODUCT";
    ReportReason["WRONG_DESCRIPTION"] = "WRONG_DESCRIPTION";
    ReportReason["COUNTERFEIT"] = "COUNTERFEIT";
    ReportReason["INAPPROPRIATE"] = "INAPPROPRIATE";
    ReportReason["OTHER"] = "OTHER";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
(0, type_graphql_1.registerEnumType)(ReportReason, {
    name: "ReportReason",
    description: "Reason for reporting the product",
});
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["OPEN"] = "OPEN";
    ReportStatus["RESOLVED"] = "RESOLVED";
    ReportStatus["DISMISSED"] = "DISMISSED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
(0, type_graphql_1.registerEnumType)(ReportStatus, {
    name: "ReportStatus",
});
let Report = class Report {
    constructor(product, reason) {
        this.id = crypto_1.default.randomUUID();
        this.status = ReportStatus.OPEN;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.product = product;
        this.company = product.company;
        this.reason = reason;
    }
};
exports.Report = Report;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.ManyToOne)(() => Products_1.Product),
    __metadata("design:type", Products_1.Product)
], Report.prototype, "product", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], Report.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.ManyToOne)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], Report.prototype, "reportedBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Enum)(() => ReportReason),
    __metadata("design:type", String)
], Report.prototype, "reason", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Enum)(() => ReportStatus),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, core_1.Property)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], Report.prototype, "details", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)({ onCreate: () => new Date() }),
    __metadata("design:type", Object)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Object)
], Report.prototype, "updatedAt", void 0);
exports.Report = Report = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Products_1.Product, String])
], Report);
//# sourceMappingURL=Report.js.map