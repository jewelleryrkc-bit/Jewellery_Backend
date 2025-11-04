"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const Invoice_1 = require("../entities/Invoice");
class InvoiceService {
    constructor(em) {
        this.em = em;
    }
    async generateInvoiceNumber(companyId) {
        const year = new Date().getFullYear();
        const lastInvoice = await this.em.findOne(Invoice_1.Invoice, { seller: companyId }, { orderBy: { sequentialNumber: 'DESC' } });
        const sequentialNumber = lastInvoice ? lastInvoice.sequentialNumber + 1 : 1;
        return `INV-${year}-${sequentialNumber.toString().padStart(6, '0')}`;
    }
    async createInvoice(order, company) {
        const invoiceNumber = await this.generateInvoiceNumber(company.id);
        const invoice = new Invoice_1.Invoice();
        invoice.invoiceNumber = invoiceNumber;
        invoice.sequentialNumber = parseInt(invoiceNumber.split('-')[2]);
        invoice.order = order;
        invoice.seller = company;
        invoice.totalAmount = order.total;
        invoice.currency = 'USD';
        invoice.status = 'issued';
        invoice.issuedAt = new Date();
        invoice.items = order.items.getItems().map(item => ({
            product: item.product.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        }));
        invoice.metadata = {
            orderDate: order.createdAt,
            customer: order.user.username,
            discounts: order.discount,
        };
        await this.em.persistAndFlush(invoice);
        return invoice;
    }
    async getInvoice(invoiceId) {
        return await this.em.findOne(Invoice_1.Invoice, { id: invoiceId }, {
            populate: ['order', 'seller', 'order.user']
        });
    }
    async getCompanyInvoices(companyId, page = 1, limit = 50) {
        const [invoices, total] = await this.em.findAndCount(Invoice_1.Invoice, { seller: companyId }, {
            populate: ['order', 'order.user'],
            orderBy: { createdAt: 'DESC' },
            offset: (page - 1) * limit,
            limit
        });
        return { invoices, total, page, totalPages: Math.ceil(total / limit) };
    }
    async updateInvoiceStatus(invoiceId, status) {
        const invoice = await this.em.findOneOrFail(Invoice_1.Invoice, { id: invoiceId });
        invoice.status = status;
        switch (status) {
            case 'sent':
                invoice.sentAt = new Date();
                break;
            case 'paid':
                invoice.paidAt = new Date();
                break;
            case 'cancelled':
                invoice.updatedAt = new Date();
                break;
        }
        await this.em.flush();
        return invoice;
    }
    async incrementDownloadCount(invoiceId) {
        const invoice = await this.em.findOneOrFail(Invoice_1.Invoice, { id: invoiceId });
        invoice.downloadCount += 1;
        await this.em.flush();
    }
}
exports.InvoiceService = InvoiceService;
//# sourceMappingURL=InoiceService.js.map