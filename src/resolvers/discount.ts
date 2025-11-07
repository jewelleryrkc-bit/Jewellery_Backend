import { Resolver, Mutation, Arg, Query, Ctx, Field, InputType, Int } from "type-graphql";
import { Category } from "../entities/Category";
import { Company } from "../entities/Company";
import { Discount, DiscountType } from "../entities/Discount";
import { Product, ProductStatus } from "../entities/Products";
import { MyContext } from "../types";

@InputType()
export class DiscountInput {
  @Field(() => DiscountType)
  type!: DiscountType;

  @Field(() => Int)
  value!: number;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  thresholdAmount?: number;

  @Field(() => Int, { nullable: true })
  thresholdQuantity?: number;

  @Field(() => Int, { nullable: true })
  bogoBuy?: number;

  @Field(() => Int, { nullable: true })
  bogoGet?: number;

  @Field(() => Int, { nullable: true })
  bogoDiscount?: number;

  @Field({ nullable: true })
  productId?: string;

  @Field({ nullable: true })
  categoryId?: string;
}

const allowedStatuses = ['draft', 'active', 'expired', 'archived'] as const;
type DiscountStatus = typeof allowedStatuses[number];

@Resolver(() => Discount)
export class DiscountResolver {
  // Query to get all discounts
  @Query(() => [Discount])
  async discounts(@Ctx() { em }: MyContext): Promise<Discount[]> {
    return em.find(Discount, {}, { 
      populate: ["company", "product", "category"] 
    });
  }

