import { EntityManager } from '@mikro-orm/core';
import { DiscountCoupon, DiscountUsage } from '../entities/DiscountCoupon';
import { Company } from '../entities/Company';
import { Service } from 'typedi';

export class DiscountCouponService {
  constructor(private readonly em: EntityManager) {}
  @Service()
  async generateCoupon(
    company: Company, discountPercentage: number, isPublic: boolean, validityDays: number, usageLimit: number,
        // options?: { prefix?: string; suffix?: string }
    ): Promise<DiscountCoupon> {
        const code = this.generateCouponCode(company.cname);
        const endDate = new Date(Date.now() + validityDays * 86400000);

        const coupon = new DiscountCoupon(
        code,
        discountPercentage,
        isPublic,
        new Date(),
        endDate,
        usageLimit,
        company
        );

        await this.em.persistAndFlush(coupon);
        return coupon;
    }

    private generateCouponCode(
        companyName: string, 
        options?: { prefix?: string; suffix?: string }
    ): string {
        const base = companyName
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 4);

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const parts = [
        options?.prefix?.toUpperCase().substring(0, 3),
        base,
        randomNum,
        options?.suffix?.toUpperCase().substring(0, 3)
        ].filter(Boolean);

        return parts.join('-');
    }

    async validateCoupon(
        code: string
    ): Promise<{ valid: boolean; discount?: number; message?: string }> {
        const coupon = await this.em.findOne(DiscountCoupon, { code });
        
        if (!coupon) return { valid: false, message: 'Invalid coupon code' };
        if (coupon.currentUsage >= coupon.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
        }
        
        const now = new Date();
        if (now < coupon.startDate) return { valid: false, message: 'Coupon not yet valid' };
        if (now > coupon.endDate) return { valid: false, message: 'Coupon has expired' };
        
        return { valid: true, discount: coupon.discountPercentage };
    }

    async recordCouponUsage(
        code: string, 
        userId: string, 
        orderId: string
    ): Promise<void> {
        const coupon = await this.em.findOne(DiscountCoupon, { code });
        if (!coupon) throw new Error('Invalid coupon code');
        if (coupon.currentUsage >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
        }
        
        const usage = new DiscountUsage(coupon, userId, orderId);
        coupon.currentUsage += 1;
        await this.em.persistAndFlush([usage, coupon]);
    }

    async getCompanyCoupons(
        companyId: string,
        includePrivate = false
    ): Promise<DiscountCoupon[]> {
        const where: any = { company: companyId };
        if (!includePrivate) where.isPublic = true;
        return this.em.find(DiscountCoupon, where);
    }
 }