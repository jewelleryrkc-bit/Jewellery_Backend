import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  Int,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { Product, ProductStatus } from "../entities/Products";
import { ProductInput, UpdateProductFields } from "../inputs/ProductInput";
import { Category } from "../entities/Category";
import { Company } from "../entities/Company";
import { ProductVariation } from "../entities/ProductVar";
import slugify from "slugify";
import { Review, ReviewSentiment } from "../entities/Reviews";
import { PaginatedProducts } from "../types/PaginatedProducts";
import { v4 as uuidv4 } from "uuid";
import { getOrSetCache, invalidateProductData } from "../utils/cache";
import { Discount, DiscountType } from "../entities/Discount";

// import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import { UploadService } from "../services/uploadService";
import { ProductImage } from "../entities/ProductImage";
// import { CartItem } from "@entities/CartItem";
// import { ProductImageInput } from "../inputs/ProductImageInput";

@Resolver(() => Product)
export class ProductResolver {
  @Query(() => Product, { nullable: true })
  async product(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    const key = `product.id:${id}`;
    const index = `product:${id}`;

    return getOrSetCache(
      () => {
        return em.findOne(
          Product,
          { id, status: ProductStatus.ACTIVE },
          { populate: ["variations", "category", "reviews.user", "company"] }
        );
      },
      {
        key,
        ttl: 300,
        index,
        validate: (data) => !!data && !!data.id,
      }
    );
  }

  @Query(() => [Product])
  async myProducts(@Ctx() { em, req }: MyContext): Promise<Product[]> {
    if (!req.session.companyId) throw new Error("Not authenticated");
    return await em.find(
      Product,
      { company: req.session.companyId },
      {
        populate: ["reviews", "variations", "company"],
      }
    );
  }

  @Query(() => Product, { nullable: true })
  async sellerProduct(
    @Arg("id") id: string,
    @Ctx() { em, req }: MyContext
  ): Promise<Product | null> {
    if (!req.session.companyId) throw new Error("Not authenticated");

    return await em.findOne(
      Product,
      { id, company: req.session.companyId },
      {
        populate: ["variations", "category", "reviews.user", "company"],
      }
    );
  }

  @Query(() => [Product])
  async getSimilarProducts(
    @Arg("category") category: string,
    @Arg("productId") productId: string,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const categoryEntity = await em.findOne(Category, { name: category });
    if (!categoryEntity) throw new Error(`Category "${category}" not found.`);

    return await em.find(
      Product,
      {
        category: categoryEntity.id,
        id: { $ne: productId },
        status: ProductStatus.ACTIVE, //
      },
      {
        populate: ["variations"],
      }
    );
  }