  // Query to get a specific discount
  @Query(() => Discount, { nullable: true })
  async discount(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<Discount | null> {
    return em.findOne(Discount, { id }, { 
      populate: ["company", "product", "category"] 
    });
  }

  // Query to get discounts by company
  @Query(() => [Discount])
  async discountsByCompany(
    @Arg("companyId") companyId: string,
    @Ctx() { em }: MyContext
  ): Promise<Discount[]> {
    return em.find(Discount, { 
      company: { id: companyId } 
    }, { 
      populate: ["product", "category"] 
    });
  }

  // Query to get seller discounts
  @Query(() => [Discount])
  async getSellerDiscounts(
    @Ctx() { em, req }: MyContext
  ): Promise<Discount[]> {
    if (!req.session.companyId) {
      throw new Error("Not authenticated");
    }

    return em.find(Discount, { 
      company: req.session.companyId 
    }, {
      populate: ['category', 'product', 'company']
    });
  }

  // Query to get all discounts for authenticated company
  @Query(() => [Discount])
  async getAllDiscount(
    @Ctx() { em, req }: MyContext
  ): Promise<Discount[]> {
    if (!req.session.companyId) throw new Error("Not authenticated");
    return await em.find(
      Discount,
      { company: req.session.companyId },
      { populate: ['product']}
    );
  }

  // Query to get active category discounts
  @Query(() => [Discount])
  async getCategoryDiscounts(
    @Arg("categoryId") categoryId: string,
    @Ctx() { em }: MyContext
  ): Promise<Discount[]> {
    return em.find(Discount, {
      category: categoryId,
      status: 'active',
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    }); 
  }

  // Create discount mutation
  @Mutation(() => Discount)
  async createDiscount(
    @Arg("input") input: DiscountInput,
    @Ctx() { em, req }: MyContext
  ): Promise<Discount> {
    const company = await em.findOneOrFail(Company, { id: req.session.companyId });
    
    this.validateDiscountInput(input);

    // Validate value based on type
    if (input.type === DiscountType.PERCENTAGE && (input.value < 1 || input.value > 99)) {
      throw new Error("Percentage must be between 1-99");
    }

    if (input.type === DiscountType.FIXED_AMOUNT && (input.value < 10 || input.value > 50)) {
      throw new Error("Fixed amount must be between $10-$50");
    }

    if (input.endDate && new Date(input.endDate) <= new Date()) {
      throw new Error("End date must be in the future");
    }

    const discountData: any = {
      company,
      type: input.type,
      value: input.value,
      startDate: input.startDate,
      endDate: input.endDate || undefined,
      isActive: true,
      status: 'draft'
    };

    // Set product or category if provided
    if (input.productId) {
      discountData.product = await em.findOneOrFail(Product, { id: input.productId });
    }
    
    if (input.categoryId) {
      discountData.category = await em.findOneOrFail(Category, { id: input.categoryId });
    }

    // Set fields based on discount type
    switch (input.type) {
      case DiscountType.SPEND_THRESHOLD:
        discountData.thresholdAmount = input.thresholdAmount!;
        break;
      
      case DiscountType.QUANTITY_THRESHOLD:
        discountData.thresholdQuantity = input.thresholdQuantity!;
        break;
      
      case DiscountType.BOGO:
        discountData.bogoBuy = input.bogoBuy!;
        discountData.bogoGet = input.bogoGet!;
        discountData.bogoDiscount = input.bogoDiscount || 100;
        break;
    }

    const discount = em.create(Discount, discountData);
    discount.checkStatus();
    await em.persistAndFlush(discount);
    
    return discount;
  }

  // Update discount mutation
  @Mutation(() => Discount)
  async updateDiscount(
    @Arg("id") id: string,
    @Arg("input") input: DiscountInput,
    @Ctx() { em }: MyContext
  ): Promise<Discount> {
    const discount = await em.findOneOrFail(Discount, { id });
    
    this.validateDiscountInput(input);
    
    discount.type = input.type;
    discount.value = input.value;
    discount.startDate = input.startDate;
    discount.endDate = input.endDate || undefined;

    // Reset optional fields to undefined instead of null
    discount.thresholdAmount = undefined;
    discount.thresholdQuantity = undefined;
    discount.bogoBuy = undefined;
    discount.bogoGet = undefined;
    discount.bogoDiscount = undefined;

    // Set fields based on discount type
    switch (input.type) {
      case DiscountType.SPEND_THRESHOLD:
        discount.thresholdAmount = input.thresholdAmount!;
        break;
      
      case DiscountType.QUANTITY_THRESHOLD:
        discount.thresholdQuantity = input.thresholdQuantity!;
        break;
      
      case DiscountType.BOGO:
        discount.bogoBuy = input.bogoBuy!;
        discount.bogoGet = input.bogoGet!;
        discount.bogoDiscount = input.bogoDiscount || 100;
        break;
    }

    discount.checkStatus();
    await em.flush();
    
    return discount;
  }

  // Update discount status mutation
  @Mutation(() => Discount)
  async updateDiscountStatus(
    @Arg("id") id: string,
    @Arg("status") status: string,
    @Ctx() { em }: MyContext
  ) {
    if (!allowedStatuses.includes(status as DiscountStatus)) {
      throw new Error("Invalid status value");
    }

    const discount = await em.findOne(Discount, { id });
    if (!discount) throw new Error("Discount not found");

    discount.status = status as DiscountStatus;
    discount.isActive = status === 'active';
    await em.persistAndFlush(discount);

    return discount;
  }

  // Delete discount mutation
  @Mutation(() => Boolean)
  async deleteDiscount(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      const discount = await em.findOneOrFail(Discount, { id });
      await em.removeAndFlush(discount);
      return true;
    } catch {
      return false;
    }
  }

