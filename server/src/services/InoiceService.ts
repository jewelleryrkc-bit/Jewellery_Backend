// backend/src/services/InvoiceService.ts
import { EntityManager } from '@mikro-orm/core';
import { Invoice } from '../entities/Invoice';
import { Order } from '../entities/Order';
import { Company } from '../entities/Company';

export class InvoiceService {
  constructor(private em: EntityManager) {}

  async generateInvoiceNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    
    // Get the last invoice number for this company
    const lastInvoice = await this.em.findOne(Invoice, 
      { seller: companyId },
      { orderBy: { sequentialNumber: 'DESC' } }
    );

    const sequentialNumber = lastInvoice ? lastInvoice.sequentialNumber + 1 : 1;
    
    return `INV-${year}-${sequentialNumber.toString().padStart(6, '0')}`;
  }

  async createInvoice(order: Order, company: Company): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber(company.id);
    
    const invoice = new Invoice();
    invoice.invoiceNumber = invoiceNumber;
    invoice.sequentialNumber = parseInt(invoiceNumber.split('-')[2]);
    invoice.order = order;
    invoice.seller = company;
    invoice.totalAmount = order.total;
    invoice.currency = 'USD'; // or get from order/company
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
    //   tax: order.tax
    };

    await this.em.persistAndFlush(invoice);
    return invoice;
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    return await this.em.findOne(Invoice, { id: invoiceId }, {
      populate: ['order', 'seller', 'order.user']
    });
  }

  async getCompanyInvoices(companyId: string, page: number = 1, limit: number = 50) {
    const [invoices, total] = await this.em.findAndCount(Invoice,
      { seller: companyId },
      {
        populate: ['order', 'order.user'],
        orderBy: { createdAt: 'DESC' },
        offset: (page - 1) * limit,
        limit
      }
    );

    return { invoices, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice> {
    const invoice = await this.em.findOneOrFail(Invoice, { id: invoiceId });
    
    invoice.status = status;
    
    // Set timestamps based on status
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

  async incrementDownloadCount(invoiceId: string): Promise<void> {
    const invoice = await this.em.findOneOrFail(Invoice, { id: invoiceId });
    invoice.downloadCount += 1;
    await this.em.flush();
  }
}