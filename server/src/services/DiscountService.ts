// services/DiscountService.ts
import { Discount, DiscountType } from "../entities/Discount";
import { EntityManager } from '@mikro-orm/core';
import { DiscountCoupon, DiscountUsage } from '../entities/DiscountCoupon';
import { Company } from '../entities/Company';

interface CartItemForDiscount {
  productId: string;
  categoryId?: string;
  companyId?: string;
  price: number;
  quantity: number;
  originalPrice?: number;
}

export class DiscountService {
  constructor(private readonly em: EntityManager) {}

  static applyDiscounts(
    cartItems: CartItemForDiscount[],
    discounts: Discount[]
  ): { totalDiscount: number; discountBreakdown: any[] } {
    let totalDiscount = 0;
    const discountBreakdown: any[] = [];
    const appliedDiscounts = new Set<string>(); // Track applied discounts to prevent double application

    // Calculate original subtotal
    const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Apply discounts in priority order
    const discountTypesOrder = [
      DiscountType.BOGO,
      DiscountType.PERCENTAGE,
      DiscountType.FIXED_AMOUNT,
      DiscountType.QUANTITY_THRESHOLD,
      DiscountType.SPEND_THRESHOLD
    ];

    for (const discountType of discountTypesOrder) {
      const typeDiscounts = discounts.filter(d => d.type === discountType && !appliedDiscounts.has(d.id));
      
      for (const discount of typeDiscounts) {
        if (this.isDiscountApplicable(discount, cartItems)) {
          const discountAmount = this.applySingleDiscount(cartItems, discount, totalDiscount, originalSubtotal);
          
          if (discountAmount > 0) {
            totalDiscount += discountAmount;
            appliedDiscounts.add(discount.id);
            
            discountBreakdown.push({
              discountId: discount.id,
              amount: discountAmount,
              type: discount.type,
              name: this.getDiscountName(discount),
              appliedTo: discount.product ? 'product' : discount.category ? 'category' : 'cart'
            });

            // Safety check: discount shouldn't exceed original subtotal
            if (totalDiscount > originalSubtotal) {
              totalDiscount = originalSubtotal;
              break;
            }
          }
        }
      }
    }

    return { totalDiscount, discountBreakdown };
  }

  private static isDiscountApplicable(discount: Discount, cartItems: CartItemForDiscount[]): boolean {
    if (!discount.isActive) return false;
    
    const now = new Date();
    if (now < discount.startDate) return false;
    if (discount.endDate && now > discount.endDate) return false;

    // Check if discount applies to specific products/categories
    if (discount.product) {
      return cartItems.some(item => item.productId === discount.product!.id);
    }
    
    if (discount.category) {
      return cartItems.some(item => item.categoryId === discount.category!.id);
    }

    // Check threshold requirements
    switch (discount.type) {
      case DiscountType.SPEND_THRESHOLD:
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal >= (discount.thresholdAmount || 0);
      
      case DiscountType.QUANTITY_THRESHOLD:
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return totalQuantity >= (discount.thresholdQuantity || 0);
      
      default:
        return true;
    }
  }

