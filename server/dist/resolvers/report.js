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
exports.ReportResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Report_1 = require("../entities/Report");
const Products_1 = require("../entities/Products");
const Company_1 = require("../entities/Company");
let ProductReportInput = class ProductReportInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ProductReportInput.prototype, "productId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Report_1.ReportReason),
    __metadata("design:type", String)
], ProductReportInput.prototype, "reason", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReportInput.prototype, "details", void 0);
ProductReportInput = __decorate([
    (0, type_graphql_1.InputType)()
], ProductReportInput);
let CompanyReportInput = class CompanyReportInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CompanyReportInput.prototype, "companyId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Report_1.ReportReason),
    __metadata("design:type", String)
], CompanyReportInput.prototype, "reason", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompanyReportInput.prototype, "details", void 0);
CompanyReportInput = __decorate([
    (0, type_graphql_1.InputType)()
], CompanyReportInput);
let ReportResolver = class ReportResolver {
    async createProductReport(input, { em, req }) {
        if (!req.session.userId) {
            throw new Error("Not authenticated");
        }
        const product = await em.findOne(Products_1.Product, { id: input.productId }, { populate: ["company"] });
        if (!product)
            throw new Error("Product not found");
        const existingReport = await em.findOne(Report_1.Report, {
            product: product.id,
            reportedBy: req.session.userId,
            status: Report_1.ReportStatus.OPEN,
        });
        if (existingReport) {
            throw new Error("You already reported this product");
        }
        const report = em.create(Report_1.Report, {
            product,
            company: product.company,
            reportedBy: req.session.userId,
            reason: input.reason,
            status: Report_1.ReportStatus.OPEN,
            details: input.details,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await em.persistAndFlush(report);
        await this.evaluateCompanyStatus(product.company.id, em);
        return report;
    }
    async evaluateCompanyStatus(companyId, em) {
        const openCount = await em.count(Report_1.Report, {
            company: companyId,
            status: Report_1.ReportStatus.OPEN,
        });
        const company = await em.findOne(Company_1.Company, { id: companyId });
        if (!company)
            return;
        if (openCount >= 10) {
            company.status = Company_1.CompanyStatus.RESTRICTED;
        }
        else if (openCount >= 5) {
            company.status = Company_1.CompanyStatus.WARNED;
        }
        else {
            company.status = Company_1.CompanyStatus.ACTIVE;
        }
        await em.persistAndFlush(company);
    }
    async createCompanyReport(input, { em, req }) {
        if (!req.session.userId) {
            throw new Error("Not authenticated");
        }
        const company = await em.findOne(Company_1.Company, { id: input.companyId }, { populate: ["products"] });
        if (!company)
            throw new Error("Company not found");
        const existingReport = await em.findOne(Report_1.Report, {
            company: company.id,
            reportedBy: req.session.userId,
            status: Report_1.ReportStatus.OPEN,
        });
        if (existingReport) {
            throw new Error("You already reported this product");
        }
        const report = em.create(Report_1.Report, {
            company,
            reportedBy: req.session.userId,
            reason: input.reason,
            status: Report_1.ReportStatus.OPEN,
            details: input.details,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: ""
        });
        await em.persistAndFlush(report);
        await this.evaluateCompanyStatus(company.id, em);
        return report;
    }
    async productReports(productId, limit, offset, { em }) {
        return em.find(Report_1.Report, { product: productId }, {
            orderBy: { createdAt: "DESC" },
            offset,
            limit,
            populate: ["reportedBy", "company", "product"],
        });
    }
    async companyReports(companyId, limit, offset, { em }) {
        return em.find(Report_1.Report, { company: companyId }, {
            orderBy: { createdAt: "DESC" },
            offset,
            limit,
            populate: ["product", "reportedBy"],
        });
    }
};
exports.ReportResolver = ReportResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Report_1.Report),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductReportInput, Object]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "createProductReport", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Report_1.Report),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompanyReportInput, Object]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "createCompanyReport", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Report_1.Report]),
    __param(0, (0, type_graphql_1.Arg)("productId")),
    __param(1, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 50 })),
    __param(2, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int, { defaultValue: 0 })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "productReports", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Report_1.Report]),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 50 })),
    __param(2, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int, { defaultValue: 0 })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "companyReports", null);
exports.ReportResolver = ReportResolver = __decorate([
    (0, type_graphql_1.Resolver)(Report_1.Report)
], ReportResolver);
//# sourceMappingURL=report.js.map