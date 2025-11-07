import { Resolver, Mutation, Arg, Query, Ctx } from 'type-graphql';
import { DiscountCoupon, DiscountUsage } from '../entities/DiscountCoupon';
import { Company } from '../entities/Company';
import { MyContext } from '../types';
import { ManualCodeInput } from '../inputs/CodeInput';
import { EntityManager } from '@mikro-orm/core';

@Resolver(() => DiscountCoupon)
export class DiscountCouponResolver {

  // CREATE COUPON
  @Mutation(() => DiscountCoupon)
  async createCoupon(
    @Arg('discountPercentage') discountPercentage: number,
    @Arg('isPublic') isPublic: boolean,
    @Arg('validityDays') validityDays: number,
    @Arg('usageLimit') usageLimit: number,
    @Arg('code', () => String, { nullable: true }) code: string | null,
    @Ctx() { em, req }: MyContext
  ): Promise<DiscountCoupon> {
    const company = await em.findOneOrFail(Company, { id: req.session.companyId });
    let finalCode = code?.trim();

    if (finalCode) {
      const hasSpecialChar = /[^A-Za-z0-9]/.test(finalCode);
      if (finalCode.length > 15 || !hasSpecialChar) {
        throw new Error("Custom coupon code must be ≤ 15 characters and include at least one special character.");
      }

      const existing = await em.findOne(DiscountCoupon, { code: finalCode });
      if (existing) {
        throw new Error("Coupon code already exists. Please choose a different one.");
      }
    } else {
      finalCode = await this.generateCouponCode(company.cname, em);
    }

    const coupon = new DiscountCoupon(
      finalCode,
      discountPercentage,
      isPublic,
      new Date(),
      new Date(Date.now() + validityDays * 86400000),
      usageLimit,
      company
    );

    await em.persistAndFlush(coupon);
    return coupon;
  }

  // CREATE CUSTOM COUPON
  @Mutation(() => DiscountCoupon)
  async createCustomCoupon(
    @Arg("input", () => ManualCodeInput) input: ManualCodeInput,
    @Ctx() { em, req }: MyContext
  ): Promise<DiscountCoupon> {
    const company = await em.findOneOrFail(Company, { id: req.session.companyId });
    if (!company) throw new Error("Not authenticated");

    let finalCode = input.code?.trim();

    if (finalCode) {
      const existing = await em.findOne(DiscountCoupon, { code: finalCode });
      if (existing) throw new Error("Coupon code already exists.");
    } else {
      finalCode = await this.generateCouponCode(company.cname, em);
    }

    const now = new Date();
    const validity = input.usageLimit || 30;

    const manualCode = em.create(DiscountCoupon, {
      code: finalCode,
      discountPercentage: input.discountPercentage || 0,
      isPublic: false,
      startDate: now,
      endDate: new Date(now.getTime() + validity * 86400000),
      usageLimit: input.usageLimit || 0,
      currentUsage: input.currentUsage || 0,
      company,
      createdAt: now,
      updatedAt: now,
    });

    await em.persistAndFlush(manualCode);
    return manualCode;
  }

  // VALIDATE COUPON
  @Query(() => Boolean)
  async validateCoupon(
    @Arg('code') code: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const coupon = await em.findOne(DiscountCoupon, { code });
    if (!coupon) return false;

    const now = new Date();
    return (
      coupon.currentUsage < coupon.usageLimit &&
      now >= coupon.startDate &&
      now <= coupon.endDate
    );
  }

  // APPLY COUPON TO ORDER
  @Mutation(() => Boolean)
  async applyCoupon(
    @Arg('code') code: string,
    @Arg('cartId') cartId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<boolean> {
    const coupon = await em.findOne(DiscountCoupon, { code });
    if (!coupon) throw new Error("Invalid coupon");

    coupon.currentUsage += 1;
    em.persist(new DiscountUsage(
      coupon,
      req.session.userId!,
      cartId
    ));

    await em.flush();
    return true;
  }

  // GET COMPANY'S COUPONS
  @Query(() => [DiscountCoupon])
  async getCompanyCoupons(
    @Ctx() { em, req }: MyContext
  ): Promise<DiscountCoupon[]> {
    return em.find(DiscountCoupon, {
      company: req.session.companyId
    }, {
      populate: ['usages']
    });
  }

  // GENERATE UNIQUE COUPON CODE
  private async generateCouponCode(
    companyName: string,
    em: EntityManager,
    options: { prefix?: string; suffix?: string } = {}
  ): Promise<string> {
    let code: string;
    let attempts = 0;

    do {
      const base = companyName
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 4);

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const parts = [
        options.prefix?.toUpperCase().substring(0, 3),
        base,
        randomNum,
        options.suffix?.toUpperCase().substring(0, 3)
      ].filter(Boolean);

      code = parts.join('-FJ#');
      attempts++;

      if (attempts > 5) throw new Error("Couldn't generate a unique coupon code.");
    } while (await em.findOne(DiscountCoupon, { code }));

    return code;
  }
}
