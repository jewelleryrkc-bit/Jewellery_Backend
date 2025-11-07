// src/resolvers/BoughtProductResolver.ts
import { Company } from "../entities/Company";
import { BoughtProduct } from "../entities/BoughtProduct";
import { Product } from "../entities/Products";
import { MyContext } from "../types";
import { Resolver, Query, Arg, Ctx } from "type-graphql";

@Resolver()
export class BoughtProductResolver {
  
  @Query(() => Boolean)
  async hasUserBoughtProduct(
    @Arg("productId") productId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<boolean> {
    const userId = req.session.userId;
    if (!userId) throw new Error("Not authenticated");

    const boughtRecord = await em.findOne(BoughtProduct, {
      user: userId,
      product: productId,
    });

    return !!boughtRecord;
  }

  @Query(() => [Product])
  async getBoughtProducts(
    @Ctx() { em, req }: MyContext
  ): Promise<Product[]> {
    const userId = req.session.userId;
    if (!userId) throw new Error("Not authenticated");

    const boughtRecords = await em.find(BoughtProduct, {
      user: userId
    }, { 
      populate: ['product', 'product.company'],
      orderBy: { boughtAt: 'DESC' }
    });

    return boughtRecords.map(r => r.product);
  }

  @Query(() => [BoughtProduct])
  async getPurchaseHistory(
    @Ctx() { em, req }: MyContext
  ): Promise<BoughtProduct[]> {
    const userId = req.session.userId;
    if (!userId) throw new Error("Not authenticated");

    return await em.find(BoughtProduct, {
      user: userId
    }, { 
      populate: ['product', 'product.company'],
      orderBy: { boughtAt: 'DESC' }
    });
  }

  @Query(() => [BoughtProduct])
  async getProductPurchaseHistory(
    @Arg("productId") productId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<BoughtProduct[]> {
    if (!req.session.companyId) throw new Error("Not authenticated as seller");

    const company = await em.findOneOrFail(Company, { id: req.session.companyId });
    if(!company) {
      throw new Error("Company doesn't exist");
    }
    const product = await em.findOneOrFail(Product, { id: productId, company });
    if(!product) {
      throw new Error(" Product not found ");
    }

    return await em.find(BoughtProduct, {
      product: productId
    }, { 
      populate: ['user'],
      orderBy: { boughtAt: 'DESC' }
    });
  }
}