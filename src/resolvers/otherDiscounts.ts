// // otherDiscounts resolver
// import { Category } from "../entities/Category";
// import { Company } from "../entities/Company";
// import { Discount, DiscountType } from "../entities/Discount";
// import { Product, ProductStatus } from "../entities/Products";
// import { MyContext } from "../types";
// import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";

// @InputType()
// export class DiscountInput {
//   @Field(() => DiscountType)
//   type!: DiscountType;

//   @Field(() => Int)
//   value!: number;

//   @Field(() => Date)
//   startDate!: Date;

//   @Field(() => Date, { nullable: true })
//   endDate?: Date;
// }

// const allowedStatuses = ['draft', 'active', 'expired', 'archived'] as const;
// type DiscountStatus = typeof allowedStatuses[number];

// @Resolver(() => Discount)
// export class DiscountResolver {

//    // In your Discount resolver file
// @Query(() => [Discount])
// async getSellerDiscounts(
//   @Ctx() { em, req }: MyContext
// ): Promise<Discount[]> {
//   if (!req.session.companyId) {
//     throw new Error("Not authenticated");
//   }

//   return em.find(Discount, { 
//     company: req.session.companyId 
//   }, {
//     populate: ['category', 'product', 'company'] // Optional: populate related entities if needed
//   });
// }
  
//   @Mutation(() => Discount)
//   async createDiscount(
//     @Arg("input") input: DiscountInput,
//     @Ctx() { em, req }: MyContext
//   ) {
//     const company = await em.findOne(Company, { id: req.session.companyId });
//     if (!company) throw new Error("Company not found");

//     // Validate value
//     if (input.type === DiscountType.PERCENTAGE && (input.value < 1 || input.value > 99)) {
//       throw new Error("Percentage must be between 1-99");
//     }

//     if (input.type === DiscountType.FIXED_AMOUNT && (input.value < 10 || input.value > 50)) {
//       throw new Error("Fixed amount must be between $10-$50");
//     }

//     if (input.endDate && new Date(input.endDate) <= new Date()) {
//       throw new Error("End date must be in the future");
//     }

//     const existingDiscount = await em.findOne(Discount, { value: input.value});
//     if(existingDiscount){
//       throw new Error("value already exists!");
//     }

//     const discount = em.create(Discount, {
//       ...input,
//       company,
//       isActive: true,
//       status: 'draft'
//     });

//     discount.checkStatus();
//     await em.persistAndFlush(discount);
//     return discount;
//   }

//   @Mutation(() => Discount)
//   async updateDiscountStatus(
//     @Arg("id") id: string,
//     @Arg("status") status: string,
//     @Ctx() { em }: MyContext
//   ) {
//     if (!allowedStatuses.includes(status as DiscountStatus)) {
//       throw new Error("Invalid status value");
//     }

//     const discount = await em.findOne(Discount, { id });
//     if (!discount) throw new Error("Discount not found");

//     discount.status = status as DiscountStatus;
//     discount.isActive = status === 'active';
//     await em.persistAndFlush(discount);

//     return discount;
//   }

//   @Query(()=> [Discount])
//     async getAllDiscount(
//       @Ctx() { em,req }: MyContext
//     ): Promise<Discount[]>{
//       if(!req.session.companyId) throw new Error("Not authenticated");
//       return await em.find(
//         Discount,
//         { company: req.session.companyId },
//         { populate: ['product']}
//       );
//     }

//   @Mutation(() => Product)
//     async applyDiscount(
//       @Arg("productId") productId: string,
//       @Arg("discountId") discountId: string,
//       @Ctx() { em, req }: MyContext
//     ) {
//       // Find the product and verify company ownership
//       const product = await em.findOne(Product, {
//         id: productId,
//         company: req.session.companyId
//       });
//       if (!product) throw new Error("Product not found");

//       // Find the discount and verify it belongs to the same company
//       const discount = await em.findOne(Discount, {
//         id: discountId,
//         company: req.session.companyId
//       });
//       if (!discount) throw new Error("Discount not found");

//       // Check if discount is active
//       if (discount.status !== 'active') {
//         throw new Error("Discount is not active");
//       }

//       // Check discount dates
//       const now = new Date();
//       if (now < discount.startDate) {
//         throw new Error("Discount hasn't started yet");
//       }
//       if (discount.endDate && now > discount.endDate) {
//         throw new Error("Discount has expired");
//       }

//       // Apply discount based on type
//       if (discount.type === DiscountType.PERCENTAGE) {
//         product.discountedPrice = product.price * (1 - discount.value / 100);
//       } else if (discount.type === DiscountType.FIXED_AMOUNT) {
//         product.discountedPrice = Math.max(0, product.price - discount.value);
//       }

//       // Link the discount to the product
//       product.discount = discount;
      
//       await em.persistAndFlush(product);
//       return product;
//     }

//     @Mutation(() => [Product]) // Now returns array of updated products
//       async applyDiscountonCategory(
//         @Arg("discountId") discountId: string,
//         @Arg("categoryId") categoryId: string, // Changed from productId to categoryId
//         @Ctx() { em, req }: MyContext
//       ) {
//         // 1. Verify discount exists and belongs to company
//         const discount = await em.findOne(Discount, {
//           id: discountId,
//           company: req.session.companyId
//         });
//         if (!discount) throw new Error("Discount not found");

//         // 2. Verify category exists
//         const category = await em.findOne(Category, { id: categoryId });
//         if (!category) throw new Error("Category not found");

//         // 3. Check discount validity (active, dates, etc.)
//         if (discount.status !== 'active') {
//           throw new Error("Discount is not active");
//         }

//         const now = new Date();
//         if (now < discount.startDate) {
//           throw new Error("Discount hasn't started yet");
//         }
//         if (discount.endDate && now > discount.endDate) {
//           throw new Error("Discount has expired");
//         }

//         // 4. Find ALL products in this category
//         const products = await em.find(Product, {
//           category: categoryId,
//           company: req.session.companyId, // Ensure they belong to the same company
//           status: ProductStatus.ACTIVE // Only apply to active products
//         }, {
//           populate: ['category', 'subcategory']
//         });

//         // 5. Apply discount to each product
//         const updatedProducts: Product[] = [];
        
//         for (const product of products) {
//           if (discount.type === DiscountType.PERCENTAGE) {
//             product.discountedPrice = product.price * (1 - discount.value / 100);
//           } else if (discount.type === DiscountType.FIXED_AMOUNT) {
//             product.discountedPrice = Math.max(0, product.price - discount.value);
//           }

//           product.discount = discount;
//           updatedProducts.push(product);
//         }

//         await em.persistAndFlush(updatedProducts);
//         return updatedProducts;
//       }

//       @Query(() => [Discount])
//         async getCategoryDiscounts(
//           @Arg("categoryId") categoryId: string,
//           @Ctx() { em }: MyContext
//         ): Promise<Discount[]> {
//           return em.find(Discount, {
//             category: categoryId,
//             status: 'active',
//             isActive: true,
//             startDate: { $lte: new Date() },
//             $or: [
//               { endDate: null },
//               { endDate: { $gte: new Date() } }
//             ]
//           }); 
//     } 
// }