  private static applySingleDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    currentTotalDiscount: number,
    originalSubtotal: number
  ): number {
    const remainingBudget = originalSubtotal - currentTotalDiscount;
    if (remainingBudget <= 0) return 0;

    switch (discount.type) {
      case DiscountType.SPEND_THRESHOLD:
        return this.applySpendThresholdDiscount(cartItems, discount, remainingBudget);
      
      case DiscountType.QUANTITY_THRESHOLD:
        return this.applyQuantityThresholdDiscount(cartItems, discount, remainingBudget);
      
      case DiscountType.BOGO:
        return this.applyBogoDiscount(cartItems, discount, remainingBudget);
      
      case DiscountType.PERCENTAGE:
        return this.applyPercentageDiscount(cartItems, discount, remainingBudget);
      
      case DiscountType.FIXED_AMOUNT:
        return this.applyFixedAmountDiscount(cartItems, discount, remainingBudget);
      
      default:
        return 0;
    }
  }

  private static applySpendThresholdDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    remainingBudget: number
  ): number {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (subtotal >= discount.thresholdAmount!) {
      const discountAmount = discount.value <= 100 
        ? subtotal * (discount.value / 100)
        : discount.value;
      
      return Math.min(discountAmount, remainingBudget);
    }
    return 0;
  }

  private static applyQuantityThresholdDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    remainingBudget: number
  ): number {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalQuantity >= discount.thresholdQuantity!) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discountAmount = discount.value <= 100 
        ? subtotal * (discount.value / 100)
        : discount.value;
      
      return Math.min(discountAmount, remainingBudget);
    }
    return 0;
  }

  private static applyBogoDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    remainingBudget: number
  ): number {
    let totalDiscount = 0;
    const buy = discount.bogoBuy || 1;
    const get = discount.bogoGet || 1;
    const discountPercent = discount.bogoDiscount || 100;

    for (const item of cartItems) {
      if (discount.product && item.productId !== discount.product.id) continue;
      if (discount.category && item.categoryId !== discount.category.id) continue;

      const sets = Math.floor(item.quantity / (buy + get));
      const freeItems = sets * get;
      const itemDiscount = freeItems * item.price * (discountPercent / 100);
      
      totalDiscount += Math.min(itemDiscount, remainingBudget - totalDiscount);
      
      if (totalDiscount >= remainingBudget) {
        totalDiscount = remainingBudget;
        break;
      }
    }
    
    return totalDiscount;
  }

  private static applyPercentageDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    remainingBudget: number
  ): number {
    let applicableItemsTotal = 0;

    for (const item of cartItems) {
      if (discount.product && item.productId !== discount.product.id) continue;
      if (discount.category && item.categoryId !== discount.category.id) continue;
      
      applicableItemsTotal += item.price * item.quantity;
    }

    const discountAmount = applicableItemsTotal * (discount.value / 100);
    return Math.min(discountAmount, remainingBudget);
  }

  private static applyFixedAmountDiscount(
    cartItems: CartItemForDiscount[], 
    discount: Discount, 
    remainingBudget: number
  ): number {
    let applicableItemsTotal = 0;

    for (const item of cartItems) {
      if (discount.product && item.productId !== discount.product.id) continue;
      if (discount.category && item.categoryId !== discount.category.id) continue;
      
      applicableItemsTotal += item.price * item.quantity;
    }

    // For fixed amount, distribute proportionally if it's product/category specific
    if (discount.product || discount.category) {
      const totalSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const proportion = applicableItemsTotal / totalSubtotal;
      const proportionalDiscount = discount.value * proportion;
      
      return Math.min(proportionalDiscount, remainingBudget);
    }

    return Math.min(discount.value, remainingBudget);
  }

  private static getDiscountName(discount: Discount): string {
    switch (discount.type) {
      case DiscountType.SPEND_THRESHOLD:
        return `Spend $${discount.thresholdAmount}, get ${discount.value}% off`;
      
      case DiscountType.QUANTITY_THRESHOLD:
        return `Buy ${discount.thresholdQuantity} items, get ${discount.value}% off`;
      
      case DiscountType.BOGO:
        return `Buy ${discount.bogoBuy}, get ${discount.bogoGet} ${discount.bogoDiscount === 100 ? 'free' : `at ${discount.bogoDiscount}% off`}`;
      
      case DiscountType.PERCENTAGE:
        return `${discount.value}% off ${discount.product ? 'product' : discount.category ? 'category' : ''}`;
      
      case DiscountType.FIXED_AMOUNT:
        return `$${discount.value} off ${discount.product ? 'product' : discount.category ? 'category' : ''}`;
      
      default:
        return `${discount.value}% off`;
    }
  }

  // Coupon methods
  async generateCoupon(
    company: Company, 
    discountPercentage: number, 
    isPublic: boolean, 
    validityDays: number, 
    usageLimit: number
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

  private generateCouponCode(companyName: string): string {
    const base = companyName
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 4);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${base}-${randomNum}`;
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; discount?: number; message?: string }> {
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

  async recordCouponUsage(code: string, userId: string, orderId: string): Promise<void> {
    const coupon = await this.em.findOne(DiscountCoupon, { code });
    if (!coupon) throw new Error('Invalid coupon code');
    if (coupon.currentUsage >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }
    
    const usage = new DiscountUsage(coupon, userId, orderId);
    coupon.currentUsage += 1;
    await this.em.persistAndFlush([usage, coupon]);
  }

  async getCompanyCoupons(companyId: string, includePrivate = false): Promise<DiscountCoupon[]> {
    const where: any = { company: companyId };
    if (!includePrivate) where.isPublic = true;
    return this.em.find(DiscountCoupon, where);
  }
}