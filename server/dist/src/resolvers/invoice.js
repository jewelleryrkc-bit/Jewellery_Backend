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
exports.InvoiceResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Invoice_1 = require("../entities/Invoice");
const InoiceService_1 = require("../services/InoiceService");
const InvoiceTypes_1 = require("../types/InvoiceTypes");
const Company_1 = require("../entities/Company");
const Order_1 = require("../entities/Order");
let InvoiceResolver = class InvoiceResolver {
    async createInvoice(orderId, { em, req }) {
        if (!req.session.companyId) {
            throw new Error('Not authenticated as a company');
        }
        const order = await em.findOneOrFail(Order_1.Order, { id: orderId }, {
            populate: ['items.product', 'user']
        });
        const company = await em.findOneOrFail(Company_1.Company, { id: req.session.companyId });
        const service = new InoiceService_1.InvoiceService(em);
        return await service.createInvoice(order, company);
    }
    async getInvoice(invoiceId, { em }) {
        const service = new InoiceService_1.InvoiceService(em);
        return await service.getInvoice(invoiceId);
    }
    async getCompanyInvoices(page, limit, { em, req }) {
        if (!req.session.companyId) {
            throw new Error('Not authenticated as a company');
        }
        const service = new InoiceService_1.InvoiceService(em);
        const result = await service.getCompanyInvoices(req.session.companyId, page, limit);
        return {
            invoices: result.invoices,
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        };
    }
    async updateInvoiceStatus(invoiceId, status, { em }) {
        const service = new InoiceService_1.InvoiceService(em);
        return await service.updateInvoiceStatus(invoiceId, status);
    }
    async recordInvoiceDownload(invoiceId, { em }) {
        const service = new InoiceService_1.InvoiceService(em);
        await service.incrementDownloadCount(invoiceId);
        return true;
    }
};
exports.InvoiceResolver = InvoiceResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Invoice_1.Invoice),
    __param(0, (0, type_graphql_1.Arg)('orderId')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "createInvoice", null);
__decorate([
    (0, type_graphql_1.Query)(() => Invoice_1.Invoice, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('invoiceId')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "getInvoice", null);
__decorate([
    (0, type_graphql_1.Query)(() => InvoiceTypes_1.InvoiceResponse),
    __param(0, (0, type_graphql_1.Arg)('page', () => type_graphql_1.Int, { defaultValue: 1 })),
    __param(1, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int, { defaultValue: 50 })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "getCompanyInvoices", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Invoice_1.Invoice),
    __param(0, (0, type_graphql_1.Arg)('invoiceId')),
    __param(1, (0, type_graphql_1.Arg)('status')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "updateInvoiceStatus", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('invoiceId')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "recordInvoiceDownload", null);
exports.InvoiceResolver = InvoiceResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Invoice_1.Invoice)
], InvoiceResolver);
//# sourceMappingURL=invoice.js.map