  @Query(() => [Product])
  async allProductsforadmin(
    @Ctx() { em }: MyContext,
    @Arg("category", { nullable: true }) categoryId?: string,
    @Arg("sentiment", () => ReviewSentiment, { nullable: true })
    sentiment?: ReviewSentiment,
    @Arg("minPrice", { nullable: true }) minPrice?: number,
    @Arg("maxPrice", { nullable: true }) maxPrice?: number,
    @Arg("material", { nullable: true }) material?: string
  ): Promise<Product[]> {
    const filters: any = {
      ...(categoryId && { category: categoryId }),
      ...(material && { material }),
      ...(sentiment && { sentiment }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { $gte: minPrice }),
          ...(maxPrice !== undefined && { $lte: maxPrice }),
        },
      }),
    };

    return await em.find(Product, filters, {
      populate: ["reviews", "variations", "category", "images"],
    });
  }

  @Query(() => [Product])
  async allProducts(
    @Ctx() { em }: MyContext,
    @Arg("category", { nullable: true }) categoryId?: string,
    @Arg("minPrice", { nullable: true }) minPrice?: number,
    @Arg("maxPrice", { nullable: true }) maxPrice?: number,
    @Arg("material", { nullable: true }) material?: string
  ): Promise<Product[]> {
    // const filters: any = { status: ProductStatus.ACTIVE }; // ✅

    const filters: any = {
      status: ProductStatus.ACTIVE,
      ...(categoryId && { category: categoryId }),
      ...(material && { material }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { $gte: minPrice }),
          ...(maxPrice !== undefined && { $lte: maxPrice }),
        },
      }),
    };

    return await em.find(Product, filters, {
      populate: [
        "variations",
        "images",
        "category",
        "subcategory",
        "discount",
        "discountedPrice",
      ],
    });
  }

  @Query(() => [Product])
  async getMaterials(
    @Ctx() { em }: MyContext,
    @Arg("material", { nullable: true }) material?: string
  ): Promise<Product[]> {
    const filters: any = { status: ProductStatus.ACTIVE };
    if (material) filters.material = material;
    return em.find(Product, filters, { populate: ["variations", "images"] });
  }

  @Query(() => [Product])
  async filteredProducts(
    @Arg("search", { nullable: true }) search: string,
    @Arg("category", () => [String], { nullable: true }) categoryIds: string[],
    @Arg("material", { nullable: true }) material: string,
    @Arg("minRating", { nullable: true }) minRating: number,
    @Arg("maxRating", { nullable: true }) maxRating: number,
    @Arg("minPrice", { nullable: true }) minPrice: number,
    @Arg("maxPrice", { nullable: true }) maxPrice: number,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const filters: any = {
      status: ProductStatus.ACTIVE,
      ...(search && { name: { $ilike: `%${search}%` } }),
      ...(categoryIds && { category: { $in: categoryIds } }),
      ...(material && { material }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { $gte: minPrice }),
          ...(maxPrice !== undefined && { $lte: maxPrice }),
        },
      }),
      ...((minRating !== undefined || maxRating !== undefined) && {
        averageRating: {
          ...(minRating !== undefined && { $gte: minRating }),
          ...(maxRating !== undefined && { $lte: maxRating }),
        },
      }),
    };

    return await em.find(Product, filters, {
      populate: ["category", "variations", "images"],
      orderBy: { averageRating: "DESC" },
    });
  }

  @Query(() => [Product])
  async topRatedProducts(
    @Arg("limit", () => Int, { defaultValue: 5 }) limit: number,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const key = `product:top-rated:${limit}`;
    return getOrSetCache(
      () => {
        return em.find(
          Product,
          { status: ProductStatus.ACTIVE }, // ✅
          {
            orderBy: { averageRating: "DESC" },
            limit,
            populate: ["reviews", "variations", "category"],
          }
        );
      },
      {
        key,
        ttl: 300,
        index: "product:top-rated",
      }
    );
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("input", () => ProductInput) input: ProductInput,
    @Arg("vendorId", () => String, { nullable: true }) vendorId?: string,
    // @Arg("images", () => [ProductImageInput], { nullable: true }) images?: ProductImageInput[],
    @Ctx() { em, req }: MyContext = {} as MyContext
  ): Promise<Product> {
    const loggedVendor = req.session.companyId;
    const loggedAdmin = req.session.adminId;

    // --------- ACCESS CONTROL ------------
    if (!loggedVendor && !loggedAdmin) {
      throw new Error("Only vendors or admins can create products.");
    }

    // Determine company
    let company: Company | null = null;
    if (loggedVendor) company = await em.findOne(Company, { id: loggedVendor });
    else if (loggedAdmin) {
      if (!vendorId) throw new Error("Admin must provide vendorId.");
      company = await em.findOne(Company, { id: vendorId });
    }
    if (!company) throw new Error("Vendor/Company not found!");

    // Validate categories
    const category = await em.findOne(Category, { id: input.category });
    // const subcategory = await em.findOne(Category, { id: input.subcategory });
    if (!category) throw new Error("Invalid category.");
    let subcategory: Category | null = null;
    if (input.subcategory) {
      subcategory = await em.findOne(Category, { id: input.subcategory });
      if (!subcategory) throw new Error("Invalid subcategory.");
    }

    // Slug
    const baseSlug = slugify(input.name, { lower: true, strict: true });
    const uuidSuffix = uuidv4().split("-")[0];
    const finalSlug = `${baseSlug}-${uuidSuffix}`;

    // Create product entity
    const product = em.create(Product, {
      ...input,
      category,
      subcategory,
      company,
      slug: finalSlug,
      averageRating: 0,
      soldCount: 0,
      reviewCount: 0,
      variations: [],
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ProductStatus.ACTIVE,
    });

    // Apply category discount
    const activeDiscounts = await em.find(Discount, {
      category: input.category,
      status: "active",
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    });
    if (activeDiscounts.length > 0) {
      const discount = activeDiscounts[0];
      product.discount = discount;
      product.discountedPrice =
        discount.type === DiscountType.PERCENTAGE
          ? product.price * (1 - discount.value / 100)
          : Math.max(0, product.price - discount.value);
    }

    await em.persistAndFlush(product);

    // Variations
    if (input.variations) {
      for (const variationInput of input.variations) {
        if (!variationInput.size)
          throw new Error("Variation must have a size.");
        if (!variationInput.color)
          throw new Error("Variation must have a color.");

        const variationSlug = slugify(
          `${product.slug}-${variationInput.size}-${variationInput.color}-${
            uuidv4().split("-")[0]
          }`,
          { lower: true, strict: true }
        );

        const variation = em.create(ProductVariation, {
          ...variationInput,
          product,
          productId: product.id,
          slug: variationSlug,
          name: product.name,
          description: product.description,
          material: product.material,
          images: variationInput.images || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        product.variations.add(variation);
        await em.persistAndFlush(variation);
      }
    }

    // Save images from ProductInput (after REST upload)
    if (!input.images || input.images.length === 0) {
      throw new Error("At least one product image is required.");
    }

    for (let index = 0; index < input.images.length; index++) {
      const imgData = input.images[index];

      const img = em.create(ProductImage, {
        url: imgData.url,
        key: imgData.key,
        product,
        isPrimary: index === 0, // first image = primary
        position: index, // 0,1,2,...
      });

      product.images.add(img);
      await em.persistAndFlush(img);
    }

    return product;
  }

  @Mutation(() => Product)
  async updateProducts(
    @Arg("id") id: string,
    @Arg("input", () => UpdateProductFields) input: UpdateProductFields,
    @Ctx() { em, req }: MyContext
  ): Promise<Product> {
    if (!req.session.companyId) throw new Error("Not authenticated");

    const product = await em.findOne(
      Product,
      { id },
      { populate: ["variations"] }
    );
    if (!product) throw new Error("Product not found");

    if (input.name && input.name !== product.name) {
      const baseSlug = slugify(input.name, { lower: true, strict: true });
      const uuidSuffix = uuidv4().split("-")[0];
      product.slug = `${baseSlug}-${uuidSuffix}`;

      for (const variation of product.variations) {
        const variationSuffix = uuidv4().split("-")[0];
        variation.slug = slugify(
          `${product.slug}-${variation.size}-${variation.color}-${variationSuffix}`,
          { lower: true, strict: true }
        );
        variation.name = input.name;
      }
    }

    em.assign(product, input);
    await em.persistAndFlush(product);
    await invalidateProductData(product.id, product.slug, product.category?.id);

    return product;
  }

  @Mutation(() => Product)
  async deleteProduct(
    @Arg("id") id: string,
    @Ctx() { em, req }: MyContext
  ): Promise<Product> {
    const vendorId = req.session.companyId;
    const adminId = req.session.adminId;

    if (!vendorId && !adminId)
      throw new Error("Only vendors or admins can delete products.");

    const product = await em.findOne(
      Product,
      { id },
      { populate: ["images", "company"] }
    );
    if (!product) throw new Error("Product not found");

    // Multi-vendor safety
    if (vendorId && product.company.id !== vendorId)
      throw new Error("You cannot delete another vendor's product");

    const uploader = new UploadService();

    if (product.videoKey) {
      await uploader.delete(product.videoKey);
    }

    // Delete all product images from cloud
    for (const img of product.images) {
      await uploader.delete(img.key);
    }

    await em.removeAndFlush(product.images); // Delete image records
    await em.removeAndFlush(product); // Delete product

    return product;
  }

  @Mutation(() => Boolean)
  async toggleProductStatus(
    @Arg("productId") productId: string,
    @Arg("status", () => ProductStatus) status: ProductStatus,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const product = await em.findOne(Product, { id: productId });
    if (!product) throw new Error("Product not found");
    product.status = status;
    await em.flush();
    return true;
  }

  // ProductStatus already has ACTIVE / DISABLED

  @Mutation(() => Boolean)
  async deleteMultipleProducts(
    @Arg("ids", () => [String]) ids: string[],
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      const products = await em.find(Product, { id: { $in: ids } });

      for (const p of products) {
        p.status = ProductStatus.DISABLED; // hide from listings & seller panel
        p.deletedMessage = "This product was removed by the seller."; // optional extra field
      }

      await em.flush();
      return true;
    } catch (e) {
      console.error("deleteMultipleProducts error:", e);
      return false;
    }
  }

  @FieldResolver(() => [Review])
  async reviews(@Root() product: Product, @Ctx() { em }: MyContext) {
    await em.populate(product, ["reviews"]);
    return product.reviews;
  }

  @Query(() => Product, { nullable: true })
  async productBySlug(
    @Arg("slug") slug: string,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    console.log(`🔍 [RESOLVER] ProductBySlug called with slug: ${slug}`);

    const key = `product:slug:${slug}`;
    const index = `product:${slug}`;

    return getOrSetCache(
      () => {
        console.log(`📦 [RESOLVER] Fetching product from DB for slug: ${slug}`);

        return em.findOne(
          Product,
          { slug, status: ProductStatus.ACTIVE },
          {
            populate: [
              "variations",
              "category",
              "company",
              "reviews",
              "discount",
              "discountedPrice",
            ],
          }
        );
      },
      {
        key,
        ttl: 300,
        index,
        validate: (data) => !!data && !!data.id, // make sure it's not null and has ID
      }
    );
  }

  // @Query(() => Product, { nullable: true })
  //   async productBySlug(@Arg("slug") slug: string, @Ctx() { em }: MyContext): Promise<Product | null> {
  //     return await em.findOne(
  //       Product,
  //       { slug, status: ProductStatus.ACTIVE }, // ✅
  //       { populate: ['variations', 'category', 'company',"reviews", 'reviews.user'] }
  //     );
  //   }

  @Query(() => [Product])
  async productsByCategory(
    @Arg("name") name: string,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const key = `product:ByCategory:${name}`;
    const category = await em.findOne(Category, { name });

    if (!category) throw new Error("Category not found");
    return getOrSetCache(
      () => {
        return em.find(
          Product,
          { category: category.id, status: ProductStatus.ACTIVE }, // ✅
          { populate: ["variations", "category", "images"] }
        );
      },
      {
        key,
        ttl: 300,
        index: "products:ByCategory",
      }
    );
  }

  @Query(() => PaginatedProducts)
  async paginatedProducts(
    @Ctx() { em }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedProducts> {
    const realLimit = Math.min(50, limit);
    const fetchLimit = realLimit + 1;

    const filters: any = { status: ProductStatus.ACTIVE }; // ✅
    if (cursor) filters.createdAt = { $lt: new Date(parseInt(cursor)) };

    const products = await em.find(Product, filters, {
      orderBy: { createdAt: "DESC" },
      limit: fetchLimit,
      populate: ["category", "variations", "reviews", "images"],
    });

    const hasMore = products.length === fetchLimit;
    const trimmed = products.slice(0, realLimit);

    return {
      products: trimmed,
      hasMore,
      nextCursor: hasMore
        ? String(new Date(trimmed[trimmed.length - 1].createdAt).getTime())
        : null,
    };
  }

  @Query(() => PaginatedProducts)
  async paginatedMyProducts(
    @Ctx() { em, req }: MyContext,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit: number
  ): Promise<PaginatedProducts> {
    if (!req.session.companyId) throw new Error("Not authenticated");

    const realLimit = Math.min(50, limit);

    const where = {
      company: req.session.companyId,
      status: ProductStatus.ACTIVE, // 👈 only active products for seller list
    };

    const [products, total] = await Promise.all([
      em.find(Product, where, {
        offset,
        limit: realLimit,
        orderBy: { createdAt: "DESC" },
        populate: ["category", "variations", "reviews", "images"],
      }),
      em.count(Product, where),
    ]);

    return { products, total };
  }
}
