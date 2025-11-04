import {
    Resolver,
    Mutation,
    Arg,
    Ctx,
    Query,
    InputType,
    Field,
    Int,
  } from "type-graphql";
  import { Report, ReportReason, ReportStatus } from "../entities/Report";
  import { Product } from "../entities/Products";
  import { Company, CompanyStatus } from "../entities/Company";
  import { MyContext } from "../types";
  import { EntityManager } from "@mikro-orm/core";
  
@InputType()
  class ProductReportInput {
    @Field()
    productId!: string;

    @Field(() => ReportReason)
    reason!: ReportReason;
  
    @Field({ nullable: true })
    details?: string;
  }

  @InputType()
  class CompanyReportInput {
    @Field()
    companyId!: string;

    @Field(() => ReportReason)
    reason!: ReportReason;
  
    @Field({ nullable: true })
    details?: string;
  }  
  
  @Resolver(Report)
  export class ReportResolver {
    @Mutation(() => Report)
    async createProductReport(
      @Arg("input") input: ProductReportInput,
      @Ctx() { em, req }: MyContext
    ): Promise<Report> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }
  
      const product = await em.findOne(Product, { id: input.productId }, { populate: ["company"] });
      if (!product) throw new Error("Product not found");
  
      const existingReport = await em.findOne(Report, {
        product: product.id,
        reportedBy: req.session.userId,
        status: ReportStatus.OPEN,
      });
  
      if (existingReport) {
        throw new Error("You already reported this product");
      }
  
      const report = em.create(Report, {
        product,
        company: product.company,
        reportedBy: req.session.userId,
        reason: input.reason,
        status: ReportStatus.OPEN,
        details: input.details,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await em.persistAndFlush(report);
      await this.evaluateCompanyStatus(product.company.id, em);
  
      return report;
    }
  
    private async evaluateCompanyStatus(companyId: string, em: EntityManager) {
      const openCount = await em.count(Report, {
        company: companyId,
        status: ReportStatus.OPEN,
      });
  
      const company = await em.findOne(Company, { id: companyId });
      if (!company) return;
  
      if (openCount >= 10) {
        company.status = CompanyStatus.RESTRICTED;
      } else if (openCount >= 5) {
        company.status = CompanyStatus.WARNED;
      } else {
        company.status = CompanyStatus.ACTIVE;
      }
  
      await em.persistAndFlush(company);
    }

    @Mutation(() => Report)
    async createCompanyReport(
      @Arg("input") input: CompanyReportInput,
      @Ctx() { em, req }: MyContext
    ): Promise<Report> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }

      const company = await em.findOne(Company, { id: input.companyId }, { populate: ["products"] });
      if (!company) throw new Error("Company not found");
  
      const existingReport = await em.findOne(Report, {
        company: company.id,
        reportedBy: req.session.userId,
        status: ReportStatus.OPEN,
      });
  
      if (existingReport) {
        throw new Error("You already reported this product");
      }
  
      const report = em.create(Report, {
          company,
          // product: company.products,
          reportedBy: req.session.userId,
          reason: input.reason,
          status: ReportStatus.OPEN,
          details: input.details,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: ""
      });
  
      await em.persistAndFlush(report);
      await this.evaluateCompanyStatus(company.id, em);
  
      return report;
    }
  
    @Query(() => [Report])
    async productReports(
      @Arg("productId") productId: string,
      @Arg("limit", () => Int, { defaultValue: 50 }) limit: number,
      @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
      @Ctx() { em }: MyContext
    ): Promise<Report[]> {
      return em.find(
        Report,
        { product: productId },
        {
          orderBy: { createdAt: "DESC" },
          offset,
          limit,
          populate: ["reportedBy", "company", "product"],
        }
      );
    }
  
    @Query(() => [Report])
    async companyReports(
      @Arg("companyId") companyId: string,
      @Arg("limit", () => Int, { defaultValue: 50 }) limit: number,
      @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
      @Ctx() { em }: MyContext
    ): Promise<Report[]> {
      return em.find(
        Report,
        { company: companyId },
        {
          orderBy: { createdAt: "DESC" },
          offset,
          limit,
          populate: ["product", "reportedBy"],
        }
      );
    }
  }
  