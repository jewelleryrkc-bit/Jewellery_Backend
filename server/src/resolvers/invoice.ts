// backend/src/resolvers/InvoiceResolver.ts
import { Resolver, Mutation, Arg, Query, Ctx, Int } from 'type-graphql';
import { Invoice } from '../entities/Invoice';
import { InvoiceService } from '../services/InoiceService';
import { MyContext } from '../types';
import { InvoiceResponse } from '../types/InvoiceTypes';
import { Company } from '../entities/Company';
import { Order } from '../entities/Order';

@Resolver(() => Invoice)
export class InvoiceResolver {
  @Mutation(() => Invoice)
  async createInvoice(
    @Arg('orderId') orderId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<Invoice> {
    if (!req.session.companyId) {
      throw new Error('Not authenticated as a company');
    }

    const order = await em.findOneOrFail(Order, { id: orderId }, {
      populate: ['items.product', 'user']
    });

    const company = await em.findOneOrFail(Company, { id: req.session.companyId });

    const service = new InvoiceService(em);
    return await service.createInvoice(order, company);
  }

  @Query(() => Invoice, { nullable: true })
  async getInvoice(
    @Arg('invoiceId') invoiceId: string,
    @Ctx() { em }: MyContext
  ): Promise<Invoice | null> {
    const service = new InvoiceService(em);
    return await service.getInvoice(invoiceId);
  }

  @Query(() => InvoiceResponse)
  async getCompanyInvoices(
    @Arg('page', () => Int, { defaultValue: 1 }) page: number,
    @Arg('limit', () => Int, { defaultValue: 50 }) limit: number,
    @Ctx() { em, req }: MyContext
  ): Promise<InvoiceResponse> {
    if (!req.session.companyId) {
      throw new Error('Not authenticated as a company');
    }

    const service = new InvoiceService(em);
    const result = await service.getCompanyInvoices(req.session.companyId, page, limit);
    
    return {
      invoices: result.invoices,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  @Mutation(() => Invoice)
  async updateInvoiceStatus(
    @Arg('invoiceId') invoiceId: string,
    @Arg('status') status: string,
    @Ctx() { em }: MyContext
  ): Promise<Invoice> {
    const service = new InvoiceService(em);
    return await service.updateInvoiceStatus(invoiceId, status as any);
  }

  @Mutation(() => Boolean)
  async recordInvoiceDownload(
    @Arg('invoiceId') invoiceId: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const service = new InvoiceService(em);
    await service.incrementDownloadCount(invoiceId);
    return true;
  }
}