  // Activate discount mutation
  @Mutation(() => Discount)
  async activateDiscount(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<Discount> {
    const discount = await em.findOneOrFail(Discount, { id });
    discount.isActive = true;
    discount.status = "active";
    await em.flush();
    return discount;
  }

  // Deactivate discount mutation
  @Mutation(() => Discount)
  async deactivateDiscount(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<Discount> {
    const discount = await em.findOneOrFail(Discount, { id });
    discount.isActive = false;
    discount.status = "draft";
    await em.flush();
    return discount;
  }

  // Apply discount to a single product
  @Mutation(() => Product)
  async applyDiscount(
    @Arg("productId") productId: string,
    @Arg("discountId") discountId: string,
    @Ctx() { em, req }: MyContext
  ) {
    // Find the product and verify company ownership
    const product = await em.findOne(Product, {
      id: productId,
      company: req.session.companyId
    });
    if (!product) throw new Error("Product not found");

    // Find the discount and verify it belongs to the same company
    const discount = await em.findOne(Discount, {
      id: discountId,
      company: req.session.companyId
    });
    if (!discount) throw new Error("Discount not found");

    // Validate discount
    this.validateDiscountApplication(discount);

    // Apply discount based on type
    this.applyDiscountToProduct(product, discount);
    
    // Link the discount to the product
    product.discount = discount;
    
    await em.persistAndFlush(product);
    return product;
  }

  // Apply discount to all products in a category
  @Mutation(() => [Product])
  async applyDiscountonCategory(
    @Arg("discountId") discountId: string,
    @Arg("categoryId") categoryId: string,
    @Ctx() { em, req }: MyContext
  ) {
    // Verify discount exists and belongs to company
    const discount = await em.findOne(Discount, {
      id: discountId,
      company: req.session.companyId
    });
    if (!discount) throw new Error("Discount not found");

    // Verify category exists
    const category = await em.findOne(Category, { id: categoryId });
    if (!category) throw new Error("Category not found");

    // Validate discount
    this.validateDiscountApplication(discount);

    // Find ALL products in this category
    const products = await em.find(Product, {
      category: categoryId,
      company: req.session.companyId,
      status: ProductStatus.ACTIVE
    }, {
      populate: ['category', 'subcategory']
    });

    // Apply discount to each product
    const updatedProducts: Product[] = [];
    
    for (const product of products) {
      this.applyDiscountToProduct(product, discount);
      product.discount = discount;
      updatedProducts.push(product);
    }

    await em.persistAndFlush(updatedProducts);
    return updatedProducts;
  }

  // Validation helper for discount input
  private validateDiscountInput(input: DiscountInput): void {
    switch (input.type) {
      case DiscountType.SPEND_THRESHOLD:
        if (!input.thresholdAmount) {
          throw new Error("Threshold amount is required for spend threshold discounts");
        }
        break;
      
      case DiscountType.QUANTITY_THRESHOLD:
        if (!input.thresholdQuantity) {
          throw new Error("Threshold quantity is required for quantity threshold discounts");
        }
        break;
      
      case DiscountType.BOGO:
        if (!input.bogoBuy || !input.bogoGet) {
          throw new Error("Buy and Get quantities are required for BOGO discounts");
        }
        if (input.bogoDiscount && (input.bogoDiscount < 0 || input.bogoDiscount > 100)) {
          throw new Error("BOGO discount must be between 0 and 100 percent");
        }
        break;
    }
  }

  // Validation helper for discount application
  private validateDiscountApplication(discount: Discount): void {
    // Check if discount is active
    if (discount.status !== 'active') {
      throw new Error("Discount is not active");
    }

    // Check discount dates
    const now = new Date();
    if (now < discount.startDate) {
      throw new Error("Discount hasn't started yet");
    }
    if (discount.endDate && now > discount.endDate) {
      throw new Error("Discount has expired");
    }

    // For threshold-based discounts, we can't apply them directly to products
    // They need to be handled during checkout
    if ([DiscountType.SPEND_THRESHOLD, DiscountType.QUANTITY_THRESHOLD].includes(discount.type)) {
      throw new Error("Threshold-based discounts can only be applied during checkout");
    }
  }

  // Helper to apply discount to a product
  private applyDiscountToProduct(product: Product, discount: Discount): void {
    // Only apply percentage and fixed amount discounts directly to products
    // BOGO discounts need to be handled during checkout as well
    if (discount.type === DiscountType.PERCENTAGE) {
      product.discountedPrice = product.price * (1 - discount.value / 100);
    } else if (discount.type === DiscountType.FIXED_AMOUNT) {
      product.discountedPrice = Math.max(0, product.price - discount.value);
    } else {
      // For BOGO and threshold discounts, we don't set a discounted price
      // These will be handled during checkout
      product.discountedPrice = undefined;
    }
  }
}